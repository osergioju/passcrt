# Checklist de deploy em VPS

Guia prático para colocar o CRT Password Manager no ar numa VPS
(Ubuntu/Debian). Arquivos de exemplo referenciados aqui estão em
`docs/deploy/`.

> **Deploy real em produção:** `https://crtpublicidade.com.br/passcrt/`
> (VPS Hestia, mesmo servidor de outros apps da agência — finance_jr,
> hub, socialdash, taskrow). Esse ambiente usa PM2 + subpath com
> `.htaccess` em vez de systemd + subdomínio dedicado (seções 6/7
> abaixo) — ver "Variante: subpath sob domínio existente (Hestia)" no
> fim deste documento para a receita exata que foi usada.

## 1. Servidor

- [ ] VPS com Ubuntu 22.04+ ou Debian 12+, usuário não-root com sudo
- [ ] Firewall (`ufw`) liberando só `22` (SSH), `80` e `443`
- [ ] Node.js 20 LTS instalado (`nvm` ou pacote da distro)
- [ ] PostgreSQL 14+ instalado e rodando
- [ ] Nginx instalado
- [ ] Usuário de sistema dedicado para rodar a API (ex: `crtapp`), sem shell de login

## 2. Banco de dados

- [ ] Criar role e database dedicados (não usar o superuser `postgres` na aplicação):
  ```sql
  CREATE ROLE crtapp WITH LOGIN PASSWORD 'senha-forte-aqui';
  CREATE DATABASE crt_password_manager OWNER crtapp;
  ```
- [ ] Confirmar que o Postgres só aceita conexões locais (`pg_hba.conf`), a menos que a API rode em outra máquina
- [ ] Definir uma rotina de backup (`pg_dump` agendado via cron, ou snapshot do provedor da VPS) — ver seção 7

## 3. Código e variáveis de ambiente

- [ ] Clonar o repositório em `/opt/crt-password-manager`
- [ ] `cd backend && npm ci` (não `npm install`, para respeitar o lockfile em produção)
- [ ] `cd frontend && npm ci && npm run build` — gera `frontend/dist`
- [ ] Copiar `.env.example` para `backend/.env` e preencher **todos** os campos:
  - `DATABASE_URL` apontando para o Postgres criado no passo 2
  - `JWT_SECRET` e `JWT_REFRESH_SECRET`: gerar com `openssl rand -base64 64` (um valor único para cada, nunca reaproveitar do ambiente de dev)
  - `ENCRYPTION_KEY`: gerar com `openssl rand -hex 32` — **guarde uma cópia offline seria dela em um cofre separado** (ex: gerenciador de senhas da equipe). Perdê-la torna todas as credenciais do cofre irrecuperáveis; trocá-la sem migrar os dados quebra a descriptografia de tudo que já foi salvo.
  - `NODE_ENV=production`
  - `FRONTEND_URL` com o domínio real (usado pelo CORS)
  - `ALLOW_CREATE_ADMIN` deve ficar `false` exceto no momento exato de criar o primeiro Admin Master (passo 5)
- [ ] Restringir permissões do `.env` (`chmod 600 backend/.env`, dono = usuário de serviço)

## 4. Migrations e seed

- [ ] `cd backend && npx prisma migrate deploy` (nunca `migrate dev` em produção)
- [ ] `npm run seed` — cria permissões, roles e categorias padrão (idempotente, seguro rodar de novo em deploys futuros)

## 5. Primeiro Admin Master

- [ ] Rodar uma única vez, com a flag explícita exigida em produção:
  ```bash
  ALLOW_CREATE_ADMIN=true npm run create-admin
  ```
- [ ] Depois, garantir que `ALLOW_CREATE_ADMIN` volte para `false` no `.env`

## 6. Processo da API

- [ ] Copiar `docs/deploy/crt-password-manager.service` para `/etc/systemd/system/`, ajustando `User`, `Group` e `WorkingDirectory` para o ambiente real
- [ ] `systemctl daemon-reload && systemctl enable --now crt-password-manager`
- [ ] Confirmar que subiu: `systemctl status crt-password-manager` e `curl -s localhost:3000/health`
- [ ] Logs: `journalctl -u crt-password-manager -f`

(Alternativa ao systemd: PM2 — `pm2 start src/server.js --name crt-api`, `pm2 save`, `pm2 startup`.)

## 7. Nginx + TLS

- [ ] Copiar `docs/deploy/nginx.conf` para `/etc/nginx/sites-available/crt-password-manager`, ajustar `server_name` e `root`
- [ ] `ln -s` para `sites-enabled`, `nginx -t`, `systemctl reload nginx`
- [ ] Emitir certificado com `certbot --nginx -d seu-dominio` (Let's Encrypt)
- [ ] Confirmar que `frontend/.env` de build (`VITE_API_URL`) apontava para `https://seu-dominio/api` **antes** do `npm run build` — a URL da API fica embutida no bundle estático

## 8. Backups

- [ ] Backup diário do Postgres (`pg_dump` para um bucket/volume externo à VPS)
- [ ] Backup do `ENCRYPTION_KEY` guardado separadamente do backup do banco — um sem o outro é inútil, mas os dois juntos no mesmo lugar anulam o propósito de ter um segredo fora do banco
- [ ] Testar a restauração ao menos uma vez (backup não testado não é backup)

## 9. Checklist final antes de anunciar o sistema em produção

- [ ] `NODE_ENV=production` confirmado (afeta cookie `secure` e verbosidade de erros)
- [ ] HTTPS funcionando ponta a ponta (o cookie de refresh só é enviado pelo navegador em `secure` sob HTTPS)
- [ ] Login, refresh e logout testados no domínio real
- [ ] Criar ao menos um segundo Admin Master ou documentar quem tem acesso ao servidor — se o único Admin Master perder a senha e ninguém tiver acesso SSH, não há caminho de recuperação pela aplicação (por design)
- [ ] `backend/.env`, `backend/.env.test` e qualquer cópia local de segredos **fora** do controle de versão

## Variante: subpath sob domínio existente (Hestia + PM2 + Apache)

Quando o app não ganha um domínio/subdomínio próprio, e sim um subpath
dentro de um site já existente (ex: `crtpublicidade.com.br/passcrt`),
o fluxo muda em relação às seções 6/7 acima. A pasta com o repositório
inteiro (backend **e** frontend, como no GitHub) fica fora do
`public_html`; só o build estático do frontend é copiado pra dentro do
`public_html`, onde a web de fato serve.

1. **Repositório inteiro** clonado direto no servidor, em
   `/home/<usuario>/apps/<app>/` (fora do `public_html` do domínio —
   o `.env` do backend, com os segredos, nunca fica numa pasta
   tecnicamente acessível pela web):
   ```bash
   cd /home/<usuario>/apps
   git clone https://github.com/<org>/<repo>.git <app>
   ```
2. **Backend**: `cd <app>/backend && npm ci --omit=dev`, rodado
   **direto no servidor** (nunca copie `node_modules` de outra
   máquina/SO — módulos nativos como o `argon2` são compilados para a
   plataforma específica). Depois recria o `.env` de produção nessa
   pasta (não vem do git — está no `.gitignore`).
3. **Processo**: `pm2 start src/server.js --name <app>-backend --cwd
   /home/<usuario>/apps/<app>/backend`, seguido de `pm2 save`. Escolha
   uma porta livre (`ss -tlnp | grep 300`) — nesse servidor, 3000-3002
   já estavam em uso por outros apps; o passcrt ficou na **3003**.
4. **`.env` do backend** precisa de `COOKIE_PATH=/<subpath>/api/auth`
   (ver seção 3 acima) e `FRONTEND_URL` apontando para o domínio
   inteiro (a origem é a mesma, então nem é CORS de verdade — é
   same-origin).
5. **Frontend**: `cd <app>/frontend && npm install` (⚠️ **`npm
   install`, não `npm ci`** — o `package-lock.json` gerado no Mac não
   carrega o binário nativo `@rolldown/binding-linux-x64-gnu` que o
   Vite 8/rolldown precisa no Linux; só um `npm install` direto no
   servidor resolve isso). Requer **Node ≥ 20.19** — se o Node do
   sistema for mais antigo (era o caso aqui, v18), baixe um Node
   avulso só pra isso, sem tocar no Node do sistema (que outros apps
   via PM2 dependem):
   ```bash
   mkdir -p /home/<usuario>/apps/.toolchain && cd $_
   curl -fsSL -o node.tar.xz https://nodejs.org/dist/v22.14.0/node-v22.14.0-linux-x64.tar.xz
   tar -xJf node.tar.xz && mv node-v22.14.0-linux-x64 node22
   export PATH=/home/<usuario>/apps/.toolchain/node22/bin:$PATH
   ```
   Depois builda com a URL da API relativa ao subpath (embutida no
   bundle): `VITE_API_URL=/<subpath>/api npm run build`.
6. **Publicar o build**: `rsync -a <app>/frontend/dist/
   /home/<usuario>/web/<dominio>/public_html/<subpath>/` (sem
   `--delete`, pra não apagar o `.htaccess`).
7. **Roteamento**: um `.htaccess` dentro de `public_html/<subpath>/`
   (exemplo em [`deploy/passcrt.htaccess`](./deploy/passcrt.htaccess))
   faz o proxy de `/<subpath>/api/*` pro Node local via `mod_rewrite`
   com a flag `[P]` (único jeito de fazer proxy num `.htaccess`), serve
   arquivos estáticos que existem de verdade, e cai no `index.html`
   para qualquer outra rota (fallback de SPA). Esse arquivo não faz
   parte do build do Vite — precisa ser recolocado toda vez que o
   `public_html/<subpath>` for recriado do zero.
8. **Ownership**: tudo criado por `root` via SSH precisa voltar para o
   usuário do domínio no Hestia (`chown -R <usuario>:<usuario>`), tanto
   em `apps/<app>` quanto em `public_html/<subpath>`.
9. Nginx (na frente), Postgres e PM2 já existentes no servidor não
   precisam de nenhuma alteração — só o `.htaccess` do subpath.

**Atualizar depois de um deploy inicial** (`git pull` + rebuild):
```bash
cd /home/<usuario>/apps/<app> && git pull
(cd backend && npm ci --omit=dev && pm2 restart <app>-backend)
(cd frontend && export PATH=/home/<usuario>/apps/.toolchain/node22/bin:$PATH \
   && npm install && VITE_API_URL=/<subpath>/api npm run build \
   && rsync -a dist/ /home/<usuario>/web/<dominio>/public_html/<subpath>/)
```

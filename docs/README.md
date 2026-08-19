# Documentação — CRT Password Manager

Esta pasta reúne a documentação complementar do projeto:

- [`deploy-vps.md`](./deploy-vps.md) — checklist passo a passo de deploy em VPS (Etapa 12), com exemplos de `systemd` e `nginx` em [`deploy/`](./deploy/)

## Modelo de dados e permissões (resumo)

O schema completo vive em `backend/prisma/schema.prisma` (fonte da
verdade). Resumo das peças principais:

- **RBAC por role** — `Role` → `RolePermission` → `Permission`. O
  catálogo de permissões e os papéis padrão (`ADMIN_MASTER`, `ADMIN`,
  `USER`) estão em `backend/src/config/permissions.js`.
- **ACL por credencial** — `CredentialPermission` concede acesso (e,
  especificamente, permissão de ver a senha) de um usuário a uma
  credencial específica. É a checagem mais fina: mesmo um `ADMIN` com
  a permissão de role `credentials.view_password` só revela a senha de
  credenciais às quais foi explicitamente concedido acesso. Só
  `ADMIN_MASTER` tem acesso irrestrito.
- **Segredos do cofre** — a senha de cada credencial é cifrada com
  AES-256-GCM (`backend/src/crypto/vault.js`) antes de ir para o
  banco; a `ENCRYPTION_KEY` só existe em variável de ambiente.
- **Auditoria** — toda ação sensível (login, CRUD de credenciais,
  revelar/copiar senha, mudança de permissão) gera um `AuditLog`,
  consultável via `GET /api/audit` (permissão `audit.view`).

# CRT Password Manager

Sistema interno de gerenciamento seguro de senhas e credenciais da CRT
Comunicação — um cofre corporativo para organizar e compartilhar
credenciais de clientes, sites, redes sociais, serviços e ferramentas
com controle de permissões e auditoria.

> **Status:** todas as 12 etapas do escopo inicial concluídas — backend,
> frontend, integração, testes e checklist de deploy prontos.

## Estrutura do projeto

```text
/senhas
  /frontend   → React + Vite + Tailwind (SPA)
  /backend    → Node.js + Express + Prisma (API REST)
    /prisma   → schema.prisma e migrations
  /docs       → documentação complementar
  .env.example
  README.md
```

## Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express, JWT, Argon2id, PostgreSQL, Prisma
- **Segurança:** AES-256-GCM para segredos do cofre, Argon2id para senhas
  de usuários do sistema, RBAC granular, auditoria de acesso

## Requisitos

- Node.js >= 20
- PostgreSQL >= 14
- npm

## Instalação

### 1. Backend

```bash
cd backend
npm install
cp ../.env.example .env   # preencha DATABASE_URL, JWT_SECRET,
                           # JWT_REFRESH_SECRET e ENCRYPTION_KEY
```

Gerar segredos fortes:

```bash
# ENCRYPTION_KEY (32 bytes em hex)
openssl rand -hex 32

# JWT_SECRET / JWT_REFRESH_SECRET
openssl rand -base64 64
```

### 2. Banco de dados (PostgreSQL + Prisma)

```bash
cd backend
npx prisma migrate dev
npm run seed
```

### 3. Primeiro Admin Master

Nunca é criado por uma tela pública. Use o comando CLI:

```bash
npm run create-admin
```

Em produção (`NODE_ENV=production`), o comando exige confirmação
explícita via `ALLOW_CREATE_ADMIN=true` para evitar criação indevida de
privilégios.

### 4. Rodar o backend

```bash
npm run dev
```

### 5. Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação frontend espera a API em `VITE_API_URL` (ver
`frontend/.env.example`). Acesse `http://localhost:5173` e entre com o
Admin Master criado no passo 3.

## Testes

```bash
# Backend — usa um banco Postgres separado (crt_password_manager_test),
# nunca o de desenvolvimento. Antes da primeira vez:
createdb crt_password_manager_test
cd backend
cp .env.example .env.test   # ajuste DATABASE_URL para o banco *_test
                             # e gere segredos próprios (podem ser
                             # descartáveis, não precisam ser os de dev)
DATABASE_URL="postgresql://user:pass@localhost:5432/crt_password_manager_test?schema=public" \
  npx prisma migrate deploy
DATABASE_URL="postgresql://user:pass@localhost:5432/crt_password_manager_test?schema=public" \
  node prisma/seed.js
npm test

# Frontend
cd frontend
npm test
```

## Build de produção

```bash
# Backend
cd backend
npm run prisma:deploy
npm start

# Frontend
cd frontend
npm run build   # gera frontend/dist, para servir via Nginx/estático
```

## Documentação

Ver [`docs/README.md`](./docs/README.md) para o modelo de dados e
permissões, e [`docs/deploy-vps.md`](./docs/deploy-vps.md) para o
checklist completo de deploy em VPS.

## Andamento das etapas

- [x] Etapa 1 — Estrutura do projeto
- [x] Etapa 2 — PostgreSQL + Prisma + migrations
- [x] Etapa 3 — Autenticação e usuários
- [x] Etapa 4 — Admin Master (CLI)
- [x] Etapa 5 — Clientes e categorias
- [x] Etapa 6 — Credenciais e criptografia
- [x] Etapa 7 — Permissões (RBAC por role + ACL por credencial)
- [x] Etapa 8 — Auditoria (`GET /api/audit`, protegido por `audit.view`)
- [x] Etapa 9 — Frontend completo (React + Vite + Tailwind, todas as telas)
- [x] Etapa 10 — Integração frontend + backend (validada ponta a ponta)
- [x] Etapa 11 — Testes (`backend/test`: 27 testes; `frontend/src/**/*.test.jsx`: 12 testes)
- [x] Etapa 12 — Preparação para produção (ver `docs/deploy-vps.md`)

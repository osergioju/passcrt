// Espelha backend/src/config/permissions.js e o enum AuditAction do
// schema Prisma. Mantido em sincronia manualmente — não há geração de
// código compartilhado entre os dois projetos.

export const PERMISSIONS = {
  CREDENTIALS_VIEW: 'credentials.view',
  CREDENTIALS_CREATE: 'credentials.create',
  CREDENTIALS_UPDATE: 'credentials.update',
  CREDENTIALS_DELETE: 'credentials.delete',
  CREDENTIALS_VIEW_PASSWORD: 'credentials.view_password',

  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',

  CLIENTS_VIEW: 'clients.view',
  CLIENTS_CREATE: 'clients.create',
  CLIENTS_UPDATE: 'clients.update',
  CLIENTS_DELETE: 'clients.delete',

  CATEGORIES_VIEW: 'categories.view',
  CATEGORIES_CREATE: 'categories.create',
  CATEGORIES_UPDATE: 'categories.update',
  CATEGORIES_DELETE: 'categories.delete',

  ADMINS_VIEW: 'admins.view',
  ADMINS_CREATE: 'admins.create',
  ADMINS_UPDATE: 'admins.update',
  ADMINS_DELETE: 'admins.delete',

  AUDIT_VIEW: 'audit.view',

  PERMISSIONS_MANAGE: 'permissions.manage',
}

export const ROLES = {
  ADMIN_MASTER: 'ADMIN_MASTER',
  ADMIN: 'ADMIN',
  USER: 'USER',
}

export const AUDIT_ACTIONS = [
  'LOGIN',
  'LOGIN_FAILED',
  'LOGOUT',
  'CREATE_USER',
  'UPDATE_USER',
  'DELETE_USER',
  'CREATE_ADMIN',
  'UPDATE_ADMIN',
  'DELETE_ADMIN',
  'CREATE_CLIENT',
  'UPDATE_CLIENT',
  'DELETE_CLIENT',
  'CREATE_CATEGORY',
  'UPDATE_CATEGORY',
  'DELETE_CATEGORY',
  'CREATE_CREDENTIAL',
  'UPDATE_CREDENTIAL',
  'DELETE_CREDENTIAL',
  'VIEW_PASSWORD',
  'COPY_PASSWORD',
  'COPY_LOGIN',
  'UPDATE_PERMISSION',
  'GRANT_CREDENTIAL_ACCESS',
  'REVOKE_CREDENTIAL_ACCESS',
]

export const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'INACTIVE', label: 'Inativo' },
]

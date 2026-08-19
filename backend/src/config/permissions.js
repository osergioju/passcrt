// Catálogo de permissões granulares do sistema (item 12 do escopo).
// Novas permissões podem ser adicionadas aqui sem alterar a estrutura
// do banco — elas vivem na tabela `permissions` e são atribuídas a
// roles via `role_permissions`.

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

export const ALL_PERMISSION_KEYS = Object.values(PERMISSIONS)

export const ROLES = {
  ADMIN_MASTER: 'ADMIN_MASTER',
  ADMIN: 'ADMIN',
  USER: 'USER',
}

// Permissões padrão de cada role (usado pelo seed). ADMIN_MASTER recebe
// tudo, incluindo administração de outros admins e configurações
// críticas. ADMIN não pode gerenciar admins nem permissões globais.
// USER só visualiza/gerencia o que lhe for concedido explicitamente.
export const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.ADMIN_MASTER]: ALL_PERMISSION_KEYS,
  [ROLES.ADMIN]: [
    PERMISSIONS.CREDENTIALS_VIEW,
    PERMISSIONS.CREDENTIALS_CREATE,
    PERMISSIONS.CREDENTIALS_UPDATE,
    PERMISSIONS.CREDENTIALS_DELETE,
    PERMISSIONS.CREDENTIALS_VIEW_PASSWORD,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.CLIENTS_VIEW,
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_UPDATE,
    PERMISSIONS.CLIENTS_DELETE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_UPDATE,
    PERMISSIONS.CATEGORIES_DELETE,
    PERMISSIONS.AUDIT_VIEW,
  ],
  [ROLES.USER]: [
    PERMISSIONS.CREDENTIALS_VIEW,
    PERMISSIONS.CLIENTS_VIEW,
    PERMISSIONS.CATEGORIES_VIEW,
  ],
}

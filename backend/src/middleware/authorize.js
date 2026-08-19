import { ForbiddenError } from '../utils/AppError.js'
import { ROLES } from '../config/permissions.js'

// Exige que o usuário autenticado possua a permissão informada.
// Assume que `authenticate` já rodou e populou `req.user`.
export function requirePermission(permissionKey) {
  return (req, res, next) => {
    if (!req.user?.permissions.has(permissionKey)) {
      throw new ForbiddenError('Você não possui permissão para executar esta ação')
    }
    next()
  }
}

export function requireRole(roleName) {
  return (req, res, next) => {
    if (!req.user?.roles.has(roleName)) {
      throw new ForbiddenError('Ação restrita a este perfil de acesso')
    }
    next()
  }
}

export const requireAdminMaster = requireRole(ROLES.ADMIN_MASTER)

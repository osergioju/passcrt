import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { requireAdminMaster } from '../middleware/authorize.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { prisma } from '../config/prisma.js'
import { ALL_PERMISSION_KEYS } from '../config/permissions.js'

export const permissionRoutes = Router()

permissionRoutes.use(authenticate, requireAdminMaster)

// Catálogo de permissões e o mapeamento atual role -> permissões.
// Usado pela tela de Configurações/Permissões no frontend.
permissionRoutes.get(
  '/',
  asyncHandler(async (req, res) => {
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: { permissions: { include: { permission: true } } },
    })

    res.json({
      permissions: ALL_PERMISSION_KEYS,
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        permissions: role.permissions.map((rp) => rp.permission.key),
      })),
    })
  }),
)

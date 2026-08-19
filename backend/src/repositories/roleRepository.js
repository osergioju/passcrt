import { prisma } from '../config/prisma.js'

export function findRoleByName(name) {
  return prisma.role.findUnique({ where: { name } })
}

export function listRoles() {
  return prisma.role.findMany({ orderBy: { name: 'asc' } })
}

// Conta quantos usuários ativos possuem a role informada — usado para
// impedir a remoção do último Admin Master ativo do sistema.
export function countActiveUsersWithRole(roleName) {
  return prisma.user.count({
    where: {
      status: 'ACTIVE',
      roles: { some: { role: { name: roleName } } },
    },
  })
}

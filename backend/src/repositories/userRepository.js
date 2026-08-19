import { prisma } from '../config/prisma.js'

const withRolesInclude = {
  roles: {
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  },
}

export function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: withRolesInclude,
  })
}

export function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: withRolesInclude,
  })
}

export function listUsers({ skip = 0, take = 50 } = {}) {
  return prisma.user.findMany({
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: withRolesInclude,
  })
}

export function createUser({ name, email, passwordHash, roleIds = [] }) {
  return prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      roles: { create: roleIds.map((roleId) => ({ roleId })) },
    },
    include: withRolesInclude,
  })
}

export function updateUser(id, data) {
  return prisma.user.update({ where: { id }, data, include: withRolesInclude })
}

export function setUserRoles(userId, roleIds) {
  return prisma.$transaction([
    prisma.userRole.deleteMany({ where: { userId } }),
    prisma.userRole.createMany({ data: roleIds.map((roleId) => ({ userId, roleId })) }),
  ])
}

// Extrai o conjunto de chaves de permissão (ex: "credentials.view") e os
// nomes de role (ex: "ADMIN_MASTER") a partir do usuário carregado com
// `withRolesInclude`.
export function extractRolesAndPermissions(user) {
  const roleNames = new Set()
  const permissionKeys = new Set()

  for (const userRole of user.roles) {
    roleNames.add(userRole.role.name)
    for (const rolePermission of userRole.role.permissions) {
      permissionKeys.add(rolePermission.permission.key)
    }
  }

  return { roleNames, permissionKeys }
}

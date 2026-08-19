import { prisma } from '../config/prisma.js'

const listInclude = {
  client: { select: { id: true, name: true } },
  category: { select: { id: true, name: true, icon: true } },
}

const detailInclude = {
  ...listInclude,
  createdBy: { select: { id: true, name: true } },
  updatedBy: { select: { id: true, name: true } },
  permissions: {
    include: { user: { select: { id: true, name: true, email: true } } },
  },
}

// `accessFilter` é aplicado apenas para usuários sem acesso irrestrito
// (ADMIN_MASTER/ADMIN); restringe a credenciais explicitamente
// concedidas ao usuário via `credential_permissions`.
export function listCredentials({ userId, unrestricted, clientId, categoryId, search }) {
  const where = {
    ...(clientId ? { clientId } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(unrestricted ? {} : { permissions: { some: { userId } } }),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { url: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
            { tags: { has: search } },
            { client: { name: { contains: search, mode: 'insensitive' } } },
            { category: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  }

  return prisma.credential.findMany({
    where,
    include: listInclude,
    orderBy: { updatedAt: 'desc' },
  })
}

export function findCredentialById(id) {
  return prisma.credential.findUnique({ where: { id }, include: detailInclude })
}

export function userHasCredentialAccess(credentialId, userId) {
  return prisma.credentialPermission.findUnique({
    where: { credentialId_userId: { credentialId, userId } },
  })
}

export function createCredential(data) {
  return prisma.credential.create({ data, include: detailInclude })
}

export function updateCredential(id, data) {
  return prisma.credential.update({ where: { id }, data, include: detailInclude })
}

export function deleteCredential(id) {
  return prisma.credential.delete({ where: { id } })
}

export function grantCredentialAccess({ credentialId, userId, grantedById, canViewPassword }) {
  return prisma.credentialPermission.upsert({
    where: { credentialId_userId: { credentialId, userId } },
    update: { canViewPassword },
    create: { credentialId, userId, grantedById, canViewPassword },
  })
}

export function revokeCredentialAccess(credentialId, userId) {
  return prisma.credentialPermission.delete({
    where: { credentialId_userId: { credentialId, userId } },
  })
}

export function setCredentialAccessList(credentialId, grants, grantedById) {
  return prisma.$transaction([
    prisma.credentialPermission.deleteMany({ where: { credentialId } }),
    prisma.credentialPermission.createMany({
      data: grants.map((g) => ({
        credentialId,
        userId: g.userId,
        canViewPassword: g.canViewPassword ?? true,
        grantedById,
      })),
    }),
  ])
}

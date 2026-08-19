import { prisma } from '../config/prisma.js'

export function createSession({ userId, userAgent, ipAddress, rememberMe }) {
  return prisma.session.create({
    data: { userId, userAgent, ipAddress, rememberMe },
  })
}

export function createRefreshToken({ sessionId, tokenHash, expiresAt }) {
  return prisma.refreshToken.create({
    data: { sessionId, tokenHash, expiresAt },
  })
}

export function findActiveRefreshTokenByHash(tokenHash) {
  return prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
      session: { revokedAt: null },
    },
    include: { session: true },
  })
}

export function revokeRefreshToken(id) {
  return prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } })
}

export function revokeSession(sessionId) {
  return prisma.$transaction([
    prisma.session.update({ where: { id: sessionId }, data: { revokedAt: new Date() } }),
    prisma.refreshToken.updateMany({
      where: { sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ])
}

export function touchSession(sessionId) {
  return prisma.session.update({ where: { id: sessionId }, data: { lastUsedAt: new Date() } })
}

import { prisma } from '../config/prisma.js'

// Registra um evento de auditoria. Nunca deve receber segredos (senhas,
// tokens) em `metadata` — apenas metadados descritivos do evento.
export async function recordAudit({
  userId = null,
  action,
  resource,
  resourceId = null,
  ipAddress = null,
  userAgent = null,
  metadata = null,
}) {
  await prisma.auditLog.create({
    data: { userId, action, resource, resourceId, ipAddress, userAgent, metadata },
  })
}

export function requestContext(req) {
  return {
    ipAddress: req.ip,
    userAgent: req.get('user-agent') || null,
  }
}

// Consulta paginada do audit log, com filtros opcionais. Usada pela
// tela de Auditoria do frontend (item 8 do escopo).
export async function listAuditLogs({
  userId,
  action,
  resource,
  resourceId,
  dateFrom,
  dateTo,
  page = 1,
  pageSize = 50,
} = {}) {
  const where = {
    userId,
    action,
    resource,
    resourceId,
    createdAt:
      dateFrom || dateTo
        ? {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          }
        : undefined,
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ])

  return { logs, total, page, pageSize }
}

import * as auditService from '../services/auditService.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const list = asyncHandler(async (req, res) => {
  const { logs, total, page, pageSize } = await auditService.listAuditLogs(req.query)
  res.json({
    logs: logs.map((log) => ({
      id: log.id,
      user: log.user,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      metadata: log.metadata,
      createdAt: log.createdAt,
    })),
    total,
    page,
    pageSize,
  })
})

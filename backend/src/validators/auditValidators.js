import { z } from 'zod'
import { AuditAction } from '@prisma/client'

export const listAuditLogsQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.enum(Object.values(AuditAction)).optional(),
  resource: z.string().trim().max(50).optional(),
  resourceId: z.string().trim().max(100).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(200).optional().default(50),
})

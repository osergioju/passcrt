import { Router } from 'express'
import * as auditController from '../controllers/auditController.js'
import { authenticate } from '../middleware/authenticate.js'
import { requirePermission } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { listAuditLogsQuerySchema } from '../validators/auditValidators.js'
import { PERMISSIONS } from '../config/permissions.js'

export const auditRoutes = Router()

auditRoutes.use(authenticate, requirePermission(PERMISSIONS.AUDIT_VIEW))

auditRoutes.get('/', validate(listAuditLogsQuerySchema, 'query'), auditController.list)

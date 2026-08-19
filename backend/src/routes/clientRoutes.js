import { Router } from 'express'
import * as clientController from '../controllers/clientController.js'
import { authenticate } from '../middleware/authenticate.js'
import { requirePermission } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { createClientSchema, updateClientSchema } from '../validators/clientValidators.js'
import { idParamSchema } from '../validators/common.js'
import { PERMISSIONS } from '../config/permissions.js'

export const clientRoutes = Router()

clientRoutes.use(authenticate)

clientRoutes.get('/', requirePermission(PERMISSIONS.CLIENTS_VIEW), clientController.list)
clientRoutes.get(
  '/:id',
  requirePermission(PERMISSIONS.CLIENTS_VIEW),
  validate(idParamSchema, 'params'),
  clientController.getById,
)
clientRoutes.post(
  '/',
  requirePermission(PERMISSIONS.CLIENTS_CREATE),
  validate(createClientSchema),
  clientController.create,
)
clientRoutes.put(
  '/:id',
  requirePermission(PERMISSIONS.CLIENTS_UPDATE),
  validate(idParamSchema, 'params'),
  validate(updateClientSchema),
  clientController.update,
)
clientRoutes.delete(
  '/:id',
  requirePermission(PERMISSIONS.CLIENTS_DELETE),
  validate(idParamSchema, 'params'),
  clientController.remove,
)

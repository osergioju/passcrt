import { Router } from 'express'
import * as adminController from '../controllers/adminController.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireAdminMaster } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { createAdminSchema, updateAdminSchema } from '../validators/adminValidators.js'
import { idParamSchema } from '../validators/common.js'

export const adminRoutes = Router()

// Toda a área de Administradores é exclusiva do Admin Master — nunca
// um Admin comum, mesmo com outras permissões elevadas.
adminRoutes.use(authenticate, requireAdminMaster)

adminRoutes.get('/', adminController.list)
adminRoutes.post('/', validate(createAdminSchema), adminController.create)
adminRoutes.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateAdminSchema),
  adminController.update,
)
adminRoutes.delete('/:id', validate(idParamSchema, 'params'), adminController.remove)

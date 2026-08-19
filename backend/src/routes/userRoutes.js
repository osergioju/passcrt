import { Router } from 'express'
import * as userController from '../controllers/userController.js'
import { authenticate } from '../middleware/authenticate.js'
import { requirePermission } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { createUserSchema, updateUserSchema, idParamSchema } from '../validators/userValidators.js'
import { PERMISSIONS } from '../config/permissions.js'

export const userRoutes = Router()

userRoutes.use(authenticate)

userRoutes.get('/', requirePermission(PERMISSIONS.USERS_VIEW), userController.list)
userRoutes.get(
  '/:id',
  requirePermission(PERMISSIONS.USERS_VIEW),
  validate(idParamSchema, 'params'),
  userController.getById,
)
userRoutes.post(
  '/',
  requirePermission(PERMISSIONS.USERS_CREATE),
  validate(createUserSchema),
  userController.create,
)
userRoutes.put(
  '/:id',
  requirePermission(PERMISSIONS.USERS_UPDATE),
  validate(idParamSchema, 'params'),
  validate(updateUserSchema),
  userController.update,
)
userRoutes.delete(
  '/:id',
  requirePermission(PERMISSIONS.USERS_DELETE),
  validate(idParamSchema, 'params'),
  userController.remove,
)

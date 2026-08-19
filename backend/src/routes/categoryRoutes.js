import { Router } from 'express'
import * as categoryController from '../controllers/categoryController.js'
import { authenticate } from '../middleware/authenticate.js'
import { requirePermission } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { createCategorySchema, updateCategorySchema } from '../validators/categoryValidators.js'
import { idParamSchema } from '../validators/common.js'
import { PERMISSIONS } from '../config/permissions.js'

export const categoryRoutes = Router()

categoryRoutes.use(authenticate)

categoryRoutes.get('/', requirePermission(PERMISSIONS.CATEGORIES_VIEW), categoryController.list)
categoryRoutes.get(
  '/:id',
  requirePermission(PERMISSIONS.CATEGORIES_VIEW),
  validate(idParamSchema, 'params'),
  categoryController.getById,
)
categoryRoutes.post(
  '/',
  requirePermission(PERMISSIONS.CATEGORIES_CREATE),
  validate(createCategorySchema),
  categoryController.create,
)
categoryRoutes.put(
  '/:id',
  requirePermission(PERMISSIONS.CATEGORIES_UPDATE),
  validate(idParamSchema, 'params'),
  validate(updateCategorySchema),
  categoryController.update,
)
categoryRoutes.delete(
  '/:id',
  requirePermission(PERMISSIONS.CATEGORIES_DELETE),
  validate(idParamSchema, 'params'),
  categoryController.remove,
)

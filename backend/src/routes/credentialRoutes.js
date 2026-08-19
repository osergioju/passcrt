import { Router } from 'express'
import * as credentialController from '../controllers/credentialController.js'
import { authenticate } from '../middleware/authenticate.js'
import { requirePermission } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import {
  createCredentialSchema,
  updateCredentialSchema,
  listCredentialsQuerySchema,
  copyCredentialSchema,
  setAccessSchema,
} from '../validators/credentialValidators.js'
import { idParamSchema } from '../validators/common.js'
import { PERMISSIONS } from '../config/permissions.js'

export const credentialRoutes = Router()

credentialRoutes.use(authenticate)

credentialRoutes.get(
  '/',
  requirePermission(PERMISSIONS.CREDENTIALS_VIEW),
  validate(listCredentialsQuerySchema, 'query'),
  credentialController.list,
)
credentialRoutes.get(
  '/:id',
  requirePermission(PERMISSIONS.CREDENTIALS_VIEW),
  validate(idParamSchema, 'params'),
  credentialController.getById,
)
credentialRoutes.post(
  '/',
  requirePermission(PERMISSIONS.CREDENTIALS_CREATE),
  validate(createCredentialSchema),
  credentialController.create,
)
credentialRoutes.put(
  '/:id',
  requirePermission(PERMISSIONS.CREDENTIALS_UPDATE),
  validate(idParamSchema, 'params'),
  validate(updateCredentialSchema),
  credentialController.update,
)
credentialRoutes.delete(
  '/:id',
  requirePermission(PERMISSIONS.CREDENTIALS_DELETE),
  validate(idParamSchema, 'params'),
  credentialController.remove,
)

// Revelação e cópia da senha: a permissão de role aqui é só o primeiro
// portão. A checagem fina (a credencial específica foi concedida a este
// usuário?) acontece no service, que também audita o evento.
credentialRoutes.post(
  '/:id/password',
  requirePermission(PERMISSIONS.CREDENTIALS_VIEW_PASSWORD),
  validate(idParamSchema, 'params'),
  credentialController.revealPassword,
)
credentialRoutes.post(
  '/:id/copy',
  requirePermission(PERMISSIONS.CREDENTIALS_VIEW),
  validate(idParamSchema, 'params'),
  validate(copyCredentialSchema),
  credentialController.copy,
)

credentialRoutes.put(
  '/:id/access',
  requirePermission(PERMISSIONS.CREDENTIALS_UPDATE),
  validate(idParamSchema, 'params'),
  validate(setAccessSchema),
  credentialController.setAccess,
)

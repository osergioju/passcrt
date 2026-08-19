import * as adminService from '../services/adminService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { recordAudit, requestContext } from '../services/auditService.js'

export const list = asyncHandler(async (req, res) => {
  const admins = await adminService.listAdmins()
  res.json({ admins })
})

export const create = asyncHandler(async (req, res) => {
  const admin = await adminService.createAdmin(req.body)
  await recordAudit({
    userId: req.user.id,
    action: 'CREATE_ADMIN',
    resource: 'admin',
    resourceId: admin.id,
    ...requestContext(req),
  })
  res.status(201).json({ admin })
})

export const update = asyncHandler(async (req, res) => {
  const admin = await adminService.updateAdmin(req.params.id, req.body)
  await recordAudit({
    userId: req.user.id,
    action: 'UPDATE_ADMIN',
    resource: 'admin',
    resourceId: admin.id,
    ...requestContext(req),
  })
  res.json({ admin })
})

export const remove = asyncHandler(async (req, res) => {
  await adminService.deleteAdmin(req.params.id)
  await recordAudit({
    userId: req.user.id,
    action: 'DELETE_ADMIN',
    resource: 'admin',
    resourceId: req.params.id,
    ...requestContext(req),
  })
  res.status(204).send()
})

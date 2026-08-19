import * as userService from '../services/userService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { recordAudit, requestContext } from '../services/auditService.js'

export const list = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1
  const users = await userService.listUsers({ page })
  res.json({ users })
})

export const getById = asyncHandler(async (req, res) => {
  const user = await userService.getUser(req.params.id)
  res.json({ user })
})

export const create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body)
  await recordAudit({
    userId: req.user.id,
    action: 'CREATE_USER',
    resource: 'user',
    resourceId: user.id,
    ...requestContext(req),
  })
  res.status(201).json({ user })
})

export const update = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body)
  await recordAudit({
    userId: req.user.id,
    action: 'UPDATE_USER',
    resource: 'user',
    resourceId: user.id,
    ...requestContext(req),
  })
  res.json({ user })
})

export const remove = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id)
  await recordAudit({
    userId: req.user.id,
    action: 'DELETE_USER',
    resource: 'user',
    resourceId: req.params.id,
    ...requestContext(req),
  })
  res.status(204).send()
})

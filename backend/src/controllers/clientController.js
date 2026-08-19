import * as clientService from '../services/clientService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { recordAudit, requestContext } from '../services/auditService.js'

export const list = asyncHandler(async (req, res) => {
  const clients = await clientService.listClients({ search: req.query.search })
  res.json({ clients })
})

export const getById = asyncHandler(async (req, res) => {
  const client = await clientService.getClient(req.params.id)
  res.json({ client })
})

export const create = asyncHandler(async (req, res) => {
  const client = await clientService.createClient(req.body)
  await recordAudit({
    userId: req.user.id,
    action: 'CREATE_CLIENT',
    resource: 'client',
    resourceId: client.id,
    ...requestContext(req),
  })
  res.status(201).json({ client })
})

export const update = asyncHandler(async (req, res) => {
  const client = await clientService.updateClient(req.params.id, req.body)
  await recordAudit({
    userId: req.user.id,
    action: 'UPDATE_CLIENT',
    resource: 'client',
    resourceId: client.id,
    ...requestContext(req),
  })
  res.json({ client })
})

export const remove = asyncHandler(async (req, res) => {
  await clientService.deleteClient(req.params.id)
  await recordAudit({
    userId: req.user.id,
    action: 'DELETE_CLIENT',
    resource: 'client',
    resourceId: req.params.id,
    ...requestContext(req),
  })
  res.status(204).send()
})

import * as credentialService from '../services/credentialService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { recordAudit, requestContext } from '../services/auditService.js'

export const list = asyncHandler(async (req, res) => {
  const credentials = await credentialService.listCredentials(req.user, req.query)
  res.json({ credentials })
})

export const getById = asyncHandler(async (req, res) => {
  const credential = await credentialService.getCredential(req.user, req.params.id)
  res.json({ credential })
})

export const create = asyncHandler(async (req, res) => {
  const credential = await credentialService.createCredential(req.user, req.body)
  await recordAudit({
    userId: req.user.id,
    action: 'CREATE_CREDENTIAL',
    resource: 'credential',
    resourceId: credential.id,
    ...requestContext(req),
  })
  res.status(201).json({ credential })
})

export const update = asyncHandler(async (req, res) => {
  const credential = await credentialService.updateCredential(req.user, req.params.id, req.body)
  await recordAudit({
    userId: req.user.id,
    action: 'UPDATE_CREDENTIAL',
    resource: 'credential',
    resourceId: credential.id,
    ...requestContext(req),
  })
  res.json({ credential })
})

export const remove = asyncHandler(async (req, res) => {
  await credentialService.deleteCredential(req.user, req.params.id)
  await recordAudit({
    userId: req.user.id,
    action: 'DELETE_CREDENTIAL',
    resource: 'credential',
    resourceId: req.params.id,
    ...requestContext(req),
  })
  res.status(204).send()
})

export const revealPassword = asyncHandler(async (req, res) => {
  const password = await credentialService.revealPassword(
    req.user,
    req.params.id,
    requestContext(req),
  )
  res.json({ password })
})

export const copy = asyncHandler(async (req, res) => {
  const value = await credentialService.copyField(
    req.user,
    req.params.id,
    req.body.field,
    requestContext(req),
  )
  res.json({ value })
})

export const setAccess = asyncHandler(async (req, res) => {
  const credential = await credentialService.setAccessList(
    req.user,
    req.params.id,
    req.body.grants,
  )
  res.json({ credential })
})

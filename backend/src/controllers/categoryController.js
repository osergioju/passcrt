import * as categoryService from '../services/categoryService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { recordAudit, requestContext } from '../services/auditService.js'

export const list = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories({ search: req.query.search })
  res.json({ categories })
})

export const getById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategory(req.params.id)
  res.json({ category })
})

export const create = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body)
  await recordAudit({
    userId: req.user.id,
    action: 'CREATE_CATEGORY',
    resource: 'category',
    resourceId: category.id,
    ...requestContext(req),
  })
  res.status(201).json({ category })
})

export const update = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body)
  await recordAudit({
    userId: req.user.id,
    action: 'UPDATE_CATEGORY',
    resource: 'category',
    resourceId: category.id,
    ...requestContext(req),
  })
  res.json({ category })
})

export const remove = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id)
  await recordAudit({
    userId: req.user.id,
    action: 'DELETE_CATEGORY',
    resource: 'category',
    resourceId: req.params.id,
    ...requestContext(req),
  })
  res.status(204).send()
})

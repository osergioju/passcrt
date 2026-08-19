import * as categoryRepository from '../repositories/categoryRepository.js'
import { ConflictError, NotFoundError } from '../utils/AppError.js'

function serialize(category) {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    icon: category.icon,
    status: category.status,
    credentialsCount: category._count?.credentials ?? 0,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }
}

export async function listCategories({ search } = {}) {
  const categories = await categoryRepository.listCategories({ search })
  return categories.map(serialize)
}

export async function getCategory(id) {
  const category = await categoryRepository.findCategoryById(id)
  if (!category) throw new NotFoundError('Categoria não encontrada')
  return serialize(category)
}

export async function createCategory(data) {
  const category = await categoryRepository.createCategory(data)
  return serialize(category)
}

export async function updateCategory(id, data) {
  const existing = await categoryRepository.findCategoryById(id)
  if (!existing) throw new NotFoundError('Categoria não encontrada')
  const category = await categoryRepository.updateCategory(id, data)
  return serialize(category)
}

export async function deleteCategory(id) {
  const existing = await categoryRepository.findCategoryById(id)
  if (!existing) throw new NotFoundError('Categoria não encontrada')

  const credentialsCount = await categoryRepository.countCredentialsForCategory(id)
  if (credentialsCount > 0) {
    throw new ConflictError(
      `Não é possível excluir: existem ${credentialsCount} credencial(is) vinculada(s) a esta categoria`,
    )
  }

  await categoryRepository.deleteCategory(id)
}

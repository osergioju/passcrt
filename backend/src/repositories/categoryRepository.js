import { prisma } from '../config/prisma.js'

export function listCategories({ search } = {}) {
  return prisma.category.findMany({
    where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
    orderBy: { name: 'asc' },
    include: { _count: { select: { credentials: true } } },
  })
}

export function findCategoryById(id) {
  return prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { credentials: true } } },
  })
}

export function createCategory(data) {
  return prisma.category.create({ data, include: { _count: { select: { credentials: true } } } })
}

export function updateCategory(id, data) {
  return prisma.category.update({
    where: { id },
    data,
    include: { _count: { select: { credentials: true } } },
  })
}

export function deleteCategory(id) {
  return prisma.category.delete({ where: { id } })
}

export function countCredentialsForCategory(categoryId) {
  return prisma.credential.count({ where: { categoryId } })
}

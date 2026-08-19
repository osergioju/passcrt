import { http } from './http.js'

export async function listCategories({ search } = {}) {
  const res = await http.get('/categories', { params: { search: search || undefined } })
  return res.data.categories
}

export async function getCategory(id) {
  const res = await http.get(`/categories/${id}`)
  return res.data.category
}

export async function createCategory(data) {
  const res = await http.post('/categories', data)
  return res.data.category
}

export async function updateCategory(id, data) {
  const res = await http.put(`/categories/${id}`, data)
  return res.data.category
}

export async function deleteCategory(id) {
  await http.delete(`/categories/${id}`)
}

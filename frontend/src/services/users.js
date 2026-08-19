import { http } from './http.js'

export async function listUsers({ page = 1 } = {}) {
  const res = await http.get('/users', { params: { page } })
  return res.data.users
}

export async function getUser(id) {
  const res = await http.get(`/users/${id}`)
  return res.data.user
}

export async function createUser(data) {
  const res = await http.post('/users', data)
  return res.data.user
}

export async function updateUser(id, data) {
  const res = await http.put(`/users/${id}`, data)
  return res.data.user
}

export async function deleteUser(id) {
  await http.delete(`/users/${id}`)
}

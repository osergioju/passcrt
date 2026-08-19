import { http } from './http.js'

export async function listAdmins() {
  const res = await http.get('/admins')
  return res.data.admins
}

export async function createAdmin(data) {
  const res = await http.post('/admins', data)
  return res.data.admin
}

export async function updateAdmin(id, data) {
  const res = await http.put(`/admins/${id}`, data)
  return res.data.admin
}

export async function deleteAdmin(id) {
  await http.delete(`/admins/${id}`)
}

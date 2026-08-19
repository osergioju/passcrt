import { http } from './http.js'

export async function listClients({ search } = {}) {
  const res = await http.get('/clients', { params: { search: search || undefined } })
  return res.data.clients
}

export async function getClient(id) {
  const res = await http.get(`/clients/${id}`)
  return res.data.client
}

export async function createClient(data) {
  const res = await http.post('/clients', data)
  return res.data.client
}

export async function updateClient(id, data) {
  const res = await http.put(`/clients/${id}`, data)
  return res.data.client
}

export async function deleteClient(id) {
  await http.delete(`/clients/${id}`)
}

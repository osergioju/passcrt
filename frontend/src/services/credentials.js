import { http } from './http.js'

export async function listCredentials({ search, clientId, categoryId } = {}) {
  const res = await http.get('/credentials', {
    params: {
      search: search || undefined,
      clientId: clientId || undefined,
      categoryId: categoryId || undefined,
    },
  })
  return res.data.credentials
}

export async function getCredential(id) {
  const res = await http.get(`/credentials/${id}`)
  return res.data.credential
}

export async function createCredential(data) {
  const res = await http.post('/credentials', data)
  return res.data.credential
}

export async function updateCredential(id, data) {
  const res = await http.put(`/credentials/${id}`, data)
  return res.data.credential
}

export async function deleteCredential(id) {
  await http.delete(`/credentials/${id}`)
}

export async function revealPassword(id) {
  const res = await http.post(`/credentials/${id}/password`)
  return res.data.password
}

export async function copyField(id, field) {
  const res = await http.post(`/credentials/${id}/copy`, { field })
  return res.data.value
}

export async function setAccess(id, grants) {
  const res = await http.put(`/credentials/${id}/access`, { grants })
  return res.data.credential
}

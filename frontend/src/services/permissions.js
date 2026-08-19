import { http } from './http.js'

export async function fetchPermissionsCatalog() {
  const res = await http.get('/permissions')
  return res.data
}

import { http } from './http.js'

export async function login({ email, password, rememberMe }) {
  const res = await http.post(
    '/auth/login',
    { email, password, rememberMe },
    { _skipAuth: true, _skipRefresh: true },
  )
  return res.data
}

export async function logout() {
  await http.post('/auth/logout')
}

export async function fetchMe() {
  const res = await http.get('/auth/me')
  return res.data.user
}

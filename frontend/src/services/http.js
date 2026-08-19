import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const http = axios.create({
  baseURL,
  withCredentials: true,
})

// Token de acesso mantido só em memória (nunca em localStorage) — em
// caso de XSS, um token de vida curta em memória é bem menos valioso
// que um token persistido. A sessão sobrevive a reloads via o cookie
// httpOnly de refresh (ver AuthContext, que chama /auth/refresh no boot).
let accessToken = null
let onUnauthorized = null

export function setAccessToken(token) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

// Registrado pelo AuthContext: chamado quando o refresh falha, para
// limpar o estado de sessão da aplicação.
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

http.interceptors.request.use((config) => {
  if (accessToken && !config._skipAuth) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let refreshPromise = null

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = http
      .post('/auth/refresh', null, { _skipAuth: true, _skipRefresh: true })
      .then((res) => {
        setAccessToken(res.data.accessToken)
        return res.data
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error
    if (!response || response.status !== 401 || config._skipRefresh || config._retried) {
      throw error
    }

    config._retried = true
    try {
      await refreshAccessToken()
      return http(config)
    } catch (refreshError) {
      setAccessToken(null)
      onUnauthorized?.()
      throw refreshError
    }
  },
)

export function extractErrorMessage(error, fallback = 'Ocorreu um erro inesperado') {
  return error?.response?.data?.error || error?.message || fallback
}

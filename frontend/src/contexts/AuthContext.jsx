import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { http, setAccessToken, setUnauthorizedHandler } from '../services/http.js'
import * as authApi from '../services/auth.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)

  const clearSession = useCallback(() => {
    setAccessToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(clearSession)
  }, [clearSession])

  // No boot, tenta trocar o cookie httpOnly de refresh por um novo
  // access token — é assim que a sessão sobrevive a um F5 sem guardar
  // nada sensível em localStorage.
  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      try {
        const res = await http.post('/auth/refresh', null, { _skipAuth: true, _skipRefresh: true })
        if (cancelled) return
        setAccessToken(res.data.accessToken)
        setUser(res.data.user)
      } catch {
        if (!cancelled) clearSession()
      } finally {
        if (!cancelled) setBooting(false)
      }
    }
    bootstrap()
    return () => {
      cancelled = true
    }
  }, [clearSession])

  const login = useCallback(async ({ email, password, rememberMe }) => {
    const data = await authApi.login({ email, password, rememberMe })
    setAccessToken(data.accessToken)
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearSession()
    }
  }, [clearSession])

  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false
      if (!permission) return true
      const list = Array.isArray(permission) ? permission : [permission]
      return list.every((key) => user.permissions.includes(key))
    },
    [user],
  )

  const hasRole = useCallback(
    (role) => {
      if (!user) return false
      const list = Array.isArray(role) ? role : [role]
      return list.some((key) => user.roles.includes(key))
    },
    [user],
  )

  const value = useMemo(
    () => ({ user, booting, login, logout, hasPermission, hasRole }),
    [user, booting, login, logout, hasPermission, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

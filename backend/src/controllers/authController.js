import * as authService from '../services/authService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { env } from '../config/env.js'
import { parseDurationMs } from '../utils/duration.js'
import { requestContext } from '../services/auditService.js'

const REFRESH_COOKIE_NAME = 'refresh_token'

function refreshCookieOptions(rememberMe) {
  const options = {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    path: env.cookiePath,
  }
  // Sem "lembrar de mim": cookie de sessão (expira ao fechar o navegador).
  if (rememberMe) {
    options.maxAge = parseDurationMs(env.jwtRefreshExpiresIn)
  }
  return options
}

function setRefreshCookie(res, token, rememberMe) {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions(rememberMe))
}

export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body
  const { ipAddress, userAgent } = requestContext(req)

  const result = await authService.login({ email, password, rememberMe, ipAddress, userAgent })

  setRefreshCookie(res, result.refreshToken, rememberMe)
  res.json({ accessToken: result.accessToken, user: result.user })
})

export const refresh = asyncHandler(async (req, res) => {
  const { ipAddress, userAgent } = requestContext(req)
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME]

  const result = await authService.refresh({ rawRefreshToken, ipAddress, userAgent })

  setRefreshCookie(res, result.refreshToken, result.rememberMe)
  res.json({ accessToken: result.accessToken, user: result.user })
})

export const logout = asyncHandler(async (req, res) => {
  const { ipAddress, userAgent } = requestContext(req)
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME]

  await authService.logout({ rawRefreshToken, userId: req.user?.id, ipAddress, userAgent })

  res.clearCookie(REFRESH_COOKIE_NAME, { path: env.cookiePath })
  res.status(204).send()
})

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getAuthenticatedUser(req.user.id)
  res.json({ user })
})

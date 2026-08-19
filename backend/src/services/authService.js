import { hashPassword, verifyPassword } from '../crypto/password.js'
import {
  signAccessToken,
  generateRefreshTokenValue,
  hashRefreshToken,
} from '../crypto/tokens.js'
import { addDuration } from '../utils/duration.js'
import { env } from '../config/env.js'
import {
  findUserByEmail,
  findUserById,
  extractRolesAndPermissions,
} from '../repositories/userRepository.js'
import {
  createSession,
  createRefreshToken,
  findActiveRefreshTokenByHash,
  revokeRefreshToken,
  revokeSession,
  touchSession,
} from '../repositories/sessionRepository.js'
import { isLocked, registerFailure, registerSuccess } from './loginAttemptTracker.js'
import { recordAudit } from './auditService.js'
import { AppError, UnauthorizedError } from '../utils/AppError.js'

const GENERIC_LOGIN_ERROR = 'E-mail ou senha inválidos'

async function issueTokens(userId, { userAgent, ipAddress, rememberMe }) {
  const session = await createSession({ userId, userAgent, ipAddress, rememberMe })
  const rawRefreshToken = generateRefreshTokenValue()
  const expiresAt = addDuration(new Date(), env.jwtRefreshExpiresIn)

  await createRefreshToken({
    sessionId: session.id,
    tokenHash: hashRefreshToken(rawRefreshToken),
    expiresAt,
  })

  const accessToken = signAccessToken(userId)
  return { accessToken, refreshToken: rawRefreshToken, session }
}

export async function login({ email, password, rememberMe, ipAddress, userAgent }) {
  if (isLocked(email)) {
    throw new AppError(
      'Conta temporariamente bloqueada após várias tentativas malsucedidas. Tente novamente mais tarde.',
      429,
    )
  }

  const user = await findUserByEmail(email)

  if (!user || user.status !== 'ACTIVE') {
    registerFailure(email)
    await recordAudit({
      action: 'LOGIN_FAILED',
      resource: 'auth',
      ipAddress,
      userAgent,
      metadata: { email },
    })
    throw new UnauthorizedError(GENERIC_LOGIN_ERROR)
  }

  const passwordValid = await verifyPassword(user.passwordHash, password)
  if (!passwordValid) {
    registerFailure(email)
    await recordAudit({
      userId: user.id,
      action: 'LOGIN_FAILED',
      resource: 'auth',
      ipAddress,
      userAgent,
    })
    throw new UnauthorizedError(GENERIC_LOGIN_ERROR)
  }

  registerSuccess(email)

  const { accessToken, refreshToken, session } = await issueTokens(user.id, {
    userAgent,
    ipAddress,
    rememberMe,
  })

  await recordAudit({
    userId: user.id,
    action: 'LOGIN',
    resource: 'auth',
    resourceId: session.id,
    ipAddress,
    userAgent,
  })

  const { roleNames, permissionKeys } = extractRolesAndPermissions(user)

  return {
    accessToken,
    refreshToken,
    rememberMe,
    user: publicUser(user, roleNames, permissionKeys),
  }
}

export async function refresh({ rawRefreshToken, ipAddress, userAgent }) {
  if (!rawRefreshToken) throw new UnauthorizedError('Sessão inválida')

  const tokenHash = hashRefreshToken(rawRefreshToken)
  const existing = await findActiveRefreshTokenByHash(tokenHash)
  if (!existing) throw new UnauthorizedError('Sessão inválida ou expirada')

  const user = await findUserById(existing.session.userId)
  if (!user || user.status !== 'ACTIVE') {
    throw new UnauthorizedError('Sessão inválida')
  }

  // Rotação: o token usado é sempre revogado, mesmo em caso de sucesso,
  // e um novo é emitido para a mesma sessão. Isso limita o dano de um
  // token de refresh vazado a um único uso.
  await revokeRefreshToken(existing.id)
  await touchSession(existing.sessionId)

  const rawNewRefreshToken = generateRefreshTokenValue()
  const expiresAt = addDuration(new Date(), env.jwtRefreshExpiresIn)
  await createRefreshToken({
    sessionId: existing.sessionId,
    tokenHash: hashRefreshToken(rawNewRefreshToken),
    expiresAt,
  })

  const accessToken = signAccessToken(user.id)
  const { roleNames, permissionKeys } = extractRolesAndPermissions(user)

  return {
    accessToken,
    refreshToken: rawNewRefreshToken,
    rememberMe: existing.session.rememberMe,
    user: publicUser(user, roleNames, permissionKeys),
  }
}

export async function logout({ rawRefreshToken, userId, ipAddress, userAgent }) {
  if (rawRefreshToken) {
    const tokenHash = hashRefreshToken(rawRefreshToken)
    const existing = await findActiveRefreshTokenByHash(tokenHash)
    if (existing) {
      await revokeSession(existing.sessionId)
    }
  }

  await recordAudit({ userId, action: 'LOGOUT', resource: 'auth', ipAddress, userAgent })
}

export async function getAuthenticatedUser(userId) {
  const user = await findUserById(userId)
  if (!user || user.status !== 'ACTIVE') return null
  const { roleNames, permissionKeys } = extractRolesAndPermissions(user)
  return publicUser(user, roleNames, permissionKeys)
}

function publicUser(user, roleNames, permissionKeys) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    roles: [...roleNames],
    permissions: [...permissionKeys],
  }
}

import jwt from 'jsonwebtoken'
import { randomBytes, createHmac } from 'node:crypto'
import { env } from '../config/env.js'

// Access token: JWT de vida curta, carrega apenas o id do usuário.
// Papéis/permissões são resolvidos no banco a cada request (nunca
// confiamos apenas no que está dentro do token).
export function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  })
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.jwtSecret)
  return payload.sub
}

// Refresh token: valor opaco aleatório (não é JWT). O valor bruto é
// entregue ao cliente uma única vez; apenas o hash HMAC é persistido,
// então um vazamento do banco não permite forjar sessões.
export function generateRefreshTokenValue() {
  return randomBytes(64).toString('hex')
}

export function hashRefreshToken(rawToken) {
  return createHmac('sha256', env.jwtRefreshSecret).update(rawToken).digest('hex')
}

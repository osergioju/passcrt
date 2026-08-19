import 'dotenv/config'

function required(name, { onlyInProduction = false } = {}) {
  const value = process.env[name]
  if (!value && (onlyInProduction ? process.env.NODE_ENV === 'production' : true)) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  encryptionKey: required('ENCRYPTION_KEY'),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  allowCreateAdmin: process.env.ALLOW_CREATE_ADMIN === 'true',
}

if (env.encryptionKey && Buffer.from(env.encryptionKey, 'hex').length !== 32) {
  throw new Error('ENCRYPTION_KEY must be a 32-byte value encoded as hex (64 hex characters).')
}

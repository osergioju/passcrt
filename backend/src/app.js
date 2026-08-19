import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import { apiRateLimiter } from './middleware/rateLimit.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { authRoutes } from './routes/authRoutes.js'
import { userRoutes } from './routes/userRoutes.js'
import { clientRoutes } from './routes/clientRoutes.js'
import { categoryRoutes } from './routes/categoryRoutes.js'
import { credentialRoutes } from './routes/credentialRoutes.js'
import { adminRoutes } from './routes/adminRoutes.js'
import { permissionRoutes } from './routes/permissionRoutes.js'
import { auditRoutes } from './routes/auditRoutes.js'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', 1)
  app.use(helmet())
  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '100kb' }))
  app.use(cookieParser())
  app.use(apiRateLimiter)

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/clients', clientRoutes)
  app.use('/api/categories', categoryRoutes)
  app.use('/api/credentials', credentialRoutes)
  app.use('/api/admins', adminRoutes)
  app.use('/api/permissions', permissionRoutes)
  app.use('/api/audit', auditRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

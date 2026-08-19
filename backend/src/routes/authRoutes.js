import { Router } from 'express'
import * as authController from '../controllers/authController.js'
import { authenticate } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'
import { loginSchema } from '../validators/authValidators.js'
import { loginRateLimiter } from '../middleware/rateLimit.js'

export const authRoutes = Router()

authRoutes.post('/login', loginRateLimiter, validate(loginSchema), authController.login)
authRoutes.post('/refresh', authController.refresh)
authRoutes.post('/logout', authenticate, authController.logout)
authRoutes.get('/me', authenticate, authController.me)

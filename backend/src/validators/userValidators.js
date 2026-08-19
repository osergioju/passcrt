import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter ao menos 8 caracteres')
  .max(200)

export const createUserSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    email: z.string().trim().email().max(255),
    password: passwordSchema,
    confirmPassword: z.string(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
})

export { idParamSchema } from './common.js'

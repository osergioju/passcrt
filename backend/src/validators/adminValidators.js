import { z } from 'zod'

const passwordSchema = z.string().min(12, 'A senha deve ter ao menos 12 caracteres').max(200)

export const createAdminSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    email: z.string().trim().email().max(255),
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(['ADMIN', 'ADMIN_MASTER']).default('ADMIN'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export const updateAdminSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  role: z.enum(['ADMIN', 'ADMIN_MASTER']).optional(),
})

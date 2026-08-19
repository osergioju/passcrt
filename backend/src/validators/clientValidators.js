import { z } from 'zod'

export const createClientSchema = z.object({
  name: z.string().trim().min(2).max(150),
  tradeName: z.string().trim().max(150).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
})

export const updateClientSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  tradeName: z.string().trim().max(150).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
})

import { z } from 'zod'

export const createCredentialSchema = z.object({
  name: z.string().trim().min(2).max(150),
  clientId: z.string().uuid(),
  categoryId: z.string().uuid(),
  url: z.string().trim().url().max(500).optional().or(z.literal('')).nullable(),
  username: z.string().trim().max(255).optional().nullable(),
  password: z.string().min(1).max(500),
  notes: z.string().trim().max(4000).optional().nullable(),
  tags: z.array(z.string().trim().max(50)).max(20).optional().default([]),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  // Usuários (além de quem cria e dos admins) que já nascem com acesso.
  accessUserIds: z.array(z.string().uuid()).optional().default([]),
})

export const updateCredentialSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  clientId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  url: z.string().trim().url().max(500).optional().or(z.literal('')).nullable(),
  username: z.string().trim().max(255).optional().nullable(),
  password: z.string().min(1).max(500).optional(),
  notes: z.string().trim().max(4000).optional().nullable(),
  tags: z.array(z.string().trim().max(50)).max(20).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
})

export const listCredentialsQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  clientId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
})

export const copyCredentialSchema = z.object({
  field: z.enum(['password', 'login']),
})

export const setAccessSchema = z.object({
  grants: z
    .array(
      z.object({
        userId: z.string().uuid(),
        canViewPassword: z.boolean().optional().default(true),
      }),
    )
    .max(500),
})

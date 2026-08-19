import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loginSchema } from '../src/validators/authValidators.js'
import { createCredentialSchema } from '../src/validators/credentialValidators.js'
import { createAdminSchema } from '../src/validators/adminValidators.js'
import { listAuditLogsQuerySchema } from '../src/validators/auditValidators.js'

test('loginSchema: rejeita e-mail inválido', () => {
  const result = loginSchema.safeParse({ email: 'não-é-email', password: '123456' })
  assert.equal(result.success, false)
})

test('loginSchema: aplica rememberMe=false por padrão', () => {
  const result = loginSchema.safeParse({ email: 'user@example.com', password: '123456' })
  assert.equal(result.success, true)
  assert.equal(result.data.rememberMe, false)
})

test('createCredentialSchema: exige clientId e categoryId como UUID', () => {
  const result = createCredentialSchema.safeParse({
    name: 'Painel X',
    clientId: 'não-é-uuid',
    categoryId: 'não-é-uuid',
    password: 'segredo',
  })
  assert.equal(result.success, false)
})

test('createAdminSchema: rejeita quando as senhas não coincidem', () => {
  const result = createAdminSchema.safeParse({
    name: 'Admin Teste',
    email: 'admin@example.com',
    password: 'senha-com-doze-chars',
    confirmPassword: 'outra-senha-diferente',
  })
  assert.equal(result.success, false)
  assert.ok(result.error.issues.some((i) => i.path.includes('confirmPassword')))
})

test('listAuditLogsQuerySchema: aplica page=1 e pageSize=50 por padrão', () => {
  const result = listAuditLogsQuerySchema.safeParse({})
  assert.equal(result.success, true)
  assert.equal(result.data.page, 1)
  assert.equal(result.data.pageSize, 50)
})

test('listAuditLogsQuerySchema: rejeita action fora do enum AuditAction', () => {
  const result = listAuditLogsQuerySchema.safeParse({ action: 'ACAO_INEXISTENTE' })
  assert.equal(result.success, false)
})

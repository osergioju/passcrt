import { randomUUID } from 'node:crypto'
import { prisma } from '../../src/config/prisma.js'
import { hashPassword } from '../../src/crypto/password.js'
import * as userRepository from '../../src/repositories/userRepository.js'
import * as roleRepository from '../../src/repositories/roleRepository.js'

const TEST_PASSWORD = 'senha-de-teste-123456'

// Cria um usuário de teste com o role indicado (assume que o seed já
// rodou contra o banco de teste, então o role existe). Retorna a senha
// em texto claro para o teste poder fazer login de verdade.
export async function createUserFixture(roleName, overrides = {}) {
  const role = await roleRepository.findRoleByName(roleName)
  if (!role) throw new Error(`Role ${roleName} não encontrada — rode o seed no banco de teste`)

  const email = overrides.email || `teste-${randomUUID()}@example.com`
  const passwordHash = await hashPassword(overrides.password || TEST_PASSWORD)

  const user = await userRepository.createUser({
    name: overrides.name || 'Usuário de Teste',
    email,
    passwordHash,
    roleIds: [role.id],
  })

  return { id: user.id, email, password: overrides.password || TEST_PASSWORD }
}

export async function createClientFixture(overrides = {}) {
  return prisma.client.create({
    data: { name: overrides.name || `Cliente Teste ${randomUUID().slice(0, 8)}` },
  })
}

export async function createCategoryFixture(overrides = {}) {
  return prisma.category.create({
    data: { name: overrides.name || `Categoria Teste ${randomUUID().slice(0, 8)}` },
  })
}

// Apaga tudo que os testes criaram, na ordem certa para respeitar as
// FKs que não têm cascade (client/category ligados a credenciais).
export async function cleanupFixtures({ userIds = [], clientIds = [], categoryIds = [] } = {}) {
  if (userIds.length) {
    await prisma.credential.deleteMany({
      where: { OR: [{ createdById: { in: userIds } }, { updatedById: { in: userIds } }] },
    })
    await prisma.auditLog.deleteMany({ where: { userId: { in: userIds } } })
    await prisma.user.deleteMany({ where: { id: { in: userIds } } })
  }
  if (clientIds.length) await prisma.client.deleteMany({ where: { id: { in: clientIds } } })
  if (categoryIds.length) await prisma.category.deleteMany({ where: { id: { in: categoryIds } } })
}

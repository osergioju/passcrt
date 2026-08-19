// Seed de dados NÃO sensíveis: roles, permissões e categorias padrão.
// Não cria nenhum usuário/admin — isso é feito exclusivamente pelo
// comando `npm run create-admin`.

import { PrismaClient } from '@prisma/client'
import {
  ALL_PERMISSION_KEYS,
  DEFAULT_ROLE_PERMISSIONS,
  ROLES,
} from '../src/config/permissions.js'

const prisma = new PrismaClient()

const DEFAULT_CATEGORIES = [
  { name: 'Sites', icon: 'globe' },
  { name: 'Redes Sociais', icon: 'share-2' },
  { name: 'E-mail', icon: 'mail' },
  { name: 'Hospedagem', icon: 'server' },
  { name: 'Domínios', icon: 'link' },
  { name: 'Google', icon: 'chrome' },
  { name: 'Meta', icon: 'facebook' },
  { name: 'Marketing', icon: 'megaphone' },
  { name: 'Sistemas', icon: 'settings' },
  { name: 'FTP', icon: 'folder' },
  { name: 'Banco de Dados', icon: 'database' },
  { name: 'Geral', icon: 'grid' },
  { name: 'Outros', icon: 'more-horizontal' },
]

async function seedPermissions() {
  for (const key of ALL_PERMISSION_KEYS) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    })
  }
}

async function seedRoles() {
  for (const roleName of Object.values(ROLES)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    })

    const permissionKeys = DEFAULT_ROLE_PERMISSIONS[roleName]
    const permissions = await prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
    })

    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      })
    }
  }
}

async function seedCategories() {
  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }
}

async function main() {
  await seedPermissions()
  await seedRoles()
  await seedCategories()
  console.log('Seed concluído: permissões, roles e categorias padrão criadas.')
}

main()
  .catch((err) => {
    console.error('Falha ao executar seed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

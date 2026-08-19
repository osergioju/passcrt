import { hashPassword } from '../crypto/password.js'
import { ROLES } from '../config/permissions.js'
import * as userRepository from '../repositories/userRepository.js'
import * as roleRepository from '../repositories/roleRepository.js'
import { prisma } from '../config/prisma.js'
import { AppError, ConflictError, NotFoundError } from '../utils/AppError.js'

function serialize(user) {
  const { roleNames } = userRepository.extractRolesAndPermissions(user)
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    roles: [...roleNames],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function isAdminRole(roleNames) {
  return roleNames.has(ROLES.ADMIN) || roleNames.has(ROLES.ADMIN_MASTER)
}

export async function listAdmins() {
  const users = await prisma.user.findMany({
    where: { roles: { some: { role: { name: { in: [ROLES.ADMIN, ROLES.ADMIN_MASTER] } } } } },
    orderBy: { createdAt: 'desc' },
    include: {
      roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
    },
  })
  return users.map(serialize)
}

export async function createAdmin({ name, email, password, role }) {
  const existing = await userRepository.findUserByEmail(email)
  if (existing) throw new ConflictError('Já existe um usuário com este e-mail')

  const roleRecord = await roleRepository.findRoleByName(role)
  if (!roleRecord) throw new AppError(`Role ${role} não configurada. Rode o seed.`, 500)

  const passwordHash = await hashPassword(password)
  const user = await userRepository.createUser({
    name,
    email,
    passwordHash,
    roleIds: [roleRecord.id],
  })
  return serialize(user)
}

export async function updateAdmin(id, data) {
  const existing = await userRepository.findUserById(id)
  if (!existing) throw new NotFoundError('Administrador não encontrado')

  const { roleNames: currentRoles } = userRepository.extractRolesAndPermissions(existing)
  if (!isAdminRole(currentRoles)) throw new NotFoundError('Administrador não encontrado')

  const isDemotingOrDeactivating =
    currentRoles.has(ROLES.ADMIN_MASTER) &&
    ((data.role && data.role !== ROLES.ADMIN_MASTER) || data.status === 'INACTIVE')

  if (isDemotingOrDeactivating) {
    const activeMasters = await roleRepository.countActiveUsersWithRole(ROLES.ADMIN_MASTER)
    if (activeMasters <= 1) {
      throw new AppError(
        'Não é possível remover o último Admin Master ativo do sistema',
        400,
      )
    }
  }

  const { role, ...userData } = data
  await userRepository.updateUser(id, userData)

  if (role) {
    const roleRecord = await roleRepository.findRoleByName(role)
    if (!roleRecord) throw new AppError(`Role ${role} não configurada.`, 500)
    await userRepository.setUserRoles(id, [roleRecord.id])
  }

  const updated = await userRepository.findUserById(id)
  return serialize(updated)
}

export async function deleteAdmin(id) {
  const existing = await userRepository.findUserById(id)
  if (!existing) throw new NotFoundError('Administrador não encontrado')

  const { roleNames } = userRepository.extractRolesAndPermissions(existing)
  if (!isAdminRole(roleNames)) throw new NotFoundError('Administrador não encontrado')

  if (roleNames.has(ROLES.ADMIN_MASTER)) {
    const activeMasters = await roleRepository.countActiveUsersWithRole(ROLES.ADMIN_MASTER)
    if (activeMasters <= 1) {
      throw new AppError(
        'Não é possível remover o último Admin Master ativo do sistema',
        400,
      )
    }
  }

  await userRepository.updateUser(id, { status: 'INACTIVE' })
}

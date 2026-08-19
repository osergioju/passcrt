import { hashPassword } from '../crypto/password.js'
import { ROLES } from '../config/permissions.js'
import * as userRepository from '../repositories/userRepository.js'
import * as roleRepository from '../repositories/roleRepository.js'
import { AppError, ConflictError, NotFoundError } from '../utils/AppError.js'

function serialize(user) {
  const { roleNames, permissionKeys } = userRepository.extractRolesAndPermissions(user)
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    roles: [...roleNames],
    permissions: [...permissionKeys],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export async function listUsers({ page = 1, pageSize = 50 } = {}) {
  const users = await userRepository.listUsers({ skip: (page - 1) * pageSize, take: pageSize })
  return users.map(serialize)
}

export async function createUser({ name, email, password }) {
  const existing = await userRepository.findUserByEmail(email)
  if (existing) throw new ConflictError('Já existe um usuário com este e-mail')

  const userRole = await roleRepository.findRoleByName(ROLES.USER)
  if (!userRole) throw new AppError('Role USER não configurada. Rode o seed.', 500)

  const passwordHash = await hashPassword(password)
  const user = await userRepository.createUser({
    name,
    email,
    passwordHash,
    roleIds: [userRole.id],
  })
  return serialize(user)
}

export async function updateUser(id, data) {
  const existing = await userRepository.findUserById(id)
  if (!existing) throw new NotFoundError('Usuário não encontrado')

  const user = await userRepository.updateUser(id, data)
  return serialize(user)
}

export async function getUser(id) {
  const user = await userRepository.findUserById(id)
  if (!user) throw new NotFoundError('Usuário não encontrado')
  return serialize(user)
}

export async function deleteUser(id) {
  const existing = await userRepository.findUserById(id)
  if (!existing) throw new NotFoundError('Usuário não encontrado')

  const { roleNames } = userRepository.extractRolesAndPermissions(existing)
  if (roleNames.has(ROLES.ADMIN_MASTER) || roleNames.has(ROLES.ADMIN)) {
    throw new AppError(
      'Use a área de Administradores para remover contas com privilégios administrativos',
      400,
    )
  }

  await userRepository.updateUser(id, { status: 'INACTIVE' })
}

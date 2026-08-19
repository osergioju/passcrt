import * as credentialRepository from '../repositories/credentialRepository.js'
import { encryptSecret, decryptSecret } from '../crypto/vault.js'
import { recordAudit } from './auditService.js'
import { PERMISSIONS, ROLES } from '../config/permissions.js'
import { ForbiddenError, NotFoundError } from '../utils/AppError.js'

function isUnrestricted(user) {
  return user.roles.has(ROLES.ADMIN_MASTER)
}

// Visibilidade dos metadados da credencial (nome, cliente, categoria,
// login, URL...) — NUNCA inclui a senha.
function canSeeMetadata(user, credential) {
  if (isUnrestricted(user)) return true
  if (user.roles.has(ROLES.ADMIN)) return true
  return credential.permissions.some((p) => p.userId === user.id)
}

// Visibilidade do segredo em si. Mais restrita que os metadados: mesmo
// ADMIN precisa de concessão explícita por credencial (item 3 e 13 do
// escopo: "Visualizar credenciais permitidas"). Só ADMIN_MASTER tem
// acesso irrestrito.
async function canViewPassword(user, credentialId) {
  if (isUnrestricted(user)) return true
  if (!user.permissions.has(PERMISSIONS.CREDENTIALS_VIEW_PASSWORD)) return false
  const grant = await credentialRepository.userHasCredentialAccess(credentialId, user.id)
  return Boolean(grant?.canViewPassword)
}

function serializeSummary(credential) {
  return {
    id: credential.id,
    name: credential.name,
    client: credential.client,
    category: credential.category,
    url: credential.url,
    username: credential.username,
    tags: credential.tags,
    status: credential.status,
    updatedAt: credential.updatedAt,
  }
}

function serializeDetail(credential) {
  return {
    ...serializeSummary(credential),
    notes: credential.notes,
    createdAt: credential.createdAt,
    createdBy: credential.createdBy,
    updatedBy: credential.updatedBy,
    accessList: credential.permissions?.map((p) => ({
      userId: p.userId,
      name: p.user.name,
      email: p.user.email,
      canViewPassword: p.canViewPassword,
    })),
  }
}

export async function listCredentials(user, { search, clientId, categoryId } = {}) {
  const credentials = await credentialRepository.listCredentials({
    userId: user.id,
    unrestricted: isUnrestricted(user) || user.roles.has(ROLES.ADMIN),
    clientId,
    categoryId,
    search,
  })
  return credentials.map(serializeSummary)
}

export async function getCredential(user, id) {
  const credential = await credentialRepository.findCredentialById(id)
  if (!credential) throw new NotFoundError('Credencial não encontrada')
  if (!canSeeMetadata(user, credential)) {
    throw new ForbiddenError('Você não tem acesso a esta credencial')
  }
  return serializeDetail(credential)
}

export async function createCredential(user, data) {
  const { password, accessUserIds, ...rest } = data

  const credential = await credentialRepository.createCredential({
    ...rest,
    url: rest.url || null,
    encryptedPassword: encryptSecret(password),
    createdById: user.id,
    updatedById: user.id,
  })

  const grantUserIds = new Set([user.id, ...accessUserIds])
  await credentialRepository.setCredentialAccessList(
    credential.id,
    [...grantUserIds].map((userId) => ({ userId, canViewPassword: true })),
    user.id,
  )

  return getCredential(user, credential.id)
}

export async function updateCredential(user, id, data) {
  const existing = await credentialRepository.findCredentialById(id)
  if (!existing) throw new NotFoundError('Credencial não encontrada')
  if (!canSeeMetadata(user, existing)) {
    throw new ForbiddenError('Você não tem acesso a esta credencial')
  }

  const { password, ...rest } = data
  const updateData = { ...rest, updatedById: user.id }
  if (rest.url !== undefined) updateData.url = rest.url || null
  if (password) updateData.encryptedPassword = encryptSecret(password)

  await credentialRepository.updateCredential(id, updateData)
  return getCredential(user, id)
}

export async function deleteCredential(user, id) {
  const existing = await credentialRepository.findCredentialById(id)
  if (!existing) throw new NotFoundError('Credencial não encontrada')
  if (!canSeeMetadata(user, existing)) {
    throw new ForbiddenError('Você não tem acesso a esta credencial')
  }
  await credentialRepository.deleteCredential(id)
}

// Revela a senha em texto claro. Só deve ser chamado a partir do
// endpoint dedicado — nunca incluir o retorno desta função em listagens
// ou no detalhe padrão da credencial.
export async function revealPassword(user, id, { ipAddress, userAgent }) {
  const credential = await credentialRepository.findCredentialById(id)
  if (!credential) throw new NotFoundError('Credencial não encontrada')

  const allowed = await canViewPassword(user, id)
  if (!allowed) throw new ForbiddenError('Você não tem permissão para ver esta senha')

  const password = decryptSecret(credential.encryptedPassword)

  await recordAudit({
    userId: user.id,
    action: 'VIEW_PASSWORD',
    resource: 'credential',
    resourceId: id,
    ipAddress,
    userAgent,
  })

  return password
}

export async function copyField(user, id, field, { ipAddress, userAgent }) {
  const credential = await credentialRepository.findCredentialById(id)
  if (!credential) throw new NotFoundError('Credencial não encontrada')

  if (field === 'password') {
    const allowed = await canViewPassword(user, id)
    if (!allowed) throw new ForbiddenError('Você não tem permissão para copiar esta senha')

    const value = decryptSecret(credential.encryptedPassword)
    await recordAudit({
      userId: user.id,
      action: 'COPY_PASSWORD',
      resource: 'credential',
      resourceId: id,
      ipAddress,
      userAgent,
    })
    return value
  }

  // field === 'login'
  if (!canSeeMetadata(user, credential)) {
    throw new ForbiddenError('Você não tem acesso a esta credencial')
  }
  await recordAudit({
    userId: user.id,
    action: 'COPY_LOGIN',
    resource: 'credential',
    resourceId: id,
    ipAddress,
    userAgent,
  })
  return credential.username
}

export async function setAccessList(user, credentialId, grants) {
  const credential = await credentialRepository.findCredentialById(credentialId)
  if (!credential) throw new NotFoundError('Credencial não encontrada')

  // O criador mantém acesso garantido, mesmo que a nova lista o omita.
  const grantsWithCreator = credential.createdById
    ? [
        ...grants.filter((g) => g.userId !== credential.createdById),
        { userId: credential.createdById, canViewPassword: true },
      ]
    : grants

  await credentialRepository.setCredentialAccessList(credentialId, grantsWithCreator, user.id)

  await recordAudit({
    userId: user.id,
    action: 'UPDATE_PERMISSION',
    resource: 'credential',
    resourceId: credentialId,
    metadata: { grantedUserIds: grantsWithCreator.map((g) => g.userId) },
  })

  return getCredential(user, credentialId)
}

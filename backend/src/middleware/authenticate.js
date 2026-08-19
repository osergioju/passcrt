import { verifyAccessToken } from '../crypto/tokens.js'
import { findUserById, extractRolesAndPermissions } from '../repositories/userRepository.js'
import { UnauthorizedError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

function extractBearerToken(req) {
  const header = req.get('authorization')
  if (!header || !header.startsWith('Bearer ')) return null
  return header.slice('Bearer '.length).trim()
}

// Autentica a requisição via JWT de acesso. Sempre recarrega o usuário
// e suas roles/permissões do banco (nunca confia apenas no payload do
// token), garantindo que uma desativação ou mudança de permissão tenha
// efeito imediato, sem esperar o token expirar.
export const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractBearerToken(req)
  if (!token) throw new UnauthorizedError('Token de acesso ausente')

  let userId
  try {
    userId = verifyAccessToken(token)
  } catch {
    throw new UnauthorizedError('Token de acesso inválido ou expirado')
  }

  const user = await findUserById(userId)
  if (!user || user.status !== 'ACTIVE') {
    throw new UnauthorizedError('Usuário inativo ou não encontrado')
  }

  const { roleNames, permissionKeys } = extractRolesAndPermissions(user)

  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: roleNames,
    permissions: permissionKeys,
  }

  next()
})

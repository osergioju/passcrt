import * as clientRepository from '../repositories/clientRepository.js'
import { ConflictError, NotFoundError } from '../utils/AppError.js'

function serialize(client) {
  return {
    id: client.id,
    name: client.name,
    tradeName: client.tradeName,
    description: client.description,
    status: client.status,
    credentialsCount: client._count?.credentials ?? 0,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  }
}

export async function listClients({ search } = {}) {
  const clients = await clientRepository.listClients({ search })
  return clients.map(serialize)
}

export async function getClient(id) {
  const client = await clientRepository.findClientById(id)
  if (!client) throw new NotFoundError('Cliente não encontrado')
  return serialize(client)
}

export async function createClient(data) {
  const client = await clientRepository.createClient(data)
  return serialize(client)
}

export async function updateClient(id, data) {
  const existing = await clientRepository.findClientById(id)
  if (!existing) throw new NotFoundError('Cliente não encontrado')
  const client = await clientRepository.updateClient(id, data)
  return serialize(client)
}

export async function deleteClient(id) {
  const existing = await clientRepository.findClientById(id)
  if (!existing) throw new NotFoundError('Cliente não encontrado')

  const credentialsCount = await clientRepository.countCredentialsForClient(id)
  if (credentialsCount > 0) {
    throw new ConflictError(
      `Não é possível excluir: existem ${credentialsCount} credencial(is) vinculada(s) a este cliente`,
    )
  }

  await clientRepository.deleteClient(id)
}

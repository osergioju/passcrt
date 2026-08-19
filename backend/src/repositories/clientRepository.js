import { prisma } from '../config/prisma.js'

export function listClients({ skip = 0, take = 50, search } = {}) {
  return prisma.client.findMany({
    skip,
    take,
    where: search
      ? { name: { contains: search, mode: 'insensitive' } }
      : undefined,
    orderBy: { name: 'asc' },
    include: { _count: { select: { credentials: true } } },
  })
}

export function findClientById(id) {
  return prisma.client.findUnique({
    where: { id },
    include: { _count: { select: { credentials: true } } },
  })
}

export function createClient(data) {
  return prisma.client.create({ data, include: { _count: { select: { credentials: true } } } })
}

export function updateClient(id, data) {
  return prisma.client.update({
    where: { id },
    data,
    include: { _count: { select: { credentials: true } } },
  })
}

export function deleteClient(id) {
  return prisma.client.delete({ where: { id } })
}

export function countCredentialsForClient(clientId) {
  return prisma.credential.count({ where: { clientId } })
}

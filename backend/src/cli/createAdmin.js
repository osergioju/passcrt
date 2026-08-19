#!/usr/bin/env node
// Comando: npm run create-admin
//
// Único caminho para criar o primeiro Admin Master do sistema. Não
// existe (e nunca deve existir) uma rota HTTP pública equivalente.
//
// Proteções:
//   1. Recusa rodar em produção a menos que ALLOW_CREATE_ADMIN=true
//      esteja explicitamente definido no ambiente.
//   2. Recusa rodar se já existir um Admin Master ativo — administradores
//      adicionais devem ser criados pela área "Administradores" do
//      sistema, por um Admin Master já autenticado.
//   3. Nunca imprime a senha em tela (mascarada) nem em logs.

import readline from 'node:readline'
import { z } from 'zod'
import { prisma } from '../config/prisma.js'
import { hashPassword } from '../crypto/password.js'
import { promptPassword } from './promptSecure.js'
import { ROLES } from '../config/permissions.js'
import { env } from '../config/env.js'

const nameSchema = z.string().trim().min(2, 'Nome muito curto.').max(150)
const emailSchema = z.string().trim().email('E-mail inválido.').max(255)
const passwordSchema = z
  .string()
  .min(12, 'A senha deve ter ao menos 12 caracteres.')

// Usa o iterador assíncrono do readline em vez de `rl.question()`
// sequencial. Com stdin não-TTY (pipe/arquivo — usado em automação e
// nos testes deste comando), múltiplas linhas podem chegar ao buffer
// do stream antes que o próximo `question()` seja registrado, fazendo
// o evento 'line' correspondente se perder. O iterador enfileira as
// linhas corretamente em ambos os casos (TTY e não-TTY).
function createAsker(rl) {
  const iterator = rl[Symbol.asyncIterator]()
  return async function ask(question) {
    process.stdout.write(question)
    const { value, done } = await iterator.next()
    if (done) throw new Error('Entrada encerrada inesperadamente.')
    return value
  }
}

async function guardProductionExecution() {
  if (env.nodeEnv === 'production' && !env.allowCreateAdmin) {
    console.error(
      [
        'Bloqueado: NODE_ENV=production e ALLOW_CREATE_ADMIN não está habilitado.',
        '',
        'Para autorizar a criação de um Admin Master em produção, defina',
        'explicitamente ALLOW_CREATE_ADMIN=true no ambiente antes de rodar',
        'este comando, e remova a variável logo em seguida.',
      ].join('\n'),
    )
    process.exitCode = 1
    return false
  }
  return true
}

async function guardNoExistingMaster() {
  const existingMaster = await prisma.user.findFirst({
    where: {
      status: 'ACTIVE',
      roles: { some: { role: { name: ROLES.ADMIN_MASTER } } },
    },
  })

  if (existingMaster) {
    console.error(
      [
        'Já existe um Admin Master ativo no sistema.',
        '',
        'Para criar administradores adicionais, use a área "Administradores"',
        'do sistema, autenticado como Admin Master.',
      ].join('\n'),
    )
    process.exitCode = 1
    return false
  }
  return true
}

async function collectName(ask) {
  while (true) {
    const raw = await ask('Nome: ')
    const result = nameSchema.safeParse(raw)
    if (result.success) return result.data
    console.log(result.error.issues[0].message)
  }
}

async function collectEmail(ask) {
  while (true) {
    const raw = await ask('E-mail: ')
    const result = emailSchema.safeParse(raw)
    if (!result.success) {
      console.log(result.error.issues[0].message)
      continue
    }
    const email = result.data.toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      console.log('Já existe um usuário com este e-mail.')
      continue
    }
    return email
  }
}

// Em terminal interativo (TTY), a senha é lida em modo raw com
// mascaramento por asterisco. Em stdin não interativo (ex: automação /
// testes com input via pipe), cai para leitura de linha simples via
// readline — não há terminal para mascarar, e tentar misturar os dois
// modos sobre um stream não-TTY é frágil (o buffer pode já ter sido
// consumido antes do listener em modo raw ser religado).
async function collectPassword(ask) {
  const read = process.stdin.isTTY ? () => promptPassword('Senha: ') : () => ask('Senha: ')
  while (true) {
    const raw = await read()
    const result = passwordSchema.safeParse(raw)
    if (result.success) return result.data
    console.log(result.error.issues[0].message)
  }
}

async function main() {
  console.log('CRT Password Manager\n')

  if (!(await guardProductionExecution())) return
  if (!(await guardNoExistingMaster())) return

  const role = await prisma.role.findUnique({ where: { name: ROLES.ADMIN_MASTER } })
  if (!role) {
    console.error('Role ADMIN_MASTER não encontrada. Rode "npm run seed" antes.')
    process.exitCode = 1
    return
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const ask = createAsker(rl)
  let rlClosed = false

  try {
    const name = await collectName(ask)
    const email = await collectEmail(ask)

    const isInteractive = process.stdin.isTTY
    if (isInteractive) {
      rl.close()
      rlClosed = true
    }

    const password = await collectPassword(ask)
    const confirmPassword = isInteractive
      ? await promptPassword('Confirmar senha: ')
      : await ask('Confirmar senha: ')

    if (!isInteractive) {
      rl.close()
      rlClosed = true
    }

    if (password !== confirmPassword) {
      console.error('\nAs senhas não coincidem. Nenhum usuário foi criado.')
      process.exitCode = 1
      return
    }

    const passwordHash = await hashPassword(password)

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        roles: { create: [{ roleId: role.id }] },
      },
    })

    console.log('\nAdmin Master criado com sucesso.')
  } finally {
    if (!rlClosed) rl.close()
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('\nErro ao criar Admin Master:', err.message)
  process.exitCode = 1
})

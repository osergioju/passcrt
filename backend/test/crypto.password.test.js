import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword, verifyPassword } from '../src/crypto/password.js'

test('hashPassword/verifyPassword: aceita a senha correta', async () => {
  const hash = await hashPassword('minha-senha-forte')
  assert.equal(await verifyPassword(hash, 'minha-senha-forte'), true)
})

test('verifyPassword: rejeita senha incorreta', async () => {
  const hash = await hashPassword('minha-senha-forte')
  assert.equal(await verifyPassword(hash, 'senha-errada'), false)
})

test('verifyPassword: nunca lança, mesmo com hash malformado', async () => {
  assert.equal(await verifyPassword('não-é-um-hash-argon2', 'qualquer-senha'), false)
})

test('hashPassword: hashes de senhas iguais não são idênticos (salt aleatório)', async () => {
  const [a, b] = await Promise.all([hashPassword('repetida'), hashPassword('repetida')])
  assert.notEqual(a, b)
})

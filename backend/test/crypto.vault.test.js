import { test } from 'node:test'
import assert from 'node:assert/strict'
import { encryptSecret, decryptSecret } from '../src/crypto/vault.js'

test('encryptSecret/decryptSecret: round-trip preserva o texto original', () => {
  const plain = 'S3nh@-super-secreta!'
  const encrypted = encryptSecret(plain)
  assert.notEqual(encrypted, plain)
  assert.equal(decryptSecret(encrypted), plain)
})

test('encryptSecret: gera um IV diferente a cada chamada (ciphertexts não repetem)', () => {
  const a = encryptSecret('mesma-senha')
  const b = encryptSecret('mesma-senha')
  assert.notEqual(a, b)
})

test('decryptSecret: rejeita payload com formato inválido', () => {
  assert.throws(() => decryptSecret('formato-invalido-sem-separadores'))
})

test('decryptSecret: rejeita authTag adulterado (autenticação da cifra)', () => {
  const encrypted = encryptSecret('outro-segredo')
  const [iv, authTag, ciphertext] = encrypted.split(':')
  const tampered = [iv, Buffer.from(authTag, 'base64').fill(0).toString('base64'), ciphertext].join(':')
  assert.throws(() => decryptSecret(tampered))
})

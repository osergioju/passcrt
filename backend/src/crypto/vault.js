import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { env } from '../config/env.js'

// Criptografia simétrica reversível dos segredos do cofre (senhas das
// credenciais). AES-256-GCM: cifra autenticada, cada registro tem um
// IV único de 96 bits. A ENCRYPTION_KEY vive apenas em variável de
// ambiente — nunca no banco, nunca no código, nunca no frontend.

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

function getKey() {
  return Buffer.from(env.encryptionKey, 'hex')
}

// Formato armazenado: "iv:authTag:ciphertext", cada parte em base64.
export function encryptSecret(plainText) {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return [iv.toString('base64'), authTag.toString('base64'), ciphertext.toString('base64')].join(
    ':',
  )
}

export function decryptSecret(encoded) {
  const [ivB64, authTagB64, ciphertextB64] = encoded.split(':')
  if (!ivB64 || !authTagB64 || !ciphertextB64) {
    throw new Error('Formato de segredo cifrado inválido')
  }

  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(authTagB64, 'base64')
  const ciphertext = Buffer.from(ciphertextB64, 'base64')

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv)
  decipher.setAuthTag(authTag)

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return plaintext.toString('utf8')
}

import argon2 from 'argon2'

// Hash irreversível das senhas de login dos usuários do sistema.
// Argon2id: resistente tanto a ataques de GPU (side-channel) quanto a
// ataques de canal lateral (time-memory tradeoff), recomendação atual
// da OWASP para hashing de senhas.
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456, // ~19 MB, recomendação OWASP
  timeCost: 2,
  parallelism: 1,
}

export async function hashPassword(plainPassword) {
  return argon2.hash(plainPassword, ARGON2_OPTIONS)
}

export async function verifyPassword(hash, plainPassword) {
  try {
    return await argon2.verify(hash, plainPassword)
  } catch {
    return false
  }
}

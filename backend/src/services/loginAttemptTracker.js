// Lockout por conta após tentativas de login malsucedidas consecutivas.
// Armazenamento em memória: adequado para uma única instância do
// processo. Em um deploy com múltiplas instâncias, substituir por um
// backing store compartilhado (ex: Redis) mantendo a mesma interface.

const MAX_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000

const attempts = new Map()

function keyFor(email) {
  return email.toLowerCase()
}

export function isLocked(email) {
  const entry = attempts.get(keyFor(email))
  if (!entry || !entry.lockedUntil) return false
  if (entry.lockedUntil < Date.now()) {
    attempts.delete(keyFor(email))
    return false
  }
  return true
}

export function registerFailure(email) {
  const key = keyFor(email)
  const entry = attempts.get(key) || { count: 0, lockedUntil: null }
  entry.count += 1
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCK_DURATION_MS
  }
  attempts.set(key, entry)
}

export function registerSuccess(email) {
  attempts.delete(keyFor(email))
}

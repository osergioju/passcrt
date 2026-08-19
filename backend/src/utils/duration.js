const UNITS = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }

// Converte strings simples como "15m", "7d", "30s" em milissegundos.
export function parseDurationMs(value) {
  const match = /^(\d+)([smhd])$/.exec(value.trim())
  if (!match) {
    throw new Error(`Invalid duration format: ${value}`)
  }
  const [, amount, unit] = match
  return Number(amount) * UNITS[unit]
}

export function addDuration(date, durationStr) {
  return new Date(date.getTime() + parseDurationMs(durationStr))
}

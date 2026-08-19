import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDurationMs, addDuration } from '../src/utils/duration.js'

test('parseDurationMs: converte unidades corretamente', () => {
  assert.equal(parseDurationMs('30s'), 30_000)
  assert.equal(parseDurationMs('15m'), 900_000)
  assert.equal(parseDurationMs('2h'), 7_200_000)
  assert.equal(parseDurationMs('7d'), 604_800_000)
})

test('parseDurationMs: rejeita formatos inválidos', () => {
  assert.throws(() => parseDurationMs('15'))
  assert.throws(() => parseDurationMs('15x'))
  assert.throws(() => parseDurationMs('abc'))
})

test('addDuration: soma a duração à data base', () => {
  const base = new Date('2026-01-01T00:00:00.000Z')
  const result = addDuration(base, '1d')
  assert.equal(result.toISOString(), '2026-01-02T00:00:00.000Z')
})

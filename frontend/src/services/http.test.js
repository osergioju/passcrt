import { describe, expect, it } from 'vitest'
import { extractErrorMessage } from './http.js'

describe('extractErrorMessage', () => {
  it('usa a mensagem de erro devolvida pela API quando disponível', () => {
    const error = { response: { data: { error: 'Credencial não encontrada' } } }
    expect(extractErrorMessage(error)).toBe('Credencial não encontrada')
  })

  it('cai para error.message quando a API não devolveu um corpo', () => {
    const error = { message: 'Network Error' }
    expect(extractErrorMessage(error)).toBe('Network Error')
  })

  it('usa o fallback informado quando não há nenhuma mensagem disponível', () => {
    expect(extractErrorMessage({}, 'Algo deu errado')).toBe('Algo deu errado')
  })
})

import { describe, expect, it, beforeEach } from 'vitest'
import { http, setAccessToken } from './http.js'
import { login } from './auth.js'

// Regressão: um 401 de credenciais erradas no /auth/login não pode
// disparar o retry automático de refresh do interceptor — antes desse
// fix, a mensagem real ("e-mail ou senha inválidos") era substituída
// pela mensagem de falha do /auth/refresh ("Sessão inválida"),
// escondendo o erro verdadeiro do usuário.
describe('login', () => {
  beforeEach(() => {
    setAccessToken(null)
  })

  it('não chama /auth/refresh quando o login falha com 401', async () => {
    const calledUrls = []
    http.defaults.adapter = async (config) => {
      calledUrls.push(config.url)
      if (config.url === '/auth/login') {
        const error = new Error('Request failed with status code 401')
        error.config = config
        error.response = { status: 401, data: { error: 'E-mail ou senha inválidos' }, headers: {} }
        throw error
      }
      throw new Error(`chamada inesperada: ${config.url}`)
    }

    await expect(login({ email: 'a@b.com', password: 'errada' })).rejects.toMatchObject({
      response: { data: { error: 'E-mail ou senha inválidos' } },
    })

    expect(calledUrls).toEqual(['/auth/login'])
  })
})

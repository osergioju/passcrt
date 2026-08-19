import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext.jsx'
import { Login } from './Login.jsx'

function renderLogin(authValue) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>
        <Login />
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('Login', () => {
  it('renderiza os campos de e-mail, senha e o botão de entrar', () => {
    renderLogin({ login: vi.fn() })

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('chama login() com os dados do formulário ao submeter', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockResolvedValue(undefined)
    renderLogin({ login })

    await user.type(screen.getByLabelText(/e-mail/i), 'junior@crtcomunicacao.com.br')
    await user.type(screen.getByLabelText(/senha/i), 'senha-super-secreta')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(login).toHaveBeenCalledWith({
      email: 'junior@crtcomunicacao.com.br',
      password: 'senha-super-secreta',
      rememberMe: false,
    })
  })

  it('mostra a mensagem de erro devolvida pela API quando o login falha', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockRejectedValue({ response: { data: { error: 'E-mail ou senha inválidos' } } })
    renderLogin({ login })

    await user.type(screen.getByLabelText(/e-mail/i), 'junior@crtcomunicacao.com.br')
    await user.type(screen.getByLabelText(/senha/i), 'senha-errada')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText('E-mail ou senha inválidos')).toBeInTheDocument()
  })
})

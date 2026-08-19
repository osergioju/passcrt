import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext.jsx'
import { RequireAuth } from './RequireAuth.jsx'

function renderWithAuth(authValue) {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <AuthContext.Provider value={authValue}>
        <Routes>
          <Route path="/login" element={<div>Tela de login</div>} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<div>Área protegida</div>} />
          </Route>
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('RequireAuth', () => {
  it('mostra um spinner enquanto a sessão ainda está sendo verificada', () => {
    const { container } = renderWithAuth({ user: null, booting: true })
    expect(container.querySelector('svg')).toBeTruthy()
    expect(screen.queryByText('Área protegida')).not.toBeInTheDocument()
  })

  it('redireciona para /login quando não há usuário autenticado', () => {
    renderWithAuth({ user: null, booting: false })
    expect(screen.getByText('Tela de login')).toBeInTheDocument()
  })

  it('renderiza a área protegida quando há um usuário autenticado', () => {
    renderWithAuth({ user: { id: '1', name: 'Junior' }, booting: false })
    expect(screen.getByText('Área protegida')).toBeInTheDocument()
  })
})

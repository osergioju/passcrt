import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext.jsx'
import { RequireAccess } from './RequireAccess.jsx'

function renderWithAccess(authValue, props) {
  return render(
    <MemoryRouter initialEntries={['/area']}>
      <AuthContext.Provider value={authValue}>
        <Routes>
          <Route path="/403" element={<div>Acesso negado</div>} />
          <Route element={<RequireAccess {...props} />}>
            <Route path="/area" element={<div>Conteúdo restrito</div>} />
          </Route>
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('RequireAccess', () => {
  it('redireciona para /403 quando falta a permissão exigida', () => {
    renderWithAccess({ hasPermission: () => false, hasRole: () => true }, { permission: 'clients.view' })
    expect(screen.getByText('Acesso negado')).toBeInTheDocument()
  })

  it('renderiza o conteúdo quando a permissão exigida está presente', () => {
    renderWithAccess({ hasPermission: () => true, hasRole: () => true }, { permission: 'clients.view' })
    expect(screen.getByText('Conteúdo restrito')).toBeInTheDocument()
  })

  it('redireciona para /403 quando falta o role exigido, mesmo com a permissão presente', () => {
    renderWithAccess({ hasPermission: () => true, hasRole: () => false }, { role: 'ADMIN_MASTER' })
    expect(screen.getByText('Acesso negado')).toBeInTheDocument()
  })
})

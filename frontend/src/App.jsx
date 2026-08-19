import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'
import { RequireAuth } from './routes/RequireAuth.jsx'
import { RequireAccess } from './routes/RequireAccess.jsx'
import { AppLayout } from './layouts/AppLayout.jsx'
import { Login } from './pages/auth/Login.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { ClientsPage } from './pages/clients/ClientsPage.jsx'
import { CategoriesPage } from './pages/categories/CategoriesPage.jsx'
import { CredentialsPage } from './pages/credentials/CredentialsPage.jsx'
import { UsersPage } from './pages/users/UsersPage.jsx'
import { AdminsPage } from './pages/admins/AdminsPage.jsx'
import { PermissionsPage } from './pages/permissions/PermissionsPage.jsx'
import { AuditPage } from './pages/audit/AuditPage.jsx'
import { Forbidden } from './pages/Forbidden.jsx'
import { NotFound } from './pages/NotFound.jsx'
import { PERMISSIONS, ROLES } from './constants.js'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/403" element={<Forbidden />} />

            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route index element={<Dashboard />} />

                <Route element={<RequireAccess permission={PERMISSIONS.CREDENTIALS_VIEW} />}>
                  <Route path="/credenciais" element={<CredentialsPage />} />
                </Route>

                <Route element={<RequireAccess permission={PERMISSIONS.CLIENTS_VIEW} />}>
                  <Route path="/clientes" element={<ClientsPage />} />
                </Route>

                <Route element={<RequireAccess permission={PERMISSIONS.CATEGORIES_VIEW} />}>
                  <Route path="/categorias" element={<CategoriesPage />} />
                </Route>

                <Route element={<RequireAccess permission={PERMISSIONS.USERS_VIEW} />}>
                  <Route path="/usuarios" element={<UsersPage />} />
                </Route>

                <Route element={<RequireAccess role={ROLES.ADMIN_MASTER} />}>
                  <Route path="/administradores" element={<AdminsPage />} />
                  <Route path="/permissoes" element={<PermissionsPage />} />
                </Route>

                <Route element={<RequireAccess permission={PERMISSIONS.AUDIT_VIEW} />}>
                  <Route path="/auditoria" element={<AuditPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App

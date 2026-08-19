import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

// Gate de rota por permissão e/ou role. Espelha exatamente as checagens
// que o backend já faz (requirePermission / requireRole) — isso é só
// para não mostrar UI que a API vai recusar; a autorização real
// continua sendo aplicada no servidor.
export function RequireAccess({ permission, role }) {
  const { hasPermission, hasRole } = useAuth()

  const allowed = (!permission || hasPermission(permission)) && (!role || hasRole(role))

  if (!allowed) return <Navigate to="/403" replace />

  return <Outlet />
}

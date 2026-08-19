import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { FullPageSpinner } from '../components/ui/Spinner.jsx'

export function RequireAuth() {
  const { user, booting } = useAuth()
  const location = useLocation()

  if (booting) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  return <Outlet />
}

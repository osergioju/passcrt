import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { PERMISSIONS, ROLES } from '../constants.js'

const NAV_ITEMS = [
  { to: '/', label: 'Painel', icon: '🏠', end: true },
  { to: '/credenciais', label: 'Credenciais', icon: '🔐', permission: PERMISSIONS.CREDENTIALS_VIEW },
  { to: '/clientes', label: 'Clientes', icon: '🏢', permission: PERMISSIONS.CLIENTS_VIEW },
  { to: '/categorias', label: 'Categorias', icon: '🗂️', permission: PERMISSIONS.CATEGORIES_VIEW },
  { to: '/usuarios', label: 'Usuários', icon: '👥', permission: PERMISSIONS.USERS_VIEW },
  { to: '/administradores', label: 'Administradores', icon: '🛡️', role: ROLES.ADMIN_MASTER },
  { to: '/permissoes', label: 'Permissões', icon: '🔑', role: ROLES.ADMIN_MASTER },
  { to: '/auditoria', label: 'Auditoria', icon: '📜', permission: PERMISSIONS.AUDIT_VIEW },
]

export function Sidebar({ onNavigate }) {
  const { hasPermission, hasRole } = useAuth()

  const items = NAV_ITEMS.filter((item) => {
    if (item.permission && !hasPermission(item.permission)) return false
    if (item.role && !hasRole(item.role)) return false
    return true
  })

  return (
    <nav className="flex h-full flex-col gap-1 p-3">
      <div className="mb-4 flex items-center gap-2 px-2 py-1">
        <span className="text-lg">🔒</span>
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">CRT Cofre</span>
      </div>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ' +
            (isActive
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800')
          }
        >
          <span aria-hidden="true">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { PERMISSIONS } from '../constants.js'
import { listClients } from '../services/clients.js'
import { listCategories } from '../services/categories.js'
import { listCredentials } from '../services/credentials.js'
import { listAuditLogs } from '../services/audit.js'
import { PageHeader } from '../components/ui/PageHeader.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'

const AUDIT_LABELS = {
  LOGIN: 'entrou no sistema',
  LOGIN_FAILED: 'tentou entrar sem sucesso',
  LOGOUT: 'saiu do sistema',
  CREATE_CREDENTIAL: 'criou uma credencial',
  UPDATE_CREDENTIAL: 'atualizou uma credencial',
  DELETE_CREDENTIAL: 'excluiu uma credencial',
  VIEW_PASSWORD: 'visualizou uma senha',
  COPY_PASSWORD: 'copiou uma senha',
  COPY_LOGIN: 'copiou um login',
}

function StatCard({ to, label, value, icon, loading }) {
  return (
    <Link
      to={to}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {loading ? (
          <Spinner className="h-5 w-5" />
        ) : (
          <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</span>
        )}
      </div>
      <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </Link>
  )
}

export function Dashboard() {
  const { user, hasPermission } = useAuth()
  const [counts, setCounts] = useState({ clients: null, categories: null, credentials: null })
  const [recentLogs, setRecentLogs] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadCounts() {
      const tasks = {
        clients: hasPermission(PERMISSIONS.CLIENTS_VIEW) ? listClients() : Promise.resolve(null),
        categories: hasPermission(PERMISSIONS.CATEGORIES_VIEW) ? listCategories() : Promise.resolve(null),
        credentials: hasPermission(PERMISSIONS.CREDENTIALS_VIEW) ? listCredentials() : Promise.resolve(null),
      }
      const [clients, categories, credentials] = await Promise.all([
        tasks.clients,
        tasks.categories,
        tasks.credentials,
      ])
      if (cancelled) return
      setCounts({
        clients: clients?.length ?? null,
        categories: categories?.length ?? null,
        credentials: credentials?.length ?? null,
      })
    }

    async function loadAudit() {
      if (!hasPermission(PERMISSIONS.AUDIT_VIEW)) return
      const data = await listAuditLogs({ pageSize: 8 })
      if (!cancelled) setRecentLogs(data.logs)
    }

    loadCounts()
    loadAudit()
    return () => {
      cancelled = true
    }
  }, [hasPermission])

  return (
    <div>
      <PageHeader title={`Olá, ${user?.name?.split(' ')[0] ?? ''}`} description="Visão geral do cofre corporativo" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hasPermission(PERMISSIONS.CREDENTIALS_VIEW) && (
          <StatCard to="/credenciais" label="Credenciais" icon="🔐" value={counts.credentials} loading={counts.credentials === null} />
        )}
        {hasPermission(PERMISSIONS.CLIENTS_VIEW) && (
          <StatCard to="/clientes" label="Clientes" icon="🏢" value={counts.clients} loading={counts.clients === null} />
        )}
        {hasPermission(PERMISSIONS.CATEGORIES_VIEW) && (
          <StatCard to="/categorias" label="Categorias" icon="🗂️" value={counts.categories} loading={counts.categories === null} />
        )}
      </div>

      {hasPermission(PERMISSIONS.AUDIT_VIEW) && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Atividade recente</h2>
            <Link to="/auditoria" className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Ver tudo
            </Link>
          </div>
          {recentLogs === null ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : recentLogs.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum evento registrado ainda.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentLogs.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong className="font-medium">{log.user?.name ?? 'Sistema'}</strong>{' '}
                    {AUDIT_LABELS[log.action] ?? log.action.toLowerCase()}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import * as credentialsApi from '../../services/credentials.js'
import { listUsers } from '../../services/users.js'
import { extractErrorMessage } from '../../services/http.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useToast } from '../../hooks/useToast.js'
import { PERMISSIONS } from '../../constants.js'
import { Modal } from '../../components/ui/Modal.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { StatusBadge, Badge } from '../../components/ui/Badge.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'

function CopyButton({ label, onCopy }) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const value = await onCopy()
      await navigator.clipboard.writeText(value ?? '')
      toast.success(`${label} copiado(a) para a área de transferência`)
    } catch (err) {
      toast.error(extractErrorMessage(err, `Falha ao copiar ${label.toLowerCase()}`))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="secondary" onClick={handleClick} disabled={loading}>
      {loading ? '…' : `Copiar ${label}`}
    </Button>
  )
}

export function CredentialDetailModal({ credentialId, onClose, onChanged }) {
  const { hasPermission } = useAuth()
  const toast = useToast()
  const [credential, setCredential] = useState(null)
  const [revealedPassword, setRevealedPassword] = useState(null)
  const [revealing, setRevealing] = useState(false)
  const [users, setUsers] = useState([])
  const [accessSelection, setAccessSelection] = useState([])
  const [savingAccess, setSavingAccess] = useState(false)

  const canViewPassword = hasPermission(PERMISSIONS.CREDENTIALS_VIEW_PASSWORD)
  const canManageAccess = hasPermission(PERMISSIONS.CREDENTIALS_UPDATE)

  useEffect(() => {
    if (!credentialId) {
      setCredential(null)
      setRevealedPassword(null)
      return
    }
    credentialsApi
      .getCredential(credentialId)
      .then((data) => {
        setCredential(data)
        setAccessSelection((data.accessList || []).map((a) => a.userId))
      })
      .catch((err) => toast.error(extractErrorMessage(err, 'Falha ao carregar credencial')))
    if (canManageAccess) {
      listUsers()
        .then(setUsers)
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credentialId])

  async function handleReveal() {
    setRevealing(true)
    try {
      const password = await credentialsApi.revealPassword(credentialId)
      setRevealedPassword(password)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Você não tem permissão para ver esta senha'))
    } finally {
      setRevealing(false)
    }
  }

  function toggleAccessUser(userId) {
    setAccessSelection((sel) => (sel.includes(userId) ? sel.filter((id) => id !== userId) : [...sel, userId]))
  }

  async function saveAccess() {
    setSavingAccess(true)
    try {
      const grants = accessSelection.map((userId) => ({ userId, canViewPassword: true }))
      const updated = await credentialsApi.setAccess(credentialId, grants)
      setCredential(updated)
      setAccessSelection((updated.accessList || []).map((a) => a.userId))
      toast.success('Acesso atualizado')
      onChanged?.()
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Falha ao atualizar acesso'))
    } finally {
      setSavingAccess(false)
    }
  }

  return (
    <Modal open={Boolean(credentialId)} onClose={onClose} title={credential?.name || 'Credencial'} size="lg">
      {!credential ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">Cliente</p>
              <p className="text-slate-800 dark:text-slate-200">{credential.client?.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">Categoria</p>
              <p className="text-slate-800 dark:text-slate-200">{credential.category?.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">Login</p>
              <p className="text-slate-800 dark:text-slate-200">{credential.username || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">Status</p>
              <StatusBadge status={credential.status} />
            </div>
            {credential.url && (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase text-slate-400">URL</p>
                <a
                  href={credential.url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {credential.url}
                </a>
              </div>
            )}
            {credential.tags?.length > 0 && (
              <div className="sm:col-span-2">
                <p className="mb-1 text-xs font-medium uppercase text-slate-400">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {credential.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
            {credential.notes && (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase text-slate-400">Notas</p>
                <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">{credential.notes}</p>
              </div>
            )}
          </div>

          <div className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
            <p className="mb-2 text-xs font-medium uppercase text-slate-400">Senha</p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="flex-1 rounded bg-slate-100 px-2 py-1.5 font-mono text-sm dark:bg-slate-800">
                {revealedPassword ?? '••••••••••••'}
              </code>
              {canViewPassword && (
                <Button variant="secondary" onClick={handleReveal} disabled={revealing}>
                  {revealing ? '…' : revealedPassword ? 'Atualizar' : 'Revelar'}
                </Button>
              )}
              {canViewPassword && (
                <CopyButton label="senha" onCopy={() => credentialsApi.copyField(credentialId, 'password')} />
              )}
              {credential.username && (
                <CopyButton label="login" onCopy={() => credentialsApi.copyField(credentialId, 'login')} />
              )}
            </div>
          </div>

          {canManageAccess && (
            <div className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium uppercase text-slate-400">Quem pode ver a senha</p>
                <Button variant="secondary" onClick={saveAccess} disabled={savingAccess}>
                  {savingAccess ? 'Salvando…' : 'Salvar acesso'}
                </Button>
              </div>
              {users.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum usuário cadastrado.</p>
              ) : (
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {users.map((u) => (
                    <label key={u.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={accessSelection.includes(u.id)}
                        onChange={() => toggleAccessUser(u.id)}
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        {u.name} <span className="text-slate-400">({u.email})</span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { useToast } from '../../hooks/useToast.js'
import { PERMISSIONS } from '../../constants.js'
import * as credentialsApi from '../../services/credentials.js'
import { listClients } from '../../services/clients.js'
import { listCategories } from '../../services/categories.js'
import { extractErrorMessage } from '../../services/http.js'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input, Select } from '../../components/ui/Field.jsx'
import { Table, Thead, Tbody, Th, Td } from '../../components/ui/Table.jsx'
import { StatusBadge } from '../../components/ui/Badge.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { CredentialFormModal } from './CredentialFormModal.jsx'
import { CredentialDetailModal } from './CredentialDetailModal.jsx'

export function CredentialsPage() {
  const { hasPermission } = useAuth()
  const toast = useToast()
  const [credentials, setCredentials] = useState(null)
  const [clients, setClients] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({ search: '', clientId: '', categoryId: '' })

  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function load(currentFilters = filters) {
    try {
      const data = await credentialsApi.listCredentials(currentFilters)
      setCredentials(data)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Falha ao carregar credenciais'))
    }
  }

  useEffect(() => {
    load({ search: '', clientId: '', categoryId: '' })
    listClients().then(setClients).catch(() => {})
    listCategories().then(setCategories).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateFilter(field, value) {
    setFilters((f) => ({ ...f, [field]: value }))
  }

  function onFilterSubmit(e) {
    e.preventDefault()
    load(filters)
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  async function openEdit(id) {
    try {
      const detail = await credentialsApi.getCredential(id)
      setEditing(detail)
      setFormOpen(true)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Falha ao carregar credencial'))
    }
  }

  async function handleSaved() {
    setFormOpen(false)
    await load()
  }

  async function confirmDelete() {
    setDeleteLoading(true)
    try {
      await credentialsApi.deleteCredential(deleting.id)
      toast.success('Credencial excluída com sucesso')
      setDeleting(null)
      await load()
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Falha ao excluir credencial'))
    } finally {
      setDeleteLoading(false)
    }
  }

  const canCreate = hasPermission(PERMISSIONS.CREDENTIALS_CREATE)
  const canUpdate = hasPermission(PERMISSIONS.CREDENTIALS_UPDATE)
  const canDelete = hasPermission(PERMISSIONS.CREDENTIALS_DELETE)

  return (
    <div>
      <PageHeader
        title="Credenciais"
        description="Cofre de senhas e acessos de clientes"
        actions={canCreate && <Button onClick={openCreate}>+ Nova credencial</Button>}
      />

      <form onSubmit={onFilterSubmit} className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Input
          placeholder="Buscar por nome, login, URL…"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
        <Select value={filters.clientId} onChange={(e) => updateFilter('clientId', e.target.value)}>
          <option value="">Todos os clientes</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={filters.categoryId} onChange={(e) => updateFilter('categoryId', e.target.value)}>
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </form>

      {credentials === null ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : credentials.length === 0 ? (
        <EmptyState title="Nenhuma credencial encontrada" description="Cadastre a primeira credencial para começar." />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Nome</Th>
              <Th>Cliente</Th>
              <Th>Categoria</Th>
              <Th>Login</Th>
              <Th>Status</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </Thead>
          <Tbody>
            {credentials.map((cred) => (
              <tr key={cred.id}>
                <Td className="font-medium text-slate-900 dark:text-slate-100">
                  <button className="hover:underline" onClick={() => setViewing(cred.id)}>
                    {cred.name}
                  </button>
                </Td>
                <Td>{cred.client?.name}</Td>
                <Td>{cred.category?.name}</Td>
                <Td>{cred.username || '—'}</Td>
                <Td>
                  <StatusBadge status={cred.status} />
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setViewing(cred.id)}>
                      Ver
                    </Button>
                    {canUpdate && (
                      <Button variant="ghost" onClick={() => openEdit(cred.id)}>
                        Editar
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" className="text-red-600 dark:text-red-400" onClick={() => setDeleting(cred)}>
                        Excluir
                      </Button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </Tbody>
        </Table>
      )}

      <CredentialFormModal
        open={formOpen}
        credential={editing}
        clients={clients}
        categories={categories}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <CredentialDetailModal
        credentialId={viewing}
        onClose={() => setViewing(null)}
        onChanged={load}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir credencial"
        message={`Tem certeza que deseja excluir "${deleting?.name}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

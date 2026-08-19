import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { useToast } from '../../hooks/useToast.js'
import { PERMISSIONS } from '../../constants.js'
import * as clientsApi from '../../services/clients.js'
import { extractErrorMessage } from '../../services/http.js'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Field.jsx'
import { Table, Thead, Tbody, Th, Td } from '../../components/ui/Table.jsx'
import { StatusBadge } from '../../components/ui/Badge.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { ClientFormModal } from './ClientFormModal.jsx'

export function ClientsPage() {
  const { hasPermission } = useAuth()
  const toast = useToast()
  const [clients, setClients] = useState(null)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function load(currentSearch = search) {
    try {
      const data = await clientsApi.listClients({ search: currentSearch })
      setClients(data)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Falha ao carregar clientes'))
    }
  }

  useEffect(() => {
    load('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onSearchSubmit(e) {
    e.preventDefault()
    load(search)
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(client) {
    setEditing(client)
    setFormOpen(true)
  }

  async function handleSaved() {
    setFormOpen(false)
    await load()
  }

  async function confirmDelete() {
    setDeleteLoading(true)
    try {
      await clientsApi.deleteClient(deleting.id)
      toast.success('Cliente excluído com sucesso')
      setDeleting(null)
      await load()
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Falha ao excluir cliente'))
    } finally {
      setDeleteLoading(false)
    }
  }

  const canCreate = hasPermission(PERMISSIONS.CLIENTS_CREATE)
  const canUpdate = hasPermission(PERMISSIONS.CLIENTS_UPDATE)
  const canDelete = hasPermission(PERMISSIONS.CLIENTS_DELETE)

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Empresas e contas atendidas pela CRT"
        actions={canCreate && <Button onClick={openCreate}>+ Novo cliente</Button>}
      />

      <form onSubmit={onSearchSubmit} className="mb-4 flex gap-2">
        <Input
          placeholder="Buscar por nome…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {clients === null ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : clients.length === 0 ? (
        <EmptyState title="Nenhum cliente encontrado" description="Cadastre o primeiro cliente para começar." />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Nome</Th>
              <Th>Nome fantasia</Th>
              <Th>Credenciais</Th>
              <Th>Status</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </Thead>
          <Tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <Td className="font-medium text-slate-900 dark:text-slate-100">{client.name}</Td>
                <Td>{client.tradeName || '—'}</Td>
                <Td>{client.credentialsCount}</Td>
                <Td>
                  <StatusBadge status={client.status} />
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-2">
                    {canUpdate && (
                      <Button variant="ghost" onClick={() => openEdit(client)}>
                        Editar
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" className="text-red-600 dark:text-red-400" onClick={() => setDeleting(client)}>
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

      <ClientFormModal open={formOpen} client={editing} onClose={() => setFormOpen(false)} onSaved={handleSaved} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir cliente"
        message={`Tem certeza que deseja excluir "${deleting?.name}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

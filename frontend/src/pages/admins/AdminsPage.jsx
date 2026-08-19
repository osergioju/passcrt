import { useEffect, useState } from 'react'
import { useToast } from '../../hooks/useToast.js'
import * as adminsApi from '../../services/admins.js'
import { extractErrorMessage } from '../../services/http.js'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Table, Thead, Tbody, Th, Td } from '../../components/ui/Table.jsx'
import { Badge, StatusBadge } from '../../components/ui/Badge.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { AdminFormModal } from './AdminFormModal.jsx'

export function AdminsPage() {
  const toast = useToast()
  const [admins, setAdmins] = useState(null)
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function load() {
    try {
      const data = await adminsApi.listAdmins()
      setAdmins(data)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Falha ao carregar administradores'))
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(admin) {
    setEditing(admin)
    setFormOpen(true)
  }

  async function handleSaved() {
    setFormOpen(false)
    await load()
  }

  async function confirmDelete() {
    setDeleteLoading(true)
    try {
      await adminsApi.deleteAdmin(deleting.id)
      toast.success('Administrador desativado com sucesso')
      setDeleting(null)
      await load()
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Falha ao desativar administrador'))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Administradores"
        description="Contas com privilégios administrativos — área exclusiva do Admin Master"
        actions={<Button onClick={openCreate}>+ Novo administrador</Button>}
      />

      {admins === null ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : admins.length === 0 ? (
        <EmptyState title="Nenhum administrador encontrado" />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Nome</Th>
              <Th>E-mail</Th>
              <Th>Papel</Th>
              <Th>Status</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </Thead>
          <Tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <Td className="font-medium text-slate-900 dark:text-slate-100">{admin.name}</Td>
                <Td>{admin.email}</Td>
                <Td>
                  <Badge tone={admin.roles.includes('ADMIN_MASTER') ? 'warning' : 'neutral'}>
                    {admin.roles.includes('ADMIN_MASTER') ? 'Admin Master' : 'Admin'}
                  </Badge>
                </Td>
                <Td>
                  <StatusBadge status={admin.status} />
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => openEdit(admin)}>
                      Editar
                    </Button>
                    <Button variant="ghost" className="text-red-600 dark:text-red-400" onClick={() => setDeleting(admin)}>
                      Desativar
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Tbody>
        </Table>
      )}

      <AdminFormModal open={formOpen} admin={editing} onClose={() => setFormOpen(false)} onSaved={handleSaved} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Desativar administrador"
        message={`Tem certeza que deseja desativar "${deleting?.name}"? O acesso administrativo dele será revogado.`}
        confirmLabel="Desativar"
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

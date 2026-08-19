import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { useToast } from '../../hooks/useToast.js'
import { PERMISSIONS } from '../../constants.js'
import * as usersApi from '../../services/users.js'
import { extractErrorMessage } from '../../services/http.js'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Table, Thead, Tbody, Th, Td } from '../../components/ui/Table.jsx'
import { Badge, StatusBadge } from '../../components/ui/Badge.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { UserFormModal } from './UserFormModal.jsx'

export function UsersPage() {
  const { hasPermission } = useAuth()
  const toast = useToast()
  const [users, setUsers] = useState(null)
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function load() {
    try {
      const data = await usersApi.listUsers()
      setUsers(data)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Falha ao carregar usuários'))
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(user) {
    setEditing(user)
    setFormOpen(true)
  }

  async function handleSaved() {
    setFormOpen(false)
    await load()
  }

  async function confirmDelete() {
    setDeleteLoading(true)
    try {
      await usersApi.deleteUser(deleting.id)
      toast.success('Usuário desativado com sucesso')
      setDeleting(null)
      await load()
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Falha ao desativar usuário'))
    } finally {
      setDeleteLoading(false)
    }
  }

  const canCreate = hasPermission(PERMISSIONS.USERS_CREATE)
  const canUpdate = hasPermission(PERMISSIONS.USERS_UPDATE)
  const canDelete = hasPermission(PERMISSIONS.USERS_DELETE)

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Contas de acesso ao cofre (perfil padrão, sem privilégios administrativos)"
        actions={canCreate && <Button onClick={openCreate}>+ Novo usuário</Button>}
      />

      {users === null ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : users.length === 0 ? (
        <EmptyState title="Nenhum usuário encontrado" description="Cadastre o primeiro usuário para começar." />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Nome</Th>
              <Th>E-mail</Th>
              <Th>Papéis</Th>
              <Th>Status</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <Td className="font-medium text-slate-900 dark:text-slate-100">{user.name}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <Badge key={role}>{role}</Badge>
                    ))}
                  </div>
                </Td>
                <Td>
                  <StatusBadge status={user.status} />
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-2">
                    {canUpdate && (
                      <Button variant="ghost" onClick={() => openEdit(user)}>
                        Editar
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" className="text-red-600 dark:text-red-400" onClick={() => setDeleting(user)}>
                        Desativar
                      </Button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </Tbody>
        </Table>
      )}

      <UserFormModal open={formOpen} user={editing} onClose={() => setFormOpen(false)} onSaved={handleSaved} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Desativar usuário"
        message={`Tem certeza que deseja desativar "${deleting?.name}"? O acesso dele ao sistema será bloqueado.`}
        confirmLabel="Desativar"
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

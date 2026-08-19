import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { useToast } from '../../hooks/useToast.js'
import { PERMISSIONS } from '../../constants.js'
import * as categoriesApi from '../../services/categories.js'
import { extractErrorMessage } from '../../services/http.js'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Field.jsx'
import { Table, Thead, Tbody, Th, Td } from '../../components/ui/Table.jsx'
import { StatusBadge } from '../../components/ui/Badge.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { CategoryFormModal } from './CategoryFormModal.jsx'

export function CategoriesPage() {
  const { hasPermission } = useAuth()
  const toast = useToast()
  const [categories, setCategories] = useState(null)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function load(currentSearch = search) {
    try {
      const data = await categoriesApi.listCategories({ search: currentSearch })
      setCategories(data)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Falha ao carregar categorias'))
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

  function openEdit(category) {
    setEditing(category)
    setFormOpen(true)
  }

  async function handleSaved() {
    setFormOpen(false)
    await load()
  }

  async function confirmDelete() {
    setDeleteLoading(true)
    try {
      await categoriesApi.deleteCategory(deleting.id)
      toast.success('Categoria excluída com sucesso')
      setDeleting(null)
      await load()
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Falha ao excluir categoria'))
    } finally {
      setDeleteLoading(false)
    }
  }

  const canCreate = hasPermission(PERMISSIONS.CATEGORIES_CREATE)
  const canUpdate = hasPermission(PERMISSIONS.CATEGORIES_UPDATE)
  const canDelete = hasPermission(PERMISSIONS.CATEGORIES_DELETE)

  return (
    <div>
      <PageHeader
        title="Categorias"
        description="Organização das credenciais por tipo"
        actions={canCreate && <Button onClick={openCreate}>+ Nova categoria</Button>}
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

      {categories === null ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : categories.length === 0 ? (
        <EmptyState title="Nenhuma categoria encontrada" description="Cadastre a primeira categoria para começar." />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Nome</Th>
              <Th>Descrição</Th>
              <Th>Credenciais</Th>
              <Th>Status</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </Thead>
          <Tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <Td className="font-medium text-slate-900 dark:text-slate-100">
                  {category.icon && <span className="mr-1.5">{'🏷️'}</span>}
                  {category.name}
                </Td>
                <Td>{category.description || '—'}</Td>
                <Td>{category.credentialsCount}</Td>
                <Td>
                  <StatusBadge status={category.status} />
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-2">
                    {canUpdate && (
                      <Button variant="ghost" onClick={() => openEdit(category)}>
                        Editar
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        className="text-red-600 dark:text-red-400"
                        onClick={() => setDeleting(category)}
                      >
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

      <CategoryFormModal open={formOpen} category={editing} onClose={() => setFormOpen(false)} onSaved={handleSaved} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir categoria"
        message={`Tem certeza que deseja excluir "${deleting?.name}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

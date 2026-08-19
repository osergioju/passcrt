import { useEffect, useState } from 'react'
import * as credentialsApi from '../../services/credentials.js'
import { listUsers } from '../../services/users.js'
import { extractErrorMessage } from '../../services/http.js'
import { useToast } from '../../hooks/useToast.js'
import { Modal } from '../../components/ui/Modal.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Field, Input, Textarea, Select } from '../../components/ui/Field.jsx'
import { STATUS_OPTIONS } from '../../constants.js'

const EMPTY_FORM = {
  name: '',
  clientId: '',
  categoryId: '',
  url: '',
  username: '',
  password: '',
  notes: '',
  tags: '',
  status: 'ACTIVE',
  accessUserIds: [],
}

export function CredentialFormModal({ open, credential, clients, categories, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(EMPTY_FORM)
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(
      credential
        ? {
            name: credential.name,
            clientId: credential.client?.id || '',
            categoryId: credential.category?.id || '',
            url: credential.url || '',
            username: credential.username || '',
            password: '',
            notes: credential.notes || '',
            tags: (credential.tags || []).join(', '),
            status: credential.status,
            accessUserIds: [],
          }
        : EMPTY_FORM,
    )
    setError(null)
    if (!credential) {
      listUsers()
        .then(setUsers)
        .catch(() => {})
    }
  }, [open, credential])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleAccessUser(userId) {
    setForm((f) => ({
      ...f,
      accessUserIds: f.accessUserIds.includes(userId)
        ? f.accessUserIds.filter((id) => id !== userId)
        : [...f.accessUserIds, userId],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const tags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      if (credential) {
        const payload = {
          name: form.name,
          clientId: form.clientId,
          categoryId: form.categoryId,
          url: form.url || null,
          username: form.username || null,
          notes: form.notes || null,
          tags,
          status: form.status,
        }
        if (form.password) payload.password = form.password
        await credentialsApi.updateCredential(credential.id, payload)
        toast.success('Credencial atualizada')
      } else {
        await credentialsApi.createCredential({
          name: form.name,
          clientId: form.clientId,
          categoryId: form.categoryId,
          url: form.url || null,
          username: form.username || null,
          password: form.password,
          notes: form.notes || null,
          tags,
          status: form.status,
          accessUserIds: form.accessUserIds,
        })
        toast.success('Credencial criada')
      }
      onSaved()
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao salvar credencial'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={credential ? 'Editar credencial' : 'Nova credencial'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="credential-form" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form id="credential-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        <Field label="Nome" htmlFor="name" required>
          <Input id="name" required value={form.name} onChange={(e) => update('name', e.target.value)} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Cliente" htmlFor="clientId" required>
            <Select id="clientId" required value={form.clientId} onChange={(e) => update('clientId', e.target.value)}>
              <option value="" disabled>
                Selecione…
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Categoria" htmlFor="categoryId" required>
            <Select id="categoryId" required value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)}>
              <option value="" disabled>
                Selecione…
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Login / usuário" htmlFor="username">
            <Input id="username" value={form.username} onChange={(e) => update('username', e.target.value)} />
          </Field>
          <Field label="URL" htmlFor="url">
            <Input id="url" type="url" placeholder="https://…" value={form.url} onChange={(e) => update('url', e.target.value)} />
          </Field>
        </div>

        <Field
          label="Senha"
          htmlFor="password"
          required={!credential}
          hint={credential ? 'Deixe em branco para manter a senha atual' : undefined}
        >
          <Input
            id="password"
            type="password"
            required={!credential}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
          />
        </Field>

        <Field label="Tags" htmlFor="tags" hint="Separadas por vírgula">
          <Input id="tags" value={form.tags} onChange={(e) => update('tags', e.target.value)} />
        </Field>

        <Field label="Notas" htmlFor="notes">
          <Textarea id="notes" value={form.notes} onChange={(e) => update('notes', e.target.value)} />
        </Field>

        <Field label="Status" htmlFor="status">
          <Select id="status" value={form.status} onChange={(e) => update('status', e.target.value)}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </Field>

        {!credential && users.length > 0 && (
          <Field label="Acesso adicional" hint="Além de você, quem mais pode ver a senha desta credencial">
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-slate-200 p-2 dark:border-slate-700">
              {users.map((u) => (
                <label key={u.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={form.accessUserIds.includes(u.id)}
                    onChange={() => toggleAccessUser(u.id)}
                  />
                  <span className="text-slate-700 dark:text-slate-300">
                    {u.name} <span className="text-slate-400">({u.email})</span>
                  </span>
                </label>
              ))}
            </div>
          </Field>
        )}
      </form>
    </Modal>
  )
}

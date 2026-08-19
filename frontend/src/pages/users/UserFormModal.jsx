import { useEffect, useState } from 'react'
import * as usersApi from '../../services/users.js'
import { extractErrorMessage } from '../../services/http.js'
import { useToast } from '../../hooks/useToast.js'
import { Modal } from '../../components/ui/Modal.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Field, Input, Select } from '../../components/ui/Field.jsx'
import { STATUS_OPTIONS } from '../../constants.js'

const EMPTY_FORM = { name: '', email: '', password: '', confirmPassword: '', status: 'ACTIVE' }

export function UserFormModal({ open, user, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(
        user
          ? { name: user.name, email: user.email, password: '', confirmPassword: '', status: user.status }
          : EMPTY_FORM,
      )
      setError(null)
    }
  }, [open, user])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (user) {
        await usersApi.updateUser(user.id, { name: form.name, status: form.status })
        toast.success('Usuário atualizado')
      } else {
        await usersApi.createUser({
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        })
        toast.success('Usuário criado')
      }
      onSaved()
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao salvar usuário'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user ? 'Editar usuário' : 'Novo usuário'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="user-form" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        <Field label="Nome" htmlFor="name" required>
          <Input id="name" required value={form.name} onChange={(e) => update('name', e.target.value)} />
        </Field>

        <Field label="E-mail" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            required
            disabled={Boolean(user)}
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </Field>

        {!user && (
          <>
            <Field label="Senha" htmlFor="password" required hint="Mínimo de 8 caracteres">
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
              />
            </Field>
            <Field label="Confirmar senha" htmlFor="confirmPassword" required>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
              />
            </Field>
          </>
        )}

        {user && (
          <Field label="Status" htmlFor="status">
            <Select id="status" value={form.status} onChange={(e) => update('status', e.target.value)}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </form>
    </Modal>
  )
}

import { useEffect, useState } from 'react'
import * as adminsApi from '../../services/admins.js'
import { extractErrorMessage } from '../../services/http.js'
import { useToast } from '../../hooks/useToast.js'
import { Modal } from '../../components/ui/Modal.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Field, Input, Select } from '../../components/ui/Field.jsx'
import { STATUS_OPTIONS } from '../../constants.js'

const EMPTY_FORM = { name: '', email: '', password: '', confirmPassword: '', role: 'ADMIN', status: 'ACTIVE' }

export function AdminFormModal({ open, admin, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(
        admin
          ? {
              name: admin.name,
              email: admin.email,
              password: '',
              confirmPassword: '',
              role: admin.roles.includes('ADMIN_MASTER') ? 'ADMIN_MASTER' : 'ADMIN',
              status: admin.status,
            }
          : EMPTY_FORM,
      )
      setError(null)
    }
  }, [open, admin])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (admin) {
        await adminsApi.updateAdmin(admin.id, { name: form.name, status: form.status, role: form.role })
        toast.success('Administrador atualizado')
      } else {
        await adminsApi.createAdmin({
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          role: form.role,
        })
        toast.success('Administrador criado')
      }
      onSaved()
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao salvar administrador'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={admin ? 'Editar administrador' : 'Novo administrador'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="admin-form" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form id="admin-form" onSubmit={handleSubmit} className="space-y-4">
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
            disabled={Boolean(admin)}
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </Field>

        {!admin && (
          <>
            <Field label="Senha" htmlFor="password" required hint="Mínimo de 12 caracteres">
              <Input
                id="password"
                type="password"
                required
                minLength={12}
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

        <Field label="Papel" htmlFor="role">
          <Select id="role" value={form.role} onChange={(e) => update('role', e.target.value)}>
            <option value="ADMIN">Admin</option>
            <option value="ADMIN_MASTER">Admin Master</option>
          </Select>
        </Field>

        {admin && (
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

import { useEffect, useState } from 'react'
import * as clientsApi from '../../services/clients.js'
import { extractErrorMessage } from '../../services/http.js'
import { useToast } from '../../hooks/useToast.js'
import { Modal } from '../../components/ui/Modal.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Field, Input, Textarea, Select } from '../../components/ui/Field.jsx'
import { STATUS_OPTIONS } from '../../constants.js'

const EMPTY_FORM = { name: '', tradeName: '', description: '', status: 'ACTIVE' }

export function ClientFormModal({ open, client, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(
        client
          ? {
              name: client.name,
              tradeName: client.tradeName || '',
              description: client.description || '',
              status: client.status,
            }
          : EMPTY_FORM,
      )
      setError(null)
    }
  }, [open, client])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        tradeName: form.tradeName || null,
        description: form.description || null,
        status: form.status,
      }
      if (client) {
        await clientsApi.updateClient(client.id, payload)
        toast.success('Cliente atualizado')
      } else {
        await clientsApi.createClient(payload)
        toast.success('Cliente criado')
      }
      onSaved()
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao salvar cliente'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={client ? 'Editar cliente' : 'Novo cliente'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="client-form" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form id="client-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        <Field label="Nome" htmlFor="name" required>
          <Input id="name" required value={form.name} onChange={(e) => update('name', e.target.value)} />
        </Field>

        <Field label="Nome fantasia" htmlFor="tradeName">
          <Input id="tradeName" value={form.tradeName} onChange={(e) => update('tradeName', e.target.value)} />
        </Field>

        <Field label="Descrição" htmlFor="description">
          <Textarea id="description" value={form.description} onChange={(e) => update('description', e.target.value)} />
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
      </form>
    </Modal>
  )
}

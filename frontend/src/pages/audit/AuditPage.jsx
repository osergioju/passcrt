import { useEffect, useState } from 'react'
import { useToast } from '../../hooks/useToast.js'
import { listAuditLogs } from '../../services/audit.js'
import { extractErrorMessage } from '../../services/http.js'
import { AUDIT_ACTIONS } from '../../constants.js'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Table, Thead, Tbody, Th, Td } from '../../components/ui/Table.jsx'
import { Field, Input, Select } from '../../components/ui/Field.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'

const PAGE_SIZE = 25

const EMPTY_FILTERS = { action: '', resource: '', dateFrom: '', dateTo: '' }

export function AuditPage() {
  const toast = useToast()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function load(currentFilters, currentPage) {
    setLoading(true)
    try {
      const data = await listAuditLogs({ ...currentFilters, page: currentPage, pageSize: PAGE_SIZE })
      setResult(data)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Falha ao carregar auditoria'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(EMPTY_FILTERS, 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateFilter(field, value) {
    setFilters((f) => ({ ...f, [field]: value }))
  }

  function onFilterSubmit(e) {
    e.preventDefault()
    setPage(1)
    load(filters, 1)
  }

  function changePage(next) {
    setPage(next)
    load(filters, next)
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1

  return (
    <div>
      <PageHeader title="Auditoria" description="Trilha de eventos de acesso e alterações no sistema" />

      <form onSubmit={onFilterSubmit} className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Ação" htmlFor="action">
          <Select id="action" value={filters.action} onChange={(e) => updateFilter('action', e.target.value)}>
            <option value="">Todas</option>
            {AUDIT_ACTIONS.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Recurso" htmlFor="resource" hint="ex: credential, client">
          <Input id="resource" value={filters.resource} onChange={(e) => updateFilter('resource', e.target.value)} />
        </Field>
        <Field label="De" htmlFor="dateFrom">
          <Input id="dateFrom" type="date" value={filters.dateFrom} onChange={(e) => updateFilter('dateFrom', e.target.value)} />
        </Field>
        <Field label="Até" htmlFor="dateTo">
          <Input id="dateTo" type="date" value={filters.dateTo} onChange={(e) => updateFilter('dateTo', e.target.value)} />
        </Field>
        <div className="flex items-end">
          <Button type="submit" variant="secondary" className="w-full">
            Filtrar
          </Button>
        </div>
      </form>

      {loading || !result ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : result.logs.length === 0 ? (
        <EmptyState title="Nenhum evento encontrado" description="Ajuste os filtros e tente novamente." />
      ) : (
        <>
          <Table>
            <Thead>
              <tr>
                <Th>Data</Th>
                <Th>Usuário</Th>
                <Th>Ação</Th>
                <Th>Recurso</Th>
                <Th>IP</Th>
              </tr>
            </Thead>
            <Tbody>
              {result.logs.map((log) => (
                <tr key={log.id}>
                  <Td className="whitespace-nowrap">{new Date(log.createdAt).toLocaleString('pt-BR')}</Td>
                  <Td>{log.user?.name ?? <span className="text-slate-400">Sistema</span>}</Td>
                  <Td>
                    <Badge>{log.action}</Badge>
                  </Td>
                  <Td>
                    {log.resource}
                    {log.resourceId && <span className="ml-1 text-xs text-slate-400">#{log.resourceId.slice(0, 8)}</span>}
                  </Td>
                  <Td className="text-slate-400">{log.ipAddress || '—'}</Td>
                </tr>
              ))}
            </Tbody>
          </Table>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>
              Página {result.page} de {totalPages} — {result.total} evento(s)
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page <= 1} onClick={() => changePage(page - 1)}>
                Anterior
              </Button>
              <Button variant="secondary" disabled={page >= totalPages} onClick={() => changePage(page + 1)}>
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

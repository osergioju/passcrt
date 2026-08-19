import { Fragment, useEffect, useState } from 'react'
import { useToast } from '../../hooks/useToast.js'
import { fetchPermissionsCatalog } from '../../services/permissions.js'
import { extractErrorMessage } from '../../services/http.js'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Table, Thead, Tbody, Th, Td } from '../../components/ui/Table.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'

function groupByResource(permissionKeys) {
  const groups = new Map()
  for (const key of permissionKeys) {
    const [resource] = key.split('.')
    if (!groups.has(resource)) groups.set(resource, [])
    groups.get(resource).push(key)
  }
  return groups
}

export function PermissionsPage() {
  const toast = useToast()
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchPermissionsCatalog()
      .then(setData)
      .catch((err) => toast.error(extractErrorMessage(err, 'Falha ao carregar permissões')))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!data) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  const groups = groupByResource(data.permissions)

  return (
    <div>
      <PageHeader
        title="Permissões"
        description="Catálogo de permissões e o que cada papel (role) pode fazer. Visualização somente leitura — controlada pelo catálogo padrão do sistema."
      />

      <Table>
        <Thead>
          <tr>
            <Th>Permissão</Th>
            {data.roles.map((role) => (
              <Th key={role.id} className="text-center">
                {role.name}
              </Th>
            ))}
          </tr>
        </Thead>
        <Tbody>
          {[...groups.entries()].map(([resource, keys]) => (
            <Fragment key={resource}>
              <tr className="bg-slate-50 dark:bg-slate-900/60">
                <Td colSpan={data.roles.length + 1} className="font-semibold uppercase text-xs tracking-wide text-slate-500">
                  {resource}
                </Td>
              </tr>
              {keys.map((key) => (
                <tr key={key}>
                  <Td>{key}</Td>
                  {data.roles.map((role) => (
                    <Td key={role.id} className="text-center">
                      {role.permissions.includes(key) ? (
                        <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">—</span>
                      )}
                    </Td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </Tbody>
      </Table>
    </div>
  )
}

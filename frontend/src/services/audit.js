import { http } from './http.js'

export async function listAuditLogs(filters = {}) {
  const res = await http.get('/audit', {
    params: {
      userId: filters.userId || undefined,
      action: filters.action || undefined,
      resource: filters.resource || undefined,
      resourceId: filters.resourceId || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      page: filters.page || undefined,
      pageSize: filters.pageSize || undefined,
    },
  })
  return res.data
}

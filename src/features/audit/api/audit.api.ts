import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'

import {
  auditResponseSchema,
  sessionsResponseSchema,
  type AuditFilters,
  type AuditResponse,
  type SessionsResponse,
} from './audit.contracts'
import { auditMocks } from './audit.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export const auditApi = {
  async list(filters: AuditFilters): Promise<AuditResponse> {
    if (env.useMocks) {
      await delay()
      return auditResponseSchema.parse(auditMocks.list(filters))
    }
    const qs = new URLSearchParams()
    if (filters.search) qs.set('search', filters.search)
    if (filters.action) qs.set('action', filters.action)
    if (filters.resource) qs.set('resource', filters.resource)
    const data = await apiRequest<unknown>(`/audit?${qs.toString()}`)
    return auditResponseSchema.parse(data)
  },
  async sessions(): Promise<SessionsResponse> {
    if (env.useMocks) {
      await delay()
      return sessionsResponseSchema.parse(auditMocks.sessions())
    }
    const data = await apiRequest<unknown>('/audit/sessions')
    return sessionsResponseSchema.parse(data)
  },
}

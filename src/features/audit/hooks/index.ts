import { useQuery } from '@tanstack/react-query'
import { auditApi } from '../api/audit.api'
import type { AuditFilters } from '../api/audit.contracts'

export const auditKeys = {
  list: (tenantId: string, filters: AuditFilters) =>
    ['audit.entries', tenantId, filters] as const,
  sessions: (tenantId: string) => ['audit.sessions', tenantId] as const,
}

export function useAuditList(tenantId: string, filters: AuditFilters) {
  return useQuery({
    queryKey: auditKeys.list(tenantId, filters),
    queryFn: () => auditApi.list(filters),
    staleTime: 30_000,
  })
}

export function useSessionsList(tenantId: string) {
  return useQuery({
    queryKey: auditKeys.sessions(tenantId),
    queryFn: auditApi.sessions,
    staleTime: 30_000,
  })
}

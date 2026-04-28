import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard.api'

const KEY = 'dashboard.overview' as const

export function useDashboardOverview(tenantId: string) {
  return useQuery({
    queryKey: [KEY, tenantId] as const,
    queryFn: dashboardApi.overview,
    staleTime: 60_000,
  })
}

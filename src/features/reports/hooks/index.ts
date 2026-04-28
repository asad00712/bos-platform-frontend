import { useQuery } from '@tanstack/react-query'

import { reportsApi } from '../api/reports.api'
import type { DateRange } from '../api/reports.contracts'

export const reportKeys = {
  catalog: (tenantId: string) => ['reports.catalog', tenantId] as const,
  sales: (tenantId: string, range: DateRange) =>
    ['reports.sales', tenantId, range] as const,
  operations: (tenantId: string, range: DateRange) =>
    ['reports.operations', tenantId, range] as const,
  staff: (tenantId: string, range: DateRange) =>
    ['reports.staff', tenantId, range] as const,
}

export function useReportCatalog(tenantId: string) {
  return useQuery({
    queryKey: reportKeys.catalog(tenantId),
    queryFn: reportsApi.catalog,
    staleTime: 5 * 60_000,
  })
}

export function useSalesReport(tenantId: string, range: DateRange) {
  return useQuery({
    queryKey: reportKeys.sales(tenantId, range),
    queryFn: () => reportsApi.sales(range),
    staleTime: 60_000,
  })
}

export function useOperationsReport(tenantId: string, range: DateRange) {
  return useQuery({
    queryKey: reportKeys.operations(tenantId, range),
    queryFn: () => reportsApi.operations(range),
    staleTime: 60_000,
  })
}

export function useStaffReport(tenantId: string, range: DateRange) {
  return useQuery({
    queryKey: reportKeys.staff(tenantId, range),
    queryFn: () => reportsApi.staff(range),
    staleTime: 60_000,
  })
}

import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'

import {
  operationsReportSchema,
  reportCatalogResponseSchema,
  salesReportSchema,
  staffReportSchema,
  type DateRange,
  type OperationsReport,
  type ReportCatalogResponse,
  type SalesReport,
  type StaffReport,
} from './reports.contracts'
import { reportsMocks } from './reports.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

function rangeQs(range: DateRange): string {
  const qs = new URLSearchParams({ from: range.from, to: range.to })
  if (range.preset) qs.set('preset', range.preset)
  return qs.toString()
}

export const reportsApi = {
  async catalog(): Promise<ReportCatalogResponse> {
    if (env.useMocks) {
      await delay()
      return reportCatalogResponseSchema.parse(reportsMocks.catalog())
    }
    const data = await apiRequest<unknown>('/reports/catalog')
    return reportCatalogResponseSchema.parse(data)
  },

  async sales(range: DateRange): Promise<SalesReport> {
    if (env.useMocks) {
      await delay()
      return salesReportSchema.parse(reportsMocks.sales(range))
    }
    const data = await apiRequest<unknown>(`/reports/sales?${rangeQs(range)}`)
    return salesReportSchema.parse(data)
  },

  async operations(range: DateRange): Promise<OperationsReport> {
    if (env.useMocks) {
      await delay()
      return operationsReportSchema.parse(reportsMocks.operations(range))
    }
    const data = await apiRequest<unknown>(`/reports/operations?${rangeQs(range)}`)
    return operationsReportSchema.parse(data)
  },

  async staff(range: DateRange): Promise<StaffReport> {
    if (env.useMocks) {
      await delay()
      return staffReportSchema.parse(reportsMocks.staff(range))
    }
    const data = await apiRequest<unknown>(`/reports/staff?${rangeQs(range)}`)
    return staffReportSchema.parse(data)
  },
}

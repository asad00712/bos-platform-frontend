import { z } from 'zod'

/* -------------------- enums + shared -------------------- */

export const reportCategorySchema = z.enum([
  'sales',
  'operations',
  'staff',
  'patients',
  'governance',
])
export type ReportCategory = z.infer<typeof reportCategorySchema>

export const dateRangeKeySchema = z.enum([
  'today',
  'week',
  'month',
  'quarter',
  'year',
  'custom',
])
export type DateRangeKey = z.infer<typeof dateRangeKeySchema>

export const dateRangeSchema = z.object({
  /** ISO datetime, inclusive. */
  from: z.string(),
  /** ISO datetime, inclusive. */
  to: z.string(),
  /** Optional preset key, used for caching/display. */
  preset: dateRangeKeySchema.optional(),
})
export type DateRange = z.infer<typeof dateRangeSchema>

/* -------------------- catalog -------------------- */

export const reportSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: reportCategorySchema,
  /** Path under /app/reports/<slug> when the report has its own page. */
  slug: z.string().nullable(),
  /** Required permission to view. */
  permission: z.string().optional(),
})
export type ReportSummary = z.infer<typeof reportSummarySchema>

export const reportCatalogResponseSchema = z.object({
  items: z.array(reportSummarySchema),
})
export type ReportCatalogResponse = z.infer<typeof reportCatalogResponseSchema>

/* -------------------- sales -------------------- */

export const seriesPointSchema = z.object({
  label: z.string(),
  value: z.number(),
})
export type SeriesPoint = z.infer<typeof seriesPointSchema>

export const breakdownSliceSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number(),
})
export type BreakdownSlice = z.infer<typeof breakdownSliceSchema>

export const salesReportSchema = z.object({
  currency: z.string(),
  totalRevenue: z.number(),
  invoiceCount: z.number(),
  collectedRate: z.number(),
  averageTicket: z.number(),
  /** Daily revenue series. */
  revenueByDay: z.array(seriesPointSchema),
  /** Revenue by payment method. */
  byMethod: z.array(breakdownSliceSchema),
  /** Top contacts by revenue. */
  topContacts: z.array(
    z.object({
      contactId: z.string().nullable(),
      contactName: z.string(),
      revenue: z.number(),
      invoiceCount: z.number(),
    }),
  ),
})
export type SalesReport = z.infer<typeof salesReportSchema>

/* -------------------- operations -------------------- */

export const operationsReportSchema = z.object({
  appointmentCount: z.number(),
  completedRate: z.number(),
  noShowRate: z.number(),
  averageDurationMinutes: z.number(),
  appointmentsByDay: z.array(seriesPointSchema),
  byKind: z.array(breakdownSliceSchema),
  byResource: z.array(breakdownSliceSchema),
})
export type OperationsReport = z.infer<typeof operationsReportSchema>

/* -------------------- staff -------------------- */

export const staffRowSchema = z.object({
  employeeId: z.string(),
  employeeName: z.string(),
  hoursWorked: z.number(),
  appointments: z.number(),
  utilization: z.number(),
})
export type StaffRow = z.infer<typeof staffRowSchema>

export const staffReportSchema = z.object({
  totalHoursWorked: z.number(),
  attendanceRate: z.number(),
  averageHoursPerEmployee: z.number(),
  hoursByDay: z.array(seriesPointSchema),
  byEmployee: z.array(staffRowSchema),
})
export type StaffReport = z.infer<typeof staffReportSchema>

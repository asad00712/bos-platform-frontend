import type {
  DateRange,
  OperationsReport,
  ReportCatalogResponse,
  SalesReport,
  StaffReport,
} from './reports.contracts'

const CURRENCY = 'USD'

const CATALOG: ReportCatalogResponse = {
  items: [
    {
      id: 'rpt.sales',
      name: 'Sales',
      description: 'Revenue, collections, top customers, and payment mix.',
      category: 'sales',
      slug: 'sales',
      permission: 'reports:read',
    },
    {
      id: 'rpt.operations',
      name: 'Operations',
      description: 'Appointment throughput, no-show rate, and resource use.',
      category: 'operations',
      slug: 'operations',
      permission: 'reports:read',
    },
    {
      id: 'rpt.staff',
      name: 'Staff',
      description: 'Hours worked, attendance, and per-employee utilization.',
      category: 'staff',
      slug: 'staff',
      permission: 'reports:read',
    },
    {
      id: 'rpt.aging',
      name: 'AR aging',
      description: 'Outstanding invoices grouped by age buckets.',
      category: 'sales',
      slug: null,
      permission: 'billing:read',
    },
    {
      id: 'rpt.recall',
      name: 'Recall queue',
      description: 'Patients due for follow-up, by interval and last visit.',
      category: 'patients',
      slug: null,
    },
    {
      id: 'rpt.audit',
      name: 'Access audit',
      description: 'Sensitive actions, sign-ins, and permission changes.',
      category: 'governance',
      slug: null,
      permission: 'audit:view',
    },
  ],
}

/** Number of days inclusive in the given range, capped to keep mocks tidy. */
function daysIn(range: DateRange): number {
  const start = new Date(range.from).getTime()
  const end = new Date(range.to).getTime()
  const diff = Math.max(0, Math.round((end - start) / 86_400_000))
  return Math.min(45, Math.max(1, diff + 1))
}

function shortDay(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function buildSeries(range: DateRange, base: number, amplitude: number, step: number) {
  const total = daysIn(range)
  const start = new Date(range.from)
  start.setHours(0, 0, 0, 0)
  return Array.from({ length: total }).map((_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const wave = Math.sin(i / 2) * amplitude
    const drift = i * step
    const value = Math.max(0, Math.round(base + wave + drift))
    return { label: shortDay(d), value }
  })
}

export const reportsMocks = {
  catalog(): ReportCatalogResponse {
    return CATALOG
  },

  sales(range: DateRange): SalesReport {
    const series = buildSeries(range, 2_400, 1_200, 40)
    const totalRevenue = series.reduce((s, p) => s + p.value, 0)
    const invoiceCount = Math.max(1, Math.round(series.length * 1.4))
    const averageTicket = Math.round(totalRevenue / invoiceCount)
    const byMethod = [
      { key: 'card', label: 'Card', value: Math.round(totalRevenue * 0.62) },
      { key: 'bank_transfer', label: 'Bank transfer', value: Math.round(totalRevenue * 0.21) },
      { key: 'cash', label: 'Cash', value: Math.round(totalRevenue * 0.11) },
      { key: 'check', label: 'Check', value: Math.round(totalRevenue * 0.06) },
    ]
    return {
      currency: CURRENCY,
      totalRevenue,
      invoiceCount,
      collectedRate: 0.93,
      averageTicket,
      revenueByDay: series,
      byMethod,
      topContacts: [
        { contactId: 'c-1003', contactName: 'Greenfield Academy', revenue: 9_400, invoiceCount: 2 },
        { contactId: 'c-1001', contactName: 'Sarah Mitchell', revenue: 3_200, invoiceCount: 1 },
        { contactId: 'c-1004', contactName: 'Bella Italia', revenue: 4_750, invoiceCount: 3 },
        { contactId: 'c-1005', contactName: 'Ahmed Khan', revenue: 2_100, invoiceCount: 1 },
        { contactId: 'c-1002', contactName: 'Khalid Al-Rashid', revenue: 1_750, invoiceCount: 1 },
      ],
    }
  },

  operations(range: DateRange): OperationsReport {
    const series = buildSeries(range, 14, 6, 0.3)
    const total = series.reduce((s, p) => s + p.value, 0)
    return {
      appointmentCount: total,
      completedRate: 0.86,
      noShowRate: 0.07,
      averageDurationMinutes: 42,
      appointmentsByDay: series,
      byKind: [
        { key: 'consultation', label: 'Consultation', value: Math.round(total * 0.32) },
        { key: 'procedure', label: 'Procedure', value: Math.round(total * 0.28) },
        { key: 'follow_up', label: 'Follow-up', value: Math.round(total * 0.22) },
        { key: 'screening', label: 'Screening', value: Math.round(total * 0.13) },
        { key: 'other', label: 'Other', value: Math.round(total * 0.05) },
      ],
      byResource: [
        { key: 'res-1', label: 'Operatory 1', value: Math.round(total * 0.34) },
        { key: 'res-2', label: 'Operatory 2', value: Math.round(total * 0.28) },
        { key: 'res-3', label: 'Hygiene room', value: Math.round(total * 0.22) },
        { key: 'res-4', label: 'Consult room', value: Math.round(total * 0.16) },
      ],
    }
  },

  staff(range: DateRange): StaffReport {
    const series = buildSeries(range, 38, 8, 0.4)
    const totalHours = series.reduce((s, p) => s + p.value, 0)
    const employees = [
      { employeeId: 'emp-001', employeeName: 'Ahmed Khan', hoursWorked: 168, appointments: 92, utilization: 0.86 },
      { employeeId: 'emp-002', employeeName: 'Maya Patel', hoursWorked: 162, appointments: 0, utilization: 0.82 },
      { employeeId: 'emp-005', employeeName: 'Priya Shah', hoursWorked: 145, appointments: 64, utilization: 0.74 },
      { employeeId: 'emp-004', employeeName: 'Tomás Hidalgo', hoursWorked: 88, appointments: 0, utilization: 0.55 },
      { employeeId: 'emp-003', employeeName: 'Lina Diaz', hoursWorked: 56, appointments: 32, utilization: 0.45 },
    ]
    const totalEmpHours = employees.reduce((s, e) => s + e.hoursWorked, 0)
    return {
      totalHoursWorked: Math.max(totalHours, totalEmpHours),
      attendanceRate: 0.91,
      averageHoursPerEmployee: Math.round(totalEmpHours / employees.length),
      hoursByDay: series,
      byEmployee: employees,
    }
  },
}

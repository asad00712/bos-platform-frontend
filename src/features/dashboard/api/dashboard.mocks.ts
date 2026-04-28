import type {
  ActivitiesResponse,
  ActiveVerticalsResponse,
  OverviewResponse,
  PipelineResponse,
  RecentClientsResponse,
  RevenueByVerticalResponse,
  RevenueWeeklyResponse,
  TasksResponse,
} from './dashboard.contracts'

const TENANT_CURRENCY = 'USD'

/**
 * Deterministic mock data. Don't randomize — flaky widgets are worse
 * than empty ones. Latency simulated by latency() before any return.
 */
export const dashboardMocks = {
  overview: (): OverviewResponse => ({
    kpis: [
      {
        id: 'kpi.revenue',
        i18nKey: 'dashboard.kpis.revenue',
        value: 84_320,
        currency: TENANT_CURRENCY,
        delta: 0.23,
        trend: 'up',
        caption: 'vs $68,600 last month',
        iconKey: 'money',
      },
      {
        id: 'kpi.activeClients',
        i18nKey: 'dashboard.kpis.activeClients',
        value: 248,
        delta: 0.12,
        trend: 'up',
        caption: '14 new this week',
        iconKey: 'users',
      },
      {
        id: 'kpi.appointments',
        i18nKey: 'dashboard.kpis.appointments',
        value: 193,
        delta: 0.08,
        trend: 'up',
        caption: '12 today, 3 pending confirm',
        iconKey: 'calendar',
      },
      {
        id: 'kpi.overdueInvoices',
        i18nKey: 'dashboard.kpis.overdueInvoices',
        value: 12_400,
        currency: TENANT_CURRENCY,
        delta: 0.155,
        trend: 'down',
        caption: '4 invoices · avg 38 days late',
        iconKey: 'alert',
      },
    ],
    aiInsight: {
      id: 'insight.month',
      title: 'BOS intelligence',
      body: 'Revenue is up 23% vs last month, driven by the dental vertical. However, 4 invoices totalling $12,400 are overdue by 30+ days. Law firm vertical shows declining client activity — 3 cases with no updates in 7 days.',
      ctas: [
        { id: 'cta.review-overdue', label: 'Review overdue invoices' },
        { id: 'cta.law-pipeline', label: 'Law firm pipeline →' },
        { id: 'cta.dismiss', label: 'Dismiss' },
      ],
    },
  }),

  revenueWeekly: (): RevenueWeeklyResponse => ({
    totalCurrent: 84_320,
    totalPrior: 68_600,
    weeks: [
      { label: 'W1', value: 18_900, isPartial: false },
      { label: 'W2', value: 21_400, isPartial: false },
      { label: 'W3', value: 19_700, isPartial: false },
      { label: 'W4', value: 17_100, isPartial: false },
      { label: 'W5', value: 7_220, isPartial: true },
    ],
  }),

  activities: (): ActivitiesResponse => ({
    items: [
      {
        id: 'a-1',
        type: 'invoice',
        title: 'Invoice #INV-2026-184 paid by Sarah M. — $3,200',
        occurredAt: minutesAgo(2),
      },
      {
        id: 'a-2',
        type: 'appointment',
        title: 'New appointment booked — Dr. Ahmed at 3:00 PM',
        occurredAt: minutesAgo(14),
      },
      {
        id: 'a-3',
        type: 'lead',
        title: 'New lead added — Al-Rashid Law (₹18k potential)',
        occurredAt: hoursAgo(1),
      },
      {
        id: 'a-4',
        type: 'support',
        title: 'Support ticket #TKT-089 escalated — SLA breach risk',
        occurredAt: hoursAgo(2),
      },
      {
        id: 'a-5',
        type: 'invoice',
        title: 'Invoice #INV-2026-141 overdue by 32 days — $4,100',
        occurredAt: hoursAgo(3),
      },
    ],
  }),

  tasks: (): TasksResponse => ({
    items: [
      {
        id: 't-1',
        title: 'Confirm Sarah M. crown fitting',
        status: 'in_progress',
        priority: 'high',
        assigneeName: 'Dr. Ahmed',
        dueAt: hoursFromNow(2),
      },
      {
        id: 't-2',
        title: 'Follow up with Al-Rashid Law lead',
        status: 'todo',
        priority: 'normal',
        assigneeName: 'Maya',
        dueAt: tomorrowAt(14),
      },
      {
        id: 't-3',
        title: 'Send overdue invoice reminders',
        status: 'todo',
        priority: 'urgent',
        assigneeName: 'Maya',
        dueAt: hoursFromNow(6),
      },
      {
        id: 't-4',
        title: 'Approve March payroll',
        status: 'done',
        priority: 'normal',
        assigneeName: 'Owner',
        dueAt: daysAgo(1),
      },
      {
        id: 't-5',
        title: 'Review compliance audit findings',
        status: 'todo',
        priority: 'high',
        assigneeName: 'Owner',
        dueAt: tomorrowAt(10),
      },
    ],
  }),

  pipeline: (): PipelineResponse => ({
    currency: TENANT_CURRENCY,
    stages: [
      { id: 'lead', name: 'Lead', count: 42, value: 84_000 },
      { id: 'qualified', name: 'Qualified', count: 28, value: 71_500 },
      { id: 'proposal', name: 'Proposal', count: 14, value: 52_300 },
      { id: 'won', name: 'Won', count: 9, value: 41_800 },
    ],
  }),

  revenueByVertical: (): RevenueByVerticalResponse => ({
    currency: TENANT_CURRENCY,
    total: 84_320,
    slices: [
      { vertical: 'dental', label: 'Dental', value: 38_400 },
      { vertical: 'medical', label: 'Medical', value: 21_900 },
      { vertical: 'law', label: 'Law', value: 12_300 },
      { vertical: 'restaurant', label: 'Restaurant', value: 8_120 },
      { vertical: 'school', label: 'School', value: 3_600 },
    ],
  }),

  activeVerticals: (): ActiveVerticalsResponse => ({
    items: [
      { id: 'dental', name: 'Dental Clinic', status: 'live', customers: 124 },
      { id: 'medical', name: 'Medical Clinic', status: 'live', customers: 96 },
      { id: 'law', name: 'Law Firm', status: 'live', customers: 41 },
      { id: 'restaurant', name: 'Restaurant', status: 'beta', customers: 18 },
      { id: 'school', name: 'School', status: 'beta', customers: 12 },
      { id: 'gym', name: 'Gym', status: 'dev', customers: 0 },
    ],
  }),

  recentClients: (): RecentClientsResponse => ({
    items: [
      { id: 'c-1', name: 'Sarah Mitchell', vertical: 'Dental', status: 'active', value: 3_200, currency: TENANT_CURRENCY },
      { id: 'c-2', name: 'Al-Rashid Law', vertical: 'Law', status: 'pending', value: 18_000, currency: TENANT_CURRENCY },
      { id: 'c-3', name: 'Greenfield Academy', vertical: 'School', status: 'active', value: 9_400, currency: TENANT_CURRENCY },
      { id: 'c-4', name: 'Bella Italia', vertical: 'Restaurant', status: 'active', value: 4_750, currency: TENANT_CURRENCY },
      { id: 'c-5', name: 'Dr. Ahmed Khan', vertical: 'Medical', status: 'paused', value: 2_100, currency: TENANT_CURRENCY },
    ],
  }),
}

/* helpers */
function minutesAgo(n: number): string {
  return new Date(Date.now() - n * 60_000).toISOString()
}
function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3_600_000).toISOString()
}
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}
function hoursFromNow(n: number): string {
  return new Date(Date.now() + n * 3_600_000).toISOString()
}
function tomorrowAt(hour: number): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

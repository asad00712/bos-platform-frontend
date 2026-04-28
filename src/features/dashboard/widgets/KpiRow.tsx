import {
  AlertTriangle,
  CalendarDays,
  DollarSign,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useTenant } from '@/shared/hooks/useTenant'
import { KpiCard } from '@/shared/ui/kpi-card'
import { useDashboardOverview } from '../hooks'
import type { Widget } from './types'

const ICONS: Record<string, ReactNode> = {
  money: <DollarSign className="size-4" />,
  users: <Users className="size-4" />,
  calendar: <CalendarDays className="size-4" />,
  alert: <AlertTriangle className="size-4" />,
}

const KPI_LABELS: Record<string, string> = {
  'dashboard.kpis.revenue': 'Total revenue',
  'dashboard.kpis.activeClients': 'Active clients',
  'dashboard.kpis.appointments': 'Appointments',
  'dashboard.kpis.overdueInvoices': 'Overdue invoices',
}

function KpiRowComponent() {
  const { tenant } = useTenant()
  const query = useDashboardOverview(tenant.id)

  if (query.isLoading || !query.data) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCard key={i} label="" value={0} isLoading />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {query.data.kpis.map((k) => (
        <KpiCard
          key={k.id}
          label={KPI_LABELS[k.i18nKey] ?? k.i18nKey}
          value={k.value}
          currency={k.currency}
          delta={k.delta}
          trend={k.trend}
          caption={k.caption}
          icon={k.iconKey ? ICONS[k.iconKey] : undefined}
          invertTrendColor={k.id === 'kpi.overdueInvoices'}
        />
      ))}
    </div>
  )
}

export const KpiRowWidget: Widget = {
  id: 'dashboard.kpi-row',
  Component: KpiRowComponent,
  permission: 'dashboard:view',
  span: { col: 12 },
}

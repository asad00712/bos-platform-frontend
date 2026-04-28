import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { KpiCard } from '@/shared/ui/kpi-card'
import { Panel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'

import { formatPercent } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'
import { routes } from '@/routes/routeMap'

import { useOperationsReport } from '../hooks'
import { presetRange } from '../lib/date-range'
import type { DateRange } from '../api/reports.contracts'
import { DateRangePicker } from '../components/DateRangePicker'

const config = {
  value: { label: 'Appointments', color: 'var(--chart-2)' },
} satisfies ChartConfig

export function OperationsReportPage() {
  const { tenant } = useTenant()
  const [range, setRange] = useState<DateRange>(() => presetRange('month'))
  const query = useOperationsReport(tenant.id, range)

  return (
    <PageContainer>
      <PageHeader
        title="Operations report"
        description="Appointment throughput, no-show rate, and resource use."
        breadcrumbs={[
          { label: 'Reports', href: routes.app.reports() },
          { label: 'Operations' },
        ]}
        actions={<DateRangePicker value={range} onChange={setRange} />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Appointments"
          value={query.data?.appointmentCount ?? 0}
          isLoading={query.isLoading}
        />
        <KpiCard
          label="Completed"
          value={(query.data?.completedRate ?? 0) * 100}
          caption="Of all booked"
          isLoading={query.isLoading}
        />
        <KpiCard
          label="No-show"
          value={(query.data?.noShowRate ?? 0) * 100}
          caption="Of all booked"
          isLoading={query.isLoading}
        />
        <KpiCard
          label="Average duration"
          value={query.data?.averageDurationMinutes ?? 0}
          caption="Minutes per appointment"
          isLoading={query.isLoading}
        />
      </div>

      <Panel
        title="Appointment volume"
        description="Daily booked appointments"
      >
        {query.isLoading || !query.data ? (
          <Skeleton className="h-[260px] w-full" />
        ) : (
          <ChartContainer config={config} className="h-[260px] w-full">
            <BarChart
              data={query.data.appointmentsByDay}
              margin={{ top: 8, right: 12, bottom: 8, left: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="preserveStartEnd"
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="By kind" description="Appointment type mix">
          {query.isLoading || !query.data ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <BreakdownList
              items={query.data.byKind}
              total={query.data.appointmentCount}
            />
          )}
        </Panel>
        <Panel title="By resource" description="Operatory utilization">
          {query.isLoading || !query.data ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <BreakdownList
              items={query.data.byResource}
              total={query.data.appointmentCount}
            />
          )}
        </Panel>
      </div>
    </PageContainer>
  )
}

function BreakdownList({
  items,
  total,
}: {
  items: { key: string; label: string; value: number }[]
  total: number
}) {
  const max = Math.max(1, ...items.map((i) => i.value))
  const safeTotal = total || 1
  return (
    <ul className="space-y-2">
      {items.map((it) => {
        const pct = it.value / safeTotal
        const width = (it.value / max) * 100
        return (
          <li key={it.key} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{it.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {it.value} · {formatPercent(pct, 0)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary"
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

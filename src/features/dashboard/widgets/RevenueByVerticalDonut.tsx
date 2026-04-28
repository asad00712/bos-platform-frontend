import { Cell, Pie, PieChart } from 'recharts'
import { Panel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatCurrency } from '@/shared/lib/format'
import { useRevenueByVertical } from '../hooks'
import type { Widget } from './types'

const PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

const config = {
  value: { label: 'Revenue' },
} satisfies ChartConfig

function RevenueByVerticalDonutComponent() {
  const { tenant } = useTenant()
  const query = useRevenueByVertical(tenant.id)

  return (
    <Panel title="Revenue by vertical">
      {query.isLoading || !query.data ? (
        <Skeleton className="h-[220px] w-full" />
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <ChartContainer config={config} className="aspect-square h-[200px]">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(Number(value), query.data!.currency, { maximumFractionDigits: 0 })}
                  />
                }
              />
              <Pie
                data={query.data.slices}
                dataKey="value"
                nameKey="label"
                innerRadius={56}
                outerRadius={86}
                strokeWidth={2}
              >
                {query.data.slices.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <ul className="flex-1 space-y-2 text-sm">
            {query.data.slices.map((s, i) => {
              const pct = (s.value / query.data!.total) * 100
              return (
                <li key={s.vertical} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: PALETTE[i % PALETTE.length] }}
                    />
                    {s.label}
                  </span>
                  <span className="text-muted-foreground">
                    {pct.toFixed(0)}% · {formatCurrency(s.value, query.data!.currency, { maximumFractionDigits: 0 })}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </Panel>
  )
}

export const RevenueByVerticalWidget: Widget = {
  id: 'dashboard.revenue-by-vertical',
  Component: RevenueByVerticalDonutComponent,
  permission: 'reports:read',
  span: { col: 4 },
}

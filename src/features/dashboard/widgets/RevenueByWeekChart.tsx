import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react'

import { Panel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'
import { cn } from '@/shared/lib/utils'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatCompact, formatCurrency } from '@/shared/lib/format'
import { useRevenueByWeek } from '../hooks'
import type { Widget } from './types'

const config = {
  value: { label: 'Revenue', color: 'var(--chart-1)' },
} satisfies ChartConfig

function RevenueByWeekChartComponent() {
  const { tenant } = useTenant()
  const query = useRevenueByWeek(tenant.id)

  const deltaPct = query.data
    ? ((query.data.totalCurrent - query.data.totalPrior) / query.data.totalPrior) * 100
    : 0
  const positive = deltaPct >= 0

  return (
    <Panel
      title="Revenue"
      description="Last 5 weeks · this period vs prior"
      actions={
        query.data ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
              positive
                ? 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-400',
            )}
          >
            {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {positive ? '+' : ''}
            {Math.round(deltaPct)}%
          </span>
        ) : null
      }
    >
      {query.isLoading || !query.data ? (
        <Skeleton className="h-[280px] w-full" />
      ) : (
        <div className="space-y-5">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-semibold leading-none tracking-tight tabular-nums">
              {formatCurrency(query.data.totalCurrent, 'USD', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-sm text-muted-foreground">
              vs {formatCurrency(query.data.totalPrior, 'USD', { maximumFractionDigits: 0 })} prior period
            </span>
            <a
              href="#"
              className="ms-auto inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Open report <ArrowUpRight className="size-3" />
            </a>
          </div>

          <ChartContainer config={config} className="h-[260px] w-full">
            <AreaChart
              data={query.data.weeks}
              margin={{ top: 12, right: 4, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="rbw-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="2 6"
                stroke="currentColor"
                className="text-border"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                stroke="currentColor"
                className="text-xs text-muted-foreground"
              />
              <YAxis
                hide
                domain={['dataMin - 2000', 'dataMax + 2000']}
              />
              <ChartTooltip
                cursor={{
                  stroke: 'var(--border)',
                  strokeDasharray: '4 4',
                }}
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      formatCurrency(Number(value), 'USD', { maximumFractionDigits: 0 })
                    }
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload as { isPartial?: boolean } | undefined
                      return item?.isPartial ? `${label} · in progress` : String(label)
                    }}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={2}
                fill="url(#rbw-area)"
                activeDot={{
                  r: 4,
                  strokeWidth: 2,
                  stroke: 'var(--background)',
                  fill: 'var(--color-value)',
                }}
              />
            </AreaChart>
          </ChartContainer>

          <p className="text-[11px] text-muted-foreground">
            Tap a point to inspect the week. <span className="text-foreground/70">Compact format:</span>{' '}
            {formatCompact(query.data.totalCurrent)} ({formatCompact(query.data.totalPrior)} prior)
          </p>
        </div>
      )}
    </Panel>
  )
}

export const RevenueByWeekWidget: Widget = {
  id: 'dashboard.revenue-by-week',
  Component: RevenueByWeekChartComponent,
  permission: 'reports:read',
  span: { col: 8 },
}

import { useMemo } from 'react'
import { ArrowUpRight, Sparkles, TrendingUp } from 'lucide-react'

import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatCurrency, formatPercent } from '@/shared/lib/format'
import { BidiNum } from '@/shared/lib/bidi'

import { useDashboardOverview, useRevenueByWeek } from '../hooks'

/**
 * North-Star hero band. One dominant metric, generous whitespace, soft
 * radial backdrop. Sits at the top of the dashboard so the first thing
 * a viewer sees is "how's the business?" — answered before any chart.
 *
 * Composition: eyebrow + headline + value + delta + a thin horizontal
 * sparkline that runs across the full width of the card. Designed to
 * read clearly at 4K and at 13".
 */
export function DashboardHero() {
  const { tenant } = useTenant()
  const overview = useDashboardOverview(tenant.id)
  const revenue = useRevenueByWeek(tenant.id)

  const revenueKpi = overview.data?.kpis.find((k) => k.id === 'kpi.revenue')
  const isLoading = overview.isLoading || revenue.isLoading

  const sparkline = useMemo(() => {
    return (revenue.data?.weeks ?? []).map((w) => w.value)
  }, [revenue.data])

  if (isLoading || !revenueKpi) {
    return (
      <Card className="relative overflow-hidden border-border/60">
        <CardContent className="space-y-6 p-8 sm:p-10">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  const positive = (revenueKpi.delta ?? 0) >= 0
  const currency = revenueKpi.currency ?? 'USD'

  return (
    <Card
      data-surface="hero"
      className="relative overflow-hidden border-border/60"
    >
      <CardContent className="relative space-y-6 p-8 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <Sparkles className="size-3 text-primary" />
              This period
            </p>
            <h2 className="mt-2 text-sm font-medium text-muted-foreground">
              Total revenue
            </h2>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:border-border hover:text-foreground"
          >
            View report <ArrowUpRight className="size-3" />
          </a>
        </div>

        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
          <span className="text-5xl font-semibold leading-none tracking-tight tabular-nums sm:text-6xl">
            <BidiNum>
              {formatCurrency(revenueKpi.value, currency, {
                maximumFractionDigits: 0,
              })}
            </BidiNum>
          </span>
          {revenueKpi.delta !== undefined ? (
            <span
              className={
                positive
                  ? 'inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold tabular-nums text-emerald-700 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-400'
                  : 'inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold tabular-nums text-rose-700 ring-1 ring-inset ring-rose-500/20 dark:text-rose-400'
              }
            >
              <TrendingUp
                className={positive ? 'size-3' : 'size-3 rotate-180'}
                aria-hidden
              />
              {positive ? '+' : ''}
              {formatPercent(Math.abs(revenueKpi.delta), 1)}
            </span>
          ) : null}
          <p className="text-sm text-muted-foreground">
            {revenueKpi.caption ?? 'vs prior period'}
          </p>
        </div>

        {sparkline.length > 1 ? <HeroSparkline data={sparkline} positive={positive} /> : null}
      </CardContent>
    </Card>
  )
}

function HeroSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const w = 1200
  const h = 80
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = data.length > 1 ? w / (data.length - 1) : 0

  const linePoints = data.map((d, i) => {
    const x = i * step
    const y = h - ((d - min) / range) * (h - 6) - 3
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  const linePath = `M ${linePoints.join(' L ')}`
  const areaPath = `M 0,${h} L ${linePoints.join(' L ')} L ${w},${h} Z`

  const tone = positive ? 'text-emerald-500' : 'text-rose-500'

  return (
    <svg
      role="img"
      aria-label="Revenue trend"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={`h-20 w-full ${tone}`}
    >
      <defs>
        <linearGradient id="hero-spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#hero-spark)" />
      <path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

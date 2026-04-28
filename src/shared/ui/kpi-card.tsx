import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import {
  formatCompact,
  formatCurrency,
  formatPercent,
} from '@/shared/lib/format'

export type KpiTrend = 'up' | 'down' | 'flat'

type Props = {
  label: string
  value: number | string
  /** Render as currency rather than compact number — only when `value` is numeric. */
  currency?: string
  /** Period-over-period delta as a fraction (0.23 = +23%). */
  delta?: number
  trend?: KpiTrend
  caption?: string
  /** Optional leading icon, rendered in a soft chip. */
  icon?: ReactNode
  /** Sparkline data — small numeric array; auto-scaled. Lights up the bottom band. */
  sparkline?: number[]
  /** Show neutral/inverted color on a "down" trend (e.g. overdue going down is good). */
  invertTrendColor?: boolean
  isLoading?: boolean
  className?: string
}

/**
 * Flagship KPI card. Three layers of signal:
 *   1. Big confident numeric value (4xl, tracking-tight, tabular-nums).
 *   2. Period-over-period delta as a softly-colored pill with a directional icon.
 *   3. Optional sparkline anchored at the bottom — period micro-trend.
 *
 * Visual rhythm matches the dashboards from Stripe / Linear / Vercel:
 *   - Hairline gradient on the top edge as a quiet accent.
 *   - Border deepens on hover; card lifts -1px with a soft shadow.
 *   - All transitions through cubic-bezier (Tailwind `ease-out`).
 *
 * Accessibility:
 *   - Icons are `aria-hidden`; the label text carries semantics.
 *   - Sparkline is `role="img"` decorative — value + delta are the source of truth.
 *   - Respects prefers-reduced-motion via Tailwind's transition utilities.
 */
export function KpiCard({
  label,
  value,
  currency,
  delta,
  trend,
  caption,
  icon,
  sparkline,
  invertTrendColor = false,
  isLoading = false,
  className,
}: Props) {
  if (isLoading) {
    return (
      <Card className={cn('relative overflow-hidden', className)}>
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-9 w-full rounded-md" />
        </CardContent>
      </Card>
    )
  }

  const numericValue = typeof value === 'number' ? value : Number(value)
  const formattedValue =
    typeof value === 'string'
      ? value
      : currency
        ? formatCurrency(numericValue, currency, { maximumFractionDigits: 0 })
        : formatCompact(numericValue)

  const positive =
    (trend === 'up' && !invertTrendColor) || (trend === 'down' && invertTrendColor)
  const negative =
    (trend === 'down' && !invertTrendColor) || (trend === 'up' && invertTrendColor)
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-border/60 bg-card',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/40',
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <CardContent className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {label}
          </p>
          {icon ? (
            <span className="grid size-8 place-items-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors group-hover:border-border group-hover:text-foreground">
              {icon}
            </span>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-3">
          <span className="text-4xl font-semibold leading-none tracking-tight tabular-nums">
            {formattedValue}
          </span>
          {delta !== undefined && trend ? (
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ring-1 ring-inset',
                positive &&
                  'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400',
                negative &&
                  'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-400',
                trend === 'flat' && 'bg-muted text-muted-foreground ring-transparent',
              )}
            >
              <TrendIcon className="size-3" aria-hidden />
              {formatPercent(Math.abs(delta), 1)}
            </span>
          ) : null}
        </div>

        {caption ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{caption}</p>
        ) : null}

        {sparkline && sparkline.length > 1 ? (
          <Sparkline data={sparkline} positive={positive} negative={negative} />
        ) : null}
      </CardContent>
    </Card>
  )
}

/** Tiny inline area sparkline. Anchored at the bottom of the card. */
function Sparkline({
  data,
  positive,
  negative,
}: {
  data: number[]
  positive?: boolean
  negative?: boolean
}) {
  const w = 200
  const h = 36
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = data.length > 1 ? w / (data.length - 1) : 0

  const linePoints = data.map((d, i) => {
    const x = i * step
    const y = h - ((d - min) / range) * (h - 4) - 2
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  const linePath = `M ${linePoints.join(' L ')}`
  const areaPath = `M 0,${h} L ${linePoints.join(' L ')} L ${w},${h} Z`

  const tone = positive
    ? 'text-emerald-500'
    : negative
      ? 'text-rose-500'
      : 'text-primary'

  const gradId = `kpi-spark-grad-${positive ? 'p' : negative ? 'n' : 'b'}-${data.length}`

  return (
    <svg
      role="img"
      aria-hidden
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn('h-9 w-full', tone)}
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

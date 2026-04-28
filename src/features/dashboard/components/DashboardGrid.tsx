import { resolveFeatureFlag } from '@/config/features'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useTenant } from '@/shared/hooks/useTenant'
import { cn } from '@/shared/lib/utils'
import type { DashboardLayout } from '../layouts/types'
import type { Widget, WidgetSpan } from '../widgets/types'

type Props = {
  layout: DashboardLayout
}

/**
 * Renders a layout's widgets in a 12-column responsive grid. Widgets are
 * filtered by the active tenant's permissions, vertical eligibility, and
 * plan-tier feature flags.
 *
 * The row gap is set on the wrapper; column spans come from each widget's
 * declared span (default 12 — full row).
 */
export function DashboardGrid({ layout }: Props) {
  const { has } = usePermissions()
  const { tenant } = useTenant()
  const featureCtx = {
    plan: tenant.plan,
    caliber: tenant.caliber,
    size: tenant.size,
    overrides: tenant.featureFlags,
  }

  const visible = layout.widgets.filter((w) => {
    if (w.permission && !has(w.permission)) return false
    if (w.verticals && !w.verticals.includes(tenant.vertical)) return false
    if (w.feature && !resolveFeatureFlag(w.feature, featureCtx)) return false
    return true
  })

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      {visible.map((w) => (
        <WidgetCell key={w.id} widget={w} />
      ))}
    </div>
  )
}

function WidgetCell({ widget }: { widget: Widget }) {
  const { Component } = widget
  return (
    <div className={spanClass(widget.span)}>
      <Component />
    </div>
  )
}

/** Static class lookup — Tailwind needs literal class names to scan. */
const LG_COL: Record<number, string> = {
  1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4',
  5: 'lg:col-span-5', 6: 'lg:col-span-6', 7: 'lg:col-span-7', 8: 'lg:col-span-8',
  9: 'lg:col-span-9', 10: 'lg:col-span-10', 11: 'lg:col-span-11', 12: 'lg:col-span-12',
}
const MD_COL: Record<number, string> = {
  1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4',
  5: 'md:col-span-5', 6: 'md:col-span-6', 7: 'md:col-span-7', 8: 'md:col-span-8',
  9: 'md:col-span-9', 10: 'md:col-span-10', 11: 'md:col-span-11', 12: 'md:col-span-12',
}
const LG_ROW: Record<number, string> = {
  1: 'lg:row-span-1', 2: 'lg:row-span-2', 3: 'lg:row-span-3', 4: 'lg:row-span-4',
}

function spanClass(span?: WidgetSpan): string {
  const desktop = clamp(span?.col ?? 12, 12)
  const tablet = clamp(span?.colMd ?? 12, 12)
  const rowSpan = span?.row ? LG_ROW[clamp(span.row, 4)] : ''
  return cn('col-span-1', MD_COL[tablet], LG_COL[desktop], rowSpan)
}

function clamp(n: number, max: number): number {
  if (n < 1) return 1
  if (n > max) return max
  return Math.round(n)
}

import { Link } from 'react-router'
import { Receipt } from 'lucide-react'

import { Panel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatCurrency } from '@/shared/lib/format'

import type { Widget } from '@/features/dashboard/widgets/types'
import { useClaims } from '../hooks'

function BillingSnapshotComponent() {
  const { tenant } = useTenant()
  const q = useClaims(tenant.id)
  const totals = q.data?.totals
  const currency = tenant.currency ?? 'USD'

  return (
    <Panel
      title="Billing snapshot"
      description="A/R, payments, and denial rate"
      actions={
        <Link
          to="/app/medical/billing"
          className="text-xs font-medium text-primary hover:underline"
        >
          Open worklist →
        </Link>
      }
    >
      {q.isLoading || !totals ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat
              label="Outstanding"
              value={formatCurrency(totals.outstanding, currency, { maximumFractionDigits: 0 })}
              tone="text-amber-700 dark:text-amber-400"
            />
            <Stat
              label="Paid 30d"
              value={formatCurrency(totals.paid30d, currency, { maximumFractionDigits: 0 })}
              tone="text-emerald-700 dark:text-emerald-400"
            />
            <Stat
              label="AR days"
              value={String(totals.arDays)}
              tone="text-muted-foreground"
            />
          </div>
          <div className="space-y-1 rounded-md border p-3">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-muted-foreground">Denial rate</span>
              <span
                className={`font-semibold tabular-nums ${
                  totals.denialRate > 0.1 ? 'text-rose-700 dark:text-rose-400' : ''
                }`}
              >
                {(totals.denialRate * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={
                  totals.denialRate > 0.1 ? 'h-full bg-rose-500' : 'h-full bg-emerald-500'
                }
                style={{ width: `${Math.min(100, Math.max(2, totals.denialRate * 200))}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              <Receipt className="me-1 inline size-3" />
              Industry benchmark: under 10%.
            </p>
          </div>
        </div>
      )}
    </Panel>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-md border p-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-0.5 text-base font-semibold tabular-nums ${tone ?? ''}`}>{value}</p>
    </div>
  )
}

export const BillingSnapshotWidget: Widget = {
  id: 'medical.dashboard.billing-snapshot',
  Component: BillingSnapshotComponent,
  permission: 'dashboard:view',
  span: { col: 6 },
}

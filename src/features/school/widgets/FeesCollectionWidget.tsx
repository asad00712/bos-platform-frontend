import { Link } from 'react-router'
import { ChartPie } from 'lucide-react'

import { Panel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatCurrency } from '@/shared/lib/format'

import type { Widget } from '@/features/dashboard/widgets/types'
import { useStudentFees } from '../hooks'

function FeesCollectionComponent() {
  const { tenant } = useTenant()
  const q = useStudentFees(tenant.id)

  return (
    <Panel
      title="Term fees"
      description="Collection vs outstanding"
      actions={
        <Link
          to="/app/school/fees"
          className="text-xs font-medium text-primary hover:underline"
        >
          Open →
        </Link>
      }
    >
      {q.isLoading || !q.data ? (
        <Skeleton className="h-32 w-full rounded" />
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat
              label="Collected"
              value={formatCurrency(q.data.totals.collected, q.data.totals.currency, { maximumFractionDigits: 0 })}
              tone="text-emerald-600 dark:text-emerald-400"
            />
            <Stat
              label="Outstanding"
              value={formatCurrency(q.data.totals.outstanding, q.data.totals.currency, { maximumFractionDigits: 0 })}
              tone="text-amber-600 dark:text-amber-400"
            />
            <Stat
              label="Overdue"
              value={formatCurrency(q.data.totals.overdue, q.data.totals.currency, { maximumFractionDigits: 0 })}
              tone="text-rose-600 dark:text-rose-400"
            />
          </div>
          {q.data.totals.expected > 0 ? (
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Collection progress</span>
                <span className="font-medium">
                  {((q.data.totals.collected / q.data.totals.expected) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${Math.min(100, (q.data.totals.collected / q.data.totals.expected) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                <ChartPie className="size-3" />
                Expected:{' '}
                {formatCurrency(q.data.totals.expected, q.data.totals.currency, {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </Panel>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: string
}) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${tone}`}>{value}</p>
    </div>
  )
}

export const FeesCollectionWidget: Widget = {
  id: 'school.dashboard.fees-collection',
  Component: FeesCollectionComponent,
  permission: 'dashboard:view',
  span: { col: 6 },
}

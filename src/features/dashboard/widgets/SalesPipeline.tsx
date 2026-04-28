import { Panel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatCompact, formatCurrency } from '@/shared/lib/format'
import { usePipeline } from '../hooks'
import type { Widget } from './types'

const STAGE_COLORS = ['bg-violet-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500']

function SalesPipelineComponent() {
  const { tenant } = useTenant()
  const query = usePipeline(tenant.id)

  return (
    <Panel title="Sales pipeline" description="Active deals by stage">
      {query.isLoading || !query.data ? (
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      ) : (
        (() => {
          const total = query.data.stages.reduce((sum, s) => sum + s.value, 0) || 1
          return (
            <div className="space-y-4">
              <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                {query.data.stages.map((s, i) => (
                  <div
                    key={s.id}
                    className={STAGE_COLORS[i % STAGE_COLORS.length]}
                    style={{ width: `${(s.value / total) * 100}%` }}
                  />
                ))}
              </div>

              <ul className="space-y-3">
                {query.data.stages.map((s, i) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`size-2.5 rounded-full ${STAGE_COLORS[i % STAGE_COLORS.length]}`} />
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted-foreground">· {formatCompact(s.count)} deals</span>
                    </div>
                    <span className="text-muted-foreground">
                      {formatCurrency(s.value, query.data.currency, { maximumFractionDigits: 0 })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })()
      )}
    </Panel>
  )
}

export const SalesPipelineWidget: Widget = {
  id: 'dashboard.sales-pipeline',
  Component: SalesPipelineComponent,
  permission: 'crm:read',
  span: { col: 4 },
}

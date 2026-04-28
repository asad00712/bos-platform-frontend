import { Link } from 'react-router'
import { CalendarClock, Pill } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Panel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatRelative } from '@/shared/lib/format'

import type { Widget } from '@/features/dashboard/widgets/types'
import { useRecalls, useRefillRequests } from '../hooks'

function RefillsRecallsComponent() {
  const { tenant } = useTenant()
  const refills = useRefillRequests(tenant.id)
  const recalls = useRecalls(tenant.id)

  const pending = (refills.data?.items ?? []).filter((r) => r.status === 'pending').slice(0, 4)
  const dueRecalls = (recalls.data?.items ?? [])
    .filter((r) => r.status === 'overdue' || r.status === 'due')
    .slice(0, 4)

  return (
    <Panel
      title="Pharmacy + outreach"
      description="Refills and recalls that need attention"
    >
      {refills.isLoading || recalls.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <section>
            <header className="mb-1.5 flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Pill className="size-3.5" /> Refill requests
              </h4>
              <Link
                to="/app/medical/rx/refills"
                className="text-xs font-medium text-primary hover:underline"
              >
                Open queue →
              </Link>
            </header>
            {pending.length === 0 ? (
              <p className="text-xs text-muted-foreground">None pending.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {pending.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 rounded-md border p-1.5">
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-medium">{r.patientName}</span>{' '}
                      <span className="text-xs text-muted-foreground">
                        {r.medication.display}
                      </span>
                    </span>
                    {r.controlled ? (
                      <Badge variant="destructive" className="text-[10px] uppercase">
                        Ctrl
                      </Badge>
                    ) : null}
                    <span className="text-[11px] text-muted-foreground">
                      {formatRelative(r.receivedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <header className="mb-1.5 flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <CalendarClock className="size-3.5" /> Recalls due / overdue
              </h4>
              <Link
                to="/app/medical/recalls"
                className="text-xs font-medium text-primary hover:underline"
              >
                Open list →
              </Link>
            </header>
            {dueRecalls.length === 0 ? (
              <p className="text-xs text-muted-foreground">No overdue recalls.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {dueRecalls.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 rounded-md border p-1.5">
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-medium">{r.patientName}</span>{' '}
                      <span className="text-xs text-muted-foreground">{r.reason}</span>
                    </span>
                    <Badge
                      variant={r.status === 'overdue' ? 'destructive' : 'secondary'}
                      className="capitalize"
                    >
                      {r.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Panel>
  )
}

export const RefillsRecallsWidget: Widget = {
  id: 'medical.dashboard.refills-recalls',
  Component: RefillsRecallsComponent,
  permission: 'dashboard:view',
  span: { col: 6 },
}

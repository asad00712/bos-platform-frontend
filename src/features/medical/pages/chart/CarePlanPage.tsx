import { useParams } from 'react-router'
import { CheckCircle2, Goal, ListChecks } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatRelative } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import { useCarePlans } from '../../hooks'

export function CarePlanPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const q = useCarePlans(tenant.id, id)
  const plans = q.data?.items ?? []

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold">Care plan</h2>
        <p className="text-sm text-muted-foreground">
          Goals, targets, and the activities that drive measurable improvement.
        </p>
      </header>

      {q.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : plans.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active care plans.</p>
      ) : (
        plans.map((p) => (
          <section key={p.id} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">{p.category}</h3>
              <Badge variant="outline" className="capitalize">{p.status}</Badge>
              <span className="ms-auto text-xs text-muted-foreground">
                Started {formatRelative(p.startDate)}
              </span>
            </div>

            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Goal className="size-4" /> Goals
              </h4>
              <ul className="space-y-1.5 text-sm">
                {p.goals.map((g) => (
                  <li key={g.id} className="flex flex-wrap items-baseline gap-2 rounded-md border p-2">
                    <span>{g.description}</span>
                    {g.targetHigh != null ? (
                      <span className="text-xs text-muted-foreground">
                        Target ≤{g.targetHigh} {g.targetUnit ?? ''}
                      </span>
                    ) : null}
                    <Badge
                      variant={
                        g.achievementStatus === 'achieved'
                          ? 'default'
                          : g.achievementStatus === 'declining' || g.achievementStatus === 'not_achieved'
                            ? 'destructive'
                            : 'secondary'
                      }
                      className="ms-auto capitalize"
                    >
                      {g.achievementStatus.replace('_', ' ')}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ListChecks className="size-4" /> Activities
              </h4>
              <ul className="space-y-1.5 text-sm">
                {p.activities.map((a, i) => (
                  <li key={`${p.id}-${i}`} className="flex flex-wrap items-center gap-2">
                    {a.status === 'completed' ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <span className="size-2 rounded-full bg-muted-foreground/40" />
                    )}
                    <span>{a.description}</span>
                    <Badge variant="outline" className="ms-auto capitalize">
                      {a.kind.replace('_', ' ')}
                    </Badge>
                    {a.dueDate ? (
                      <span className="text-xs text-muted-foreground">
                        Due {formatRelative(a.dueDate)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))
      )}
    </div>
  )
}

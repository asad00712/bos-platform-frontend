import { CircleDashed, CheckCircle2, Clock, ListChecks } from 'lucide-react'
import { Panel } from '@/shared/ui/panel'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatRelative } from '@/shared/lib/format'
import { useTasks } from '../hooks'
import type { Widget } from './types'
import type { Task } from '../api/dashboard.contracts'

const STATUS_ICON: Record<Task['status'], typeof CircleDashed> = {
  todo: CircleDashed,
  in_progress: Clock,
  done: CheckCircle2,
}

const PRIORITY_VARIANT: Record<Task['priority'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
  low: 'outline',
  normal: 'secondary',
  high: 'default',
  urgent: 'destructive',
}

function OpenTasksComponent() {
  const { tenant } = useTenant()
  const query = useTasks(tenant.id)

  return (
    <Panel title="Open tasks" description="Highest priority first">
      {query.isLoading || !query.data ? (
        <ul className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex gap-3">
              <Skeleton className="size-5 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </li>
          ))}
        </ul>
      ) : query.data.items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
          <ListChecks className="size-8 opacity-50" />
          <p>No tasks. Inbox zero!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {query.data.items.map((t) => {
            const Icon = STATUS_ICON[t.status]
            const isDone = t.status === 'done'
            return (
              <li key={t.id} className="flex items-start gap-3">
                <Icon
                  className={`size-5 shrink-0 ${isDone ? 'text-emerald-500' : t.status === 'in_progress' ? 'text-amber-500' : 'text-muted-foreground'}`}
                />
                <div className="flex flex-1 items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className={`text-sm ${isDone ? 'text-muted-foreground line-through' : ''}`}>
                      {t.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      {t.assigneeName ? <span>{t.assigneeName}</span> : null}
                      {t.dueAt ? <span>· due {formatRelative(t.dueAt)}</span> : null}
                    </div>
                  </div>
                  <Badge variant={PRIORITY_VARIANT[t.priority]} className="shrink-0">
                    {t.priority}
                  </Badge>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

export const OpenTasksWidget: Widget = {
  id: 'dashboard.open-tasks',
  Component: OpenTasksComponent,
  permission: 'dashboard:view',
  span: { col: 4 },
}

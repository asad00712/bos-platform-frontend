import {
  CheckSquare,
  FileText,
  Mail,
  MessageSquareText,
  Phone,
  Sparkles,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Skeleton } from '@/shared/ui/skeleton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { formatRelative } from '@/shared/lib/format'

import type { Activity, ActivityKind } from '@/types/crm'

import { useTenant } from '@/shared/hooks/useTenant'
import { useLeadActivities } from '../hooks'

const ICON_MAP: Record<ActivityKind, { Icon: LucideIcon; tone: string }> = {
  note: { Icon: FileText, tone: 'bg-muted text-muted-foreground' },
  call: { Icon: Phone, tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  email: { Icon: Mail, tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  sms: { Icon: MessageSquareText, tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  whatsapp: { Icon: MessageSquareText, tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  meeting: { Icon: Users, tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  task: { Icon: CheckSquare, tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  appointment: { Icon: Users, tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  invoice: { Icon: FileText, tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  system: { Icon: Sparkles, tone: 'bg-muted text-muted-foreground' },
}

export function LeadActivityList({ leadId }: { leadId: string }) {
  const { tenant } = useTenant()
  const query = useLeadActivities(tenant.id, leadId)

  if (query.isLoading) {
    return (
      <ul className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="flex gap-3">
            <Skeleton className="size-8 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </li>
        ))}
      </ul>
    )
  }

  const items = query.data ?? []
  if (items.length === 0) {
    return (
      <Empty className="py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Sparkles />
          </EmptyMedia>
          <EmptyTitle>No activity yet</EmptyTitle>
          <EmptyDescription>
            Notes, calls, emails, SMS, meetings, and tasks appear here. The
            unified composer ships in Phase E.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ol className="space-y-4">
      {items.map((a) => (
        <ActivityRow key={a.id} activity={a} />
      ))}
    </ol>
  )
}

function ActivityRow({ activity: a }: { activity: Activity }) {
  const { Icon, tone } = ICON_MAP[a.kind] ?? ICON_MAP.note
  return (
    <li className="flex gap-3">
      <span className={`grid size-8 shrink-0 place-items-center rounded-md ${tone}`}>
        <Icon className="size-4" />
      </span>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">
            {a.subject ?? labelFor(a.kind)}
            {a.direction ? (
              <span className="ms-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                {a.direction}
              </span>
            ) : null}
          </p>
          <span className="text-xs text-muted-foreground">
            {formatRelative(a.createdAt)}
          </span>
        </div>
        {a.body ? (
          <p className="text-sm text-muted-foreground">{a.body}</p>
        ) : null}
        <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
          {a.outcome ? <span>· outcome: {a.outcome.replace('_', ' ')}</span> : null}
          {a.durationSeconds ? (
            <span>· {Math.round(a.durationSeconds / 60)}m</span>
          ) : null}
          {a.taskStatus ? <span>· task: {a.taskStatus.replace('_', ' ')}</span> : null}
          {a.dueAt ? <span>· due {formatRelative(a.dueAt)}</span> : null}
        </div>
      </div>
    </li>
  )
}

function labelFor(kind: ActivityKind): string {
  return kind.replace(/^./, (c) => c.toUpperCase())
}

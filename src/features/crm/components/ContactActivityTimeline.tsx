import { CalendarDays, FileText, Mail, MessageSquareText, Receipt, Sparkles } from 'lucide-react'
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
import { useTenant } from '@/shared/hooks/useTenant'

import { useContactActivities } from '../hooks'
import type { ContactActivity } from '../api/crm.contracts'

const ICON_MAP: Record<ContactActivity['kind'], { Icon: LucideIcon; tone: string }> = {
  note: { Icon: FileText, tone: 'bg-muted text-muted-foreground' },
  email: { Icon: Mail, tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  sms: { Icon: MessageSquareText, tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  appointment: { Icon: CalendarDays, tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  invoice: { Icon: Receipt, tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  system: { Icon: Sparkles, tone: 'bg-muted text-muted-foreground' },
}

export function ContactActivityTimeline({ contactId }: { contactId: string }) {
  const { tenant } = useTenant()
  const query = useContactActivities(tenant.id, contactId)

  if (query.isLoading) {
    return (
      <ul className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="flex gap-3">
            <Skeleton className="size-8 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (!query.data || query.data.items.length === 0) {
    return (
      <Empty className="py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Sparkles />
          </EmptyMedia>
          <EmptyTitle>No activity yet</EmptyTitle>
          <EmptyDescription>
            Notes, emails, calls, appointments, and invoices appear here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ol className="space-y-4">
      {query.data.items.map((a) => {
        const { Icon, tone } = ICON_MAP[a.kind]
        return (
          <li key={a.id} className="flex gap-3">
            <span className={`grid size-8 shrink-0 place-items-center rounded-md ${tone}`}>
              <Icon className="size-4" />
            </span>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{a.title}</p>
                <span className="text-xs text-muted-foreground">
                  {formatRelative(a.occurredAt)}
                </span>
              </div>
              {a.body ? (
                <p className="text-sm text-muted-foreground">{a.body}</p>
              ) : null}
              {a.authorName ? (
                <p className="text-xs text-muted-foreground">by {a.authorName}</p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

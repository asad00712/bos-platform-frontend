import { Inbox } from 'lucide-react'

import { Skeleton } from '@/shared/ui/skeleton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { cn } from '@/shared/lib/utils'
import { formatRelative } from '@/shared/lib/format'
import type { Thread } from '../api/communication.contracts'
import { ChannelIcon } from './ChannelBadge'

type Props = {
  threads: Thread[] | undefined
  isLoading?: boolean
  selectedId?: string | null
  onSelect: (id: string) => void
}

export function ThreadList({ threads, isLoading, selectedId, onSelect }: Props) {
  if (isLoading) {
    return (
      <ul className="divide-y">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="flex gap-3 p-3">
            <Skeleton className="size-9 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (!threads || threads.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox />
          </EmptyMedia>
          <EmptyTitle>Inbox is clear</EmptyTitle>
          <EmptyDescription>
            New emails, SMS, and internal notes will land here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ul className="divide-y">
      {threads.map((t) => {
        const isSelected = t.id === selectedId
        return (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onSelect(t.id)}
              className={cn(
                'flex w-full items-start gap-3 p-3 text-start transition hover:bg-accent/40',
                isSelected && 'bg-accent/60',
              )}
            >
              <ChannelIcon channel={t.channel} />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      'truncate text-sm',
                      t.unread ? 'font-semibold' : 'font-medium',
                    )}
                  >
                    {t.contactName ?? 'Unknown'}
                  </p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatRelative(t.lastActivityAt)}
                  </span>
                </div>
                {t.subject ? (
                  <p
                    className={cn(
                      'truncate text-xs',
                      t.unread ? 'font-medium' : 'text-muted-foreground',
                    )}
                  >
                    {t.subject}
                  </p>
                ) : null}
                <p className="truncate text-xs text-muted-foreground">
                  {t.preview}
                </p>
              </div>
              {t.unread ? (
                <span
                  aria-label="Unread"
                  className="mt-1 size-2 shrink-0 rounded-full bg-primary"
                />
              ) : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

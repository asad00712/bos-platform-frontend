import { Plus, Sparkles } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

import type { ActivityEntity, ActivityKind } from '@/types/crm'
import { useActivities } from '../hooks'
import { ActivityRow } from './ActivityRow'
import { NewActivityDialog } from './NewActivityDialog'

type Props = {
  entity: ActivityEntity
  entityId: string
  /** Restrict the kind picker — defaults to all kinds the entity supports. */
  allowedKinds?: ActivityKind[]
  /** Hide the inline composer (useful when the host renders its own). */
  hideComposer?: boolean
}

export function ActivityTimeline({
  entity,
  entityId,
  allowedKinds,
  hideComposer,
}: Props) {
  const query = useActivities(entity, entityId)

  return (
    <div className="space-y-4">
      {!hideComposer ? (
        <div className="flex items-center justify-end">
          <NewActivityDialog
            entity={entity}
            entityId={entityId}
            allowedKinds={allowedKinds}
            trigger={
              <Button size="sm">
                <Plus /> Log activity
              </Button>
            }
          />
        </div>
      ) : null}

      {query.isLoading ? (
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
      ) : (query.data ?? []).length === 0 ? (
        <Empty className="py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Sparkles />
            </EmptyMedia>
            <EmptyTitle>No activity yet</EmptyTitle>
            <EmptyDescription>
              Log notes, calls, emails, SMS, meetings, and tasks. They appear
              here in reverse-chronological order.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ol className="space-y-4">
          {(query.data ?? []).map((a) => (
            <ActivityRow key={a.id} activity={a} />
          ))}
        </ol>
      )}
    </div>
  )
}

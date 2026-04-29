import { CheckSquare, Plus } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

import { useHasPermission } from '@/shared/auth/useHasPermission'
import type { TaskRelatedEntity } from '@/types/crm'

import { useTasksForEntity } from '../hooks'
import { TaskFormDialog } from './TaskFormDialog'
import { TaskRow } from './TaskRow'

type Props = {
  entity: TaskRelatedEntity
  entityId: string
}

/**
 * Slim task list scoped to a single contact / lead. Mounts on the detail
 * tab so reps can capture next-actions without leaving the record.
 */
export function RelatedTasksPanel({ entity, entityId }: Props) {
  const canCreate = useHasPermission('tenant:tasks:create')
  const query = useTasksForEntity(entity, entityId)
  const tasks = query.data ?? []

  if (query.isLoading) {
    return (
      <Card>
        <CardContent className="space-y-2 p-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            Tasks ({tasks.length})
          </p>
          {canCreate ? (
            <TaskFormDialog
              presetRelated={{ entity, entityId }}
              trigger={
                <Button size="sm" variant="outline">
                  <Plus /> Add task
                </Button>
              }
            />
          ) : null}
        </div>

        {tasks.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CheckSquare />
              </EmptyMedia>
              <EmptyTitle>No tasks linked yet</EmptyTitle>
              <EmptyDescription>
                Capture follow-ups so they don&apos;t fall off the radar.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="divide-y rounded-md border bg-background">
            {tasks.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

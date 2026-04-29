import { useState } from 'react'
import { Link } from 'react-router'
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import { formatRelative } from '@/shared/lib/format'

import { useTenant } from '@/shared/hooks/useTenant'
import { useOwnerLookup } from '@/features/crm/hooks'
import { routes } from '@/routes/routeMap'
import type { Task, TaskPriority } from '@/types/crm'

import {
  useDeleteTask,
  useToggleTaskStatus,
} from '../hooks'
import { TaskFormDialog } from './TaskFormDialog'

const PRIORITY_TONE: Record<TaskPriority, string> = {
  high: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  low: 'bg-muted text-muted-foreground',
}

export function TaskRow({ task }: { task: Task }) {
  const { tenant } = useTenant()
  const ownersQ = useOwnerLookup(tenant.id)
  const toggle = useToggleTaskStatus(tenant.id)
  const remove = useDeleteTask(tenant.id)

  const [editOpen, setEditOpen] = useState(false)

  const owner = ownersQ.data?.find((o) => o.userId === task.assigneeUserId)
  const done = task.status === 'done'
  const cancelled = task.status === 'cancelled'
  const overdue =
    task.dueAt &&
    !done &&
    !cancelled &&
    new Date(task.dueAt).getTime() < Date.now()

  const initials = (
    (owner?.name?.split(' ')[0]?.[0] ?? '') +
    (owner?.name?.split(' ')[1]?.[0] ?? '')
  ).toUpperCase()

  const relatedHref =
    task.relatedEntity === 'contact' && task.relatedEntityId
      ? routes.app.crm.contact(task.relatedEntityId)
      : task.relatedEntity === 'lead' && task.relatedEntityId
        ? routes.app.crm.lead(task.relatedEntityId)
        : null

  return (
    <>
      <li
        className={cn(
          'flex flex-wrap items-start gap-3 px-5 py-3 transition-colors',
          cancelled && 'opacity-60',
        )}
      >
        <Checkbox
          className="mt-1"
          checked={done}
          onCheckedChange={() => toggle(task)}
          aria-label="Toggle done"
        />

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                'font-medium',
                (done || cancelled) && 'line-through text-muted-foreground',
              )}
            >
              {task.title}
            </p>
            <Badge
              variant="outline"
              className={cn('capitalize', PRIORITY_TONE[task.priority])}
            >
              {task.priority}
            </Badge>
            {task.status === 'in_progress' ? (
              <Badge variant="secondary">In progress</Badge>
            ) : null}
            {cancelled ? <Badge variant="outline">Cancelled</Badge> : null}
            {relatedHref ? (
              <Link
                to={relatedHref}
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                <ArrowRight className="size-3" />
                {task.relatedEntity}
              </Link>
            ) : null}
          </div>

          {task.description ? (
            <p
              className={cn(
                'text-sm text-muted-foreground',
                done && 'line-through',
              )}
            >
              {task.description}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            {task.dueAt ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1',
                  overdue && 'text-rose-600 dark:text-rose-400',
                )}
              >
                {overdue ? (
                  <AlertCircle className="size-3" />
                ) : (
                  <CalendarClock className="size-3" />
                )}
                Due {formatRelative(task.dueAt)}
              </span>
            ) : null}
            <span>created {formatRelative(task.createdAt)}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {owner ? (
            <Avatar className="size-7" title={owner.name}>
              <AvatarFallback className="text-[10px]">
                {initials || '·'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <span className="text-[11px] text-muted-foreground">Unassigned</span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Task actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => remove.mutate(task.id)}
              >
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </li>

      <TaskFormDialog
        task={task}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}

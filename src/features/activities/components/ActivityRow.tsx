import { CheckSquare, ExternalLink, Trash2 } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Badge } from '@/shared/ui/badge'
import { formatRelative } from '@/shared/lib/format'

import type { Activity } from '@/types/crm'
import { useTenant } from '@/shared/hooks/useTenant'
import { useOwnerLookup } from '@/features/crm/hooks'

import { ActivityIcon, activityIconSpec } from './ActivityIcon'
import {
  useDeleteActivity,
  useSetActivityTaskStatus,
} from '../hooks'

type Props = {
  activity: Activity
}

export function ActivityRow({ activity: a }: Props) {
  const { tenant } = useTenant()
  const ownersQ = useOwnerLookup(tenant.id)
  const owner = ownersQ.data?.find((o) => o.userId === a.createdByUserId)

  const setTask = useSetActivityTaskStatus()
  const remove = useDeleteActivity(a.entity, a.entityId)

  const spec = activityIconSpec(a.kind)
  const isTask = a.kind === 'task'
  const taskDone = a.taskStatus === 'done'

  return (
    <li className="flex gap-3">
      <ActivityIcon kind={a.kind} />
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={
                'text-sm font-medium' + (taskDone ? ' line-through text-muted-foreground' : '')
              }
            >
              {a.subject ?? spec.label}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>{spec.label}</span>
              {a.direction ? (
                <Badge variant="outline" className="text-[10px] uppercase">
                  {a.direction}
                </Badge>
              ) : null}
              {a.outcome ? (
                <Badge variant="outline" className="text-[10px]">
                  {a.outcome.replace(/_/g, ' ')}
                </Badge>
              ) : null}
              {a.durationSeconds ? <span>· {Math.round(a.durationSeconds / 60)}m</span> : null}
              {a.dueAt ? <span>· due {formatRelative(a.dueAt)}</span> : null}
              {a.taskStatus ? (
                <Badge variant={taskDone ? 'secondary' : 'outline'} className="text-[10px]">
                  {a.taskStatus.replace('_', ' ')}
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-xs text-muted-foreground">
              {formatRelative(a.createdAt)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More actions">
                  <ExternalLink className="rotate-90" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isTask ? (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        setTask.mutate({
                          id: a.id,
                          taskStatus: taskDone ? 'open' : 'done',
                        })
                      }
                    >
                      <CheckSquare />{' '}
                      {taskDone ? 'Reopen task' : 'Mark complete'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => remove.mutate(a.id)}
                >
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {a.body ? (
          <p
            className={
              'whitespace-pre-wrap text-sm text-muted-foreground' +
              (taskDone ? ' line-through' : '')
            }
          >
            {a.body}
          </p>
        ) : null}
        {a.recordingUrl || a.transcriptUrl ? (
          <div className="flex flex-wrap gap-2 text-[11px]">
            {a.recordingUrl ? (
              <a
                href={a.recordingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="size-3" /> recording
              </a>
            ) : null}
            {a.transcriptUrl ? (
              <a
                href={a.transcriptUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="size-3" /> transcript
              </a>
            ) : null}
          </div>
        ) : null}
        {owner ? (
          <p className="text-[11px] text-muted-foreground">by {owner.name}</p>
        ) : null}
      </div>
    </li>
  )
}

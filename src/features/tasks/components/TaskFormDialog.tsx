import { useEffect, useState } from 'react'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { useTenant } from '@/shared/hooks/useTenant'
import { useActiveBranchStore } from '@/stores/activeBranch.store'
import { useOwnerLookup } from '@/features/crm/hooks'
import type {
  Task,
  TaskPriority,
  TaskRelatedEntity,
  TaskStatus,
} from '@/types/crm'

import { useCreateTask, useUpdateTask } from '../hooks'

const SENTINEL = '__none__'

type Props = {
  trigger?: React.ReactNode
  /** Edit mode — pre-fill the form with this task. */
  task?: Task
  /** Pre-link the new task to a contact / lead. */
  presetRelated?: { entity: TaskRelatedEntity; entityId: string }
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSaved?: (task: Task) => void
}

export function TaskFormDialog({
  trigger,
  task,
  presetRelated,
  open: openProp,
  onOpenChange: setOpenProp,
  onSaved,
}: Props) {
  const { tenant } = useTenant()
  const branchId = useActiveBranchStore((s) => s.branchId) ?? 'br-main'
  const ownersQ = useOwnerLookup(tenant.id)
  const createM = useCreateTask(tenant.id)
  const updateM = useUpdateTask(tenant.id)

  const [internalOpen, setInternalOpen] = useState(false)
  const open = openProp ?? internalOpen
  const setOpen = (v: boolean) => {
    setOpenProp?.(v)
    setInternalOpen(v)
  }

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('open')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueAt, setDueAt] = useState('')
  const [assigneeUserId, setAssignee] = useState<string | undefined>()

  useEffect(() => {
    if (open && task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
      setStatus(task.status)
      setPriority(task.priority)
      setDueAt(task.dueAt ? task.dueAt.slice(0, 16) : '')
      setAssignee(task.assigneeUserId ?? undefined)
    } else if (open && !task) {
      setTitle('')
      setDescription('')
      setStatus('open')
      setPriority('medium')
      setDueAt('')
      setAssignee(undefined)
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [open, task?.id])

  const submit = async () => {
    const dueAtIso = dueAt ? new Date(dueAt).toISOString() : undefined
    if (task) {
      const updated = await updateM.mutateAsync({
        id: task.id,
        patch: {
          title,
          description: description || undefined,
          status,
          priority,
          dueAt: dueAtIso,
          assigneeUserId: assigneeUserId || undefined,
        },
      })
      setOpen(false)
      onSaved?.(updated)
    } else {
      const created = await createM.mutateAsync({
        branchId,
        title,
        description: description || undefined,
        status,
        priority,
        dueAt: dueAtIso,
        assigneeUserId: assigneeUserId || undefined,
        relatedEntity: presetRelated?.entity,
        relatedEntityId: presetRelated?.entityId,
      })
      setOpen(false)
      onSaved?.(created)
    }
  }

  const isPending = createM.isPending || updateM.isPending

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit task' : 'New task'}</DialogTitle>
          <DialogDescription>
            Tasks live independently from lead activities. Link to a contact
            or lead to surface the task on that record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Title</Label>
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs doing"
            />
          </div>

          <div>
            <Label className="text-xs">Description</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TaskPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Due</Label>
              <Input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Assignee</Label>
            <Select
              value={assigneeUserId ?? SENTINEL}
              onValueChange={(v) => setAssignee(v === SENTINEL ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SENTINEL}>Unassigned</SelectItem>
                {(ownersQ.data ?? []).map((o) => (
                  <SelectItem key={o.userId} value={o.userId}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {presetRelated ? (
            <p className="text-[11px] text-muted-foreground">
              Linked to {presetRelated.entity}{' '}
              <code>{presetRelated.entityId}</code>
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={isPending || !title.trim()}>
            {isPending ? 'Saving…' : task ? 'Save changes' : 'Create task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

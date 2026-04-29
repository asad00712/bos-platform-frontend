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
import { useOwnerLookup } from '@/features/crm/hooks'
import type {
  ActivityDirection,
  ActivityEntity,
  ActivityInput,
  ActivityKind,
  CallOutcome,
  TaskStatus,
} from '@/types/crm'

import { useCreateActivity } from '../hooks'
import { activityIconSpec } from './ActivityIcon'

type Props = {
  entity: ActivityEntity
  entityId: string
  trigger: React.ReactNode
  /** Restrict the kind picker — defaults to all kinds the entity supports. */
  allowedKinds?: ActivityKind[]
}

const SENTINEL = '__none__'

const ALL_LEAD_KINDS: ActivityKind[] = [
  'note',
  'call',
  'email',
  'sms',
  'whatsapp',
  'meeting',
  'task',
]

const ALL_CONTACT_KINDS: ActivityKind[] = [
  'note',
  'call',
  'email',
  'sms',
  'whatsapp',
  'meeting',
  'task',
  'appointment',
  'invoice',
]

const CALL_OUTCOMES: { value: CallOutcome; label: string }[] = [
  { value: 'spoke', label: 'Spoke' },
  { value: 'no_answer', label: 'No answer' },
  { value: 'voicemail', label: 'Voicemail' },
  { value: 'busy', label: 'Busy' },
  { value: 'wrong_number', label: 'Wrong number' },
  { value: 'call_back_requested', label: 'Call back requested' },
]

export function NewActivityDialog({
  entity,
  entityId,
  trigger,
  allowedKinds,
}: Props) {
  const { tenant } = useTenant()
  const ownersQ = useOwnerLookup(tenant.id)
  const create = useCreateActivity(entity, entityId)

  const kinds =
    allowedKinds ?? (entity === 'lead' ? ALL_LEAD_KINDS : ALL_CONTACT_KINDS)

  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<ActivityKind>(kinds[0])
  const [direction, setDirection] = useState<ActivityDirection | undefined>()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [outcome, setOutcome] = useState<CallOutcome | undefined>()
  const [durationMin, setDurationMin] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('open')
  const [assignedToUserId, setAssigned] = useState<string | undefined>()

  /* Reset transient fields when kind changes so we don't carry stale state */
  useEffect(() => {
    setDirection(undefined)
    setOutcome(undefined)
    setDurationMin('')
    setScheduledAt('')
    setDueAt('')
    setTaskStatus('open')
  }, [kind])

  const reset = () => {
    setKind(kinds[0])
    setDirection(undefined)
    setSubject('')
    setBody('')
    setOutcome(undefined)
    setDurationMin('')
    setScheduledAt('')
    setDueAt('')
    setTaskStatus('open')
    setAssigned(undefined)
  }

  const submit = async () => {
    const input: ActivityInput = {
      kind,
      direction,
      subject: subject.trim() || undefined,
      body: body.trim() || undefined,
    }
    if (kind === 'call') {
      input.outcome = outcome
      const minutes = Number.parseFloat(durationMin)
      if (Number.isFinite(minutes) && minutes > 0) {
        input.durationSeconds = Math.round(minutes * 60)
      }
    }
    if (kind === 'meeting' || kind === 'appointment') {
      input.scheduledAt = scheduledAt || undefined
    }
    if (kind === 'task') {
      input.dueAt = dueAt || undefined
      input.taskStatus = taskStatus
      input.assignedToUserId = assignedToUserId
    }

    await create.mutateAsync(input)
    setOpen(false)
    reset()
  }

  const supportsDirection =
    kind === 'call' || kind === 'email' || kind === 'sms' || kind === 'whatsapp'
  const isCall = kind === 'call'
  const isMeeting = kind === 'meeting' || kind === 'appointment'
  const isTask = kind === 'task'

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log activity</DialogTitle>
          <DialogDescription>
            Capture a note, call, email, SMS, meeting, or task on this{' '}
            {entity}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* kind chip row */}
          <div className="flex flex-wrap gap-1.5">
            {kinds.map((k) => {
              const spec = activityIconSpec(k)
              const active = k === kind
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input hover:bg-accent/40'
                  }`}
                >
                  <spec.Icon className="size-3.5" />
                  {spec.label}
                </button>
              )
            })}
          </div>

          {supportsDirection ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Direction</Label>
                <Select
                  value={direction ?? SENTINEL}
                  onValueChange={(v) =>
                    setDirection(v === SENTINEL ? undefined : (v as ActivityDirection))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SENTINEL}>—</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isCall ? (
                <div>
                  <Label className="text-xs">Outcome</Label>
                  <Select
                    value={outcome ?? SENTINEL}
                    onValueChange={(v) =>
                      setOutcome(v === SENTINEL ? undefined : (v as CallOutcome))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SENTINEL}>—</SelectItem>
                      {CALL_OUTCOMES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </div>
          ) : null}

          <div>
            <Label className="text-xs">Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Short summary"
            />
          </div>

          <div>
            <Label className="text-xs">
              {isTask ? 'Description' : isMeeting ? 'Notes / agenda' : 'Body'}
            </Label>
            <Textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                isTask
                  ? 'What needs doing…'
                  : isMeeting
                    ? 'Agenda, attendees…'
                    : 'Details…'
              }
            />
          </div>

          {isCall ? (
            <div>
              <Label className="text-xs">Duration (minutes)</Label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="e.g. 12"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
              />
            </div>
          ) : null}

          {isMeeting ? (
            <div>
              <Label className="text-xs">Scheduled at</Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
          ) : null}

          {isTask ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div>
                <Label className="text-xs">Due</Label>
                <Input
                  type="datetime-local"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select
                  value={taskStatus}
                  onValueChange={(v) => setTaskStatus(v as TaskStatus)}
                >
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
                <Label className="text-xs">Assignee</Label>
                <Select
                  value={assignedToUserId ?? SENTINEL}
                  onValueChange={(v) =>
                    setAssigned(v === SENTINEL ? undefined : v)
                  }
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
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending ? 'Saving…' : 'Log activity'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

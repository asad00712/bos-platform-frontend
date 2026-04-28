import { Badge } from '@/shared/ui/badge'
import type { RunStatus, TriggerKind, WorkflowStatus } from '../api/automation.contracts'

const WORKFLOW_VARIANT: Record<WorkflowStatus, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  paused: 'secondary',
  draft: 'outline',
}

const WORKFLOW_LABEL: Record<WorkflowStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  draft: 'Draft',
}

export function WorkflowStatusBadge({ status }: { status: WorkflowStatus }) {
  return <Badge variant={WORKFLOW_VARIANT[status]}>{WORKFLOW_LABEL[status]}</Badge>
}

const RUN_VARIANT: Record<RunStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  queued: 'outline',
  running: 'secondary',
  succeeded: 'default',
  failed: 'destructive',
  cancelled: 'outline',
}

const RUN_LABEL: Record<RunStatus, string> = {
  queued: 'Queued',
  running: 'Running',
  succeeded: 'Succeeded',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

export function RunStatusBadge({ status }: { status: RunStatus }) {
  return <Badge variant={RUN_VARIANT[status]}>{RUN_LABEL[status]}</Badge>
}

const TRIGGER_LABEL: Record<TriggerKind, string> = {
  event: 'Event',
  schedule: 'Schedule',
  webhook: 'Webhook',
  manual: 'Manual',
}

export function TriggerKindBadge({ kind }: { kind: TriggerKind }) {
  return (
    <Badge variant="outline" className="text-[10px] uppercase">
      {TRIGGER_LABEL[kind]}
    </Badge>
  )
}

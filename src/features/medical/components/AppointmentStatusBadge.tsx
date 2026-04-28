import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'

import type { Appointment } from '../api/medical.contracts'

const STATUS_TONE: Record<Appointment['status'], string> = {
  proposed: 'border-sky-500/40 bg-sky-500/5 text-sky-700 dark:text-sky-300',
  booked: 'border-primary/40 bg-primary/10 text-primary',
  arrived: 'border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300',
  fulfilled: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300',
  cancelled: 'border-muted text-muted-foreground',
  noshow: 'border-rose-500/40 bg-rose-500/5 text-rose-700 dark:text-rose-300',
}

const STATUS_LABEL: Record<Appointment['status'], string> = {
  proposed: 'Proposed',
  booked: 'Booked',
  arrived: 'Arrived',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
  noshow: 'No-show',
}

const STAGE_LABEL: Record<Appointment['pipelineStage'], string> = {
  scheduled: 'Scheduled',
  arrived: 'Arrived',
  roomed: 'Roomed',
  with_provider: 'With provider',
  checkout: 'Checkout',
  departed: 'Departed',
  noshow: 'No-show',
}

export function AppointmentStatusBadge({
  status,
  className,
}: {
  status: Appointment['status']
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        STATUS_TONE[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

export function PipelineStageBadge({
  stage,
}: {
  stage: Appointment['pipelineStage']
}) {
  const variant: 'default' | 'secondary' | 'outline' | 'destructive' =
    stage === 'noshow'
      ? 'destructive'
      : stage === 'departed'
        ? 'outline'
        : stage === 'with_provider' || stage === 'roomed'
          ? 'default'
          : 'secondary'
  return (
    <Badge variant={variant} className="capitalize">
      {STAGE_LABEL[stage]}
    </Badge>
  )
}

export const PIPELINE_STAGE_ORDER: Appointment['pipelineStage'][] = [
  'scheduled',
  'arrived',
  'roomed',
  'with_provider',
  'checkout',
  'departed',
]

export { STATUS_LABEL as APPOINTMENT_STATUS_LABEL }
export { STAGE_LABEL as PIPELINE_STAGE_LABEL }

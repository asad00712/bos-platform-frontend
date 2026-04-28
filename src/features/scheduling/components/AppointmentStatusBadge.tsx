import { Badge } from '@/shared/ui/badge'
import type { AppointmentStatus } from '../api/scheduling.contracts'

const VARIANT: Record<AppointmentStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  scheduled: 'secondary',
  confirmed: 'default',
  in_progress: 'default',
  completed: 'outline',
  cancelled: 'destructive',
  no_show: 'destructive',
}

const LABEL: Record<AppointmentStatus, string> = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No-show',
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>
}

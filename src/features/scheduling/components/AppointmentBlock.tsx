import { useNavigate } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { formatTime } from '@/shared/lib/format'
import { routes } from '@/routes/routeMap'
import type { Appointment } from '../api/scheduling.contracts'

const TONE: Record<Appointment['status'], string> = {
  scheduled:
    'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15',
  confirmed:
    'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20 dark:text-emerald-300',
  in_progress:
    'bg-amber-500/15 text-amber-700 border-amber-500/30 hover:bg-amber-500/20 dark:text-amber-300',
  completed:
    'bg-muted text-muted-foreground border-border hover:bg-muted/80',
  cancelled:
    'bg-rose-500/10 text-rose-700 line-through border-rose-500/20 hover:bg-rose-500/15 dark:text-rose-300',
  no_show:
    'bg-rose-500/10 text-rose-700 border-rose-500/20 hover:bg-rose-500/15 dark:text-rose-300',
}

type Props = {
  appointment: Appointment
  /** When false, the card is rendered in a list (no absolute position). */
  positioned?: boolean
  style?: React.CSSProperties
}

/** Visual block for a single appointment in calendar grids or lists. */
export function AppointmentBlock({ appointment, positioned = true, style }: Props) {
  const navigate = useNavigate()
  const start = new Date(appointment.startsAt)
  const end = new Date(appointment.endsAt)
  return (
    <button
      type="button"
      onClick={() => navigate(routes.app.scheduling.appointment(appointment.id))}
      className={cn(
        'overflow-hidden rounded-md border p-2 text-start text-xs leading-tight transition',
        TONE[appointment.status],
        positioned && 'absolute inset-x-1',
      )}
      style={style}
    >
      <div className="font-medium truncate">{appointment.title}</div>
      <div className="text-[11px] opacity-80 truncate">
        {formatTime(start)} – {formatTime(end)}
        {appointment.resourceName ? ` · ${appointment.resourceName}` : ''}
      </div>
    </button>
  )
}

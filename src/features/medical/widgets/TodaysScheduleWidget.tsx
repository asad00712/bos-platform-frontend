import { Link } from 'react-router'
import { CalendarClock, Stethoscope, Video } from 'lucide-react'

import { Panel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatTime } from '@/shared/lib/format'

import type { Widget } from '@/features/dashboard/widgets/types'
import { useAppointments } from '../hooks'
import { AppointmentStatusBadge } from '../components/AppointmentStatusBadge'

function TodaysScheduleComponent() {
  const { tenant } = useTenant()
  const q = useAppointments(tenant.id)

  const todayKey = new Date().toISOString().slice(0, 10)
  const items = (q.data?.items ?? [])
    .filter((a) => a.startAt.slice(0, 10) === todayKey)
    .sort((a, b) => a.startAt.localeCompare(b.startAt))

  return (
    <Panel
      title="Today's schedule"
      description="Day-of visits across providers"
      actions={
        <Link
          to="/app/medical/schedule"
          className="text-xs font-medium text-primary hover:underline"
        >
          Full schedule →
        </Link>
      }
    >
      {q.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
          <CalendarClock className="size-7 opacity-50" />
          <p>Nothing on the calendar today.</p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {items.slice(0, 8).map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-md border p-2 text-sm">
              <span className="w-14 shrink-0 font-medium tabular-nums">
                {formatTime(a.startAt)}
              </span>
              {a.appointmentClass === 'VR' ? (
                <Video className="size-3.5 text-violet-500" aria-label="Telehealth" />
              ) : (
                <Stethoscope className="size-3.5 text-muted-foreground" aria-hidden />
              )}
              <Link
                to={`/app/medical/patients/${a.patientId}`}
                className="min-w-0 flex-1 truncate font-medium hover:underline"
              >
                {a.patientName}
              </Link>
              <span className="hidden truncate text-xs text-muted-foreground md:block md:max-w-[8rem]">
                {a.providerName}
              </span>
              <AppointmentStatusBadge status={a.status} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export const TodaysScheduleWidget: Widget = {
  id: 'medical.dashboard.todays-schedule',
  Component: TodaysScheduleComponent,
  permission: 'dashboard:view',
  span: { col: 6 },
}

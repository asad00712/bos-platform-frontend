import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { CalendarDays, ChevronRight } from 'lucide-react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatDate, formatTime } from '@/shared/lib/format'
import { routes } from '@/routes/routeMap'

import type { Appointment } from '../api/scheduling.contracts'
import { AppointmentStatusBadge } from './AppointmentStatusBadge'

type Props = {
  appointments: Appointment[] | undefined
  isLoading?: boolean
}

export function AgendaView({ appointments, isLoading }: Props) {
  const navigate = useNavigate()

  const grouped = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const a of appointments ?? []) {
      const day = new Date(a.startsAt)
      const key = formatDate(day, { weekday: 'long', month: 'long', day: 'numeric' })
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(a)
    }
    return Array.from(map.entries())
  }, [appointments])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (grouped.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarDays />
              </EmptyMedia>
              <EmptyTitle>No appointments</EmptyTitle>
              <EmptyDescription>
                Nothing scheduled in this range. Click a slot in week or day view to add one.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {grouped.map(([day, items]) => (
        <Card key={day}>
          <CardContent className="p-0">
            <div className="border-b px-5 py-3">
              <p className="text-sm font-semibold">{day}</p>
              <p className="text-xs text-muted-foreground">
                {items.length} {items.length === 1 ? 'appointment' : 'appointments'}
              </p>
            </div>
            <ul className="divide-y">
              {items.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => navigate(routes.app.scheduling.appointment(a.id))}
                    className="flex w-full items-center gap-4 px-5 py-3 text-start text-sm transition hover:bg-accent/40"
                  >
                    <div className="w-24 shrink-0">
                      <div className="font-mono text-xs text-muted-foreground">
                        {formatTime(a.startsAt)} – {formatTime(a.endsAt)}
                      </div>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {[a.staffName, a.resourceName, a.contactName]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </p>
                    </div>
                    <AppointmentStatusBadge status={a.status} />
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

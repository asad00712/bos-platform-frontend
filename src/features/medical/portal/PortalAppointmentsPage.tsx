import { Link } from 'react-router'
import { CalendarCheck, MapPin, Stethoscope, Video } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatDateTime, formatRelative } from '@/shared/lib/format'

import { useAppointments } from '../hooks'
import { AppointmentStatusBadge } from '../components/AppointmentStatusBadge'
import { PORTAL_PATIENT_ID } from './portalConstants'

export function PortalAppointmentsPage() {
  const { tenant } = useTenant()
  const q = useAppointments(tenant.id)

  const mine = (q.data?.items ?? [])
    .filter((a) => a.patientId === PORTAL_PATIENT_ID)
    .sort((a, b) => a.startAt.localeCompare(b.startAt))

  const upcoming = mine.filter(
    (a) => a.status !== 'fulfilled' && a.status !== 'cancelled' && a.status !== 'noshow',
  )
  const past = mine.filter(
    (a) => a.status === 'fulfilled' || a.status === 'cancelled' || a.status === 'noshow',
  )

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Appointments</h1>
          <p className="text-sm text-muted-foreground">
            Manage upcoming visits and review past encounters.
          </p>
        </div>
        <Button>
          <CalendarCheck /> Request appointment
        </Button>
      </header>

      <Section title="Upcoming">
        {q.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((a) => (
              <li key={a.id}>
                <Card>
                  <CardContent className="flex flex-wrap items-center gap-3 p-4 text-sm">
                    <div className="flex flex-col items-center justify-center rounded-md border bg-primary/5 px-3 py-2 text-center text-primary">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {new Date(a.startAt).toLocaleString(undefined, { month: 'short' })}
                      </p>
                      <p className="text-xl font-semibold tabular-nums">
                        {new Date(a.startAt).getDate()}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{a.visitType}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(a.startAt)} · {formatRelative(a.startAt)}
                      </p>
                      <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <Stethoscope className="size-3" />
                        {a.providerName}
                        {a.appointmentClass === 'VR' ? (
                          <Badge variant="outline" className="ms-1 gap-1">
                            <Video className="size-3" /> Telehealth
                          </Badge>
                        ) : (
                          <>
                            <MapPin className="ms-1 size-3" /> {a.locationName}
                          </>
                        )}
                      </p>
                    </div>
                    <AppointmentStatusBadge status={a.status} />
                    <div className="flex gap-2">
                      {a.appointmentClass === 'VR' ? (
                        <Button asChild>
                          <Link to="/portal">Join visit</Link>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          Directions
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Past visits" muted={past.length === 0}>
        {q.isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : past.length === 0 ? (
          <p className="text-sm text-muted-foreground">No past visits.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {past.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-md border p-3"
              >
                <p className="font-medium">{a.visitType}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(a.startAt)}
                </span>
                <AppointmentStatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}

function Section({
  title,
  muted,
  children,
}: {
  title: string
  muted?: boolean
  children: React.ReactNode
}) {
  return (
    <section className={muted ? 'opacity-90' : undefined}>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

import { Link } from 'react-router'
import {
  CalendarCheck,
  ChevronRight,
  Microscope,
  MessageSquareText,
  Pill,
  Receipt,
  Sparkles,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

import { useTenant } from '@/shared/hooks/useTenant'
import { formatDateTime, formatRelative } from '@/shared/lib/format'

import {
  useAppointments,
  useLabInbox,
  useMedications,
  usePatient,
} from '../hooks'
import { PORTAL_PATIENT_ID } from './portalConstants'

export function PortalHomePage() {
  const { tenant } = useTenant()
  const patient = usePatient(tenant.id, PORTAL_PATIENT_ID)
  const meds = useMedications(tenant.id, PORTAL_PATIENT_ID)
  const appts = useAppointments(tenant.id)
  const labs = useLabInbox(tenant.id)

  const upcoming = (appts.data?.items ?? [])
    .filter(
      (a) =>
        a.patientId === PORTAL_PATIENT_ID &&
        (a.status === 'booked' || a.status === 'proposed' || a.status === 'arrived'),
    )
    .sort((a, b) => a.startAt.localeCompare(b.startAt))[0]

  const releasedResults = (labs.data?.items ?? []).filter(
    (i) => i.patientId === PORTAL_PATIENT_ID && i.signedAt,
  )

  const fullName = patient.data
    ? `${patient.data.patient.name.preferred ?? patient.data.patient.name.given}`
    : ''

  return (
    <div className="space-y-6">
      {/* hero */}
      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
        <CardContent className="flex flex-wrap items-center gap-4 p-6">
          <Avatar className="size-12">
            <AvatarFallback>
              {fullName
                .split(' ')
                .map((p) => p[0])
                .join('')
                .toUpperCase() || 'PS'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="text-2xl font-semibold">
              {fullName || <Skeleton className="inline-block h-7 w-32" />}
            </h1>
            <p className="text-xs text-muted-foreground">{tenant.name}</p>
          </div>
          <Badge className="gap-1.5 bg-primary text-primary-foreground">
            <Sparkles className="size-3" /> Secure portal
          </Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Upcoming appointment */}
        <Card>
          <CardContent className="space-y-2 p-5">
            <header className="flex items-center gap-2">
              <CalendarCheck className="size-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Next appointment
              </h2>
            </header>
            {appts.isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : !upcoming ? (
              <p className="text-sm text-muted-foreground">No upcoming visits scheduled.</p>
            ) : (
              <div>
                <p className="text-base font-medium">{upcoming.visitType}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(upcoming.startAt)} · {upcoming.providerName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {upcoming.appointmentClass === 'VR'
                    ? 'Telehealth'
                    : upcoming.locationName}{' '}
                  · {formatRelative(upcoming.startAt)}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    to="/portal/appointments"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Manage →
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test results */}
        <Card>
          <CardContent className="space-y-2 p-5">
            <header className="flex items-center gap-2">
              <Microscope className="size-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Test results
              </h2>
              {releasedResults.length > 0 ? (
                <Badge variant="secondary" className="ms-auto">
                  {releasedResults.length} released
                </Badge>
              ) : null}
            </header>
            {labs.isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : releasedResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No results released yet. Your provider will let you know when they're available.
              </p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {releasedResults.slice(0, 3).map((r) => (
                  <li key={r.reportId}>
                    <Link
                      to="/portal/results"
                      className="flex items-baseline justify-between gap-2 hover:underline"
                    >
                      <span className="break-words font-medium">{r.panelDisplay}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelative(r.effectiveDateTime)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Medications */}
        <Card>
          <CardContent className="space-y-2 p-5">
            <header className="flex items-center gap-2">
              <Pill className="size-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Medications
              </h2>
            </header>
            {meds.isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (meds.data?.active ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No active prescriptions on file.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {meds.data!.active.slice(0, 3).map((m) => (
                  <li key={m.id} className="space-y-0.5">
                    <p className="break-words font-medium leading-tight">
                      {m.medication.display}{' '}
                      <span className="text-muted-foreground">{m.strengthLabel}</span>
                    </p>
                    <p className="break-words text-xs text-muted-foreground">{m.dosage.text}</p>
                  </li>
                ))}
                <li className="pt-1">
                  <Link
                    to="/portal/medications"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Request a refill →
                  </Link>
                </li>
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick links */}
        <Card>
          <CardContent className="p-5">
            <header className="mb-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Quick links
              </h2>
            </header>
            <ul className="space-y-1.5 text-sm">
              <QuickLink
                to="/portal/messages"
                icon={<MessageSquareText className="size-4" />}
                label="Message your care team"
              />
              <QuickLink
                to="/portal/billing"
                icon={<Receipt className="size-4" />}
                label="View statements & pay"
              />
              <QuickLink
                to="/portal/appointments"
                icon={<CalendarCheck className="size-4" />}
                label="Request a new visit"
              />
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function QuickLink({
  to,
  icon,
  label,
}: {
  to: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center gap-2 rounded-md border p-2.5 transition-colors hover:bg-accent"
      >
        <span className="text-primary">{icon}</span>
        <span className="flex-1">{label}</span>
        <ChevronRight className="size-4 text-muted-foreground" />
      </Link>
    </li>
  )
}

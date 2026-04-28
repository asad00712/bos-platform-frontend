import { Link, useParams } from 'react-router'
import {
  Activity,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  HeartPulse,
  Microscope,
  Pill,
  ShieldAlert,
  Syringe,
  TrendingUp,
} from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatRelative } from '@/shared/lib/format'
import { BidiCode } from '@/shared/lib/bidi'

import {
  useEncounters,
  useImmunizations,
  useLabReport,
  useMedications,
  useProblems,
  useRecalls,
} from '../../hooks'

export function PatientSummaryPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()

  const problems = useProblems(tenant.id, id)
  const meds = useMedications(tenant.id, id)
  const imms = useImmunizations(tenant.id, id)
  const encounters = useEncounters(tenant.id, id)
  const recalls = useRecalls(tenant.id)
  // pre-fetch a result detail for the most recent abnormal report — left
  // intentionally null when no id is available
  void useLabReport(tenant.id, undefined)

  const myRecalls = recalls.data?.items.filter((r) => r.patientId === id) ?? []
  const dueImms = imms.data?.due.filter((d) => d.status !== 'upcoming') ?? []
  const recentEncounter = encounters.data?.items[0]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Block
          icon={<Activity className="size-4" />}
          title="Active problems"
          to={`/app/medical/patients/${id}/problems`}
          count={problems.data?.items.filter((p) => p.clinicalStatus === 'active').length}
        >
          {problems.isLoading ? (
            <SkeletonRows />
          ) : problems.data?.items.length === 0 ? (
            <Empty>None on file</Empty>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {problems.data?.items
                .filter((p) => p.clinicalStatus === 'active')
                .slice(0, 6)
                .map((p) => (
                  <li key={p.id} className="flex items-baseline gap-2">
                    <BidiCode className="text-xs text-muted-foreground">{p.icd10.code}</BidiCode>
                    <span className="break-words">{p.icd10.display}</span>
                    {p.severity ? (
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {p.severity}
                      </Badge>
                    ) : null}
                  </li>
                ))}
            </ul>
          )}
        </Block>

        <Block
          icon={<Pill className="size-4" />}
          title="Active medications"
          to={`/app/medical/patients/${id}/medications`}
          count={meds.data?.active.length}
        >
          {meds.isLoading ? (
            <SkeletonRows />
          ) : meds.data?.active.length === 0 ? (
            <Empty>None on file</Empty>
          ) : (
            <ul className="space-y-2 text-sm">
              {meds.data?.active.slice(0, 6).map((m) => (
                <li key={m.id} className="space-y-0.5">
                  <p className="break-words font-medium leading-tight">
                    {m.medication.display}
                    <span className="ms-1 text-muted-foreground">{m.strengthLabel}</span>
                    {m.controlled ? (
                      <Badge variant="outline" className="ms-2 text-[10px] uppercase">
                        {m.controlledSchedule ?? 'Ctrl'}
                      </Badge>
                    ) : null}
                  </p>
                  <p className="break-words text-xs text-muted-foreground">{m.dosage.text}</p>
                </li>
              ))}
            </ul>
          )}
        </Block>

        <Block
          icon={<Syringe className="size-4" />}
          title="Immunizations due"
          to={`/app/medical/patients/${id}/immunizations`}
          count={dueImms.length}
        >
          {imms.isLoading ? (
            <SkeletonRows />
          ) : dueImms.length === 0 ? (
            <Empty>Up to date</Empty>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {dueImms.slice(0, 6).map((d) => (
                <li
                  key={`${d.vaccineCode}-${d.doseLabel}`}
                  className="flex items-center gap-2"
                >
                  <Badge
                    variant={d.status === 'overdue' ? 'destructive' : 'secondary'}
                    className="capitalize"
                  >
                    {d.status}
                  </Badge>
                  <span>
                    {d.vaccineDisplay} · {d.doseLabel}
                  </span>
                  <span className="ms-auto text-xs text-muted-foreground">
                    {formatRelative(d.dueDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Block>

        <Block
          icon={<CalendarClock className="size-4" />}
          title="Recalls"
          to={`/app/medical/recalls`}
          count={myRecalls.length}
        >
          {recalls.isLoading ? (
            <SkeletonRows />
          ) : myRecalls.length === 0 ? (
            <Empty>None pending</Empty>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {myRecalls.slice(0, 6).map((r) => (
                <li key={r.id} className="flex items-center gap-2">
                  <Badge
                    variant={
                      r.status === 'overdue'
                        ? 'destructive'
                        : r.status === 'due'
                          ? 'default'
                          : 'outline'
                    }
                    className="capitalize"
                  >
                    {r.status}
                  </Badge>
                  <span className="flex-1 break-words">{r.reason}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelative(r.dueDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Block>

        <Block
          icon={<ClipboardList className="size-4" />}
          title="Last encounter"
          to={`/app/medical/patients/${id}/encounters`}
        >
          {encounters.isLoading ? (
            <SkeletonRows />
          ) : !recentEncounter ? (
            <Empty>No prior encounters</Empty>
          ) : (
            <div className="space-y-1.5 text-sm">
              <p className="font-medium">{recentEncounter.visitType}</p>
              <p className="text-xs text-muted-foreground">
                {recentEncounter.providerName} · {formatRelative(recentEncounter.startAt)}
              </p>
              {recentEncounter.primaryDxDisplay ? (
                <p className="text-xs">
                  <span className="text-muted-foreground">Dx:</span>{' '}
                  {recentEncounter.primaryDxDisplay}
                </p>
              ) : null}
              <Button asChild size="sm" variant="outline" className="mt-2">
                <Link to={`/app/medical/encounters/${recentEncounter.id}`}>
                  Open encounter <ChevronRight className="ms-1 size-3" />
                </Link>
              </Button>
            </div>
          )}
        </Block>

        <Block
          icon={<HeartPulse className="size-4" />}
          title="Quick actions"
        >
          <ul className="space-y-1.5 text-sm">
            <li>
              <Link className="text-primary hover:underline" to={`/app/medical/patients/${id}/vitals`}>
                <TrendingUp className="me-1 inline size-3.5" /> Record vitals
              </Link>
            </li>
            <li>
              <Link className="text-primary hover:underline" to={`/app/medical/patients/${id}/labs`}>
                <Microscope className="me-1 inline size-3.5" /> Order labs
              </Link>
            </li>
            <li>
              <Link className="text-primary hover:underline" to={`/app/medical/patients/${id}/medications`}>
                <Pill className="me-1 inline size-3.5" /> Open Rx pad
              </Link>
            </li>
            <li>
              <Link className="text-rose-600 hover:underline dark:text-rose-400" to={`/app/medical/patients/${id}/allergies`}>
                <ShieldAlert className="me-1 inline size-3.5" /> Update allergies
              </Link>
            </li>
          </ul>
        </Block>
      </div>
    </div>
  )
}

function Block({
  icon,
  title,
  to,
  count,
  children,
}: {
  icon: React.ReactNode
  title: string
  to?: string
  count?: number
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border bg-background p-4">
      <header className="mb-3 flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        {count !== undefined && count > 0 ? (
          <Badge variant="secondary" className="ms-1 h-5 px-1.5 text-[10px] tabular-nums">
            {count}
          </Badge>
        ) : null}
        {to ? (
          <Link to={to} className="ms-auto text-xs font-medium text-primary hover:underline">
            View →
          </Link>
        ) : null}
      </header>
      {children}
    </section>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  )
}

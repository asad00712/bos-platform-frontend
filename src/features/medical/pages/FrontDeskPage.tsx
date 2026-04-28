import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  DoorOpen,
  HomeIcon,
  Stethoscope,
  UserX,
  Video,
} from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatDate, formatRelative, formatTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'

import { useAppointments, useSetAppointmentStage } from '../hooks'
import type { Appointment } from '../api/medical.contracts'

type Stage = Appointment['pipelineStage']

const STAGES: { id: Stage; label: string; icon: typeof Stethoscope; tone: string }[] = [
  { id: 'scheduled', label: 'Scheduled', icon: Clock3, tone: 'border-sky-500/40 bg-sky-500/5' },
  { id: 'arrived', label: 'Arrived', icon: DoorOpen, tone: 'border-amber-500/50 bg-amber-500/10' },
  { id: 'roomed', label: 'Roomed', icon: HomeIcon, tone: 'border-amber-500/50 bg-amber-500/10' },
  { id: 'with_provider', label: 'With provider', icon: Stethoscope, tone: 'border-primary/50 bg-primary/10' },
  { id: 'checkout', label: 'Checkout', icon: ArrowRight, tone: 'border-amber-500/40 bg-amber-500/5' },
  { id: 'departed', label: 'Departed', icon: CheckCircle2, tone: 'border-emerald-500/50 bg-emerald-500/10' },
]

const NEXT_STAGE: Partial<Record<Stage, Stage>> = {
  scheduled: 'arrived',
  arrived: 'roomed',
  roomed: 'with_provider',
  with_provider: 'checkout',
  checkout: 'departed',
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function FrontDeskPage() {
  const { tenant } = useTenant()
  const q = useAppointments(tenant.id)
  const setStage = useSetAppointmentStage(tenant.id)

  const today = useMemo(() => startOfDay(new Date()), [])
  const todayStr = today.toISOString().slice(0, 10)
  const items = useMemo(() => {
    return (q.data?.items ?? [])
      .filter((a) => a.startAt.slice(0, 10) === todayStr || a.pipelineStage !== 'scheduled')
      .filter((a) => a.status !== 'cancelled')
      .sort((a, b) => a.startAt.localeCompare(b.startAt))
  }, [q.data, todayStr])

  const buckets = useMemo(() => {
    const map = new Map<Stage, Appointment[]>()
    for (const s of STAGES) map.set(s.id, [])
    map.set('noshow', [])
    for (const a of items) {
      const list = map.get(a.pipelineStage) ?? []
      list.push(a)
      map.set(a.pipelineStage, list)
    }
    return map
  }, [items])

  const noshow = buckets.get('noshow') ?? []

  return (
    <PageContainer>
      <PageHeader
        title="Front desk"
        description={
          q.isLoading
            ? 'Loading…'
            : `${formatDate(today, { dateStyle: 'full' })} · ${items.length} on the board`
        }
        actions={
          <Button asChild variant="outline">
            <Link to="/app/medical/schedule">Schedule</Link>
          </Button>
        }
      />

      {q.isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {STAGES.map((stage) => {
            const list = buckets.get(stage.id) ?? []
            const Icon = stage.icon
            return (
              <Card key={stage.id} className={cn('flex flex-col', stage.tone)}>
                <CardContent className="space-y-2 p-3">
                  <header className="flex items-center gap-2">
                    <Icon className="size-4" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider">
                      {stage.label}
                    </h3>
                    <Badge variant="outline" className="ms-auto h-5 px-1.5 text-[10px] tabular-nums">
                      {list.length}
                    </Badge>
                  </header>
                  <ul className="space-y-2">
                    {list.length === 0 ? (
                      <li className="rounded-md border border-dashed p-2 text-center text-xs text-muted-foreground">
                        Empty
                      </li>
                    ) : (
                      list.map((a) => (
                        <PipelineCard
                          key={a.id}
                          appt={a}
                          onAdvance={() => {
                            const next = NEXT_STAGE[a.pipelineStage]
                            if (next) setStage.mutate({ id: a.id, stage: next })
                          }}
                          onNoShow={() => setStage.mutate({ id: a.id, stage: 'noshow' })}
                        />
                      ))
                    )}
                  </ul>
                </CardContent>
              </Card>
            )
          })}

          {noshow.length > 0 ? (
            <Card className="border-rose-500/40 bg-rose-500/5 md:col-span-2 xl:col-span-3 2xl:col-span-6">
              <CardContent className="space-y-2 p-3">
                <header className="flex items-center gap-2">
                  <UserX className="size-4 text-rose-500" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    No-shows ({noshow.length})
                  </h3>
                </header>
                <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {noshow.map((a) => (
                    <PipelineCard key={a.id} appt={a} muted />
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </PageContainer>
  )
}

function PipelineCard({
  appt,
  onAdvance,
  onNoShow,
  muted,
}: {
  appt: Appointment
  onAdvance?: () => void
  onNoShow?: () => void
  muted?: boolean
}) {
  const next = NEXT_STAGE[appt.pipelineStage]
  return (
    <li className={cn('rounded-md border bg-background p-2.5 text-sm', muted && 'opacity-80')}>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-medium tabular-nums">{formatTime(appt.startAt)}</span>
        {appt.appointmentClass === 'VR' ? (
          <Badge variant="outline" className="gap-1 text-[10px]">
            <Video className="size-3" /> Tele
          </Badge>
        ) : null}
        <span className="ms-auto text-[11px] text-muted-foreground">
          {formatRelative(appt.startAt)}
        </span>
      </div>
      <Link
        to={`/app/medical/patients/${appt.patientId}`}
        className="block break-words font-semibold leading-tight hover:underline"
      >
        {appt.patientName}
      </Link>
      <p className="break-words text-xs text-muted-foreground">{appt.visitType}</p>
      <p className="text-[11px] text-muted-foreground">{appt.providerName}</p>

      {!muted ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {next ? (
            <Button size="sm" className="h-7 px-2 text-xs" onClick={onAdvance}>
              <ArrowRight className="me-1 size-3" /> {STAGES.find((s) => s.id === next)?.label}
            </Button>
          ) : null}
          {onNoShow && appt.pipelineStage !== 'departed' ? (
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={onNoShow}>
              No-show
            </Button>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}

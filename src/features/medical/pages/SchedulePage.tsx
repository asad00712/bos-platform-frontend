import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Users,
  Video,
} from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/tabs'

import { formatDate, formatTime } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'
import { cn } from '@/shared/lib/utils'

import { useAppointments, usePractitioners } from '../hooks'
import type { Appointment } from '../api/medical.contracts'
import {
  APPOINTMENT_STATUS_LABEL,
  AppointmentStatusBadge,
} from '../components/AppointmentStatusBadge'

type Mode = 'day' | 'week'

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function startOfWeek(d: Date): Date {
  const x = startOfDay(d)
  const diff = x.getDay() // 0 = Sun
  x.setDate(x.getDate() - diff)
  return x
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

const HOURS = Array.from({ length: 13 }, (_, i) => 7 + i) // 07:00 → 19:00

const CLASS_TONE: Record<Appointment['appointmentClass'], string> = {
  AMB: 'border-primary/40 bg-primary/10',
  VR: 'border-violet-500/50 bg-violet-500/10',
  EMER: 'border-rose-500/50 bg-rose-500/10',
  IMP: 'border-amber-500/50 bg-amber-500/10',
  HH: 'border-sky-500/50 bg-sky-500/10',
}

export function SchedulePage() {
  const { tenant } = useTenant()
  const q = useAppointments(tenant.id)
  const practitioners = usePractitioners(tenant.id)
  const [mode, setMode] = useState<Mode>('day')
  const [anchor, setAnchor] = useState<Date>(() => new Date())
  const [providerId, setProviderId] = useState<string>('all')

  const items = useMemo(() => {
    let list = q.data?.items ?? []
    if (providerId !== 'all') list = list.filter((a) => a.providerId === providerId)
    return list
  }, [q.data, providerId])

  const days = useMemo<Date[]>(() => {
    if (mode === 'day') return [startOfDay(anchor)]
    const wk = startOfWeek(anchor)
    return Array.from({ length: 7 }, (_, i) => addDays(wk, i))
  }, [mode, anchor])

  const headerLabel =
    mode === 'day'
      ? formatDate(days[0]!, { dateStyle: 'full' })
      : `Week of ${formatDate(days[0]!, { dateStyle: 'medium' })}`

  function shift(direction: -1 | 1) {
    setAnchor((cur) => addDays(cur, mode === 'day' ? direction : 7 * direction))
  }

  const dayBuckets = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const d of days) map.set(d.toISOString().slice(0, 10), [])
    for (const a of items) {
      const dayKey = a.startAt.slice(0, 10)
      const bucket = map.get(dayKey)
      if (bucket) bucket.push(a)
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.startAt.localeCompare(b.startAt))
    }
    return map
  }, [items, days])

  return (
    <PageContainer>
      <PageHeader
        title="Schedule"
        description={
          q.isLoading
            ? 'Loading…'
            : `${items.length} appointments in scope`
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/app/medical/recalls">
                <Users /> Recalls
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/app/medical/front-desk">
                <Stethoscope /> Front desk
              </Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" aria-label="Previous" onClick={() => shift(-1)}>
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAnchor(new Date())}
                className="gap-1"
              >
                <CalendarDays className="size-3.5" /> Today
              </Button>
              <Button variant="ghost" size="icon" aria-label="Next" onClick={() => shift(1)}>
                <ChevronRight />
              </Button>
            </div>
            <p className="text-sm font-medium">{headerLabel}</p>
            <Select value={providerId} onValueChange={setProviderId}>
              <SelectTrigger className="ms-auto w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All providers</SelectItem>
                {practitioners.data?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    Dr. {p.firstName} {p.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {q.isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : mode === 'day' ? (
            <DayGrid date={days[0]!} items={dayBuckets.get(days[0]!.toISOString().slice(0, 10)) ?? []} />
          ) : (
            <WeekGrid days={days} buckets={dayBuckets} />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

function DayGrid({ date, items }: { date: Date; items: Appointment[] }) {
  const isToday = startOfDay(date).getTime() === startOfDay(new Date()).getTime()
  return (
    <div className="overflow-x-auto rounded-md border">
      <div className="grid grid-cols-[5rem_1fr]">
        <div className="border-e bg-muted/30 px-2 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Time
        </div>
        <div
          className={cn(
            'flex items-baseline gap-2 px-3 py-2 text-sm font-medium',
            isToday && 'bg-primary/10',
          )}
        >
          {formatDate(date, { weekday: 'long', month: 'short', day: 'numeric' })}
          {isToday ? <Badge>Today</Badge> : null}
        </div>
        {HOURS.map((h) => (
          <Hour key={h} hour={h} items={itemsInHour(items, date, h)} fullWidth />
        ))}
      </div>
    </div>
  )
}

function WeekGrid({
  days,
  buckets,
}: {
  days: Date[]
  buckets: Map<string, Appointment[]>
}) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <div
        className="grid"
        style={{ gridTemplateColumns: `5rem repeat(${days.length}, minmax(140px, 1fr))` }}
      >
        <div className="border-e bg-muted/30 px-2 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Time
        </div>
        {days.map((d) => {
          const isToday = startOfDay(d).getTime() === startOfDay(new Date()).getTime()
          return (
            <div
              key={d.toISOString()}
              className={cn(
                'border-s px-2 py-2 text-xs font-medium uppercase tracking-wider',
                isToday ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
              )}
            >
              {formatDate(d, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          )
        })}
        {HOURS.map((h) => (
          <WeekHourRow
            key={h}
            hour={h}
            days={days}
            buckets={buckets}
          />
        ))}
      </div>
    </div>
  )
}

function WeekHourRow({
  hour,
  days,
  buckets,
}: {
  hour: number
  days: Date[]
  buckets: Map<string, Appointment[]>
}) {
  return (
    <>
      <Hour hour={hour} items={[]} hideContent />
      {days.map((d) => {
        const list = itemsInHour(buckets.get(d.toISOString().slice(0, 10)) ?? [], d, hour)
        return (
          <div
            key={`${d.toISOString()}-${hour}`}
            className={cn(
              'border-s border-t p-1 align-top',
              startOfDay(d).getTime() === startOfDay(new Date()).getTime() && 'bg-primary/[0.04]',
            )}
          >
            {list.length === 0 ? (
              <span className="block h-full" />
            ) : (
              <div className="flex flex-col gap-1">
                {list.map((a) => (
                  <AppointmentChip key={a.id} appt={a} compact />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

function Hour({
  hour,
  items,
  fullWidth,
  hideContent,
}: {
  hour: number
  items: Appointment[]
  fullWidth?: boolean
  hideContent?: boolean
}) {
  const label = `${hour.toString().padStart(2, '0')}:00`
  return (
    <>
      <div className="border-e border-t bg-muted/30 px-2 py-2 text-[11px] tabular-nums text-muted-foreground">
        {label}
      </div>
      {hideContent ? null : (
        <div
          className={cn(
            'min-h-[60px] border-t p-1 align-top',
            fullWidth ? '' : '',
          )}
        >
          {items.length === 0 ? (
            <span className="block h-full" />
          ) : (
            <div className="flex flex-col gap-1">
              {items.map((a) => (
                <AppointmentChip key={a.id} appt={a} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

function AppointmentChip({ appt, compact }: { appt: Appointment; compact?: boolean }) {
  return (
    <Link
      to={`/app/medical/patients/${appt.patientId}`}
      className={cn(
        'block rounded-md border-2 p-1.5 text-xs leading-tight transition-colors hover:bg-accent',
        CLASS_TONE[appt.appointmentClass],
        appt.status === 'cancelled' && 'opacity-50 line-through',
        appt.status === 'noshow' && 'border-rose-500/60 bg-rose-500/15',
      )}
      title={`${appt.patientName} · ${appt.visitType} · ${APPOINTMENT_STATUS_LABEL[appt.status]}`}
    >
      <p className="flex items-center gap-1 font-medium">
        <span className="tabular-nums">{formatTime(appt.startAt)}</span>
        {appt.appointmentClass === 'VR' ? <Video className="size-3" /> : null}
      </p>
      <p className="break-words font-medium">{appt.patientName}</p>
      {!compact ? (
        <p className="break-words text-muted-foreground">{appt.visitType}</p>
      ) : null}
      {!compact ? (
        <div className="mt-0.5">
          <AppointmentStatusBadge status={appt.status} />
        </div>
      ) : null}
    </Link>
  )
}

function itemsInHour(items: Appointment[], date: Date, hour: number): Appointment[] {
  return items.filter((a) => {
    const d = new Date(a.startAt)
    return (
      d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear() &&
      d.getHours() === hour
    )
  })
}

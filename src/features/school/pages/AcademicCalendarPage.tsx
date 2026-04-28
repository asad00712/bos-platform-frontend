import {
  CalendarDays,
  GraduationCap,
  PartyPopper,
  Trophy,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

import { formatDate } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import type { CalendarEvent } from '../api/school.contracts'
import { useAcademicCalendar } from '../hooks'

const KIND_ICON: Record<CalendarEvent['kind'], LucideIcon> = {
  holiday: PartyPopper,
  event: CalendarDays,
  exam: GraduationCap,
  parent_meeting: Users,
  sports: Trophy,
  term: CalendarDays,
}

const KIND_TONE: Record<CalendarEvent['kind'], string> = {
  holiday: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  event: 'bg-primary/15 text-primary',
  exam: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  parent_meeting: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  sports: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  term: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
}

const KIND_LABEL: Record<CalendarEvent['kind'], string> = {
  holiday: 'Holiday',
  event: 'Event',
  exam: 'Exam',
  parent_meeting: 'Parent meeting',
  sports: 'Sports',
  term: 'Term',
}

export function AcademicCalendarPage() {
  const { tenant } = useTenant()
  const q = useAcademicCalendar(tenant.id)

  if (q.isLoading || !q.data) {
    return (
      <PageContainer>
        <PageHeader title="Academic calendar" description="Loading…" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </PageContainer>
    )
  }

  if (q.data.items.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Academic calendar" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarDays />
            </EmptyMedia>
            <EmptyTitle>No events</EmptyTitle>
            <EmptyDescription>
              Add term boundaries, exams, holidays, and meetings.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </PageContainer>
    )
  }

  // Group by month
  const byMonth = q.data.items.reduce<Record<string, CalendarEvent[]>>(
    (acc, ev) => {
      const monthKey = ev.startDate.slice(0, 7)
      ;(acc[monthKey] ??= []).push(ev)
      return acc
    },
    {},
  )

  return (
    <PageContainer>
      <PageHeader
        title="Academic calendar"
        description={`${q.data.items.length} events scheduled`}
      />

      <div className="space-y-6">
        {Object.entries(byMonth).map(([month, events]) => (
          <section key={month} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {formatDate(`${month}-01`, { month: 'long', year: 'numeric' })}
            </h2>
            <div className="space-y-2">
              {events.map((ev) => {
                const Icon = KIND_ICON[ev.kind]
                const sameDay = ev.startDate === ev.endDate
                return (
                  <Card key={ev.id}>
                    <CardContent className="flex items-start gap-3 p-4">
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${KIND_TONE[ev.kind]}`}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold">{ev.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {KIND_LABEL[ev.kind]} ·{' '}
                          {sameDay
                            ? formatDate(ev.startDate, { dateStyle: 'medium' })
                            : `${formatDate(ev.startDate, { dateStyle: 'medium' })} — ${formatDate(ev.endDate, { dateStyle: 'medium' })}`}
                        </p>
                        {ev.notes ? (
                          <p className="text-xs text-muted-foreground/90">
                            {ev.notes}
                          </p>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </PageContainer>
  )
}

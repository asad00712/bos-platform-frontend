import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Plus } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { useTenant } from '@/shared/hooks/useTenant'
import { usePermissions } from '@/shared/hooks/usePermissions'

import {
  endOfDay,
  endOfWeek,
  startOfDay,
  startOfWeek,
  toIso,
} from '../lib/calendar'
import { useAppointmentList } from '../hooks'
import { CalendarToolbar, type CalendarView } from '../components/CalendarToolbar'
import { WeekView } from '../components/WeekView'
import { DayView } from '../components/DayView'
import { AgendaView } from '../components/AgendaView'
import { NewAppointmentDialog } from '../components/NewAppointmentDialog'
import type { AppointmentInput } from '../api/scheduling.contracts'

const VIEW_VALUES: CalendarView[] = ['day', 'week', 'agenda']

export function ScheduleCalendarPage() {
  const { tenant } = useTenant()
  const { has } = usePermissions()
  const [searchParams, setSearchParams] = useSearchParams()

  const viewParam = searchParams.get('view') as CalendarView | null
  const view: CalendarView =
    viewParam && VIEW_VALUES.includes(viewParam) ? viewParam : 'week'

  const [anchor, setAnchor] = useState<Date>(new Date())
  const [slotDraft, setSlotDraft] = useState<Partial<AppointmentInput> | null>(null)

  const range = useMemo(() => {
    const from = view === 'day' ? startOfDay(anchor) : startOfWeek(anchor)
    const to = view === 'day' ? endOfDay(anchor) : endOfWeek(anchor)
    return { from: toIso(from), to: toIso(to) }
  }, [view, anchor])

  const list = useAppointmentList(tenant.id, range)
  const canWrite = has('scheduling:write')

  const setView = (next: CalendarView) => {
    setSearchParams((p) => {
      const np = new URLSearchParams(p)
      if (next === 'week') np.delete('view')
      else np.set('view', next)
      return np
    })
  }

  const onSlotClick = (start: Date) => {
    if (!canWrite) return
    const end = new Date(start.getTime() + 30 * 60_000)
    setSlotDraft({
      title: '',
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      status: 'scheduled',
      kind: 'consultation',
    })
  }

  const total = list.data?.items.length ?? 0

  return (
    <PageContainer>
      <PageHeader
        title="Scheduling"
        description={
          list.isLoading
            ? 'Loading…'
            : `${total} ${total === 1 ? 'appointment' : 'appointments'} this ${
                view === 'day' ? 'day' : 'week'
              }`
        }
        actions={
          canWrite ? (
            <NewAppointmentDialog
              trigger={
                <Button>
                  <Plus /> New appointment
                </Button>
              }
            />
          ) : undefined
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <CalendarToolbar
            view={view}
            onViewChange={setView}
            anchor={anchor}
            onAnchorChange={setAnchor}
          />

          {view === 'week' ? (
            <WeekView
              anchor={anchor}
              appointments={list.data?.items}
              isLoading={list.isLoading}
              onSlotClick={onSlotClick}
            />
          ) : null}
          {view === 'day' ? (
            <DayView
              day={anchor}
              appointments={list.data?.items}
              onSlotClick={onSlotClick}
            />
          ) : null}
          {view === 'agenda' ? (
            <AgendaView
              appointments={list.data?.items}
              isLoading={list.isLoading}
            />
          ) : null}
        </CardContent>
      </Card>

      {/* Slot-click dialog (controlled, mounts only when there's a draft). */}
      <NewAppointmentDialog
        open={Boolean(slotDraft)}
        onOpenChange={(o) => {
          if (!o) setSlotDraft(null)
        }}
        initialValues={slotDraft ?? undefined}
        onCreated={() => setSlotDraft(null)}
      />
    </PageContainer>
  )
}

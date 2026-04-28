import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { formatDate } from '@/shared/lib/format'
import {
  addDays,
  addWeeks,
  endOfWeek,
  isSameDay,
  startOfWeek,
} from '../lib/calendar'

export type CalendarView = 'day' | 'week' | 'agenda'

type Props = {
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  anchor: Date
  onAnchorChange: (date: Date) => void
  trailing?: React.ReactNode
}

export function CalendarToolbar({
  view,
  onViewChange,
  anchor,
  onAnchorChange,
  trailing,
}: Props) {
  const label = labelFor(view, anchor)

  const stepBack = () => onAnchorChange(stepDate(view, anchor, -1))
  const stepFwd = () => onAnchorChange(stepDate(view, anchor, 1))
  const goToday = () => onAnchorChange(new Date())

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={goToday}>
          Today
        </Button>
        <Button variant="ghost" size="icon" aria-label="Previous" onClick={stepBack}>
          <ChevronLeft />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Next" onClick={stepFwd}>
          <ChevronRight />
        </Button>
        <span className="text-sm font-semibold">{label}</span>
      </div>

      <div className="flex items-center gap-2">
        <Tabs value={view} onValueChange={(v) => onViewChange(v as CalendarView)}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>
        </Tabs>
        {trailing}
      </div>
    </div>
  )
}

function stepDate(view: CalendarView, anchor: Date, dir: number): Date {
  if (view === 'day') return addDays(anchor, dir)
  if (view === 'week') return addWeeks(anchor, dir)
  return addWeeks(anchor, dir)
}

function labelFor(view: CalendarView, anchor: Date): string {
  if (view === 'day') return formatDate(anchor, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  if (view === 'week') {
    const start = startOfWeek(anchor)
    const end = endOfWeek(anchor)
    if (isSameDay(start, end)) return formatDate(start, { dateStyle: 'medium' })
    return `${formatDate(start, { month: 'short', day: 'numeric' })} – ${formatDate(end, { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  return formatDate(anchor, { month: 'long', year: 'numeric' })
}

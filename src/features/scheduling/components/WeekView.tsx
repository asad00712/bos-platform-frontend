import { useMemo } from 'react'

import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import { formatDate } from '@/shared/lib/format'

import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  HOUR_HEIGHT_PX,
  endOfWeek,
  getDayHours,
  getWeekDays,
  heightForRange,
  isSameDay,
  offsetTopForDate,
  setTimeOnDate,
  startOfWeek,
} from '../lib/calendar'
import type { Appointment } from '../api/scheduling.contracts'
import { AppointmentBlock } from './AppointmentBlock'

type Props = {
  anchor: Date
  appointments: Appointment[] | undefined
  isLoading?: boolean
  onSlotClick?: (start: Date) => void
}

export function WeekView({ anchor, appointments, isLoading, onSlotClick }: Props) {
  const days = useMemo(() => getWeekDays(anchor), [anchor])
  const hours = useMemo(() => getDayHours(), [])
  const today = new Date()
  const visibleHeight = (DAY_END_HOUR - DAY_START_HOUR + 1) * HOUR_HEIGHT_PX

  return (
    <div className="overflow-x-auto rounded-md border bg-card">
      <div className="grid min-w-[900px] grid-cols-[64px_repeat(7,minmax(0,1fr))]">
        {/* header row */}
        <div className="border-b bg-muted/40" />
        {days.map((d) => {
          const isToday = isSameDay(d, today)
          return (
            <div
              key={d.toISOString()}
              className={cn(
                'border-b border-l px-3 py-2 text-xs',
                isToday && 'bg-primary/5',
              )}
            >
              <div className="font-medium uppercase tracking-wider text-muted-foreground">
                {formatDate(d, { weekday: 'short' })}
              </div>
              <div className={cn('text-base font-semibold', isToday && 'text-primary')}>
                {formatDate(d, { day: 'numeric' })}
              </div>
            </div>
          )
        })}

        {/* hour gutter + day columns share the same grid; render gutter once with row-spanned content */}
        <div className="relative" style={{ height: visibleHeight }}>
          {hours.map((h) => (
            <div
              key={h}
              className="absolute -translate-y-1.5 pe-2 text-end text-[10px] uppercase tracking-wider text-muted-foreground"
              style={{ top: (h - DAY_START_HOUR) * HOUR_HEIGHT_PX }}
            >
              {labelHour(h)}
            </div>
          ))}
        </div>

        {days.map((d) => (
          <DayColumn
            key={d.toISOString()}
            day={d}
            hours={hours}
            visibleHeight={visibleHeight}
            appointments={(appointments ?? []).filter((a) =>
              isSameDay(new Date(a.startsAt), d),
            )}
            onSlotClick={onSlotClick}
          />
        ))}
      </div>

      {isLoading ? (
        <div className="border-t p-4">
          <Skeleton className="h-3 w-32" />
        </div>
      ) : null}
    </div>
  )
}

type DayColumnProps = {
  day: Date
  hours: number[]
  visibleHeight: number
  appointments: Appointment[]
  onSlotClick?: (start: Date) => void
}

function DayColumn({ day, hours, visibleHeight, appointments, onSlotClick }: DayColumnProps) {
  const today = new Date()
  const isToday = isSameDay(day, today)

  return (
    <div
      className={cn(
        'relative border-l',
        isToday && 'bg-primary/5',
      )}
      style={{ height: visibleHeight }}
    >
      {/* hour grid lines + clickable slots */}
      {hours.map((h) => (
        <div
          key={h}
          className="absolute inset-x-0 border-b border-border/60 transition hover:bg-accent/40"
          style={{
            top: (h - DAY_START_HOUR) * HOUR_HEIGHT_PX,
            height: HOUR_HEIGHT_PX,
          }}
          onClick={() =>
            onSlotClick?.(setTimeOnDate(day, h * 60))
          }
        />
      ))}

      {/* now-line */}
      {isToday ? <NowLine day={day} /> : null}

      {/* appointment blocks */}
      {appointments.map((a) => {
        const start = new Date(a.startsAt)
        const end = new Date(a.endsAt)
        return (
          <AppointmentBlock
            key={a.id}
            appointment={a}
            style={{
              top: offsetTopForDate(start),
              height: heightForRange(start, end) - 2,
            }}
          />
        )
      })}
    </div>
  )
}

function NowLine({ day }: { day: Date }) {
  const now = new Date()
  if (!isSameDay(now, day)) return null
  const top = offsetTopForDate(now)
  if (top < 0 || top > (DAY_END_HOUR - DAY_START_HOUR + 1) * HOUR_HEIGHT_PX) {
    return null
  }
  return (
    <div className="pointer-events-none absolute inset-x-0 z-10" style={{ top }}>
      <div className="relative">
        <span className="absolute -start-1 -top-1.5 size-2.5 rounded-full bg-primary" />
        <div className="h-px bg-primary" />
      </div>
    </div>
  )
}

function labelHour(h: number): string {
  if (h === 0) return '12 AM'
  if (h === 12) return '12 PM'
  if (h < 12) return `${h} AM`
  return `${h - 12} PM`
}

void startOfWeek
void endOfWeek

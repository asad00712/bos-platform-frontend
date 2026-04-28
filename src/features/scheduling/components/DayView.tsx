import { useMemo } from 'react'

import { cn } from '@/shared/lib/utils'
import { formatDate } from '@/shared/lib/format'

import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  HOUR_HEIGHT_PX,
  getDayHours,
  heightForRange,
  isSameDay,
  offsetTopForDate,
  setTimeOnDate,
} from '../lib/calendar'
import type { Appointment } from '../api/scheduling.contracts'
import { AppointmentBlock } from './AppointmentBlock'

type Props = {
  day: Date
  appointments: Appointment[] | undefined
  onSlotClick?: (start: Date) => void
}

export function DayView({ day, appointments, onSlotClick }: Props) {
  const hours = useMemo(() => getDayHours(), [])
  const today = new Date()
  const visibleHeight = (DAY_END_HOUR - DAY_START_HOUR + 1) * HOUR_HEIGHT_PX
  const isToday = isSameDay(day, today)

  const items = (appointments ?? []).filter((a) =>
    isSameDay(new Date(a.startsAt), day),
  )

  return (
    <div className="overflow-x-auto rounded-md border bg-card">
      <div className="grid grid-cols-[80px_minmax(0,1fr)]">
        <div className="border-b bg-muted/40 p-2 text-xs">
          <div className="font-medium uppercase tracking-wider text-muted-foreground">
            {formatDate(day, { weekday: 'short' })}
          </div>
          <div className={cn('text-base font-semibold', isToday && 'text-primary')}>
            {formatDate(day, { day: 'numeric', month: 'long' })}
          </div>
        </div>
        <div className="border-b bg-muted/40" />

        <div className="relative" style={{ height: visibleHeight }}>
          {hours.map((h) => (
            <div
              key={h}
              className="absolute -translate-y-1.5 pe-3 text-end text-[10px] uppercase tracking-wider text-muted-foreground"
              style={{ top: (h - DAY_START_HOUR) * HOUR_HEIGHT_PX, right: 0 }}
            >
              {labelHour(h)}
            </div>
          ))}
        </div>

        <div className="relative" style={{ height: visibleHeight }}>
          {hours.map((h) => (
            <div
              key={h}
              className="absolute inset-x-0 border-b border-border/60 transition hover:bg-accent/40"
              style={{
                top: (h - DAY_START_HOUR) * HOUR_HEIGHT_PX,
                height: HOUR_HEIGHT_PX,
              }}
              onClick={() => onSlotClick?.(setTimeOnDate(day, h * 60))}
            />
          ))}

          {items.map((a) => {
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

import { useMemo } from 'react'

import { cn } from '@/shared/lib/utils'

import type { Period, Timetable, TimetableEntry } from '../api/school.contracts'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type Props = {
  timetable: Timetable
  classId?: string
  sectionId?: string
  teacherId?: string
  /** Render a 6th column for Saturday. Defaults to false (Mon–Fri). */
  showSaturday?: boolean
  className?: string
}

/**
 * Period × Day matrix. Break/lunch periods get a single full-width band.
 * Cells render subject + teacher + room. Highlights the current weekday.
 */
export function TimetableGrid({
  timetable,
  classId,
  sectionId,
  teacherId,
  showSaturday = false,
  className,
}: Props) {
  const days = showSaturday ? DAY_LABELS : DAY_LABELS.slice(0, 5)
  const today = new Date().getDay() // Sun=0, Mon=1
  const todayIndex = today === 0 ? -1 : today - 1

  const filtered = useMemo(() => {
    return timetable.entries.filter((e) => {
      if (classId && e.classId !== classId) return false
      if (sectionId && e.sectionId !== sectionId) return false
      if (teacherId && e.teacherId !== teacherId) return false
      return true
    })
  }, [timetable.entries, classId, sectionId, teacherId])

  const lookup = useMemo(() => {
    const m = new Map<string, TimetableEntry>()
    for (const e of filtered) m.set(`${e.day}-${e.period}`, e)
    return m
  }, [filtered])

  const periods = [...timetable.periods].sort((a, b) => a.number - b.number)

  return (
    <div className={cn('overflow-x-auto rounded-lg border bg-card', className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted/40">
            <th className="sticky start-0 z-10 border-e border-b bg-muted/40 p-3 text-start text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Time
            </th>
            {days.map((d, i) => (
              <th
                key={d}
                className={cn(
                  'border-b p-3 text-center text-xs font-medium uppercase tracking-wider',
                  i === todayIndex
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground',
                )}
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((p) => (
            <PeriodRow
              key={p.number}
              period={p}
              days={days}
              lookup={lookup}
              todayIndex={todayIndex}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PeriodRow({
  period,
  days,
  lookup,
  todayIndex,
}: {
  period: Period
  days: string[]
  lookup: Map<string, TimetableEntry>
  todayIndex: number
}) {
  if (period.isBreak) {
    return (
      <tr className="bg-amber-500/5">
        <td className="sticky start-0 z-10 border-e border-b bg-amber-500/5 p-2 text-xs text-muted-foreground">
          <div className="font-medium">{period.startTime}</div>
          <div>{period.endTime}</div>
        </td>
        <td
          colSpan={days.length}
          className="border-b p-3 text-center text-xs font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300"
        >
          {period.breakLabel ?? 'Break'}
        </td>
      </tr>
    )
  }
  return (
    <tr>
      <td className="sticky start-0 z-10 border-e border-b bg-card p-2 text-xs text-muted-foreground">
        <div className="font-medium tabular-nums">{period.startTime}</div>
        <div className="tabular-nums">{period.endTime}</div>
      </td>
      {days.map((_, i) => {
        const entry = lookup.get(`${i}-${period.number}`)
        return (
          <td
            key={i}
            className={cn(
              'border-b p-2 align-top',
              i === todayIndex && 'bg-primary/5',
            )}
          >
            {entry ? (
              <div className="space-y-0.5">
                <div className="text-sm font-medium leading-tight">
                  {entry.subjectName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {entry.teacherName}
                </div>
                {entry.roomName ? (
                  <div className="text-[11px] text-muted-foreground/80">
                    Room {entry.roomName}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="text-center text-xs text-muted-foreground/30">
                —
              </div>
            )}
          </td>
        )
      })}
    </tr>
  )
}

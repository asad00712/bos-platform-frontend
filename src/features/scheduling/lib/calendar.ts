/**
 * Calendar date utilities. Pure helpers; no React, no dependencies.
 * Week starts on Monday by default — adjust via WEEK_STARTS_ON.
 */

export const WEEK_STARTS_ON = 1 // 0 = Sun, 1 = Mon

export const DAY_START_HOUR = 8
export const DAY_END_HOUR = 20
export const SLOT_MINUTES = 30
export const HOUR_HEIGHT_PX = 56

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function startOfWeek(date: Date): Date {
  const d = startOfDay(date)
  const day = d.getDay()
  const diff = (day - WEEK_STARTS_ON + 7) % 7
  d.setDate(d.getDate() - diff)
  return d
}

export function endOfWeek(date: Date): Date {
  const d = startOfWeek(date)
  d.setDate(d.getDate() + 6)
  return endOfDay(d)
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7)
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function getWeekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

/** Inclusive whole hours in a single day (e.g. 8..20). */
export function getDayHours(): number[] {
  const out: number[] = []
  for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) out.push(h)
  return out
}

/** Y offset (px) of a date inside a day column relative to DAY_START_HOUR. */
export function offsetTopForDate(date: Date): number {
  const minutes = (date.getHours() - DAY_START_HOUR) * 60 + date.getMinutes()
  return (minutes / 60) * HOUR_HEIGHT_PX
}

/** Height (px) for an [start,end] block on a day grid. */
export function heightForRange(start: Date, end: Date): number {
  const minutes = (end.getTime() - start.getTime()) / 60_000
  return Math.max(20, (minutes / 60) * HOUR_HEIGHT_PX)
}

/** Snap a Date to the nearest SLOT_MINUTES grid boundary (rounded down). */
export function snapToSlot(date: Date): Date {
  const d = new Date(date)
  const m = d.getMinutes()
  d.setMinutes(m - (m % SLOT_MINUTES), 0, 0)
  return d
}

/** Compose a Date from a base day + a time-of-day in minutes from midnight. */
export function setTimeOnDate(base: Date, minutesFromMidnight: number): Date {
  const d = new Date(base)
  d.setHours(0, minutesFromMidnight, 0, 0)
  return d
}

export function toIso(date: Date): string {
  return date.toISOString()
}

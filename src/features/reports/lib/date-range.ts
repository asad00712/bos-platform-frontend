import type { DateRange, DateRangeKey } from '../api/reports.contracts'

function startOfDay(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  return out
}
function endOfDay(d: Date): Date {
  const out = new Date(d)
  out.setHours(23, 59, 59, 999)
  return out
}

/** Resolve a preset key to a concrete date range. */
export function presetRange(key: DateRangeKey): DateRange {
  const today = new Date()
  const start = startOfDay(today)
  const end = endOfDay(today)

  if (key === 'today') return { from: start.toISOString(), to: end.toISOString(), preset: key }

  if (key === 'week') {
    const d = startOfDay(today)
    d.setDate(d.getDate() - 6)
    return { from: d.toISOString(), to: end.toISOString(), preset: key }
  }
  if (key === 'month') {
    const d = startOfDay(today)
    d.setDate(d.getDate() - 29)
    return { from: d.toISOString(), to: end.toISOString(), preset: key }
  }
  if (key === 'quarter') {
    const d = startOfDay(today)
    d.setDate(d.getDate() - 89)
    return { from: d.toISOString(), to: end.toISOString(), preset: key }
  }
  if (key === 'year') {
    const d = startOfDay(today)
    d.setDate(d.getDate() - 364)
    return { from: d.toISOString(), to: end.toISOString(), preset: key }
  }
  // custom defaults to last 30 days when not yet picked
  const d = startOfDay(today)
  d.setDate(d.getDate() - 29)
  return { from: d.toISOString(), to: end.toISOString(), preset: 'custom' }
}

export const PRESETS: { key: DateRangeKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Last 7 days' },
  { key: 'month', label: 'Last 30 days' },
  { key: 'quarter', label: 'Last 90 days' },
  { key: 'year', label: 'Last 12 months' },
]

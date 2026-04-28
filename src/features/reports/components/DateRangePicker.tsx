import { CalendarDays } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import {
  PRESETS,
  presetRange,
} from '../lib/date-range'
import type { DateRange, DateRangeKey } from '../api/reports.contracts'

type Props = {
  value: DateRange
  onChange: (next: DateRange) => void
}

/** Preset-only picker for v1 — full custom-range calendar follow-up. */
export function DateRangePicker({ value, onChange }: Props) {
  const preset: DateRangeKey = value.preset ?? 'month'
  return (
    <div className="flex items-center gap-2">
      <CalendarDays className="size-4 text-muted-foreground" />
      <Select
        value={preset}
        onValueChange={(v) => onChange(presetRange(v as DateRangeKey))}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p.key} value={p.key}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

import { Check, Clock3, HeartPulse, ShieldCheck, X } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { useTenant } from '@/shared/hooks/useTenant'
import { cn } from '@/shared/lib/utils'

import type {
  AttendanceRosterResponse,
  AttendanceState,
} from '../api/school.contracts'
import { useMarkAttendance } from '../hooks'
import { ATTENDANCE_STATE_LABEL } from './Badges'

const STATES: { value: AttendanceState; icon: typeof Check }[] = [
  { value: 'present', icon: Check },
  { value: 'absent', icon: X },
  { value: 'late', icon: Clock3 },
  { value: 'excused', icon: ShieldCheck },
  { value: 'sick', icon: HeartPulse },
]

const STATE_BUTTON_TONE: Record<AttendanceState, string> = {
  present:
    'data-[active=true]:bg-emerald-500 data-[active=true]:text-white data-[active=true]:border-emerald-500',
  absent:
    'data-[active=true]:bg-rose-500 data-[active=true]:text-white data-[active=true]:border-rose-500',
  late: 'data-[active=true]:bg-amber-500 data-[active=true]:text-white data-[active=true]:border-amber-500',
  excused:
    'data-[active=true]:bg-sky-500 data-[active=true]:text-white data-[active=true]:border-sky-500',
  sick: 'data-[active=true]:bg-violet-500 data-[active=true]:text-white data-[active=true]:border-violet-500',
}

type Props = {
  roster: AttendanceRosterResponse
  sectionId: string
}

export function AttendanceMarker({ roster, sectionId }: Props) {
  const { tenant } = useTenant()
  const mark = useMarkAttendance(tenant.id, sectionId)

  const totals = roster.records.reduce<Record<AttendanceState, number>>(
    (acc, r) => {
      acc[r.state] = (acc[r.state] ?? 0) + 1
      return acc
    },
    { present: 0, absent: 0, late: 0, excused: 0, sick: 0 },
  )

  const markAll = (state: AttendanceState) => {
    for (const r of roster.records) {
      if (r.state !== state) {
        mark.mutate({ studentId: r.studentId, state, notes: null })
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="gap-1.5">
          <Check className="size-3.5 text-emerald-500" />
          Present {totals.present}
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <X className="size-3.5 text-rose-500" />
          Absent {totals.absent}
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <Clock3 className="size-3.5 text-amber-500" />
          Late {totals.late}
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <ShieldCheck className="size-3.5 text-sky-500" />
          Excused {totals.excused}
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <HeartPulse className="size-3.5 text-violet-500" />
          Sick {totals.sick}
        </Badge>

        <div className="ms-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll('present')}
            disabled={mark.isPending}
          >
            <Check className="me-1 size-3.5" /> Mark all present
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-14 p-3 text-center">Roll</th>
              <th className="p-3 text-start">Student</th>
              <th className="p-3 text-start">Mark</th>
            </tr>
          </thead>
          <tbody>
            {roster.records.map((r) => (
              <tr key={r.id} className="border-t hover:bg-muted/30">
                <td className="p-3 text-center text-xs font-medium tabular-nums text-muted-foreground">
                  {r.rollNumber}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-[10px]">
                        {initials(r.studentName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{r.studentName}</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {STATES.map(({ value, icon: Icon }) => {
                      const active = r.state === value
                      return (
                        <button
                          key={value}
                          type="button"
                          data-active={active}
                          aria-pressed={active}
                          aria-label={ATTENDANCE_STATE_LABEL[value]}
                          onClick={() =>
                            mark.mutate({
                              studentId: r.studentId,
                              state: value,
                              notes: null,
                            })
                          }
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                            'hover:bg-accent',
                            STATE_BUTTON_TONE[value],
                          )}
                        >
                          <Icon className="size-3.5" />
                          <span>{ATTENDANCE_STATE_LABEL[value]}</span>
                        </button>
                      )
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

import { Link } from 'react-router'

import { Panel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'

import type { Widget } from '@/features/dashboard/widgets/types'
import { useAttendanceSummary } from '../hooks'

function AttendanceTodayComponent() {
  const { tenant } = useTenant()
  const q = useAttendanceSummary(tenant.id)

  return (
    <Panel
      title="Attendance today"
      description="Section-wise present rate"
      actions={
        <Link
          to="/app/school/attendance"
          className="text-xs font-medium text-primary hover:underline"
        >
          Take attendance →
        </Link>
      }
    >
      {q.isLoading || !q.data ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded" />
          ))}
        </div>
      ) : q.data.byClass.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No attendance recorded yet today.
        </p>
      ) : (
        <ul className="space-y-2">
          {q.data.byClass.slice(0, 8).map((c) => (
            <li
              key={c.classId}
              className="flex items-center gap-3 rounded-md border p-2"
            >
              <span className="text-sm font-medium">
                {c.className} · {c.sectionName}
              </span>
              <div className="ms-auto flex items-center gap-2">
                <span className="tabular-nums text-xs text-muted-foreground">
                  {c.present} / {c.present + c.absent}
                </span>
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                  <div
                    className={
                      c.attendanceRate >= 0.9
                        ? 'h-full bg-emerald-500'
                        : c.attendanceRate >= 0.75
                          ? 'h-full bg-amber-500'
                          : 'h-full bg-rose-500'
                    }
                    style={{
                      width: `${Math.max(0, Math.min(1, c.attendanceRate)) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-10 text-end text-xs font-semibold tabular-nums">
                  {(c.attendanceRate * 100).toFixed(0)}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export const AttendanceTodayWidget: Widget = {
  id: 'school.dashboard.attendance-today',
  Component: AttendanceTodayComponent,
  permission: 'dashboard:view',
  span: { col: 6 },
}

import { Link } from 'react-router'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

import { formatDate, formatPercent } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import { useAttendanceSummary } from '../hooks'

export function AttendanceOverviewPage() {
  const { tenant } = useTenant()
  const q = useAttendanceSummary(tenant.id)

  return (
    <PageContainer>
      <PageHeader
        title="Attendance overview"
        description={
          q.data
            ? formatDate(q.data.date, { dateStyle: 'full' })
            : 'Loading…'
        }
        actions={
          <Button asChild>
            <Link to="/app/school/attendance">Take attendance</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryStat
          label="Total"
          value={q.data?.totalStudents ?? 0}
          loading={q.isLoading}
        />
        <SummaryStat
          label="Present"
          value={q.data?.present ?? 0}
          loading={q.isLoading}
          tone="text-emerald-600 dark:text-emerald-400"
        />
        <SummaryStat
          label="Absent"
          value={q.data?.absent ?? 0}
          loading={q.isLoading}
          tone="text-rose-600 dark:text-rose-400"
        />
        <SummaryStat
          label="Late"
          value={q.data?.late ?? 0}
          loading={q.isLoading}
          tone="text-amber-600 dark:text-amber-400"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {q.isLoading || !q.data ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : q.data.byClass.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              No attendance recorded today yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3 text-start">Class · Section</th>
                  <th className="p-3 text-end">Present</th>
                  <th className="p-3 text-end">Absent</th>
                  <th className="p-3 text-end">Rate</th>
                  <th className="p-3 text-start">Bar</th>
                </tr>
              </thead>
              <tbody>
                {q.data.byClass.map((c) => (
                  <tr key={c.classId} className="border-t">
                    <td className="p-3 font-medium">
                      {c.className} · {c.sectionName}
                    </td>
                    <td className="p-3 text-end tabular-nums">{c.present}</td>
                    <td className="p-3 text-end tabular-nums">{c.absent}</td>
                    <td className="p-3 text-end font-medium tabular-nums">
                      {formatPercent(c.attendanceRate, 0)}
                    </td>
                    <td className="p-3">
                      <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

function SummaryStat({
  label,
  value,
  tone,
  loading,
}: {
  label: string
  value: number
  tone?: string
  loading?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-16" />
        ) : (
          <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone ?? ''}`}>
            {value}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

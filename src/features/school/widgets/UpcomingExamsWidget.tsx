import { Link } from 'react-router'
import { CalendarClock } from 'lucide-react'

import { Panel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatRelative } from '@/shared/lib/format'

import type { Widget } from '@/features/dashboard/widgets/types'
import { useExamsList } from '../hooks'
import { ExamStatusBadge } from '../components/Badges'

function UpcomingExamsComponent() {
  const { tenant } = useTenant()
  const q = useExamsList(tenant.id)

  const items = (q.data?.items ?? [])
    .filter((e) => e.status !== 'cancelled')
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 6)

  return (
    <Panel
      title="Upcoming exams"
      description="Across all sections"
      actions={
        <Link
          to="/app/school/exams"
          className="text-xs font-medium text-primary hover:underline"
        >
          All exams →
        </Link>
      }
    >
      {q.isLoading || !q.data ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
          <CalendarClock className="size-7 opacity-50" />
          <p>No exams scheduled.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-3 rounded-md border p-2.5"
            >
              <div className="min-w-0">
                <Link
                  to={`/app/school/exams/${e.id}`}
                  className="block truncate text-sm font-medium hover:underline"
                >
                  {e.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {e.termName} · {e.paperCount} papers · {formatRelative(e.startDate)}
                </p>
              </div>
              <ExamStatusBadge status={e.status} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export const UpcomingExamsWidget: Widget = {
  id: 'school.dashboard.upcoming-exams',
  Component: UpcomingExamsComponent,
  permission: 'dashboard:view',
  span: { col: 6 },
}

import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { ChevronRight, Microscope } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatRelative } from '@/shared/lib/format'

import { useLabInbox } from '../../hooks'
import { AbnormalFlag } from '../../components/AbnormalFlag'

export function LabsPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const q = useLabInbox(tenant.id)

  const my = useMemo(() => {
    return (q.data?.items ?? [])
      .filter((i) => i.patientId === id)
      .sort((a, b) => b.effectiveDateTime.localeCompare(a.effectiveDateTime))
  }, [q.data, id])

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Labs</h2>
          <p className="text-sm text-muted-foreground">
            Reports for this patient. Open any panel for full results + trend.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/app/medical/labs/inbox">Inbox</Link>
        </Button>
      </header>

      {q.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : my.length === 0 ? (
        <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Microscope className="size-4" /> No lab reports on file.
        </p>
      ) : (
        <ul className="space-y-2">
          {my.map((r) => (
            <li key={r.reportId} className="flex flex-wrap items-center gap-3 rounded-md border p-3 text-sm">
              <Microscope className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <Link
                  to={`/app/medical/labs/${r.reportId}`}
                  className="break-words font-medium hover:underline"
                >
                  {r.panelDisplay}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {formatRelative(r.effectiveDateTime)} ·{' '}
                  {r.signedAt ? (
                    <>signed {formatRelative(r.signedAt)}</>
                  ) : (
                    'awaiting sign'
                  )}
                </p>
              </div>
              <AbnormalFlag flag={r.worstFlag} />
              {r.hasCritical ? (
                <Badge variant="destructive" className="text-[10px] uppercase">
                  Critical
                </Badge>
              ) : null}
              <Button asChild size="sm" variant="ghost">
                <Link to={`/app/medical/labs/${r.reportId}`}>
                  Open <ChevronRight className="ms-1 size-3" />
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

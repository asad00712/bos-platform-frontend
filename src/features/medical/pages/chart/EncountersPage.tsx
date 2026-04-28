import { Link, useParams } from 'react-router'
import { ChevronRight, Stethoscope } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatDateTime, formatRelative } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import { useEncounters } from '../../hooks'
import { BidiCode } from '@/shared/lib/bidi'

const STATUS_TONE: Record<string, string> = {
  planned: 'border-sky-500/40 bg-sky-500/5 text-sky-700 dark:text-sky-300',
  arrived: 'border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300',
  in_progress: 'border-primary/40 bg-primary/10 text-primary',
  finished: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300',
  cancelled: 'border-rose-500/40 bg-rose-500/5 text-rose-700 dark:text-rose-300',
}

export function EncountersPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const q = useEncounters(tenant.id, id)

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Encounters</h2>
        <p className="text-sm text-muted-foreground">
          Visits across all classes — office, telehealth, ED, inpatient, home health.
        </p>
      </header>

      {q.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (q.data?.items ?? []).length === 0 ? (
        <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Stethoscope className="size-4" /> No encounters on file.
        </p>
      ) : (
        <ul className="space-y-2">
          {(q.data?.items ?? []).map((e) => (
            <li key={e.id} className="rounded-md border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{e.visitType}</p>
                <Badge variant="outline" className="uppercase">
                  {e.class}
                </Badge>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase ${
                    STATUS_TONE[e.status] ?? ''
                  }`}
                >
                  {e.status.replace('_', ' ')}
                </span>
                <span className="ms-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                  {formatDateTime(e.startAt)} · {formatRelative(e.startAt)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {e.providerName} · {e.locationName}
                {e.primaryDxCode ? (
                  <>
                    <span className="mx-1">·</span>
                    <BidiCode>{e.primaryDxCode}</BidiCode>{' '}
                    {e.primaryDxDisplay}
                  </>
                ) : null}
              </p>
              <div className="mt-2 flex justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link to={`/app/medical/encounters/${e.id}`}>
                    Open <ChevronRight className="ms-1 size-3" />
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

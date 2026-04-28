import { useMemo } from 'react'
import { Microscope } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatDateTime, formatRelative } from '@/shared/lib/format'

import { useLabInbox } from '../hooks'
import { PORTAL_PATIENT_ID } from './portalConstants'

export function PortalResultsPage() {
  const { tenant } = useTenant()
  const q = useLabInbox(tenant.id)

  const my = useMemo(
    () =>
      (q.data?.items ?? [])
        .filter((i) => i.patientId === PORTAL_PATIENT_ID)
        .sort((a, b) => b.effectiveDateTime.localeCompare(a.effectiveDateTime)),
    [q.data],
  )

  const released = my.filter((i) => i.signedAt)
  const pending = my.filter((i) => !i.signedAt)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Test results</h1>
        <p className="text-sm text-muted-foreground">
          Results appear here once your provider has reviewed and released them.
        </p>
      </header>

      {q.isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : null}

      {released.length > 0 ? (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Released ({released.length})
          </h2>
          <ul className="space-y-2">
            {released.map((r) => (
              <li key={r.reportId}>
                <Card>
                  <CardContent className="flex flex-wrap items-center gap-3 p-4 text-sm">
                    <Microscope className="size-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium">{r.panelDisplay}</p>
                      <p className="text-xs text-muted-foreground">
                        Tested {formatDateTime(r.effectiveDateTime)} · released{' '}
                        {r.signedAt ? formatRelative(r.signedAt) : ''}
                      </p>
                    </div>
                    <Badge
                      variant={r.hasCritical ? 'destructive' : r.worstFlag === 'N' ? 'default' : 'secondary'}
                    >
                      {r.hasCritical ? 'Discuss with provider' : r.worstFlag === 'N' ? 'Within range' : 'Some out of range'}
                    </Badge>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {pending.length > 0 ? (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Awaiting provider review ({pending.length})
          </h2>
          <ul className="space-y-2 text-sm">
            {pending.map((r) => (
              <li key={r.reportId} className="rounded-md border bg-muted/30 p-3">
                <p className="font-medium">{r.panelDisplay}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(r.effectiveDateTime)} — your provider will release this once reviewed.
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {my.length === 0 && !q.isLoading ? (
        <p className="text-sm text-muted-foreground">No results on file yet.</p>
      ) : null}

      <Card className="border-dashed bg-muted/30">
        <CardContent className="p-4 text-xs text-muted-foreground">
          Reference ranges depend on your age, sex, and lab. A "discuss with provider" tag means
          one or more values warrant a follow-up — your provider may already have messaged you about it.
        </CardContent>
      </Card>
    </div>
  )
}

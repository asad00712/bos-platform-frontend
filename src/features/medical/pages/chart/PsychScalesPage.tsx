import { useMemo } from 'react'
import { useParams } from 'react-router'
import { ClipboardList } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatDate, formatRelative } from '@/shared/lib/format'
import { BidiNum } from '@/shared/lib/bidi'

import { usePsychScales } from '../../hooks'
import type { PsychScale } from '../../api/medical.contracts'

const SEVERITY_TONE: Record<PsychScale['severity'], string> = {
  none: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300',
  mild: 'border-sky-500/40 bg-sky-500/5 text-sky-700 dark:text-sky-300',
  moderate: 'border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  moderately_severe: 'border-orange-500/50 bg-orange-500/10 text-orange-800 dark:text-orange-300',
  severe: 'border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300',
}

const SEVERITY_LABEL: Record<PsychScale['severity'], string> = {
  none: 'None',
  mild: 'Mild',
  moderate: 'Moderate',
  moderately_severe: 'Moderately severe',
  severe: 'Severe',
}

export function PsychScalesPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const q = usePsychScales(tenant.id, id)
  const items = q.data?.items ?? []

  // Group by instrument LOINC
  const grouped = useMemo(() => {
    const map = new Map<string, { display: string; entries: PsychScale[] }>()
    for (const s of items) {
      const cur = map.get(s.loinc.code) ?? { display: s.loinc.display, entries: [] }
      cur.entries.push(s)
      map.set(s.loinc.code, cur)
    }
    for (const v of map.values()) {
      v.entries.sort((a, b) => a.administeredAt.localeCompare(b.administeredAt))
    }
    return Array.from(map.entries())
  }, [items])

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold">Psychiatric scales</h2>
        <p className="text-sm text-muted-foreground">
          Validated screening instruments — PHQ-9, GAD-7, C-SSRS, EPDS, AUDIT-C.
          Severity tier maps to standard score ranges.
        </p>
      </header>

      {q.isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : items.length === 0 ? (
        <div className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          <ClipboardList className="mx-auto mb-2 size-6 opacity-50" />
          No screening scales administered yet.
        </div>
      ) : (
        grouped.map(([loinc, group]) => {
          const latest = group.entries[group.entries.length - 1]!
          return (
            <section key={loinc} className="space-y-3 rounded-lg border p-4">
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold">{group.display}</h3>
                  <p className="text-xs text-muted-foreground">
                    LOINC {loinc} · {group.entries.length}{' '}
                    {group.entries.length === 1 ? 'administration' : 'administrations'}
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tabular-nums">
                    <BidiNum>{latest.totalScore}</BidiNum>
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                      SEVERITY_TONE[latest.severity]
                    }`}
                  >
                    {SEVERITY_LABEL[latest.severity]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelative(latest.administeredAt)}
                  </span>
                </div>
              </header>

              {/* trend bars */}
              <div className="space-y-1">
                {group.entries.map((s) => {
                  const max = group.entries.reduce((m, e) => Math.max(m, e.totalScore), 0)
                  const pct = max === 0 ? 0 : (s.totalScore / max) * 100
                  return (
                    <div key={s.id} className="flex items-center gap-2 text-xs">
                      <span className="w-24 shrink-0 text-muted-foreground">
                        {formatDate(s.administeredAt, { dateStyle: 'medium' })}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={
                            s.severity === 'severe' || s.severity === 'moderately_severe'
                              ? 'h-full bg-rose-500'
                              : s.severity === 'moderate'
                                ? 'h-full bg-amber-500'
                                : 'h-full bg-primary'
                          }
                          style={{ width: `${Math.max(2, pct)}%` }}
                        />
                      </div>
                      <span className="w-8 text-end tabular-nums">
                        <BidiNum>{s.totalScore}</BidiNum>
                      </span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {s.severity.replace('_', ' ')}
                      </Badge>
                    </div>
                  )
                })}
              </div>

              {latest.notes ? (
                <p className="text-xs text-muted-foreground">{latest.notes}</p>
              ) : null}
            </section>
          )
        })
      )}
    </div>
  )
}

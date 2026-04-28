import { useParams } from 'react-router'
import { CheckCircle2, Syringe } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatDate, formatRelative } from '@/shared/lib/format'
import { BidiCode } from '@/shared/lib/bidi'

import { useImmunizations } from '../../hooks'

export function ImmunizationsPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const q = useImmunizations(tenant.id, id)

  const given = q.data?.given ?? []
  const due = q.data?.due ?? []
  const overdue = due.filter((d) => d.status === 'overdue')
  const dueNow = due.filter((d) => d.status === 'due')
  const upcoming = due.filter((d) => d.status === 'upcoming')

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold">Immunizations</h2>
        <p className="text-sm text-muted-foreground">
          ACIP-aligned schedule. Overdue doses surface at the top.
        </p>
      </header>

      {q.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <>
          {(overdue.length > 0 || dueNow.length > 0) && (
            <Section title={`Due now (${overdue.length + dueNow.length})`} highlight>
              <ul className="space-y-2">
                {[...overdue, ...dueNow].map((d) => (
                  <li
                    key={`${d.vaccineCode}-${d.doseLabel}`}
                    className={`flex flex-wrap items-center gap-2 rounded-md border p-2.5 text-sm ${
                      d.status === 'overdue' ? 'border-rose-500/50 bg-rose-500/5' : 'border-amber-500/40 bg-amber-500/5'
                    }`}
                  >
                    <Syringe className="size-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium">{d.vaccineDisplay}</span>
                    <span className="text-xs text-muted-foreground">{d.doseLabel}</span>
                    <Badge
                      variant={d.status === 'overdue' ? 'destructive' : 'secondary'}
                      className="capitalize"
                    >
                      {d.status}
                    </Badge>
                    <span className="ms-auto text-xs text-muted-foreground">
                      Due {formatRelative(d.dueDate)}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {upcoming.length > 0 ? (
            <Section title={`Upcoming (${upcoming.length})`}>
              <ul className="space-y-1.5 text-sm">
                {upcoming.slice(0, 8).map((d) => (
                  <li
                    key={`${d.vaccineCode}-${d.doseLabel}`}
                    className="flex items-center gap-2"
                  >
                    <span className="size-2 rounded-full bg-muted-foreground/40" />
                    <span>{d.vaccineDisplay}</span>
                    <span className="text-xs text-muted-foreground">{d.doseLabel}</span>
                    <span className="ms-auto text-xs text-muted-foreground">
                      {formatRelative(d.dueDate)}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Section title={`Administered (${given.length})`} muted={given.length === 0}>
            {given.length === 0 ? (
              <p className="text-sm text-muted-foreground">No immunizations on record.</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3 text-start">Vaccine</th>
                      <th className="p-3 text-start">Dose</th>
                      <th className="p-3 text-start">Date</th>
                      <th className="p-3 text-start">Site / Route</th>
                      <th className="p-3 text-start">Lot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...given]
                      .sort((a, b) => b.occurrenceDate.localeCompare(a.occurrenceDate))
                      .map((g) => (
                        <tr key={g.id} className="border-t">
                          <td className="p-3">
                            <div className="flex items-baseline gap-1.5">
                              <BidiCode className="text-xs text-muted-foreground">{g.vaccine.code}</BidiCode>
                              <span className="font-medium">{g.vaccine.display}</span>
                            </div>
                          </td>
                          <td className="p-3 text-xs">{g.doseLabel}</td>
                          <td className="p-3 text-xs text-muted-foreground">
                            {formatDate(g.occurrenceDate, { dateStyle: 'medium' })}
                          </td>
                          <td className="p-3 text-xs text-muted-foreground">
                            {(g.site ?? '').replace('_', ' ')} · {g.route}
                          </td>
                          <td className="p-3 font-mono text-xs text-muted-foreground">
                            {g.lotNumber ?? '—'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {given.length > 0 && due.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" /> Up to date with the recommended schedule.
            </p>
          ) : null}
        </>
      )}
    </div>
  )
}

function Section({
  title,
  highlight,
  muted,
  children,
}: {
  title: string
  highlight?: boolean
  muted?: boolean
  children: React.ReactNode
}) {
  return (
    <section className={muted ? 'opacity-90' : undefined}>
      <h3
        className={`mb-2 text-xs font-semibold uppercase tracking-wider ${
          highlight ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'
        }`}
      >
        {title}
      </h3>
      {children}
    </section>
  )
}

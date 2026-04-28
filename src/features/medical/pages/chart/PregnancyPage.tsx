import { useParams } from 'react-router'
import { Baby } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatDate } from '@/shared/lib/format'
import { BidiNum } from '@/shared/lib/bidi'

import { usePregnancy } from '../../hooks'

export function PregnancyPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const q = usePregnancy(tenant.id, id)

  if (q.isLoading) {
    return <Skeleton className="h-48 w-full" />
  }
  if (!q.data) {
    return (
      <div className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        <Baby className="mx-auto mb-2 size-6 opacity-50" />
        No active pregnancy on file.
      </div>
    )
  }

  const { pregnancy, visits, ultrasounds } = q.data
  const trimester = pregnancy.gaWeeks < 14 ? 'T1' : pregnancy.gaWeeks < 28 ? 'T2' : 'T3'

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Prenatal flowsheet</h2>
          <p className="text-sm text-muted-foreground">
            Vitals + fundal height + FHR over the course of pregnancy.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge className="gap-1.5">
            <Baby className="size-3" />
            <BidiNum>{pregnancy.gaWeeks}</BidiNum>w <BidiNum>{pregnancy.gaDays}</BidiNum>d
          </Badge>
          <Badge variant="outline">{trimester}</Badge>
          <Badge variant="outline">
            G<BidiNum>{pregnancy.gravida}</BidiNum>P<BidiNum>{pregnancy.para}</BidiNum>
          </Badge>
          <Badge variant="outline">
            T<BidiNum>{pregnancy.tpalT}</BidiNum>
            P<BidiNum>{pregnancy.tpalP}</BidiNum>
            A<BidiNum>{pregnancy.tpalA}</BidiNum>
            L<BidiNum>{pregnancy.tpalL}</BidiNum>
          </Badge>
          {pregnancy.bloodType ? (
            <Badge variant="outline">
              {pregnancy.bloodType}
              {pregnancy.rhFactor === 'unknown' ? '?' : pregnancy.rhFactor}
            </Badge>
          ) : null}
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 rounded-md border p-4 text-sm md:grid-cols-4">
        <KV k="LMP" v={formatDate(pregnancy.lmpDate, { dateStyle: 'medium' })} />
        <KV k="EDD" v={formatDate(pregnancy.eddDate, { dateStyle: 'medium' })} />
        <KV k="Status" v={pregnancy.status} />
        <KV k="Notes" v={pregnancy.notes ?? '—'} />
      </dl>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Visits ({visits.length})
        </h3>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-start">Date</th>
                <th className="p-3 text-end">GA</th>
                <th className="p-3 text-end">BP</th>
                <th className="p-3 text-end">Wt (kg)</th>
                <th className="p-3 text-end">Fundal (cm)</th>
                <th className="p-3 text-end">FHR (bpm)</th>
                <th className="p-3 text-start">Movement</th>
                <th className="p-3 text-start">Urine</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="p-3 text-xs text-muted-foreground">
                    {formatDate(v.visitDate, { dateStyle: 'medium' })}
                  </td>
                  <td className="p-3 text-end">
                    <BidiNum>{v.gaWeeks}</BidiNum>w <BidiNum>{v.gaDays}</BidiNum>d
                  </td>
                  <td className="p-3 text-end tabular-nums">
                    {v.systolic && v.diastolic ? (
                      <BidiNum>{`${v.systolic}/${v.diastolic}`}</BidiNum>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-3 text-end tabular-nums">
                    {v.weightKg != null ? <BidiNum>{v.weightKg.toFixed(1)}</BidiNum> : '—'}
                  </td>
                  <td className="p-3 text-end tabular-nums">
                    {v.fundalHeightCm != null ? <BidiNum>{v.fundalHeightCm}</BidiNum> : '—'}
                  </td>
                  <td className="p-3 text-end tabular-nums">
                    {v.fhrBpm != null ? <BidiNum>{v.fhrBpm}</BidiNum> : '—'}
                  </td>
                  <td className="p-3 text-xs capitalize text-muted-foreground">
                    {v.fetalMovement.replace('_', ' ')}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {v.urineProtein ? `Pro ${v.urineProtein}` : ''}
                    {v.urineGlucose ? ` · Glu ${v.urineGlucose}` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {ultrasounds.length > 0 ? (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ultrasounds ({ultrasounds.length})
          </h3>
          <ul className="space-y-2">
            {ultrasounds.map((u) => (
              <li key={u.id} className="rounded-md border p-3 text-sm">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-medium">
                    {formatDate(u.studyDate, { dateStyle: 'medium' })}
                  </span>
                  <Badge variant="outline">
                    GA <BidiNum>{u.gaWeeksAtScan}</BidiNum>w <BidiNum>{u.gaDaysAtScan}</BidiNum>d
                  </Badge>
                </div>
                <p className="mt-1 grid grid-cols-2 gap-2 text-xs text-muted-foreground md:grid-cols-5">
                  {u.bpdMm != null && (
                    <span>
                      BPD <BidiNum>{u.bpdMm}</BidiNum> mm
                    </span>
                  )}
                  {u.hcMm != null && (
                    <span>
                      HC <BidiNum>{u.hcMm}</BidiNum> mm
                    </span>
                  )}
                  {u.acMm != null && (
                    <span>
                      AC <BidiNum>{u.acMm}</BidiNum> mm
                    </span>
                  )}
                  {u.flMm != null && (
                    <span>
                      FL <BidiNum>{u.flMm}</BidiNum> mm
                    </span>
                  )}
                  {u.efwG != null && (
                    <span>
                      EFW <BidiNum>{u.efwG}</BidiNum> g
                    </span>
                  )}
                  {u.afi != null && (
                    <span>
                      AFI <BidiNum>{u.afi}</BidiNum>
                    </span>
                  )}
                </p>
                {u.notes ? (
                  <p className="mt-1 text-xs text-muted-foreground">{u.notes}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="font-medium capitalize tabular-nums">{v}</dd>
    </div>
  )
}

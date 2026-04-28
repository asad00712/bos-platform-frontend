import { useParams } from 'react-router'

import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'

import { useHistory } from '../../hooks'

export function HistoryPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const q = useHistory(tenant.id, id)

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold">Family & social history</h2>
        <p className="text-sm text-muted-foreground">
          Hereditary risk and lifestyle factors that shape preventive care.
        </p>
      </header>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Family</h3>
        {q.isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (q.data?.family ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No family history on file.</p>
        ) : (
          <ul className="space-y-2">
            {(q.data?.family ?? []).map((f) => (
              <li key={f.id} className="rounded-md border p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {f.relationship.replace('_', ' ')}
                  </Badge>
                  <span className="capitalize text-muted-foreground">{f.sex}</span>
                  {f.deceasedAge ? (
                    <Badge variant="secondary">Deceased age {f.deceasedAge}</Badge>
                  ) : null}
                </div>
                <ul className="mt-1.5 space-y-0.5 text-xs">
                  {f.conditions.map((c, i) => (
                    <li key={`${f.id}-${i}`}>
                      <span className="font-medium">{c.snomed.display}</span>
                      {c.onsetAge ? <span className="text-muted-foreground"> · onset age {c.onsetAge}</span> : null}
                    </li>
                  ))}
                </ul>
                {f.notes ? <p className="mt-1 text-xs text-muted-foreground">{f.notes}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Social</h3>
        {q.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !q.data?.social ? (
          <p className="text-sm text-muted-foreground">No social history on file.</p>
        ) : (
          <dl className="grid grid-cols-1 gap-3 rounded-md border p-4 text-sm md:grid-cols-2">
            <Row k="Smoking" v={q.data.social.smoking.replace(/_/g, ' ')} />
            <Row k="Alcohol" v={q.data.social.alcohol} />
            <Row k="Recreational drugs" v={q.data.social.recreationalDrugs ?? '—'} />
            <Row k="Occupation" v={q.data.social.occupation ?? '—'} />
            <Row k="Living situation" v={q.data.social.livingSituation ?? '—'} />
            <Row k="Exercise" v={q.data.social.exercise ?? '—'} />
            <Row k="Diet" v={q.data.social.diet ?? '—'} />
          </dl>
        )}
      </section>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b pb-1 last:border-0">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="capitalize">{v}</dd>
    </div>
  )
}

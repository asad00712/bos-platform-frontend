import { useParams } from 'react-router'

import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatCurrency, formatDate } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import { useClaims, useCoverages, useRunEligibility } from '../../hooks'
import { Button } from '@/shared/ui/button'

export function BillingPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const cov = useCoverages(tenant.id, id)
  const claims = useClaims(tenant.id)
  const eligibility = useRunEligibility()

  const myClaims = (claims.data?.items ?? []).filter((c) => c.patientId === id)

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold">Billing</h2>
        <p className="text-sm text-muted-foreground">
          Coverage, eligibility, and the patient's claim history.
        </p>
      </header>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Coverage
        </h3>
        {cov.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (cov.data?.items ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No coverage on file.</p>
        ) : (
          <ul className="space-y-2">
            {(cov.data?.items ?? []).map((c) => (
              <li key={c.id} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{c.payor}</p>
                  <span className="text-muted-foreground">{c.planName}</span>
                  <Badge variant="outline" className="capitalize">{c.order}</Badge>
                  <Badge variant={c.network === 'in_network' ? 'default' : 'destructive'} className="capitalize">
                    {c.network.replace('_', ' ')}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ms-auto"
                    onClick={() => eligibility.mutate(c.id)}
                    disabled={eligibility.isPending}
                  >
                    {eligibility.isPending ? 'Checking…' : 'Check eligibility'}
                  </Button>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                  <KV k="Member ID" v={c.memberId} />
                  <KV k="Group" v={c.groupNumber ?? '—'} />
                  <KV k="Copay" v={c.copay != null ? formatCurrency(c.copay, tenant.currency ?? 'USD', { maximumFractionDigits: 0 }) : '—'} />
                  <KV
                    k="Deductible"
                    v={c.deductibleTotal != null ? `${formatCurrency(c.deductibleMet ?? 0, tenant.currency ?? 'USD', { maximumFractionDigits: 0 })} / ${formatCurrency(c.deductibleTotal, tenant.currency ?? 'USD', { maximumFractionDigits: 0 })}` : '—'}
                  />
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Claims
        </h3>
        {claims.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : myClaims.length === 0 ? (
          <p className="text-sm text-muted-foreground">No claims for this patient.</p>
        ) : (
          <ul className="space-y-2">
            {myClaims.map((c) => (
              <li key={c.id} className="rounded-md border p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-xs">{c.id}</p>
                  <Badge
                    variant={
                      c.status === 'paid'
                        ? 'default'
                        : c.status === 'denied'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className="capitalize"
                  >
                    {c.status}
                  </Badge>
                  <span className="ms-auto text-xs text-muted-foreground">
                    {formatDate(c.serviceDate, { dateStyle: 'medium' })}
                  </span>
                </div>
                <p className="mt-1 text-xs">
                  {c.payor ?? 'Self-pay'} ·{' '}
                  {formatCurrency(c.totalCharge, tenant.currency ?? 'USD', { maximumFractionDigits: 0 })} charged ·{' '}
                  {formatCurrency(c.totalPaid, tenant.currency ?? 'USD', { maximumFractionDigits: 0 })} paid
                </p>
                {c.denialReason ? (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{c.denialReason}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="font-medium tabular-nums">{v}</dd>
    </div>
  )
}

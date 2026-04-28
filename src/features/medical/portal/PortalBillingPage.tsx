import { useMemo } from 'react'
import { CreditCard, Receipt } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatCurrency, formatDate } from '@/shared/lib/format'

import { useClaims, useCoverages } from '../hooks'
import { PORTAL_PATIENT_ID } from './portalConstants'

export function PortalBillingPage() {
  const { tenant } = useTenant()
  const cov = useCoverages(tenant.id, PORTAL_PATIENT_ID)
  const claims = useClaims(tenant.id)

  const myClaims = useMemo(
    () => (claims.data?.items ?? []).filter((c) => c.patientId === PORTAL_PATIENT_ID),
    [claims.data],
  )

  const balance = myClaims.reduce((s, c) => s + c.patientResponsibility, 0)
  const currency = tenant.currency ?? 'USD'

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Statements, balances, and your insurance summary.
        </p>
      </header>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <CreditCard className="size-8 text-primary" />
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Outstanding balance
            </p>
            <p className="text-3xl font-semibold tabular-nums">
              {formatCurrency(balance, currency, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">
              {myClaims.length} {myClaims.length === 1 ? 'claim' : 'claims'} on your account
            </p>
          </div>
          <Button disabled={balance === 0}>
            <Receipt /> Pay balance
          </Button>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Coverage
        </h2>
        {cov.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (cov.data?.items ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No coverage on file.</p>
        ) : (
          <ul className="space-y-2">
            {(cov.data?.items ?? []).map((c) => (
              <li key={c.id}>
                <Card>
                  <CardContent className="space-y-1 p-4 text-sm">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="font-semibold">{c.payor}</p>
                      <span className="text-muted-foreground">{c.planName}</span>
                      <Badge variant="outline" className="capitalize">{c.order}</Badge>
                    </div>
                    <dl className="grid grid-cols-2 gap-2 pt-1 text-xs md:grid-cols-4">
                      <KV k="Member ID" v={c.memberId} />
                      <KV
                        k="Copay"
                        v={
                          c.copay != null
                            ? formatCurrency(c.copay, currency, { maximumFractionDigits: 0 })
                            : '—'
                        }
                      />
                      <KV
                        k="Deductible met"
                        v={
                          c.deductibleMet != null && c.deductibleTotal != null
                            ? `${formatCurrency(c.deductibleMet, currency, { maximumFractionDigits: 0 })} / ${formatCurrency(c.deductibleTotal, currency, { maximumFractionDigits: 0 })}`
                            : '—'
                        }
                      />
                      <KV
                        k="OOP max"
                        v={
                          c.oopMaxMet != null && c.oopMaxTotal != null
                            ? `${formatCurrency(c.oopMaxMet, currency, { maximumFractionDigits: 0 })} / ${formatCurrency(c.oopMaxTotal, currency, { maximumFractionDigits: 0 })}`
                            : '—'
                        }
                      />
                    </dl>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recent claims
        </h2>
        {claims.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : myClaims.length === 0 ? (
          <p className="text-sm text-muted-foreground">No claims on file.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {myClaims.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-md border p-3"
              >
                <div>
                  <p className="font-medium">
                    {formatDate(c.serviceDate, { dateStyle: 'medium' })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.payor ?? 'Self-pay'} · {c.diagnoses[0]?.display ?? 'Visit'}
                  </p>
                </div>
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
                <p className="text-xs">
                  Charge{' '}
                  <span className="font-medium tabular-nums">
                    {formatCurrency(c.totalCharge, currency, { maximumFractionDigits: 0 })}
                  </span>
                </p>
                <p className="text-xs">
                  Your responsibility{' '}
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(c.patientResponsibility, currency, { maximumFractionDigits: 0 })}
                  </span>
                </p>
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

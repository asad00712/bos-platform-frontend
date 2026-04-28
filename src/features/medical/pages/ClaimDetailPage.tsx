import { useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CircleAlert,
  Receipt,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

import { formatCurrency, formatDate } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'
import { BidiCode, BidiNum } from '@/shared/lib/bidi'

import { useClaims } from '../hooks'
import type { Claim } from '../api/medical.contracts'

const STATUS_VARIANT: Record<Claim['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'outline',
  submitted: 'secondary',
  paid: 'default',
  partial: 'secondary',
  denied: 'destructive',
  rejected: 'destructive',
}

export function ClaimDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const q = useClaims(tenant.id)
  const claim = q.data?.items.find((c) => c.id === id)
  const currency = tenant.currency ?? 'USD'

  // Local payment posting (demo). Persisted server-side in production.
  const [payments, setPayments] = useState<{ amount: number; source: string; postedAt: string }[]>([])
  const [draftAmt, setDraftAmt] = useState('')
  const [draftSource, setDraftSource] = useState(claim?.payor ?? 'Insurance EFT')

  if (q.isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Loading claim…" />
        <Skeleton className="h-72 w-full" />
      </PageContainer>
    )
  }

  if (!claim) {
    return (
      <PageContainer>
        <PageHeader title="Claim" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Receipt />
            </EmptyMedia>
            <EmptyTitle>Claim not found</EmptyTitle>
            <EmptyDescription>It may have been removed.</EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to="/app/medical/billing">
              <ArrowLeft /> Back to claims
            </Link>
          </Button>
        </Empty>
      </PageContainer>
    )
  }

  const totalPosted = payments.reduce((s, p) => s + p.amount, 0)
  const livePaid = claim.totalPaid + totalPosted
  const liveOutstanding = Math.max(0, claim.totalCharge - livePaid - claim.totalAdjustment)

  function postPayment() {
    const amt = Number(draftAmt)
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    setPayments((cur) => [
      ...cur,
      { amount: amt, source: draftSource, postedAt: new Date().toISOString() },
    ])
    setDraftAmt('')
    toast.success('Payment posted', {
      description: `${formatCurrency(amt, currency, { maximumFractionDigits: 2 })} from ${draftSource}`,
    })
  }

  return (
    <PageContainer>
      <PageHeader
        title="Claim detail"
        description={`${claim.id} · ${claim.patientName} · ${formatDate(claim.serviceDate, { dateStyle: 'medium' })}`}
        breadcrumbs={[
          { label: 'Billing', href: '/app/medical/billing' },
          { label: claim.patientName },
        ]}
        actions={
          <>
            <Badge variant={STATUS_VARIANT[claim.status]} className="capitalize">
              {claim.status}
            </Badge>
            {claim.encounterId ? (
              <Button variant="outline" asChild>
                <Link to={`/app/medical/encounters/${claim.encounterId}`}>
                  Open encounter
                </Link>
              </Button>
            ) : null}
            {claim.status === 'denied' ? (
              <Button>
                <RotateCcw /> Resubmit
              </Button>
            ) : null}
          </>
        }
      />

      {claim.denialReason ? (
        <Card className="border-rose-500/50 bg-rose-500/5">
          <CardContent className="flex items-start gap-3 p-4 text-sm">
            <CircleAlert className="mt-0.5 size-4 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-semibold text-rose-700 dark:text-rose-300">Denied</p>
              <p className="text-xs text-muted-foreground">{claim.denialReason}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="border-b p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Diagnoses
              </p>
              <ul className="mt-2 space-y-0.5">
                {claim.diagnoses.map((d, i) => (
                  <li key={d.code} className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <BidiCode className="text-xs text-muted-foreground">{d.code}</BidiCode>
                    <span className="break-words">{d.display}</span>
                  </li>
                ))}
              </ul>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3 text-start">CPT</th>
                  <th className="p-3 text-start">Modifiers</th>
                  <th className="p-3 text-end">Units</th>
                  <th className="p-3 text-end">Unit price</th>
                  <th className="p-3 text-start">Pointers</th>
                  <th className="p-3 text-end">Line total</th>
                </tr>
              </thead>
              <tbody>
                {claim.lines.map((line) => (
                  <tr key={line.id} className="border-t">
                    <td className="p-3">
                      <BidiCode className="text-xs text-muted-foreground">{line.cpt.code}</BidiCode>
                    </td>
                    <td className="p-3">
                      {line.modifiers.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {line.modifiers.map((m) => (
                            <Badge key={m} variant="outline" className="text-[10px]">
                              -{m}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-end tabular-nums">
                      <BidiNum>{line.units}</BidiNum>
                    </td>
                    <td className="p-3 text-end tabular-nums">
                      {formatCurrency(line.unitPrice, currency, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 font-mono text-xs">
                        {line.diagnosisPointers.map((p) => (
                          <span key={p} className="rounded border bg-muted/40 px-1 py-0.5">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-end font-medium tabular-nums">
                      {formatCurrency(line.units * line.unitPrice, currency, { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/30 text-sm">
                  <td colSpan={5} className="p-3 text-end font-medium">
                    Total charge
                  </td>
                  <td className="p-3 text-end font-semibold tabular-nums">
                    {formatCurrency(claim.totalCharge, currency, { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardContent className="space-y-2 p-5 text-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Settlement
              </h3>
              <Row k="Charge" v={formatCurrency(claim.totalCharge, currency, { maximumFractionDigits: 2 })} />
              <Row k="Adjustments" v={formatCurrency(claim.totalAdjustment, currency, { maximumFractionDigits: 2 })} />
              <Row
                k="Paid (live)"
                v={formatCurrency(livePaid, currency, { maximumFractionDigits: 2 })}
                tone="text-emerald-700 dark:text-emerald-400"
              />
              <Row
                k="Patient responsibility"
                v={formatCurrency(claim.patientResponsibility, currency, { maximumFractionDigits: 2 })}
              />
              <div className="flex items-baseline justify-between border-t pt-2 text-base font-semibold">
                <span>Outstanding</span>
                <span
                  className={
                    liveOutstanding > 0
                      ? 'text-amber-700 dark:text-amber-400 tabular-nums'
                      : 'text-emerald-700 dark:text-emerald-400 tabular-nums'
                  }
                >
                  {formatCurrency(liveOutstanding, currency, { maximumFractionDigits: 2 })}
                </span>
              </div>
              {liveOutstanding === 0 ? (
                <p className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" /> Claim fully posted.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5 text-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Post payment
              </h3>
              <div className="space-y-1.5">
                <Label className="text-xs">Source</Label>
                <Input value={draftSource} onChange={(e) => setDraftSource(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Amount</Label>
                <Input
                  inputMode="decimal"
                  placeholder="0.00"
                  value={draftAmt}
                  onChange={(e) => setDraftAmt(e.target.value)}
                  className="text-end tabular-nums"
                />
              </div>
              <Button onClick={postPayment} className="w-full">
                <Banknote /> Post payment
              </Button>
              {payments.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Posted this session ({payments.length})
                  </p>
                  <ul className="mt-1 space-y-1 text-xs">
                    {payments.map((p, i) => (
                      <li
                        key={`${p.postedAt}-${i}`}
                        className="flex items-baseline justify-between gap-2 rounded-md border p-2"
                      >
                        <span>{p.source}</span>
                        <span className="font-medium tabular-nums">
                          {formatCurrency(p.amount, currency, { maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(p.postedAt, { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

function Row({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className={`font-medium tabular-nums ${tone ?? ''}`}>{v}</span>
    </div>
  )
}

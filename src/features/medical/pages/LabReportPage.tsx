import { useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileSignature,
  Mail,
  Microscope,
} from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

import { formatDateTime, formatRelative } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'
import { BidiCode, BidiNum } from '@/shared/lib/bidi'

import {
  useLabReport,
  useNotifyPatientForReport,
  usePractitioners,
  useSignLabReport,
} from '../hooks'
import { AbnormalFlag } from '../components/AbnormalFlag'
import { LabTrendChart } from '../components/LabTrendChart'
import { SignCeremonyDialog } from '../components/SignCeremonyDialog'

export function LabReportPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const q = useLabReport(tenant.id, id)
  const sign = useSignLabReport(tenant.id)
  const notify = useNotifyPatientForReport(tenant.id)
  const practitioners = usePractitioners(tenant.id)
  const [signing, setSigning] = useState(false)

  if (q.isLoading || !q.data) {
    return (
      <PageContainer>
        <PageHeader title="Loading result…" />
        <Skeleton className="h-72 w-full" />
      </PageContainer>
    )
  }
  if (q.isError) {
    return (
      <PageContainer>
        <PageHeader title="Lab result" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Microscope />
            </EmptyMedia>
            <EmptyTitle>Result not found</EmptyTitle>
            <EmptyDescription>
              {(q.error as Error)?.message ?? 'It may have been removed.'}
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to="/app/medical/labs/inbox">
              <ArrowLeft /> Back to inbox
            </Link>
          </Button>
        </Empty>
      </PageContainer>
    )
  }

  const { report, patientName, results, trend } = q.data
  const provider = practitioners.data?.[0]
  const expectedPin = provider?.signaturePin ?? '0001'
  const isSigned = Boolean(report.signedAt)
  const wasNotified = Boolean(report.patientNotifiedAt)
  const hasCritical = results.some(
    (r) => r.interpretation === 'Critical' || r.interpretation === 'HH' || r.interpretation === 'LL',
  )

  return (
    <PageContainer>
      <PageHeader
        title={report.code.display}
        description={`${patientName} · ${formatDateTime(report.effectiveDateTime)} · ${report.performer}`}
        breadcrumbs={[
          { label: 'Lab inbox', href: '/app/medical/labs/inbox' },
          { label: report.code.display },
        ]}
        actions={
          <>
            <Badge variant="outline" className="capitalize">
              {report.status}
            </Badge>
            {isSigned ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="size-3" /> Signed{' '}
                {report.signedAt ? formatRelative(report.signedAt) : ''}
              </Badge>
            ) : (
              <Button onClick={() => setSigning(true)}>
                <FileSignature /> Sign result
              </Button>
            )}
            <Button
              variant="outline"
              disabled={!isSigned || wasNotified || notify.isPending}
              onClick={() => notify.mutate(report.id)}
            >
              <Mail /> {wasNotified ? 'Patient notified' : 'Notify patient'}
            </Button>
            {report.presentedFormUrl ? (
              <Button variant="outline" asChild>
                <a href={report.presentedFormUrl} target="_blank" rel="noreferrer">
                  PDF <ExternalLink className="ms-1 size-3" />
                </a>
              </Button>
            ) : null}
          </>
        }
      />

      {hasCritical && !isSigned ? (
        <Card className="border-rose-500/50 bg-rose-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <Microscope className="size-5 text-rose-600 dark:text-rose-400" />
            <div className="flex-1 text-sm">
              <p className="font-semibold">Contains critical values</p>
              <p className="text-muted-foreground text-xs">
                Notify the patient promptly after sign. Document the callback in the chart.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-start">Analyte</th>
                <th className="p-3 text-end">Result</th>
                <th className="p-3 text-start">Reference</th>
                <th className="p-3 text-center">Flag</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <BidiCode className="text-xs text-muted-foreground">{r.code.code}</BidiCode>
                      <span className="font-medium">{r.code.display}</span>
                    </div>
                  </td>
                  <td className="p-3 text-end font-medium tabular-nums">
                    {r.value ? (
                      <>
                        <BidiNum>{r.value.value}</BidiNum>{' '}
                        <span className="text-xs font-normal text-muted-foreground">
                          {r.value.unit}
                        </span>
                      </>
                    ) : (
                      r.valueText ?? '—'
                    )}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground tabular-nums">
                    {r.referenceRange ? (
                      <>
                        <BidiNum>
                          {r.referenceRange.low ?? ''}–{r.referenceRange.high ?? ''}
                        </BidiNum>{' '}
                        {r.referenceRange.unit}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <AbnormalFlag flag={r.interpretation} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {report.conclusion ? (
        <Card>
          <CardContent className="space-y-1 p-5 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Conclusion
            </p>
            <p className="leading-relaxed">{report.conclusion}</p>
          </CardContent>
        </Card>
      ) : null}

      {trend.length > 0 ? (
        <Card>
          <CardContent className="space-y-4 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Trend
            </h3>
            <div className="space-y-4">
              {trend.map((t) => (
                <LabTrendChart
                  key={t.analyteLoinc}
                  analyteDisplay={t.analyteDisplay}
                  points={t.points}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <SignCeremonyDialog
        open={signing}
        onOpenChange={setSigning}
        title="Sign lab result"
        description="Confirm the result before releasing it to the chart and patient."
        expectedPin={expectedPin}
        onConfirm={async () => {
          await sign.mutateAsync(report.id)
        }}
        preview={
          <div className="space-y-1 text-sm">
            <p className="font-medium">{report.code.display}</p>
            <p className="text-xs text-muted-foreground">
              {patientName} · {formatDateTime(report.effectiveDateTime)} · {report.performer}
            </p>
            <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs">
              {results.slice(0, 8).map((r) => (
                <li key={r.id}>
                  {r.code.display}:{' '}
                  {r.value ? (
                    <>
                      <BidiNum>{r.value.value}</BidiNum> {r.value.unit}{' '}
                    </>
                  ) : (
                    r.valueText ?? ''
                  )}
                  <span className="ms-1 text-muted-foreground">[{r.interpretation}]</span>
                </li>
              ))}
            </ul>
          </div>
        }
      />
    </PageContainer>
  )
}

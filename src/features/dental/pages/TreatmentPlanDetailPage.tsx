import { Link, useParams } from 'react-router'
import { ChevronLeft, ClipboardList } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

import { formatCurrency, formatDate } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import { useTreatmentPlan } from '../hooks'
import {
  ProcedureStatusBadge,
  TreatmentPlanStatusBadge,
} from '../components/Badges'

export function TreatmentPlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const query = useTreatmentPlan(tenant.id, id)

  if (query.isLoading || !query.data) {
    return (
      <PageContainer>
        <PageHeader title="Loading…" />
        <Card>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <PageHeader title="Treatment plan" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList />
            </EmptyMedia>
            <EmptyTitle>Plan not found</EmptyTitle>
            <EmptyDescription>
              {(query.error as Error)?.message ?? 'It may have been removed.'}
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to="/app/dental/patients">
              <ChevronLeft /> Back to patients
            </Link>
          </Button>
        </Empty>
      </PageContainer>
    )
  }

  const tp = query.data
  return (
    <PageContainer>
      <PageHeader
        title={tp.title}
        description={`${tp.procedureCount} ${tp.procedureCount === 1 ? 'procedure' : 'procedures'}`}
        breadcrumbs={[
          { label: 'Patients', href: '/app/dental/patients' },
          {
            label: tp.patientName,
            href: `/app/dental/patients/${tp.patientId}`,
          },
          { label: tp.title },
        ]}
        actions={<TreatmentPlanStatusBadge status={tp.status} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Procedure</TableHead>
                  <TableHead>Tooth</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead className="text-right">Insurance</TableHead>
                  <TableHead className="text-right">Patient</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tp.procedures.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-medium">{p.name}</div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {p.code}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.toothNumber ? (
                        <span className="text-sm">
                          #{p.toothNumber}
                          {p.surface ? ` · ${p.surface}` : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <ProcedureStatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(p.fee, tp.currency, { maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatCurrency(p.insuranceCovered, tp.currency, {
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(p.patientResponsibility, tp.currency, {
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Summary
            </p>
            <Stat
              label="Total fee"
              value={formatCurrency(tp.totalFee, tp.currency, { maximumFractionDigits: 0 })}
            />
            <Stat
              label="Insurance"
              value={formatCurrency(tp.totalInsurance, tp.currency, {
                maximumFractionDigits: 0,
              })}
            />
            <div className="flex items-center justify-between border-t pt-3">
              <span className="font-semibold">Patient pays</span>
              <span className="font-semibold tabular-nums">
                {formatCurrency(tp.totalPatient, tp.currency, {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>

            <div className="space-y-1 border-t pt-3 text-xs text-muted-foreground">
              <p>
                Presented:{' '}
                {tp.presentedAt
                  ? formatDate(tp.presentedAt, { dateStyle: 'medium' })
                  : '—'}
              </p>
              <p>
                Accepted:{' '}
                {tp.acceptedAt
                  ? formatDate(tp.acceptedAt, { dateStyle: 'medium' })
                  : '—'}
              </p>
            </div>

            {tp.notes ? (
              <div className="space-y-1 border-t pt-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Notes
                </p>
                <p className="text-sm leading-relaxed">{tp.notes}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

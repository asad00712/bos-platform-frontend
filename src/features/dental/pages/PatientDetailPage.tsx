import { Link, useNavigate, useParams } from 'react-router'
import {
  CalendarDays,
  ChevronLeft,
  ClipboardList,
  FileText,
  Mail,
  Phone,
  Receipt,
  Smile,
  Stethoscope,
} from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/tabs'

import { formatCurrency, formatDate, formatRelative } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import { usePatient, usePatientPlans } from '../hooks'
import { PatientStatusBadge, TreatmentPlanStatusBadge } from '../components/Badges'
import { ToothChart } from '../components/ToothChart'

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tenant } = useTenant()

  const query = usePatient(tenant.id, id)
  const plans = usePatientPlans(tenant.id, id)

  if (query.isLoading || !query.data) {
    return (
      <PageContainer>
        <PageHeader title="Loading…" />
        <Card>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <PageHeader title="Patient" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Smile />
            </EmptyMedia>
            <EmptyTitle>Patient not found</EmptyTitle>
            <EmptyDescription>
              {(query.error as Error)?.message ?? 'They may have been removed.'}
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

  const p = query.data
  const fullName = `${p.firstName} ${p.lastName}`
  const initials = `${p.firstName[0] ?? ''}${p.lastName[0] ?? ''}`.toUpperCase()

  return (
    <PageContainer>
      <PageHeader
        title={fullName}
        description={`${p.chartNumber}${p.dateOfBirth ? ` · DOB ${p.dateOfBirth}` : ''}`}
        breadcrumbs={[
          { label: 'Patients', href: '/app/dental/patients' },
          { label: fullName },
        ]}
        actions={
          <>
            {p.email ? (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${p.email}`}>
                  <Mail /> Email
                </a>
              </Button>
            ) : null}
            {p.phone ? (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${p.phone}`}>
                  <Phone /> Call
                </a>
              </Button>
            ) : null}
            <Button onClick={() => navigate('/app/scheduling')}>
              <CalendarDays /> Book appointment
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarFallback className="text-sm">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <p className="text-base font-semibold">{fullName}</p>
                <PatientStatusBadge status={p.status} />
              </div>
            </div>

            <dl className="space-y-3 text-sm">
              <Row label="Chart" value={p.chartNumber} />
              <Row label="Email" value={p.email ?? '—'} />
              <Row label="Phone" value={p.phone ?? '—'} />
              <Row label="DOB" value={p.dateOfBirth ?? '—'} />
              <Row label="Insurer" value={p.insurer ?? 'Self-pay'} />
              <Row label="Primary dentist" value={p.primaryDentistName ?? 'Unassigned'} />
              <Row
                label="Last visit"
                value={p.lastVisitAt ? formatRelative(p.lastVisitAt) : 'never'}
              />
              <Row
                label="Recall due"
                value={p.recallDueAt ? formatDate(p.recallDueAt, { dateStyle: 'medium' }) : '—'}
              />
              <Row
                label="Outstanding"
                value={
                  p.outstandingBalance > 0
                    ? formatCurrency(p.outstandingBalance, p.currency, {
                        maximumFractionDigits: 0,
                      })
                    : '—'
                }
              />
            </dl>

            {p.allergies.length > 0 ? (
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Allergies
                </p>
                <div className="flex flex-wrap gap-1">
                  {p.allergies.map((a) => (
                    <Badge key={a} variant="destructive" className="text-[10px]">
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {p.conditions.length > 0 ? (
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Medical conditions
                </p>
                <div className="flex flex-wrap gap-1">
                  {p.conditions.map((c) => (
                    <Badge key={c} variant="outline" className="text-[10px]">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {p.medications.length > 0 ? (
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Medications
                </p>
                <ul className="space-y-0.5 text-sm">
                  {p.medications.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {p.notes ? (
              <div className="space-y-1 border-t pt-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Notes
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{p.notes}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="lg:col-span-8">
          <Tabs defaultValue="chart">
            <TabsList>
              <TabsTrigger value="chart">
                <Stethoscope /> Tooth chart
              </TabsTrigger>
              <TabsTrigger value="plans">
                <ClipboardList /> Treatment plans
              </TabsTrigger>
              <TabsTrigger value="imaging">
                <FileText /> Imaging
              </TabsTrigger>
              <TabsTrigger value="billing">
                <Receipt /> Billing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="mt-4">
              <Card>
                <CardContent className="p-5">
                  <ToothChart patientId={p.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plans" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {plans.isLoading || !plans.data ? (
                    <div className="space-y-3 p-5">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : plans.data.items.length === 0 ? (
                    <Empty className="py-10">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <ClipboardList />
                        </EmptyMedia>
                        <EmptyTitle>No treatment plans</EmptyTitle>
                        <EmptyDescription>
                          Plans you create for this patient appear here.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <ul className="divide-y">
                      {plans.data.items.map((tp) => (
                        <li key={tp.id}>
                          <Link
                            to={`/app/dental/treatment-plans/${tp.id}`}
                            className="flex items-start gap-3 px-5 py-4 transition hover:bg-accent/40"
                          >
                            <div className="flex-1 space-y-0.5">
                              <p className="font-medium leading-tight">{tp.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {tp.procedureCount}{' '}
                                {tp.procedureCount === 1 ? 'procedure' : 'procedures'} ·{' '}
                                {formatCurrency(tp.totalFee, tp.currency, { maximumFractionDigits: 0 })}
                              </p>
                            </div>
                            <TreatmentPlanStatusBadge status={tp.status} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="imaging" className="mt-4">
              <Card>
                <CardContent className="p-5">
                  <Empty className="py-10">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <FileText />
                      </EmptyMedia>
                      <EmptyTitle>Imaging viewer ships next</EmptyTitle>
                      <EmptyDescription>
                        DICOM viewer with annotations lands in Phase 9. Documents
                        tab on each patient already supports manual uploads.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="mt-4">
              <Card>
                <CardContent className="p-5">
                  {p.outstandingBalance > 0 ? (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Outstanding
                        </p>
                        <p className="text-2xl font-semibold tabular-nums">
                          {formatCurrency(p.outstandingBalance, p.currency, {
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                      <Button asChild>
                        <Link to="/app/billing">
                          Open invoices
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <Empty className="py-10">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Receipt />
                        </EmptyMedia>
                        <EmptyTitle>Account is up to date</EmptyTitle>
                        <EmptyDescription>
                          Invoices for this patient will be linked here once
                          tenant CRM ↔ billing references are wired.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-end text-sm">{value}</dd>
    </div>
  )
}

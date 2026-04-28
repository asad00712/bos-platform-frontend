import { Link, useNavigate, useParams } from 'react-router'
import {
  Bus,
  CalendarCheck,
  ChevronLeft,
  GraduationCap,
  Home,
  Mail,
  Phone,
  Receipt,
  ShieldAlert,
  User,
  Users,
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

import { formatCurrency, formatDate, formatPercent } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import { useReportCards, useStudent, useStudentFees } from '../hooks'
import { StudentStatusBadge } from '../components/Badges'

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tenant } = useTenant()

  const q = useStudent(tenant.id, id)
  const fees = useStudentFees(tenant.id)
  const reportCards = useReportCards(tenant.id)

  if (q.isLoading || !q.data) {
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

  if (q.isError) {
    return (
      <PageContainer>
        <PageHeader title="Student" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GraduationCap />
            </EmptyMedia>
            <EmptyTitle>Student not found</EmptyTitle>
            <EmptyDescription>
              {(q.error as Error)?.message ?? 'They may have been removed.'}
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to="/app/school/students">
              <ChevronLeft /> Back to students
            </Link>
          </Button>
        </Empty>
      </PageContainer>
    )
  }

  const s = q.data
  const fullName = `${s.firstName} ${s.lastName}`
  const initials = `${s.firstName[0] ?? ''}${s.lastName[0] ?? ''}`.toUpperCase()

  const studentFeeRows =
    fees.data?.items.filter((r) => r.studentId === s.id) ?? []
  const reportCard = reportCards.data?.items.find((rc) => rc.studentId === s.id)

  return (
    <PageContainer>
      <PageHeader
        title={fullName}
        description={`${s.admissionNumber} · ${s.className} · Section ${s.sectionName} · Roll ${s.rollNumber}`}
        breadcrumbs={[
          { label: 'Students', href: '/app/school/students' },
          { label: fullName },
        ]}
        actions={
          <>
            {s.email ? (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${s.email}`}>
                  <Mail /> Email
                </a>
              </Button>
            ) : null}
            {s.primaryParentPhone ? (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${s.primaryParentPhone}`}>
                  <Phone /> Call guardian
                </a>
              </Button>
            ) : null}
            <Button onClick={() => navigate('/app/school/attendance')}>
              <CalendarCheck /> Attendance
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
                <StudentStatusBadge status={s.status} />
              </div>
            </div>

            <dl className="space-y-3 text-sm">
              <Row label="Admission" value={s.admissionNumber} />
              <Row label="Date of birth" value={s.dateOfBirth} />
              <Row label="Gender" value={cap(s.gender)} />
              <Row label="Blood group" value={s.bloodGroup ?? '—'} />
              <Row label="Class" value={`${s.className} · Section ${s.sectionName}`} />
              <Row label="Roll" value={String(s.rollNumber)} />
              <Row label="Homeroom" value={s.homeroomTeacher ?? '—'} />
              <Row
                label="Attendance"
                value={formatPercent(s.attendanceRate, 0)}
              />
              <Row
                label="Outstanding fees"
                value={
                  s.outstandingFees > 0
                    ? formatCurrency(s.outstandingFees, s.currency, {
                        maximumFractionDigits: 0,
                      })
                    : '—'
                }
              />
              <Row
                label="Enrolled"
                value={formatDate(s.enrolledAt, { dateStyle: 'medium' })}
              />
              <Row label="Email" value={s.email ?? '—'} />
              <Row label="Address" value={s.address ?? '—'} />
            </dl>

            {s.allergies.length > 0 ? (
              <div className="space-y-1 border-t pt-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Allergies
                </p>
                <div className="flex flex-wrap gap-1">
                  {s.allergies.map((a) => (
                    <Badge key={a} variant="destructive" className="text-[10px]">
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {s.medicalNotes ? (
              <div className="space-y-1 border-t pt-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Medical notes
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {s.medicalNotes}
                </p>
              </div>
            ) : null}

            {s.notes ? (
              <div className="space-y-1 border-t pt-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Notes
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {s.notes}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="lg:col-span-8">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">
                <User /> Overview
              </TabsTrigger>
              <TabsTrigger value="academics">
                <GraduationCap /> Academics
              </TabsTrigger>
              <TabsTrigger value="fees">
                <Receipt /> Fees
              </TabsTrigger>
              <TabsTrigger value="parents">
                <Users /> Parents
              </TabsTrigger>
              <TabsTrigger value="logistics">
                <Bus /> Logistics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardContent className="space-y-4 p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Emergency contact
                  </h3>
                  <p className="text-sm">{s.emergencyContact ?? '—'}</p>
                  {s.outstandingFees > 0 ? (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                      <div className="flex items-start gap-3">
                        <ShieldAlert className="mt-0.5 size-4 text-destructive" />
                        <div>
                          <p className="text-sm font-medium">
                            Outstanding fees
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(s.outstandingFees, s.currency, {
                              maximumFractionDigits: 0,
                            })}{' '}
                            owed across {studentFeeRows.length} term{' '}
                            {studentFeeRows.length === 1 ? 'fee' : 'fees'}.
                          </p>
                        </div>
                        <Button asChild size="sm" className="ms-auto">
                          <Link to="/app/school/fees">Review</Link>
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academics" className="mt-4">
              <Card>
                <CardContent className="p-5">
                  {!reportCard ? (
                    <Empty className="py-10">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <GraduationCap />
                        </EmptyMedia>
                        <EmptyTitle>No published report card yet</EmptyTitle>
                        <EmptyDescription>
                          Term grades will appear once exams are graded and
                          published.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {reportCard.termName}
                          </p>
                          <p className="text-2xl font-semibold tabular-nums">
                            {formatPercent(reportCard.percentage, 1)}{' '}
                            <span className="text-base font-normal text-muted-foreground">
                              · Grade {reportCard.overallGrade}
                            </span>
                          </p>
                        </div>
                        {reportCard.rank ? (
                          <Badge>Rank {reportCard.rank} of {reportCard.classSize}</Badge>
                        ) : null}
                      </div>

                      <div className="overflow-hidden rounded-lg border">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                            <tr>
                              <th className="p-3 text-start">Subject</th>
                              <th className="p-3 text-center">Marks</th>
                              <th className="p-3 text-center">Grade</th>
                              <th className="p-3 text-start">Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportCard.subjects.map((sub) => (
                              <tr key={sub.subjectName} className="border-t">
                                <td className="p-3 font-medium">{sub.subjectName}</td>
                                <td className="p-3 text-center tabular-nums">
                                  {sub.marks} / {sub.maxMarks}
                                </td>
                                <td className="p-3 text-center">
                                  <Badge variant="outline" className="font-mono">
                                    {sub.grade}
                                  </Badge>
                                </td>
                                <td className="p-3 text-xs text-muted-foreground">
                                  {sub.remarks ?? '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {reportCard.homeroomRemarks ? (
                        <div className="rounded-md border bg-muted/30 p-3">
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Homeroom remarks
                          </p>
                          <p className="mt-1 text-sm">
                            {reportCard.homeroomRemarks}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fees" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {studentFeeRows.length === 0 ? (
                    <Empty className="py-10">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Receipt />
                        </EmptyMedia>
                        <EmptyTitle>No fee records</EmptyTitle>
                        <EmptyDescription>
                          Term fees will appear here once issued.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="p-3 text-start">Fee</th>
                          <th className="p-3 text-start">Term</th>
                          <th className="p-3 text-end">Amount</th>
                          <th className="p-3 text-end">Outstanding</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentFeeRows.map((r) => (
                          <tr key={r.id} className="border-t">
                            <td className="p-3 font-medium">
                              {r.feeStructureName}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {r.termName}
                            </td>
                            <td className="p-3 text-end tabular-nums">
                              {formatCurrency(r.amount, r.currency, {
                                maximumFractionDigits: 0,
                              })}
                            </td>
                            <td className="p-3 text-end tabular-nums">
                              {r.outstanding > 0
                                ? formatCurrency(r.outstanding, r.currency, {
                                    maximumFractionDigits: 0,
                                  })
                                : '—'}
                            </td>
                            <td className="p-3 text-center">
                              <Badge
                                variant={
                                  r.status === 'paid'
                                    ? 'default'
                                    : r.status === 'overdue'
                                      ? 'destructive'
                                      : 'outline'
                                }
                              >
                                {r.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parents" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {s.parents.map((p) => (
                      <li
                        key={p.id}
                        className="flex flex-wrap items-center gap-3 px-5 py-4"
                      >
                        <Avatar className="size-9">
                          <AvatarFallback className="text-xs">
                            {`${p.firstName[0] ?? ''}${p.lastName[0] ?? ''}`.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">
                            {p.firstName} {p.lastName}{' '}
                            {p.primary ? (
                              <Badge variant="outline" className="ms-1 text-[10px]">
                                Primary
                              </Badge>
                            ) : null}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cap(p.relationship)} · {p.email ?? '—'} ·{' '}
                            {p.phone ?? '—'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {p.email ? (
                            <Button variant="ghost" size="icon" asChild aria-label="Email">
                              <a href={`mailto:${p.email}`}>
                                <Mail />
                              </a>
                            </Button>
                          ) : null}
                          {p.phone ? (
                            <Button variant="ghost" size="icon" asChild aria-label="Call">
                              <a href={`tel:${p.phone}`}>
                                <Phone />
                              </a>
                            </Button>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logistics" className="mt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card>
                  <CardContent className="space-y-2 p-5">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <Bus className="size-4" /> Transport
                    </div>
                    {s.transportRouteName ? (
                      <p className="text-sm">{s.transportRouteName}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Not assigned to a route
                      </p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="space-y-2 p-5">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <Home className="size-4" /> Hostel
                    </div>
                    {s.hostelRoom ? (
                      <p className="text-sm">{s.hostelRoom}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Day scholar
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
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

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

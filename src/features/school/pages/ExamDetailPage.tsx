import { Link, useParams } from 'react-router'
import { ChevronLeft, ClipboardCheck, FileText } from 'lucide-react'

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

import { formatDate } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import { ExamStatusBadge } from '../components/Badges'
import { useExam } from '../hooks'

export function ExamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const q = useExam(tenant.id, id)

  if (q.isLoading || !q.data) {
    return (
      <PageContainer>
        <PageHeader title="Loading exam…" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  if (q.isError) {
    return (
      <PageContainer>
        <PageHeader title="Exam" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>Exam not found</EmptyTitle>
            <EmptyDescription>It may have been removed.</EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to="/app/school/exams">
              <ChevronLeft /> Back to exams
            </Link>
          </Button>
        </Empty>
      </PageContainer>
    )
  }

  const e = q.data

  return (
    <PageContainer>
      <PageHeader
        title={e.name}
        description={`${e.termName} · ${e.papers.length} papers · ${formatDate(e.startDate, { dateStyle: 'medium' })} — ${formatDate(e.endDate, { dateStyle: 'medium' })}`}
        breadcrumbs={[
          { label: 'Exams', href: '/app/school/exams' },
          { label: e.name },
        ]}
        actions={
          <>
            <ExamStatusBadge status={e.status} />
            <Button asChild>
              <Link
                to={`/app/school/gradebook?examId=${e.id}&paperId=${e.papers[0]?.id ?? ''}`}
              >
                <ClipboardCheck /> Open gradebook
              </Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-start">Subject</th>
                <th className="p-3 text-start">Date</th>
                <th className="p-3 text-start">Start</th>
                <th className="p-3 text-end">Duration</th>
                <th className="p-3 text-end">Max</th>
                <th className="p-3 text-end">Pass</th>
                <th className="p-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {e.papers.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 font-medium">{p.subjectName}</td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {formatDate(p.date, { dateStyle: 'medium' })}
                  </td>
                  <td className="p-3 tabular-nums">{p.startTime}</td>
                  <td className="p-3 text-end tabular-nums">
                    {p.durationMinutes} min
                  </td>
                  <td className="p-3 text-end tabular-nums">{p.maxMarks}</td>
                  <td className="p-3 text-end tabular-nums">
                    {p.passingMarks}
                  </td>
                  <td className="p-3 text-end">
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        to={`/app/school/gradebook?examId=${e.id}&paperId=${p.id}`}
                      >
                        Grade
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

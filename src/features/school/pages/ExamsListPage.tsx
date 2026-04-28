import { Link } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { CalendarClock, ClipboardCheck } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'

import { formatDate } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import type { Exam } from '../api/school.contracts'
import { ExamStatusBadge } from '../components/Badges'
import { useExamsList } from '../hooks'

const TYPE_LABELS: Record<Exam['type'], string> = {
  unit_test: 'Unit test',
  mid_term: 'Mid-term',
  final: 'Final',
  practical: 'Practical',
  oral: 'Oral',
}

export function ExamsListPage() {
  const { tenant } = useTenant()
  const q = useExamsList(tenant.id)

  const columns: ColumnDef<Exam>[] = [
    {
      accessorKey: 'name',
      header: 'Exam',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <Link
            to={`/app/school/exams/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
          <p className="text-xs text-muted-foreground">
            {TYPE_LABELS[row.original.type]} · {row.original.termName}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <ExamStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'paperCount',
      header: 'Papers',
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.paperCount}</span>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Window',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.original.startDate, { dateStyle: 'medium' })} —{' '}
          {formatDate(row.original.endDate, { dateStyle: 'medium' })}
        </span>
      ),
    },
    {
      id: 'gradebook',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button asChild variant="outline" size="sm">
            <Link to={`/app/school/exams/${row.original.id}`}>
              <ClipboardCheck /> Open
            </Link>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Exams"
        description={
          q.isLoading ? 'Loading…' : `${q.data?.items.length ?? 0} exams`
        }
        actions={
          <Button asChild variant="outline">
            <Link to="/app/school/gradebook">Gradebook</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={q.data?.items}
            isLoading={q.isLoading}
            stickyHeader={false}
            emptyTitle="No exams scheduled"
            emptyDescription="Schedule a unit test, mid-term, or final."
            emptyIcon={<CalendarClock />}
            noPagination
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

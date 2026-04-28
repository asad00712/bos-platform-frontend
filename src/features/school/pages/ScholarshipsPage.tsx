import { Link } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Award } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'

import { useTenant } from '@/shared/hooks/useTenant'

import type { Scholarship } from '../api/school.contracts'
import { useScholarshipsList } from '../hooks'

const TYPE_LABEL: Record<Scholarship['type'], string> = {
  merit: 'Merit',
  need: 'Need-based',
  sports: 'Sports',
  staff_child: 'Staff child',
}

const STATUS_VARIANT: Record<
  Scholarship['status'],
  'default' | 'outline' | 'destructive' | 'secondary'
> = {
  active: 'default',
  expired: 'outline',
  revoked: 'destructive',
}

export function ScholarshipsPage() {
  const { tenant } = useTenant()
  const q = useScholarshipsList(tenant.id)

  const columns: ColumnDef<Scholarship>[] = [
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <Link
          to={`/app/school/students/${row.original.studentId}`}
          className="font-medium hover:underline"
        >
          {row.original.studentName}
        </Link>
      ),
    },
    {
      accessorKey: 'scholarshipName',
      header: 'Scholarship',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">{TYPE_LABEL[row.original.type]}</Badge>
      ),
    },
    {
      accessorKey: 'percent',
      header: () => <div className="text-right">Award</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium tabular-nums">
          {row.original.percent !== null
            ? `${row.original.percent}%`
            : row.original.amount !== null
              ? `$${row.original.amount}`
              : '—'}
        </div>
      ),
    },
    {
      accessorKey: 'termName',
      header: 'Term',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.termName}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Scholarships"
        description={
          q.isLoading
            ? 'Loading…'
            : `${q.data?.items.length ?? 0} active and historical awards`
        }
        breadcrumbs={[
          { label: 'Fees', href: '/app/school/fees' },
          { label: 'Scholarships' },
        ]}
      />
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={q.data?.items}
            isLoading={q.isLoading}
            stickyHeader={false}
            emptyTitle="No scholarships"
            emptyDescription="Award merit, need-based, or sports scholarships to qualifying students."
            emptyIcon={<Award />}
            noPagination
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

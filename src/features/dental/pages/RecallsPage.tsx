import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { CalendarClock, ChevronRight } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'

import { formatDate, formatRelative } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'
import { cn } from '@/shared/lib/utils'

import { useRecallsList } from '../hooks'
import type { Recall } from '../api/dental.contracts'

export function RecallsPage() {
  const { tenant } = useTenant()
  const navigate = useNavigate()
  const list = useRecallsList(tenant.id)

  const columns: ColumnDef<Recall>[] = [
    {
      accessorKey: 'patientName',
      header: 'Patient',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => navigate(`/app/dental/patients/${row.original.patientId}`)}
          className="text-start font-medium underline-offset-2 hover:underline"
        >
          {row.original.patientName}
        </button>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.reason.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'dueAt',
      header: 'Due',
      cell: ({ row }) => (
        <span className="text-sm">
          {formatDate(row.original.dueAt, { dateStyle: 'medium' })}
        </span>
      ),
    },
    {
      accessorKey: 'daysOverdue',
      header: () => <div className="text-right">Overdue</div>,
      cell: ({ row }) => {
        const d = row.original.daysOverdue
        if (d <= 0) {
          return (
            <div className="text-right text-xs text-muted-foreground">
              in {Math.abs(d)}d
            </div>
          )
        }
        return (
          <div
            className={cn(
              'text-right font-medium tabular-nums',
              d > 30 ? 'text-destructive' : 'text-amber-600 dark:text-amber-400',
            )}
          >
            {d}d
          </div>
        )
      },
    },
    {
      accessorKey: 'lastVisitAt',
      header: 'Last visit',
      cell: ({ row }) =>
        row.original.lastVisitAt ? (
          <span className="text-sm text-muted-foreground">
            {formatRelative(row.original.lastVisitAt)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: 'primaryDentistName',
      header: 'Dentist',
      cell: ({ row }) =>
        row.original.primaryDentistName ?? (
          <span className="text-xs text-muted-foreground">Unassigned</span>
        ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(`/app/communication?contact=${row.original.patientId}`)
            }
          >
            Contact
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open patient"
            onClick={() => navigate(`/app/dental/patients/${row.original.patientId}`)}
          >
            <ChevronRight />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Recall queue"
        description="Patients due for follow-up cleanings, checkups, or imaging."
      />
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={list.data?.items}
            isLoading={list.isLoading}
            stickyHeader={false}
            pageSize={20}
            emptyTitle="No recalls due"
            emptyDescription="Patients due for a follow-up will appear here."
            emptyIcon={<CalendarClock />}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

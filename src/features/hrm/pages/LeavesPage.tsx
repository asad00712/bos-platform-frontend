import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { CalendarOff, Check, MoreHorizontal, Plus, X } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

import { formatDate } from '@/shared/lib/format'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useTenant } from '@/shared/hooks/useTenant'
import { useSessionStore } from '@/stores/session.store'
import { routes } from '@/routes/routeMap'

import {
  useCancelLeave,
  useDecideLeave,
  useLeavesList,
} from '../hooks'
import type { Leave } from '../api/hrm.contracts'
import {
  LeaveKindBadge,
  LeaveStatusBadge,
} from '../components/StatusBadges'
import { NewLeaveDialog } from '../components/NewLeaveDialog'

export function LeavesPage() {
  const { tenant } = useTenant()
  const { has } = usePermissions()
  const navigate = useNavigate()
  const user = useSessionStore((s) => s.user)

  const list = useLeavesList(tenant.id)
  const decide = useDecideLeave(tenant.id)
  const cancel = useCancelLeave(tenant.id)

  const canApprove = has('hrm:write')
  const decidedBy =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.email ||
    'Owner'

  const columns: ColumnDef<Leave>[] = [
    {
      accessorKey: 'employeeName',
      header: 'Employee',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => navigate(routes.app.hrm.employee(row.original.employeeId))}
          className="text-start font-medium underline-offset-2 hover:underline"
        >
          {row.original.employeeName}
        </button>
      ),
    },
    {
      accessorKey: 'kind',
      header: 'Type',
      cell: ({ row }) => <LeaveKindBadge kind={row.original.kind} />,
    },
    {
      accessorKey: 'startDate',
      header: 'Dates',
      cell: ({ row }) => (
        <span className="text-sm">
          {formatDate(row.original.startDate, { dateStyle: 'medium' })} →{' '}
          {formatDate(row.original.endDate, { dateStyle: 'medium' })}
        </span>
      ),
    },
    {
      accessorKey: 'days',
      header: () => <div className="text-right">Days</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums">{row.original.days}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <LeaveStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'decidedBy',
      header: 'Decided',
      cell: ({ row }) =>
        row.original.decidedBy ? (
          <div className="space-y-0.5">
            <div className="text-sm">{row.original.decidedBy}</div>
            {row.original.decidedAt ? (
              <div className="text-xs text-muted-foreground">
                {formatDate(row.original.decidedAt, { dateStyle: 'medium' })}
              </div>
            ) : null}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const lv = row.original
        const isPending = lv.status === 'pending'
        const canCancel = lv.status === 'pending' || lv.status === 'approved'
        return (
          <div className="flex items-center justify-end gap-1">
            {canApprove && isPending ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    decide.mutate({ id: lv.id, decision: 'approved', decidedBy })
                  }
                  disabled={decide.isPending}
                >
                  <Check /> Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    decide.mutate({ id: lv.id, decision: 'rejected', decidedBy })
                  }
                  disabled={decide.isPending}
                >
                  <X /> Reject
                </Button>
              </>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigate(routes.app.hrm.employee(lv.employeeId))}
                >
                  Open employee
                </DropdownMenuItem>
                {canCancel && canApprove ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => cancel.mutate(lv.id)}
                    >
                      Cancel leave
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Leaves"
        description={
          list.isLoading
            ? 'Loading…'
            : `${list.data?.items.length ?? 0} leave requests`
        }
        actions={
          canApprove ? (
            <NewLeaveDialog
              trigger={
                <Button>
                  <Plus /> Request leave
                </Button>
              }
            />
          ) : undefined
        }
      />
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={list.data?.items}
            isLoading={list.isLoading}
            stickyHeader={false}
            pageSize={15}
            emptyTitle="No leave requests"
            emptyDescription="Submitted leaves and approvals will show up here."
            emptyIcon={<CalendarOff />}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Clock } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { DataTable } from '@/shared/ui/data-table'
import { formatTime } from '@/shared/lib/format'
import { routes } from '@/routes/routeMap'

import type { AttendanceEntry } from '../api/hrm.contracts'
import { AttendanceStateBadge } from './StatusBadges'

type Props = {
  data: AttendanceEntry[] | undefined
  isLoading?: boolean
}

export function AttendanceTable({ data, isLoading }: Props) {
  const navigate = useNavigate()

  const columns: ColumnDef<AttendanceEntry>[] = [
    {
      accessorKey: 'employeeName',
      header: 'Employee',
      cell: ({ row }) => {
        const e = row.original
        const initials = (e.employeeName.split(' ').map((p) => p[0] ?? '').join('') || '·').toUpperCase()
        return (
          <button
            type="button"
            onClick={() => navigate(routes.app.hrm.employee(e.employeeId))}
            className="flex items-center gap-3 text-start"
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{e.employeeName}</span>
          </button>
        )
      },
    },
    {
      accessorKey: 'state',
      header: 'State',
      cell: ({ row }) => <AttendanceStateBadge state={row.original.state} />,
    },
    {
      accessorKey: 'clockInAt',
      header: 'In',
      cell: ({ row }) =>
        row.original.clockInAt ? (
          <span className="text-sm tabular-nums">{formatTime(row.original.clockInAt)}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: 'clockOutAt',
      header: 'Out',
      cell: ({ row }) =>
        row.original.clockOutAt ? (
          <span className="text-sm tabular-nums">{formatTime(row.original.clockOutAt)}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: 'hoursWorked',
      header: () => <div className="text-right">Hours</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium tabular-nums">
          {row.original.hoursWorked.toFixed(1)}h
        </div>
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ row }) =>
        row.original.notes ? (
          <span className="text-xs text-muted-foreground">{row.original.notes}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      stickyHeader={false}
      pageSize={20}
      emptyTitle="No attendance yet today"
      emptyIcon={<Clock />}
    />
  )
}

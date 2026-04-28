import type { ColumnDef } from '@tanstack/react-table'
import { Users } from 'lucide-react'

import { Panel } from '@/shared/ui/panel'
import { Badge } from '@/shared/ui/badge'
import { DataTable } from '@/shared/ui/data-table'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatCurrency } from '@/shared/lib/format'
import { useRecentClients } from '../hooks'
import type { RecentClient } from '../api/dashboard.contracts'
import type { Widget } from './types'

const STATUS_VARIANT = {
  active: 'default',
  pending: 'secondary',
  paused: 'outline',
} as const

const columns: ColumnDef<RecentClient>[] = [
  {
    accessorKey: 'name',
    header: 'Client',
    cell: ({ row }) => (
      <div className="font-medium">{row.original.name}</div>
    ),
  },
  {
    accessorKey: 'vertical',
    header: 'Vertical',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.vertical}</span>
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
  {
    accessorKey: 'value',
    header: () => <div className="text-right">Value</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.original.value, row.original.currency, {
          maximumFractionDigits: 0,
        })}
      </div>
    ),
  },
]

function RecentClientsTableComponent() {
  const { tenant } = useTenant()
  const query = useRecentClients(tenant.id)

  return (
    <Panel title="Recent clients" flush>
      <DataTable
        columns={columns}
        data={query.data?.items}
        isLoading={query.isLoading}
        noPagination
        stickyHeader={false}
        emptyTitle="No recent clients"
        emptyIcon={<Users />}
        className="p-2"
      />
    </Panel>
  )
}

export const RecentClientsWidget: Widget = {
  id: 'dashboard.recent-clients',
  Component: RecentClientsTableComponent,
  permission: 'crm:read',
  span: { col: 4 },
}

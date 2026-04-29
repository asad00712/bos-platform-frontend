import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight, MoreHorizontal, Trash2, Workflow } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { DataTable } from '@/shared/ui/data-table'
import { formatCurrency, formatRelative } from '@/shared/lib/format'
import { routes } from '@/routes/routeMap'

import { useTenant } from '@/shared/hooks/useTenant'
import { useOwnerLookup } from '@/features/crm/hooks'
import type { Lead } from '@/types/crm'

import { useDeleteLead, useLeadStatuses } from '../hooks'
import { LeadPriorityBadge } from './LeadPriorityBadge'
import { LeadStatusChip } from './LeadStatusChip'

type Props = {
  data: Lead[] | undefined
  isLoading?: boolean
  toolbar?: React.ReactNode
}

export function LeadsTable({ data, isLoading, toolbar }: Props) {
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const remove = useDeleteLead(tenant.id)
  const ownersQ = useOwnerLookup(tenant.id)
  const statusesQ = useLeadStatuses(tenant.id)

  const owners = ownersQ.data ?? []
  const statuses = statusesQ.data ?? []

  const ownerById = (id: string | null) =>
    id ? owners.find((o) => o.userId === id) : undefined
  const statusById = (id: string | null) =>
    id ? statuses.find((s) => s.id === id) : undefined

  const columns: ColumnDef<Lead>[] = [
    {
      accessorKey: 'firstName',
      header: 'Name',
      cell: ({ row }) => {
        const l = row.original
        return (
          <button
            type="button"
            onClick={() => navigate(routes.app.crm.lead(l.id))}
            className="flex items-center gap-3 text-start"
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">
                {(l.firstName[0] ?? '') + (l.lastName?.[0] ?? '')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="font-medium leading-tight">
                {l.firstName} {l.lastName ?? ''}
              </div>
              {l.company ? (
                <div className="text-xs text-muted-foreground">{l.company}</div>
              ) : null}
            </div>
          </button>
        )
      },
    },
    {
      accessorKey: 'statusId',
      header: 'Status',
      cell: ({ row }) => <LeadStatusChip status={statusById(row.original.statusId)} />,
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => <LeadPriorityBadge priority={row.original.priority} />,
    },
    {
      accessorKey: 'estimatedValue',
      header: () => <div className="text-right">Value</div>,
      cell: ({ row }) =>
        row.original.estimatedValue != null ? (
          <div className="text-right font-medium">
            {formatCurrency(row.original.estimatedValue, 'USD', {
              maximumFractionDigits: 0,
            })}
          </div>
        ) : (
          <div className="text-right text-xs text-muted-foreground">—</div>
        ),
    },
    {
      accessorKey: 'ownerUserId',
      header: 'Owner',
      cell: ({ row }) => {
        const owner = ownerById(row.original.ownerUserId)
        return owner ? (
          <span className="text-sm">{owner.name}</span>
        ) : (
          <span className="text-xs text-muted-foreground">Unassigned</span>
        )
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatRelative(row.original.updatedAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const l = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open"
              onClick={() => navigate(routes.app.crm.lead(l.id))}
            >
              <ChevronRight />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More actions">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(routes.app.crm.lead(l.id))}>
                  Open
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => remove.mutate(l.id)}
                >
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      toolbar={toolbar}
      pageSize={10}
      stickyHeader={false}
      emptyTitle="No leads in this branch"
      emptyDescription="Capture an enquiry — the contact gets created on conversion."
      emptyIcon={<Workflow />}
    />
  )
}

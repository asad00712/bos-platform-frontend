import { Link } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Check, Inbox, Pill, X } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatRelative } from '@/shared/lib/format'

import {
  useApproveRefill,
  useDenyRefill,
  useRefillRequests,
} from '../hooks'
import type { RefillRequest } from '../api/medical.contracts'

const STATUS_VARIANT: Record<
  RefillRequest['status'],
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending: 'secondary',
  approved: 'default',
  denied: 'destructive',
  changed: 'outline',
}

export function RefillQueuePage() {
  const { tenant } = useTenant()
  const q = useRefillRequests(tenant.id)
  const approve = useApproveRefill(tenant.id)
  const deny = useDenyRefill(tenant.id)

  const items = q.data?.items ?? []
  const pending = items.filter((r) => r.status === 'pending').length
  const controlledPending = items.filter((r) => r.status === 'pending' && r.controlled).length

  const columns: ColumnDef<RefillRequest>[] = [
    {
      accessorKey: 'patientName',
      header: 'Patient',
      cell: ({ row }) => (
        <Link
          to={`/app/medical/patients/${row.original.patientId}/medications`}
          className="font-medium hover:underline"
        >
          {row.original.patientName}
        </Link>
      ),
    },
    {
      accessorKey: 'medication',
      header: 'Medication',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="break-words font-medium leading-tight">
            {row.original.medication.display}{' '}
            <span className="text-muted-foreground">{row.original.strengthLabel}</span>
          </p>
          {row.original.controlled ? (
            <Badge variant="destructive" className="text-[10px] uppercase">Controlled</Badge>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: 'pharmacyName',
      header: 'Pharmacy',
      cell: ({ row }) => <span className="text-sm">{row.original.pharmacyName}</span>,
    },
    {
      accessorKey: 'receivedAt',
      header: 'Received',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatRelative(row.original.receivedAt)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status]} className="capitalize">
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) =>
        row.original.status === 'pending' ? (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => deny.mutate(row.original.id)}
              disabled={deny.isPending}
            >
              <X /> Deny
            </Button>
            <Button
              size="sm"
              onClick={() => approve.mutate(row.original.id)}
              disabled={approve.isPending}
            >
              <Check /> Approve
            </Button>
          </div>
        ) : (
          <div className="text-end text-xs text-muted-foreground">Resolved</div>
        ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Refill queue"
        description={
          q.isLoading
            ? 'Loading…'
            : `${pending} pending${controlledPending ? ` · ${controlledPending} controlled` : ''}`
        }
        actions={
          <Button asChild variant="outline">
            <Link to="/app/medical/patients">
              <Pill /> Patient list
            </Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={items}
            isLoading={q.isLoading}
            stickyHeader={false}
            emptyTitle="No refill requests"
            emptyDescription="Inbound pharmacy refill requests appear here."
            emptyIcon={<Inbox />}
            noPagination
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

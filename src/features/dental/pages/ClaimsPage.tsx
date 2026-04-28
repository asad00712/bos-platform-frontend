import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight, FileSpreadsheet } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'

import { formatCurrency, formatRelative } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import { useClaimsList } from '../hooks'
import type { Claim } from '../api/dental.contracts'
import { ClaimStatusBadge } from '../components/Badges'

export function ClaimsPage() {
  const { tenant } = useTenant()
  const navigate = useNavigate()
  const list = useClaimsList(tenant.id)

  const columns: ColumnDef<Claim>[] = [
    {
      accessorKey: 'number',
      header: 'Claim',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-medium">{row.original.number}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.insurerName}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'patientName',
      header: 'Patient',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() =>
            navigate(`/app/dental/patients/${row.original.patientId}`)
          }
          className="text-start font-medium underline-offset-2 hover:underline"
        >
          {row.original.patientName}
        </button>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <ClaimStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'billedAmount',
      header: () => <div className="text-right">Billed</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums">
          {formatCurrency(row.original.billedAmount, row.original.currency, {
            maximumFractionDigits: 0,
          })}
        </div>
      ),
    },
    {
      accessorKey: 'approvedAmount',
      header: () => <div className="text-right">Approved</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums">
          {row.original.approvedAmount > 0
            ? formatCurrency(row.original.approvedAmount, row.original.currency, {
                maximumFractionDigits: 0,
              })
            : '—'}
        </div>
      ),
    },
    {
      accessorKey: 'patientPortion',
      header: () => <div className="text-right">Patient</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium tabular-nums">
          {formatCurrency(row.original.patientPortion, row.original.currency, {
            maximumFractionDigits: 0,
          })}
        </div>
      ),
    },
    {
      accessorKey: 'submittedAt',
      header: 'Submitted',
      cell: ({ row }) =>
        row.original.submittedAt ? (
          <span className="text-sm text-muted-foreground">
            {formatRelative(row.original.submittedAt)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">draft</span>
        ),
    },
    {
      id: 'open',
      header: () => <span className="sr-only">Open</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open patient"
            onClick={() =>
              navigate(`/app/dental/patients/${row.original.patientId}`)
            }
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
        title="Insurance claims"
        description="Claim status across all insurers."
      />
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={list.data?.items}
            isLoading={list.isLoading}
            stickyHeader={false}
            pageSize={15}
            emptyTitle="No claims"
            emptyDescription="Claims submitted for this tenant appear here."
            emptyIcon={<FileSpreadsheet />}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

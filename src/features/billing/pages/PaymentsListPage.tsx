import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight, Wallet } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'
import { formatCurrency, formatDate } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'
import { routes } from '@/routes/routeMap'

import { usePaymentList } from '../hooks'
import type { Payment } from '../api/billing.contracts'

const METHOD_LABEL = {
  card: 'Card',
  cash: 'Cash',
  bank_transfer: 'Bank transfer',
  check: 'Check',
  other: 'Other',
} as const

export function PaymentsListPage() {
  const { tenant } = useTenant()
  const navigate = useNavigate()
  const list = usePaymentList(tenant.id)

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'receivedAt',
      header: 'Received',
      cell: ({ row }) => formatDate(row.original.receivedAt, { dateStyle: 'medium' }),
    },
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => navigate(routes.app.billing.invoice(row.original.invoiceId))}
          className="text-start font-medium underline-offset-2 hover:underline"
        >
          {row.original.invoiceNumber}
        </button>
      ),
    },
    {
      accessorKey: 'contactName',
      header: 'Contact',
      cell: ({ row }) =>
        row.original.contactName ?? <span className="text-xs text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }) => METHOD_LABEL[row.original.method],
    },
    {
      accessorKey: 'reference',
      header: 'Reference',
      cell: ({ row }) =>
        row.original.reference ? (
          <span className="text-xs text-muted-foreground">{row.original.reference}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium tabular-nums">
          {formatCurrency(row.original.amount, row.original.currency, {
            maximumFractionDigits: 2,
          })}
        </div>
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
            aria-label="Open invoice"
            onClick={() => navigate(routes.app.billing.invoice(row.original.invoiceId))}
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
        title="Payments"
        description={
          list.isLoading
            ? 'Loading…'
            : `${list.data?.total ?? 0} payments recorded`
        }
      />
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={list.data?.items}
            isLoading={list.isLoading}
            stickyHeader={false}
            pageSize={10}
            emptyTitle="No payments yet"
            emptyDescription="Recorded payments will show up here."
            emptyIcon={<Wallet />}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

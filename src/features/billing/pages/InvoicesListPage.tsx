import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight, Plus, Receipt, Search, X } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { formatCurrency, formatDate } from '@/shared/lib/format'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useTenant } from '@/shared/hooks/useTenant'
import { routes } from '@/routes/routeMap'

import { useInvoiceList } from '../hooks'
import type { Invoice, InvoiceListFilters } from '../api/billing.contracts'
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge'
import { NewInvoiceDialog } from '../components/NewInvoiceDialog'

const STATUS_OPTIONS: { label: string; value: InvoiceListFilters['status'] | 'all' }[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Partial', value: 'partial' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Void', value: 'void' },
]

export function InvoicesListPage() {
  const { tenant } = useTenant()
  const { has } = usePermissions()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<InvoiceListFilters>({})
  const debouncedSearch = useDebouncedValue(filters.search ?? '', 250)

  const queryFilters = useMemo<InvoiceListFilters>(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch],
  )

  const list = useInvoiceList(tenant.id, queryFilters)
  const canWrite = has('billing:write')

  const columns: ColumnDef<Invoice>[] = useMemo(
    () => [
      {
        accessorKey: 'number',
        header: 'Invoice',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => navigate(routes.app.billing.invoice(row.original.id))}
            className="text-start"
          >
            <div className="font-medium">{row.original.number}</div>
            <div className="text-xs text-muted-foreground">
              Issued {formatDate(row.original.issuedAt, { dateStyle: 'medium' })}
            </div>
          </button>
        ),
      },
      {
        accessorKey: 'contactName',
        header: 'Contact',
        cell: ({ row }) =>
          row.original.contactName ? (
            <span className="text-sm">{row.original.contactName}</span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'dueAt',
        header: 'Due',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.dueAt, { dateStyle: 'medium' })}
          </span>
        ),
      },
      {
        accessorKey: 'total',
        header: () => <div className="text-right">Total</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium tabular-nums">
            {formatCurrency(row.original.total, row.original.currency, {
              maximumFractionDigits: 0,
            })}
          </div>
        ),
      },
      {
        accessorKey: 'amountDue',
        header: () => <div className="text-right">Outstanding</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium tabular-nums">
            {formatCurrency(row.original.amountDue, row.original.currency, {
              maximumFractionDigits: 0,
            })}
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open"
              onClick={() => navigate(routes.app.billing.invoice(row.original.id))}
            >
              <ChevronRight />
            </Button>
          </div>
        ),
      },
    ],
    [navigate],
  )

  const total = list.data?.total ?? 0
  const isFiltered =
    Boolean(filters.search) || Boolean(filters.status) || Boolean(filters.contactId)

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="w-full sm:max-w-xs">
        <InputGroupAddon align="inline-start">
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search by number or contact…"
          value={filters.search ?? ''}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </InputGroup>
      <Select
        value={filters.status ?? 'all'}
        onValueChange={(v) =>
          setFilters({
            ...filters,
            status: v === 'all' ? undefined : (v as InvoiceListFilters['status']),
          })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={String(o.value)}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isFiltered ? (
        <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
          <X /> Clear
        </Button>
      ) : null}
    </div>
  )

  return (
    <PageContainer>
      <PageHeader
        title="Invoices"
        description={
          list.isLoading
            ? 'Loading invoices…'
            : `${total} ${total === 1 ? 'invoice' : 'invoices'}`
        }
        actions={
          canWrite ? (
            <NewInvoiceDialog
              trigger={
                <Button>
                  <Plus /> New invoice
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
            toolbar={toolbar}
            stickyHeader={false}
            pageSize={10}
            emptyTitle="No invoices match"
            emptyDescription="Create your first invoice to start billing."
            emptyIcon={<Receipt />}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

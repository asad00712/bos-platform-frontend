import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { CheckCircle2, FileText, Receipt, Search, X } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
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
import { useTenant } from '@/shared/hooks/useTenant'

import { useClaims } from '../hooks'
import type { Claim } from '../api/medical.contracts'

type Filter = Claim['status'] | 'all' | 'open'

const FILTER_OPTIONS: { value: Filter; label: string }[] = [
  { value: 'open', label: 'Open (submitted + denied)' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partial' },
  { value: 'denied', label: 'Denied' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'draft', label: 'Draft' },
  { value: 'all', label: 'All claims' },
]

const STATUS_VARIANT: Record<Claim['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'outline',
  submitted: 'secondary',
  paid: 'default',
  partial: 'secondary',
  denied: 'destructive',
  rejected: 'destructive',
}

export function BillingWorklistPage() {
  const { tenant } = useTenant()
  const q = useClaims(tenant.id)
  const [filter, setFilter] = useState<Filter>('open')
  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search, 200)

  const items = useMemo(() => {
    let list = q.data?.items ?? []
    if (filter === 'open') list = list.filter((c) => c.status === 'submitted' || c.status === 'denied')
    else if (filter !== 'all') list = list.filter((c) => c.status === filter)
    if (debounced) {
      const needle = debounced.toLowerCase()
      list = list.filter(
        (c) =>
          c.patientName.toLowerCase().includes(needle) ||
          (c.payor ?? '').toLowerCase().includes(needle) ||
          c.id.toLowerCase().includes(needle),
      )
    }
    return list
  }, [q.data, filter, debounced])

  const totals = q.data?.totals ?? { arDays: 0, outstanding: 0, paid30d: 0, denialRate: 0 }
  const currency = tenant.currency ?? 'USD'

  const columns: ColumnDef<Claim>[] = [
    {
      accessorKey: 'id',
      header: 'Claim',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <Link
            to={`/app/medical/billing/${row.original.id}`}
            className="font-mono text-xs hover:underline"
          >
            {row.original.id}
          </Link>
          <p className="text-xs text-muted-foreground">
            {formatDate(row.original.serviceDate, { dateStyle: 'medium' })}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'patientName',
      header: 'Patient',
      cell: ({ row }) => (
        <Link
          to={`/app/medical/patients/${row.original.patientId}`}
          className="font-medium hover:underline"
        >
          {row.original.patientName}
        </Link>
      ),
    },
    {
      accessorKey: 'payor',
      header: 'Payor',
      cell: ({ row }) => row.original.payor ?? <span className="text-xs text-muted-foreground">Self-pay</span>,
    },
    {
      accessorKey: 'totalCharge',
      header: () => <div className="text-right">Charge</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium tabular-nums">
          {formatCurrency(row.original.totalCharge, currency, { maximumFractionDigits: 0 })}
        </div>
      ),
    },
    {
      accessorKey: 'totalPaid',
      header: () => <div className="text-right">Paid</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums text-emerald-600 dark:text-emerald-400">
          {row.original.totalPaid > 0
            ? formatCurrency(row.original.totalPaid, currency, { maximumFractionDigits: 0 })
            : '—'}
        </div>
      ),
    },
    {
      id: 'outstanding',
      header: () => <div className="text-right">Outstanding</div>,
      cell: ({ row }) => {
        const out = row.original.totalCharge - row.original.totalPaid
        return (
          <div className="text-right font-semibold tabular-nums">
            {out > 0 ? formatCurrency(out, currency, { maximumFractionDigits: 0 }) : '—'}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <Badge variant={STATUS_VARIANT[row.original.status]} className="capitalize">
            {row.original.status}
          </Badge>
          {row.original.denialReason ? (
            <p className="break-words text-xs text-rose-600 dark:text-rose-400">
              {row.original.denialReason}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      id: 'open',
      header: () => <span className="sr-only">Open</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button asChild size="sm" variant="outline">
            <Link to={`/app/medical/billing/${row.original.id}`}>Open</Link>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Billing"
        description={
          q.isLoading
            ? 'Loading…'
            : `${q.data?.items.length ?? 0} claims · ${(totals.denialRate * 100).toFixed(0)}% denial rate · ${totals.arDays}-day AR`
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi
          label="Outstanding"
          value={formatCurrency(totals.outstanding, currency, { maximumFractionDigits: 0 })}
          tone="text-amber-700 dark:text-amber-400"
        />
        <Kpi
          label="Paid (30d)"
          value={formatCurrency(totals.paid30d, currency, { maximumFractionDigits: 0 })}
          tone="text-emerald-700 dark:text-emerald-400"
        />
        <Kpi label="AR days" value={String(totals.arDays)} tone="text-muted-foreground" />
        <Kpi
          label="Denial rate"
          value={`${(totals.denialRate * 100).toFixed(0)}%`}
          tone={totals.denialRate > 0.1 ? 'text-rose-700 dark:text-rose-400' : 'text-muted-foreground'}
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={items}
            isLoading={q.isLoading}
            stickyHeader={false}
            pageSize={15}
            emptyTitle="No claims match"
            emptyDescription="Try a wider filter."
            emptyIcon={<Receipt />}
            toolbar={
              <div className="flex flex-wrap items-center gap-2">
                <InputGroup className="w-full sm:max-w-xs">
                  <InputGroupAddon align="inline-start">
                    <Search className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Search patient, payor, or ID…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
                <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTER_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(search || filter !== 'open') ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearch('')
                      setFilter('open')
                    }}
                  >
                    <X /> Reset
                  </Button>
                ) : null}
              </div>
            }
          />
        </CardContent>
      </Card>

      {totals.denialRate <= 0.1 && totals.outstanding > 0 ? (
        <p className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-3.5" /> Denial rate within target.
        </p>
      ) : null}
      <p className="text-[11px] text-muted-foreground">
        <FileText className="me-1 inline size-3" /> Build a new superbill from any signed encounter
        via the Encounter detail page.
      </p>
    </PageContainer>
  )
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone ?? ''}`}>{value}</p>
      </CardContent>
    </Card>
  )
}

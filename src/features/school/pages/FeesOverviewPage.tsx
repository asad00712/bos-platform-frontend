import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Receipt, Search } from 'lucide-react'

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
import { useTenant } from '@/shared/hooks/useTenant'

import type { FeeStatus, StudentFeeRow } from '../api/school.contracts'
import { FeeStatusBadge } from '../components/Badges'
import { useCollectFee, useStudentFees } from '../hooks'

const STATUS_OPTIONS: { label: string; value: FeeStatus | 'all' }[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Partial', value: 'partial' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Waived', value: 'waived' },
]

export function FeesOverviewPage() {
  const { tenant } = useTenant()
  const q = useStudentFees(tenant.id)
  const collect = useCollectFee(tenant.id)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<FeeStatus | 'all'>('all')
  const debounced = useDebouncedValue(search, 200)

  const rows = useMemo<StudentFeeRow[]>(() => {
    let list = q.data?.items ?? []
    if (status !== 'all') list = list.filter((r) => r.status === status)
    if (debounced) {
      const needle = debounced.toLowerCase()
      list = list.filter(
        (r) =>
          r.studentName.toLowerCase().includes(needle) ||
          r.feeStructureName.toLowerCase().includes(needle),
      )
    }
    return list
  }, [q.data, debounced, status])

  const columns: ColumnDef<StudentFeeRow>[] = [
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <Link
            to={`/app/school/students/${row.original.studentId}`}
            className="font-medium hover:underline"
          >
            {row.original.studentName}
          </Link>
          <p className="text-xs text-muted-foreground">
            {row.original.className} · {row.original.sectionName}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'feeStructureName',
      header: 'Fee',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{row.original.feeStructureName}</p>
          <p className="text-xs text-muted-foreground">{row.original.termName}</p>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums">
          {formatCurrency(row.original.amount, row.original.currency, {
            maximumFractionDigits: 0,
          })}
        </div>
      ),
    },
    {
      accessorKey: 'paid',
      header: () => <div className="text-right">Paid</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums text-emerald-600 dark:text-emerald-400">
          {formatCurrency(row.original.paid, row.original.currency, {
            maximumFractionDigits: 0,
          })}
        </div>
      ),
    },
    {
      accessorKey: 'outstanding',
      header: () => <div className="text-right">Outstanding</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium tabular-nums">
          {row.original.outstanding > 0
            ? formatCurrency(row.original.outstanding, row.original.currency, {
                maximumFractionDigits: 0,
              })
            : '—'}
        </div>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.original.dueDate, { dateStyle: 'medium' })}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <FeeStatusBadge status={row.original.status} />,
    },
    {
      id: 'collect',
      header: () => <span className="sr-only">Collect</span>,
      cell: ({ row }) =>
        row.original.outstanding > 0 ? (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              disabled={collect.isPending}
              onClick={() => collect.mutate(row.original.id)}
            >
              Collect
            </Button>
          </div>
        ) : (
          <div className="text-end text-xs text-muted-foreground">Cleared</div>
        ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Fees"
        description="Term-wise student fee tracking"
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/app/school/fees/structures">Fee structures</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app/school/fees/scholarships">Scholarships</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiBox
          label="Expected"
          value={q.data?.totals.expected ?? 0}
          currency={q.data?.totals.currency ?? 'USD'}
        />
        <KpiBox
          label="Collected"
          value={q.data?.totals.collected ?? 0}
          currency={q.data?.totals.currency ?? 'USD'}
          tone="text-emerald-600 dark:text-emerald-400"
        />
        <KpiBox
          label="Outstanding"
          value={q.data?.totals.outstanding ?? 0}
          currency={q.data?.totals.currency ?? 'USD'}
          tone="text-amber-600 dark:text-amber-400"
        />
        <KpiBox
          label="Overdue"
          value={q.data?.totals.overdue ?? 0}
          currency={q.data?.totals.currency ?? 'USD'}
          tone="text-rose-600 dark:text-rose-400"
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={rows}
            isLoading={q.isLoading}
            stickyHeader={false}
            pageSize={15}
            emptyTitle="No fee records"
            emptyDescription="Issue fee structures to populate this list."
            emptyIcon={<Receipt />}
            toolbar={
              <div className="flex flex-wrap items-center gap-2">
                <InputGroup className="w-full sm:max-w-xs">
                  <InputGroupAddon align="inline-start">
                    <Search className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Search student or fee…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as FeeStatus | 'all')}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={String(o.value)}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

function KpiBox({
  label,
  value,
  currency,
  tone,
}: {
  label: string
  value: number
  currency: string
  tone?: string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className={`mt-1 text-xl font-semibold tabular-nums ${tone ?? ''}`}>
          {formatCurrency(value, currency, { maximumFractionDigits: 0 })}
        </p>
      </CardContent>
    </Card>
  )
}

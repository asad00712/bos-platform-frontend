import type { ColumnDef } from '@tanstack/react-table'
import { Wallet } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'

import { formatCurrency } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import type { FeeStructure } from '../api/school.contracts'
import { useFeeStructures } from '../hooks'

const FREQUENCY_LABEL: Record<FeeStructure['frequency'], string> = {
  one_time: 'One-time',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  termly: 'Termly',
  annual: 'Annual',
}

export function FeeStructuresPage() {
  const { tenant } = useTenant()
  const q = useFeeStructures(tenant.id)

  const columns: ColumnDef<FeeStructure>[] = [
    {
      accessorKey: 'name',
      header: 'Fee',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'className',
      header: 'Applies to',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.className ?? 'All classes'}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium tabular-nums">
          {formatCurrency(row.original.amount, row.original.currency, {
            maximumFractionDigits: 0,
          })}
        </div>
      ),
    },
    {
      accessorKey: 'frequency',
      header: 'Frequency',
      cell: ({ row }) => (
        <Badge variant="outline">
          {FREQUENCY_LABEL[row.original.frequency]}
        </Badge>
      ),
    },
    {
      accessorKey: 'lateFee',
      header: () => <div className="text-right">Late fee</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums">
          {row.original.lateFee > 0
            ? formatCurrency(row.original.lateFee, row.original.currency, {
                maximumFractionDigits: 0,
              })
            : '—'}
        </div>
      ),
    },
    {
      accessorKey: 'dueDay',
      header: 'Due day',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.dueDay ? `${ord(row.original.dueDay)} of cycle` : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'studentsAssigned',
      header: 'Students',
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.studentsAssigned}</span>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Fee structures"
        description={
          q.isLoading
            ? 'Loading…'
            : `${q.data?.items.length ?? 0} structures defined`
        }
        breadcrumbs={[
          { label: 'Fees', href: '/app/school/fees' },
          { label: 'Structures' },
        ]}
      />
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={q.data?.items}
            isLoading={q.isLoading}
            stickyHeader={false}
            emptyTitle="No fee structures"
            emptyDescription="Define structures to issue term fees to students."
            emptyIcon={<Wallet />}
            noPagination
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

function ord(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

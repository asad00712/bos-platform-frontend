import type { ColumnDef } from '@tanstack/react-table'
import { ListChecks } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'

import { formatCurrency } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import { useProcedureCodes } from '../hooks'
import type { ProcedureCode } from '../api/dental.contracts'

export function ProcedureCodesPage() {
  const { tenant } = useTenant()
  const query = useProcedureCodes(tenant.id)

  const columns: ColumnDef<ProcedureCode>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono text-xs uppercase tracking-wider">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
    },
    {
      accessorKey: 'defaultFee',
      header: () => <div className="text-right">Default fee</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums">
          {formatCurrency(row.original.defaultFee, 'USD', { maximumFractionDigits: 0 })}
        </div>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Procedure codes"
        description="CDT codes used in treatment plans, procedures, and claims."
      />
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={query.data?.items}
            isLoading={query.isLoading}
            stickyHeader={false}
            pageSize={20}
            emptyTitle="No codes"
            emptyIcon={<ListChecks />}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

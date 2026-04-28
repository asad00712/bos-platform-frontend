import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Activity } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'

import { formatDateTime, formatRelative } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import { useRuns } from '../hooks'
import type { Run } from '../api/automation.contracts'
import { RunStatusBadge } from '../components/Badges'

export function RunsPage() {
  const { tenant } = useTenant()
  const navigate = useNavigate()
  const list = useRuns(tenant.id)

  const columns: ColumnDef<Run>[] = [
    {
      accessorKey: 'startedAt',
      header: 'Started',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="text-sm">{formatRelative(row.original.startedAt)}</div>
          <div className="text-[11px] text-muted-foreground">
            {formatDateTime(row.original.startedAt)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'workflowName',
      header: 'Workflow',
      cell: ({ row }) => (
        <Button
          variant="link"
          className="h-auto px-0"
          onClick={() => navigate(`/app/automation/${row.original.workflowId}`)}
        >
          {row.original.workflowName}
        </Button>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <RunStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'triggeredBy',
      header: 'Triggered by',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.triggeredBy}
        </span>
      ),
    },
    {
      accessorKey: 'durationMs',
      header: () => <div className="text-right">Duration</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums">
          {row.original.durationMs > 0
            ? `${(row.original.durationMs / 1000).toFixed(1)}s`
            : '—'}
        </div>
      ),
    },
    {
      accessorKey: 'error',
      header: 'Error',
      cell: ({ row }) =>
        row.original.error ? (
          <span className="text-xs text-destructive">{row.original.error}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Run history"
        description="Every workflow execution across your tenant."
        breadcrumbs={[
          { label: 'Automations', href: '/app/automation' },
          { label: 'Runs' },
        ]}
      />
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={list.data?.items}
            isLoading={list.isLoading}
            stickyHeader={false}
            pageSize={20}
            emptyTitle="No runs yet"
            emptyDescription="Workflows that have fired will appear here."
            emptyIcon={<Activity />}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

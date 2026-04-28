import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight, Plus, Search, Workflow as WorkflowIcon, X } from 'lucide-react'

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

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatPercent, formatRelative } from '@/shared/lib/format'

import { useWorkflowList } from '../hooks'
import type {
  Workflow,
  WorkflowFilters,
} from '../api/automation.contracts'
import {
  TriggerKindBadge,
  WorkflowStatusBadge,
} from '../components/Badges'
import { NewWorkflowDialog } from '../components/NewWorkflowDialog'

const STATUS_OPTIONS: { label: string; value: WorkflowFilters['status'] | 'all' }[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Draft', value: 'draft' },
]

export function WorkflowsListPage() {
  const { tenant } = useTenant()
  const { has } = usePermissions()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<WorkflowFilters>({})
  const debouncedSearch = useDebouncedValue(filters.search ?? '', 250)
  const queryFilters = useMemo<WorkflowFilters>(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch],
  )
  const list = useWorkflowList(tenant.id, queryFilters)
  const canWrite = has('automation:write')

  const columns: ColumnDef<Workflow>[] = [
    {
      accessorKey: 'name',
      header: 'Workflow',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => navigate(`/app/automation/${row.original.id}`)}
          className="text-start"
        >
          <div className="font-medium leading-tight">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.description || '—'}
          </div>
        </button>
      ),
    },
    {
      accessorKey: 'trigger',
      header: 'Trigger',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <TriggerKindBadge kind={row.original.trigger.kind} />
          <div className="text-xs text-muted-foreground">{row.original.trigger.label}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <WorkflowStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'runs30d',
      header: () => <div className="text-right">30d runs</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums">{row.original.runs30d}</div>
      ),
    },
    {
      accessorKey: 'successRate',
      header: () => <div className="text-right">Success</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums">
          {row.original.runs30d === 0 ? '—' : formatPercent(row.original.successRate, 0)}
        </div>
      ),
    },
    {
      accessorKey: 'lastRunAt',
      header: 'Last run',
      cell: ({ row }) =>
        row.original.lastRunAt ? (
          <span className="text-sm text-muted-foreground">
            {formatRelative(row.original.lastRunAt)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">never</span>
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
            aria-label="Open"
            onClick={() => navigate(`/app/automation/${row.original.id}`)}
          >
            <ChevronRight />
          </Button>
        </div>
      ),
    },
  ]

  const isFiltered = Boolean(filters.search) || Boolean(filters.status)
  const total = list.data?.total ?? 0

  return (
    <PageContainer>
      <PageHeader
        title="Automations"
        description={
          list.isLoading
            ? 'Loading…'
            : `${total} ${total === 1 ? 'workflow' : 'workflows'}`
        }
        actions={
          canWrite ? (
            <NewWorkflowDialog
              trigger={
                <Button>
                  <Plus /> New workflow
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
            stickyHeader={false}
            pageSize={10}
            emptyTitle="No workflows match"
            emptyDescription="Try adjusting filters or create a new workflow."
            emptyIcon={<WorkflowIcon />}
            toolbar={
              <div className="flex flex-wrap items-center gap-2">
                <InputGroup className="w-full sm:max-w-xs">
                  <InputGroupAddon align="inline-start">
                    <Search className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Search workflows…"
                    value={filters.search ?? ''}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </InputGroup>
                <Select
                  value={filters.status ?? 'all'}
                  onValueChange={(v) =>
                    setFilters({
                      ...filters,
                      status: v === 'all' ? undefined : (v as WorkflowFilters['status']),
                    })
                  }
                >
                  <SelectTrigger className="w-[150px]">
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
            }
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

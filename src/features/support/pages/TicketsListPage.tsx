import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight, LifeBuoy, Plus, Search, X } from 'lucide-react'

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
import { useTenant } from '@/shared/hooks/useTenant'
import { formatRelative } from '@/shared/lib/format'

import { useTicketList } from '../hooks'
import type {
  Ticket,
  TicketFilters,
} from '../api/support.contracts'
import { NewTicketDialog } from '../components/NewTicketDialog'
import { TicketPriorityBadge, TicketStatusBadge } from '../components/Badges'

const STATUS_OPTIONS: { label: string; value: TicketFilters['status'] | 'all' }[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Waiting', value: 'waiting' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
]

const PRIORITY_OPTIONS: { label: string; value: TicketFilters['priority'] | 'all' }[] = [
  { label: 'All priorities', value: 'all' },
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]

export function TicketsListPage() {
  const { tenant } = useTenant()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<TicketFilters>({})
  const debouncedSearch = useDebouncedValue(filters.search ?? '', 250)
  const queryFilters = useMemo<TicketFilters>(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch],
  )
  const list = useTicketList(tenant.id, queryFilters)

  const columns: ColumnDef<Ticket>[] = [
    {
      accessorKey: 'subject',
      header: 'Ticket',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => navigate(`/app/support/tickets/${row.original.id}`)}
          className="text-start"
        >
          <div className="font-medium leading-tight">{row.original.subject}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.number} · {row.original.category}
          </div>
        </button>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <TicketStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => <TicketPriorityBadge priority={row.original.priority} />,
    },
    {
      accessorKey: 'replyCount',
      header: 'Replies',
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.replyCount}</span>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatRelative(row.original.updatedAt)}
        </span>
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
            onClick={() => navigate(`/app/support/tickets/${row.original.id}`)}
          >
            <ChevronRight />
          </Button>
        </div>
      ),
    },
  ]

  const isFiltered =
    Boolean(filters.search) || Boolean(filters.status) || Boolean(filters.priority)
  const total = list.data?.total ?? 0

  return (
    <PageContainer>
      <PageHeader
        title="Tickets"
        description={
          list.isLoading
            ? 'Loading…'
            : `${total} ${total === 1 ? 'ticket' : 'tickets'}`
        }
        breadcrumbs={[
          { label: 'Support', href: '/app/support' },
          { label: 'Tickets' },
        ]}
        actions={
          <NewTicketDialog
            trigger={
              <Button>
                <Plus /> New ticket
              </Button>
            }
          />
        }
      />
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={list.data?.items}
            isLoading={list.isLoading}
            stickyHeader={false}
            pageSize={15}
            emptyTitle="No tickets match"
            emptyDescription="When you open a ticket it'll show up here."
            emptyIcon={<LifeBuoy />}
            toolbar={
              <div className="flex flex-wrap items-center gap-2">
                <InputGroup className="w-full sm:max-w-xs">
                  <InputGroupAddon align="inline-start">
                    <Search className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Search by number, subject, category…"
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
                      status: v === 'all' ? undefined : (v as TicketFilters['status']),
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
                <Select
                  value={filters.priority ?? 'all'}
                  onValueChange={(v) =>
                    setFilters({
                      ...filters,
                      priority: v === 'all' ? undefined : (v as TicketFilters['priority']),
                    })
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((o) => (
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

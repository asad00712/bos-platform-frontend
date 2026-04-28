import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Search, ShieldCheck, X } from 'lucide-react'

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

import { useTenant } from '@/shared/hooks/useTenant'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { formatDateTime, formatRelative } from '@/shared/lib/format'

import { useAuditList } from '../hooks'
import type {
  AuditAction,
  AuditEntry,
  AuditFilters,
  AuditResource,
} from '../api/audit.contracts'

const ACTION_VARIANT: Record<AuditAction, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  create: 'default',
  update: 'secondary',
  delete: 'destructive',
  view: 'outline',
  login: 'secondary',
  logout: 'outline',
  permission_change: 'destructive',
  export: 'outline',
  invite: 'secondary',
}

const ACTION_LABEL: Record<AuditAction, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  view: 'Viewed',
  login: 'Logged in',
  logout: 'Logged out',
  permission_change: 'Permission change',
  export: 'Exported',
  invite: 'Invited',
}

const ACTION_OPTIONS: { label: string; value: AuditAction | 'all' }[] = [
  { label: 'All actions', value: 'all' },
  { label: 'Created', value: 'create' },
  { label: 'Updated', value: 'update' },
  { label: 'Deleted', value: 'delete' },
  { label: 'Viewed', value: 'view' },
  { label: 'Logged in', value: 'login' },
  { label: 'Logged out', value: 'logout' },
  { label: 'Permission change', value: 'permission_change' },
  { label: 'Exported', value: 'export' },
  { label: 'Invited', value: 'invite' },
]

const RESOURCE_OPTIONS: { label: string; value: AuditResource | 'all' }[] = [
  { label: 'All resources', value: 'all' },
  { label: 'Contacts', value: 'contact' },
  { label: 'Appointments', value: 'appointment' },
  { label: 'Invoices', value: 'invoice' },
  { label: 'Payments', value: 'payment' },
  { label: 'Employees', value: 'employee' },
  { label: 'Documents', value: 'document' },
  { label: 'Messages', value: 'message' },
  { label: 'Roles', value: 'role' },
  { label: 'Tenant', value: 'tenant' },
  { label: 'Sessions', value: 'session' },
  { label: 'System', value: 'system' },
]

export function AuditLogPage() {
  const { tenant } = useTenant()
  const [filters, setFilters] = useState<AuditFilters>({})
  const debouncedSearch = useDebouncedValue(filters.search ?? '', 250)
  const queryFilters = useMemo<AuditFilters>(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch],
  )
  const list = useAuditList(tenant.id, queryFilters)

  const columns: ColumnDef<AuditEntry>[] = [
    {
      accessorKey: 'occurredAt',
      header: 'When',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="text-sm">{formatRelative(row.original.occurredAt)}</div>
          <div className="text-[11px] text-muted-foreground">
            {formatDateTime(row.original.occurredAt)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <Badge variant={ACTION_VARIANT[row.original.action]}>
          {ACTION_LABEL[row.original.action]}
        </Badge>
      ),
    },
    {
      accessorKey: 'resource',
      header: 'Resource',
      cell: ({ row }) => (
        <span className="text-sm capitalize">{row.original.resource}</span>
      ),
    },
    {
      accessorKey: 'summary',
      header: 'Summary',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.summary}</span>
      ),
    },
    {
      accessorKey: 'actorName',
      header: 'Actor',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="text-sm font-medium">{row.original.actorName}</div>
          {row.original.actorEmail ? (
            <div className="text-[11px] text-muted-foreground">
              {row.original.actorEmail}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP',
      cell: ({ row }) =>
        row.original.ipAddress ? (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.ipAddress}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ]

  const isFiltered =
    Boolean(filters.search) || Boolean(filters.action) || Boolean(filters.resource)
  const total = list.data?.total ?? 0

  return (
    <PageContainer>
      <PageHeader
        title="Audit log"
        description={
          list.isLoading
            ? 'Loading…'
            : `${total} ${total === 1 ? 'event' : 'events'}`
        }
      />
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={list.data?.items}
            isLoading={list.isLoading}
            stickyHeader={false}
            pageSize={20}
            emptyTitle="No audit events match"
            emptyDescription="Try adjusting your filters or widening the time range."
            emptyIcon={<ShieldCheck />}
            toolbar={
              <div className="flex flex-wrap items-center gap-2">
                <InputGroup className="w-full sm:max-w-xs">
                  <InputGroupAddon align="inline-start">
                    <Search className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Search summary, actor, resource…"
                    value={filters.search ?? ''}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </InputGroup>
                <Select
                  value={filters.action ?? 'all'}
                  onValueChange={(v) =>
                    setFilters({
                      ...filters,
                      action: v === 'all' ? undefined : (v as AuditAction),
                    })
                  }
                >
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={String(o.value)}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.resource ?? 'all'}
                  onValueChange={(v) =>
                    setFilters({
                      ...filters,
                      resource: v === 'all' ? undefined : (v as AuditResource),
                    })
                  }
                >
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="Resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_OPTIONS.map((o) => (
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

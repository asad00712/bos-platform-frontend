import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight, Plus, Search, Users, X } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
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

import { formatDate } from '@/shared/lib/format'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useTenant } from '@/shared/hooks/useTenant'
import { routes } from '@/routes/routeMap'

import { useEmployeeList } from '../hooks'
import type { Employee, EmployeeListFilters } from '../api/hrm.contracts'
import { EmployeeStatusBadge } from '../components/StatusBadges'
import { NewEmployeeDialog } from '../components/NewEmployeeDialog'

const STATUS_OPTIONS: { label: string; value: EmployeeListFilters['status'] | 'all' }[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'On leave', value: 'on_leave' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Terminated', value: 'terminated' },
]

export function EmployeesListPage() {
  const { tenant } = useTenant()
  const { has } = usePermissions()
  const navigate = useNavigate()

  const [filters, setFilters] = useState<EmployeeListFilters>({})
  const debouncedSearch = useDebouncedValue(filters.search ?? '', 250)
  const queryFilters = useMemo<EmployeeListFilters>(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch],
  )

  const list = useEmployeeList(tenant.id, queryFilters)
  const canWrite = has('hrm:write')

  const columns: ColumnDef<Employee>[] = useMemo(
    () => [
      {
        accessorKey: 'firstName',
        header: 'Employee',
        cell: ({ row }) => {
          const e = row.original
          const initials = `${e.firstName[0] ?? ''}${e.lastName[0] ?? ''}`.toUpperCase()
          return (
            <button
              type="button"
              onClick={() => navigate(routes.app.hrm.employee(e.id))}
              className="flex items-center gap-3 text-start"
            >
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <div className="font-medium leading-tight">
                  {e.firstName} {e.lastName}
                </div>
                {e.email ? (
                  <div className="text-xs text-muted-foreground">{e.email}</div>
                ) : null}
              </div>
            </button>
          )
        },
      },
      {
        accessorKey: 'jobTitle',
        header: 'Role',
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <div className="text-sm">{row.original.jobTitle}</div>
            <div className="text-xs text-muted-foreground">{row.original.department}</div>
          </div>
        ),
      },
      {
        accessorKey: 'employmentType',
        header: 'Type',
        cell: ({ row }) => (
          <span className="text-sm capitalize">
            {row.original.employmentType.replace('_', ' ')}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <EmployeeStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'startDate',
        header: 'Started',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.startDate, { dateStyle: 'medium' })}
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
              onClick={() => navigate(routes.app.hrm.employee(row.original.id))}
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
    Boolean(filters.search) || Boolean(filters.status) || Boolean(filters.department)

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="w-full sm:max-w-xs">
        <InputGroupAddon align="inline-start">
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search by name, email, role…"
          value={filters.search ?? ''}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </InputGroup>
      <Select
        value={filters.status ?? 'all'}
        onValueChange={(v) =>
          setFilters({
            ...filters,
            status: v === 'all' ? undefined : (v as EmployeeListFilters['status']),
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
        title="Team"
        description={
          list.isLoading
            ? 'Loading…'
            : `${total} ${total === 1 ? 'employee' : 'employees'}`
        }
        actions={
          canWrite ? (
            <NewEmployeeDialog
              trigger={
                <Button>
                  <Plus /> Add employee
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
            emptyTitle="No employees match"
            emptyDescription="Try adjusting your filters or add a new team member."
            emptyIcon={<Users />}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

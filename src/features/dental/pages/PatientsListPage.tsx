import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import {
  ChevronRight,
  Plus,
  Search,
  Smile,
  X,
} from 'lucide-react'

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

import { formatCurrency, formatRelative } from '@/shared/lib/format'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useTenant } from '@/shared/hooks/useTenant'

import { usePatientList } from '../hooks'
import type {
  Patient,
  PatientListFilters,
} from '../api/dental.contracts'
import { PatientStatusBadge } from '../components/Badges'
import { NewPatientDialog } from '../components/NewPatientDialog'

const STATUS_OPTIONS: { label: string; value: PatientListFilters['status'] | 'all' }[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Recall due', value: 'recall_due' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Archived', value: 'archived' },
]

export function PatientsListPage() {
  const { tenant } = useTenant()
  const { has } = usePermissions()
  const navigate = useNavigate()

  const [filters, setFilters] = useState<PatientListFilters>({})
  const debouncedSearch = useDebouncedValue(filters.search ?? '', 250)
  const queryFilters = useMemo<PatientListFilters>(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch],
  )
  const list = usePatientList(tenant.id, queryFilters)
  const canWrite = has('dental:write')

  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: 'firstName',
      header: 'Patient',
      cell: ({ row }) => {
        const p = row.original
        const initials = `${p.firstName[0] ?? ''}${p.lastName[0] ?? ''}`.toUpperCase()
        return (
          <button
            type="button"
            onClick={() => navigate(`/app/dental/patients/${p.id}`)}
            className="flex items-center gap-3 text-start"
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="font-medium leading-tight">
                {p.firstName} {p.lastName}
              </div>
              <div className="text-xs text-muted-foreground">
                {p.chartNumber}
                {p.dateOfBirth ? ` · DOB ${p.dateOfBirth}` : ''}
              </div>
            </div>
          </button>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <PatientStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'insurer',
      header: 'Insurer',
      cell: ({ row }) =>
        row.original.insurer ? (
          <span className="text-sm">{row.original.insurer}</span>
        ) : (
          <span className="text-xs text-muted-foreground">Self-pay</span>
        ),
    },
    {
      accessorKey: 'primaryDentistName',
      header: 'Dentist',
      cell: ({ row }) =>
        row.original.primaryDentistName ?? (
          <span className="text-xs text-muted-foreground">Unassigned</span>
        ),
    },
    {
      accessorKey: 'lastVisitAt',
      header: 'Last visit',
      cell: ({ row }) =>
        row.original.lastVisitAt ? (
          <span className="text-sm text-muted-foreground">
            {formatRelative(row.original.lastVisitAt)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">never</span>
        ),
    },
    {
      accessorKey: 'outstandingBalance',
      header: () => <div className="text-right">Outstanding</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium tabular-nums">
          {row.original.outstandingBalance > 0
            ? formatCurrency(row.original.outstandingBalance, row.original.currency, {
                maximumFractionDigits: 0,
              })
            : '—'}
        </div>
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
            onClick={() => navigate(`/app/dental/patients/${row.original.id}`)}
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
        title="Patients"
        description={
          list.isLoading
            ? 'Loading…'
            : `${total} ${total === 1 ? 'patient' : 'patients'}`
        }
        actions={
          canWrite ? (
            <NewPatientDialog
              trigger={
                <Button>
                  <Plus /> New patient
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
            emptyTitle="No patients match"
            emptyDescription="Try adjusting filters or admit a new patient."
            emptyIcon={<Smile />}
            toolbar={
              <div className="flex flex-wrap items-center gap-2">
                <InputGroup className="w-full sm:max-w-xs">
                  <InputGroupAddon align="inline-start">
                    <Search className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Search by name, chart number, email…"
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
                      status: v === 'all' ? undefined : (v as PatientListFilters['status']),
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
            }
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

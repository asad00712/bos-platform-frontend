import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight, Search, ShieldAlert, Stethoscope, X } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
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

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatDate } from '@/shared/lib/format'
import { BidiCode } from '@/shared/lib/bidi'

import { usePatientList, usePractitioners } from '../hooks'
import type { Patient, PatientListFilters } from '../api/medical.contracts'

const FLAG_OPTIONS: { label: string; value: PatientListFilters['flag'] | 'all' }[] = [
  { label: 'All flags', value: 'all' },
  { label: 'VIP', value: 'vip' },
  { label: 'High-risk allergy', value: 'allergy_high' },
  { label: 'DNR', value: 'dnr' },
  { label: 'Fall risk', value: 'fall_risk' },
  { label: 'Interpreter needed', value: 'interpreter_needed' },
  { label: 'Sensitive', value: 'sensitive_record' },
]

export function PatientsListPage() {
  const { tenant } = useTenant()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<PatientListFilters>({})
  const debounced = useDebouncedValue(filters.search ?? '', 250)
  const queryFilters = useMemo<PatientListFilters>(
    () => ({ ...filters, search: debounced || undefined }),
    [filters, debounced],
  )
  const list = usePatientList(tenant.id, queryFilters)
  const practitioners = usePractitioners(tenant.id)

  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: 'name',
      header: 'Patient',
      cell: ({ row }) => {
        const p = row.original
        const initials = `${p.name.given[0] ?? ''}${p.name.family[0] ?? ''}`.toUpperCase()
        return (
          <button
            type="button"
            className="flex items-center gap-3 text-start"
            onClick={() => navigate(`/app/medical/patients/${p.id}`)}
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <p className="font-medium leading-tight">
                {p.name.preferred ?? p.name.given} {p.name.family}
              </p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <BidiCode>{p.mrn}</BidiCode>
                <span>·</span>
                <span className="capitalize">{p.sexAtBirth}</span>
              </p>
            </div>
          </button>
        )
      },
    },
    {
      accessorKey: 'dateOfBirth',
      header: 'DOB',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.original.dateOfBirth, { dateStyle: 'medium' })}
        </span>
      ),
    },
    {
      id: 'flags',
      header: 'Flags',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.flags.length === 0 ? (
            <span className="text-xs text-muted-foreground">—</span>
          ) : (
            row.original.flags.map((f) => (
              <Badge
                key={f}
                variant={f === 'allergy_high' || f === 'dnr' ? 'destructive' : 'outline'}
                className="text-[10px] uppercase"
              >
                {f.replace('_', ' ')}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      accessorKey: 'preferredLanguage',
      header: 'Language',
      cell: ({ row }) => (
        <span className="text-xs">
          {row.original.preferredLanguage}
          {row.original.interpreterNeeded ? (
            <Badge variant="outline" className="ms-1 text-[10px]">interpreter</Badge>
          ) : null}
        </span>
      ),
    },
    {
      accessorKey: 'primaryProviderId',
      header: 'PCP',
      cell: ({ row }) => {
        const p = practitioners.data?.find((x) => x.id === row.original.primaryProviderId)
        return p ? (
          <span className="text-sm">
            Dr. {p.firstName} {p.lastName}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Unassigned</span>
        )
      },
    },
    {
      id: 'open',
      header: () => <span className="sr-only">Open</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open chart"
            onClick={() => navigate(`/app/medical/patients/${row.original.id}`)}
          >
            <ChevronRight />
          </Button>
        </div>
      ),
    },
  ]

  const isFiltered = Boolean(filters.search) || Boolean(filters.flag) || Boolean(filters.primaryProviderId)
  const total = list.data?.total ?? 0

  return (
    <PageContainer>
      <PageHeader
        title="Patients"
        description={list.isLoading ? 'Loading…' : `${total} ${total === 1 ? 'patient' : 'patients'}`}
        actions={
          <Button>
            <Stethoscope /> New patient
          </Button>
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
            emptyTitle="No patients match"
            emptyDescription="Try adjusting filters or admit a new patient."
            emptyIcon={<ShieldAlert />}
            toolbar={
              <div className="flex flex-wrap items-center gap-2">
                <InputGroup className="w-full sm:max-w-xs">
                  <InputGroupAddon align="inline-start">
                    <Search className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Search by name, MRN, phone, email…"
                    value={filters.search ?? ''}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </InputGroup>
                <Select
                  value={filters.flag ?? 'all'}
                  onValueChange={(v) =>
                    setFilters({
                      ...filters,
                      flag: v === 'all' ? undefined : (v as PatientListFilters['flag']),
                    })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Flag" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLAG_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={String(o.value)}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.primaryProviderId ?? 'all'}
                  onValueChange={(v) =>
                    setFilters({
                      ...filters,
                      primaryProviderId: v === 'all' ? undefined : v,
                    })
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All providers</SelectItem>
                    {practitioners.data?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        Dr. {p.firstName} {p.lastName}
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

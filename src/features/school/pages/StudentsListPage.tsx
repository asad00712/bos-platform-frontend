import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight, GraduationCap, Plus, Search, X } from 'lucide-react'

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

import { formatCurrency, formatPercent } from '@/shared/lib/format'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useTenant } from '@/shared/hooks/useTenant'

import type {
  Student,
  StudentListFilters,
  StudentStatus,
} from '../api/school.contracts'
import { StudentStatusBadge } from '../components/Badges'
import { NewStudentDialog } from '../components/NewStudentDialog'
import { useClassesList, useStudentList } from '../hooks'

const STATUS_OPTIONS: { label: string; value: StudentStatus | 'all' }[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Enrolled', value: 'enrolled' },
  { label: 'On leave', value: 'on_leave' },
  { label: 'Graduated', value: 'graduated' },
  { label: 'Withdrawn', value: 'withdrawn' },
  { label: 'Suspended', value: 'suspended' },
]

export function StudentsListPage() {
  const { tenant } = useTenant()
  const { has } = usePermissions()
  const navigate = useNavigate()

  const [filters, setFilters] = useState<StudentListFilters>({})
  const debounced = useDebouncedValue(filters.search ?? '', 250)
  const queryFilters = useMemo<StudentListFilters>(
    () => ({ ...filters, search: debounced || undefined }),
    [filters, debounced],
  )

  const list = useStudentList(tenant.id, queryFilters)
  const classesQ = useClassesList(tenant.id)
  const canWrite = has('school:write')

  const sectionsForClass =
    classesQ.data?.items.find((c) => c.id === filters.classId)?.sections ?? []

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'firstName',
      header: 'Student',
      cell: ({ row }) => {
        const s = row.original
        const initials = `${s.firstName[0] ?? ''}${s.lastName[0] ?? ''}`.toUpperCase()
        return (
          <button
            type="button"
            onClick={() => navigate(`/app/school/students/${s.id}`)}
            className="flex items-center gap-3 text-start"
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="font-medium leading-tight">
                {s.firstName} {s.lastName}
              </div>
              <div className="text-xs text-muted-foreground">
                {s.admissionNumber} · Roll {s.rollNumber}
              </div>
            </div>
          </button>
        )
      },
    },
    {
      accessorKey: 'className',
      header: 'Class',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.className} · {row.original.sectionName}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StudentStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'primaryParentName',
      header: 'Guardian',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="text-sm">{row.original.primaryParentName}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.primaryParentPhone ?? '—'}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'attendanceRate',
      header: 'Attendance',
      cell: ({ row }) => {
        const r = row.original.attendanceRate
        const tone =
          r >= 0.9
            ? 'text-emerald-600 dark:text-emerald-400'
            : r >= 0.75
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-rose-600 dark:text-rose-400'
        return (
          <span className={`text-sm font-medium tabular-nums ${tone}`}>
            {formatPercent(r, 0)}
          </span>
        )
      },
    },
    {
      accessorKey: 'outstandingFees',
      header: () => <div className="text-right">Outstanding</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums">
          {row.original.outstandingFees > 0 ? (
            <span className="font-medium text-rose-600 dark:text-rose-400">
              {formatCurrency(row.original.outstandingFees, row.original.currency, {
                maximumFractionDigits: 0,
              })}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
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
            onClick={() => navigate(`/app/school/students/${row.original.id}`)}
          >
            <ChevronRight />
          </Button>
        </div>
      ),
    },
  ]

  const isFiltered =
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    Boolean(filters.classId) ||
    Boolean(filters.sectionId)
  const total = list.data?.total ?? 0

  return (
    <PageContainer>
      <PageHeader
        title="Students"
        description={
          list.isLoading
            ? 'Loading…'
            : `${total} ${total === 1 ? 'student' : 'students'}`
        }
        actions={
          canWrite ? (
            <NewStudentDialog
              trigger={
                <Button>
                  <Plus /> Admit student
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
            pageSize={15}
            emptyTitle="No students match"
            emptyDescription="Adjust filters or admit a new student."
            emptyIcon={<GraduationCap />}
            toolbar={
              <div className="flex flex-wrap items-center gap-2">
                <InputGroup className="w-full sm:max-w-xs">
                  <InputGroupAddon align="inline-start">
                    <Search className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Name, admission number, parent…"
                    value={filters.search ?? ''}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </InputGroup>
                <Select
                  value={filters.classId ?? 'all'}
                  onValueChange={(v) =>
                    setFilters({
                      ...filters,
                      classId: v === 'all' ? undefined : v,
                      sectionId: undefined,
                    })
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All classes</SelectItem>
                    {classesQ.data?.items.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filters.classId ? (
                  <Select
                    value={filters.sectionId ?? 'all'}
                    onValueChange={(v) =>
                      setFilters({
                        ...filters,
                        sectionId: v === 'all' ? undefined : v,
                      })
                    }
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All sections</SelectItem>
                      {sectionsForClass.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          Section {s.sectionName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
                <Select
                  value={filters.status ?? 'all'}
                  onValueChange={(v) =>
                    setFilters({
                      ...filters,
                      status: v === 'all' ? undefined : (v as StudentStatus),
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

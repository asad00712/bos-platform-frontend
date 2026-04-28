import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { CalendarClock, Mail, Phone, Search, Users } from 'lucide-react'

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

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatDate, formatRelative } from '@/shared/lib/format'

import { useRecalls } from '../hooks'
import type { RecallEntry } from '../api/medical.contracts'

type StatusFilter = RecallEntry['status'] | 'all' | 'open'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'open', label: 'Open (overdue + due)' },
  { value: 'overdue', label: 'Overdue only' },
  { value: 'due', label: 'Due now' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'all', label: 'All recalls' },
]

const STATUS_TONE: Record<RecallEntry['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
  upcoming: 'outline',
  due: 'default',
  overdue: 'destructive',
  fulfilled: 'secondary',
}

export function RecallsPage() {
  const { tenant } = useTenant()
  const q = useRecalls(tenant.id)
  const [filter, setFilter] = useState<StatusFilter>('open')
  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search, 200)

  const items = useMemo(() => {
    let list = q.data?.items ?? []
    if (filter === 'open') list = list.filter((r) => r.status === 'overdue' || r.status === 'due')
    else if (filter !== 'all') list = list.filter((r) => r.status === filter)
    if (debounced) {
      const needle = debounced.toLowerCase()
      list = list.filter(
        (r) =>
          r.patientName.toLowerCase().includes(needle) ||
          r.reason.toLowerCase().includes(needle),
      )
    }
    return list
  }, [q.data, filter, debounced])

  const totals = useMemo(() => {
    const all = q.data?.items ?? []
    return {
      overdue: all.filter((r) => r.status === 'overdue').length,
      due: all.filter((r) => r.status === 'due').length,
      upcoming: all.filter((r) => r.status === 'upcoming').length,
    }
  }, [q.data])

  const columns: ColumnDef<RecallEntry>[] = [
    {
      accessorKey: 'patientName',
      header: 'Patient',
      cell: ({ row }) => (
        <Link
          to={`/app/medical/patients/${row.original.patientId}`}
          className="font-medium hover:underline"
        >
          {row.original.patientName}
        </Link>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => <span className="break-words">{row.original.reason}</span>,
    },
    {
      accessorKey: 'dueDate',
      header: 'Due',
      cell: ({ row }) => (
        <div className="text-xs">
          <p className="font-medium tabular-nums">
            {formatDate(row.original.dueDate, { dateStyle: 'medium' })}
          </p>
          <p className="text-muted-foreground">{formatRelative(row.original.dueDate)}</p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={STATUS_TONE[row.original.status]} className="capitalize">
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'outreach',
      header: () => <div className="text-right">Outreach</div>,
      cell: () => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" aria-label="Send email">
            <Mail />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Place call">
            <Phone />
          </Button>
          <Button variant="outline" size="sm">
            Mark contacted
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Recalls"
        description={
          q.isLoading
            ? 'Loading…'
            : `${totals.overdue} overdue · ${totals.due} due · ${totals.upcoming} upcoming`
        }
        actions={
          <Button asChild variant="outline">
            <Link to="/app/medical/patients">
              <Users /> Patients
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Overdue" value={totals.overdue} tone="text-rose-700 dark:text-rose-400" />
        <Kpi label="Due now" value={totals.due} tone="text-amber-700 dark:text-amber-400" />
        <Kpi label="Upcoming" value={totals.upcoming} tone="text-muted-foreground" />
        <Kpi label="Total tracked" value={q.data?.items.length ?? 0} tone="text-muted-foreground" />
      </div>

      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={items}
            isLoading={q.isLoading}
            stickyHeader={false}
            pageSize={15}
            emptyTitle="No recalls match"
            emptyDescription="Try a wider filter or a different search."
            emptyIcon={<CalendarClock />}
            toolbar={
              <div className="flex flex-wrap items-center gap-2">
                <InputGroup className="w-full sm:max-w-xs">
                  <InputGroupAddon align="inline-start">
                    <Search className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Search patient or reason…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
                <Select value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone ?? ''}`}>{value}</p>
      </CardContent>
    </Card>
  )
}

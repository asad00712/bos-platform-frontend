import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertOctagon, FileSignature, Inbox, Microscope, Search, X } from 'lucide-react'

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
import { formatRelative } from '@/shared/lib/format'

import { useLabInbox } from '../hooks'
import type { LabInboxItem } from '../api/medical.contracts'
import { AbnormalFlag } from '../components/AbnormalFlag'

type FilterMode = 'all' | 'unsigned' | 'critical' | 'abnormal'

const FILTER_OPTIONS: { value: FilterMode; label: string }[] = [
  { value: 'all', label: 'All results' },
  { value: 'unsigned', label: 'Unsigned' },
  { value: 'critical', label: 'Critical' },
  { value: 'abnormal', label: 'Abnormal' },
]

export function LabInboxPage() {
  const { tenant } = useTenant()
  const navigate = useNavigate()
  const q = useLabInbox(tenant.id)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterMode>('unsigned')
  const debounced = useDebouncedValue(search, 200)

  const filtered = useMemo<LabInboxItem[]>(() => {
    let list = q.data?.items ?? []
    if (filter === 'unsigned') list = list.filter((i) => !i.signedAt)
    if (filter === 'critical') list = list.filter((i) => i.hasCritical)
    if (filter === 'abnormal') list = list.filter((i) => i.worstFlag !== 'N')
    if (debounced) {
      const needle = debounced.toLowerCase()
      list = list.filter(
        (i) =>
          i.patientName.toLowerCase().includes(needle) ||
          i.panelDisplay.toLowerCase().includes(needle),
      )
    }
    return list
  }, [q.data, debounced, filter])

  const columns: ColumnDef<LabInboxItem>[] = [
    {
      accessorKey: 'patientName',
      header: 'Patient',
      cell: ({ row }) => (
        <Link
          to={`/app/medical/patients/${row.original.patientId}/labs`}
          className="font-medium hover:underline"
        >
          {row.original.patientName}
        </Link>
      ),
    },
    {
      accessorKey: 'panelDisplay',
      header: 'Panel',
      cell: ({ row }) => <span className="break-words">{row.original.panelDisplay}</span>,
    },
    {
      accessorKey: 'worstFlag',
      header: 'Flag',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <AbnormalFlag flag={row.original.worstFlag} />
          {row.original.hasCritical ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
              <AlertOctagon className="size-3.5" /> Critical
            </span>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'effectiveDateTime',
      header: 'Reported',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatRelative(row.original.effectiveDateTime)}
        </span>
      ),
    },
    {
      accessorKey: 'signedAt',
      header: 'Sign',
      cell: ({ row }) =>
        row.original.signedAt ? (
          <span className="text-xs text-muted-foreground">
            Signed {formatRelative(row.original.signedAt)}
          </span>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <FileSignature className="size-3" /> Awaiting
          </Badge>
        ),
    },
    {
      id: 'open',
      header: () => <span className="sr-only">Open</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/app/medical/labs/${row.original.reportId}`)}
          >
            Open
          </Button>
        </div>
      ),
    },
  ]

  const totals = q.data?.totals ?? { unread: 0, critical: 0, abnormal: 0 }

  return (
    <PageContainer>
      <PageHeader
        title="Lab inbox"
        description={
          q.isLoading
            ? 'Loading…'
            : `${totals.unread} awaiting sign · ${totals.abnormal} abnormal · ${totals.critical} critical`
        }
        actions={
          <Button asChild variant="outline">
            <Link to="/app/medical/patients">
              <Microscope /> Patient list
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCell label="Awaiting sign" value={totals.unread} tone="text-amber-700 dark:text-amber-400" />
        <KpiCell label="Critical" value={totals.critical} tone="text-rose-700 dark:text-rose-400" />
        <KpiCell label="Abnormal" value={totals.abnormal} tone="text-amber-600 dark:text-amber-300" />
        <KpiCell
          label="Total in queue"
          value={q.data?.items.length ?? 0}
          tone="text-muted-foreground"
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={filtered}
            isLoading={q.isLoading}
            stickyHeader={false}
            pageSize={15}
            emptyTitle="Inbox empty"
            emptyDescription="No results match the current filter."
            emptyIcon={<Inbox />}
            toolbar={
              <div className="flex flex-wrap items-center gap-2">
                <InputGroup className="w-full sm:max-w-xs">
                  <InputGroupAddon align="inline-start">
                    <Search className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Search patient or panel…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
                <Select value={filter} onValueChange={(v) => setFilter(v as FilterMode)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTER_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {search || filter !== 'unsigned' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearch('')
                      setFilter('unsigned')
                    }}
                  >
                    <X /> Reset
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

function KpiCell({ label, value, tone }: { label: string; value: number; tone?: string }) {
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

import { useMemo, useState } from 'react'
import { Eye, ShieldAlert } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group'
import { Search } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatDateTime } from '@/shared/lib/format'

import { useAuditEvents } from '../../hooks'
import type { AuditEvent } from '../../api/medical.contracts'

const ACTION_LABEL: Record<AuditEvent['action'], string> = {
  chart_open: 'Opened chart',
  patient_view: 'Viewed patient',
  note_save_draft: 'Saved note draft',
  note_sign: 'Signed note',
  rx_sign: 'Signed prescription',
  order_sign: 'Signed order',
  result_sign: 'Signed result',
  allergy_add: 'Added allergy',
  patient_export: 'Exported chart',
  break_glass_open: 'Opened emergency access',
  break_glass_close: 'Closed emergency access',
}

type Filter = 'all' | 'break_glass' | 'export' | 'sign'

export function AuditOverviewPage() {
  const { tenant } = useTenant()
  const q = useAuditEvents(tenant.id)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const debounced = useDebouncedValue(search, 200)

  const items = useMemo(() => {
    let list = q.data?.items ?? []
    if (filter === 'break_glass') list = list.filter((e) => e.breakGlass)
    if (filter === 'export') list = list.filter((e) => e.action === 'patient_export')
    if (filter === 'sign')
      list = list.filter((e) =>
        ['note_sign', 'rx_sign', 'order_sign', 'result_sign'].includes(e.action),
      )
    if (debounced) {
      const needle = debounced.toLowerCase()
      list = list.filter(
        (e) =>
          (e.actorName ?? '').toLowerCase().includes(needle) ||
          (e.patientName ?? '').toLowerCase().includes(needle),
      )
    }
    return list
  }, [q.data, filter, debounced])

  const breakGlassCount = (q.data?.items ?? []).filter((e) => e.breakGlass).length
  const last7d = useMemo(() => {
    const since = Date.now() - 7 * 86_400_000
    return (q.data?.items ?? []).filter((e) => new Date(e.occurredAt).getTime() >= since)
      .length
  }, [q.data])

  return (
    <PageContainer>
      <PageHeader
        title="Audit overview"
        description="Tenant-wide PHI access log. Privacy officer review queue."
        breadcrumbs={[
          { label: 'Medical', href: '/app/medical/patients' },
          { label: 'Audit' },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Events (7 days)" value={last7d} />
        <Kpi
          label="Break-glass"
          value={breakGlassCount}
          tone={breakGlassCount > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-muted-foreground'}
        />
        <Kpi label="Total events" value={q.data?.items.length ?? 0} />
        <Kpi label="Tenant" value={tenant.name} />
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <InputGroup className="w-full sm:max-w-xs">
              <InputGroupAddon align="inline-start">
                <Search className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search actor or patient…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                <SelectItem value="break_glass">Break-glass only</SelectItem>
                <SelectItem value="sign">Signing actions</SelectItem>
                <SelectItem value="export">Exports</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {q.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No audit events match.
            </p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {items.slice(0, 80).map((e) => (
                <li
                  key={e.id}
                  className={`flex flex-wrap items-center gap-2 rounded-md border p-2.5 ${
                    e.breakGlass ? 'border-rose-500/40 bg-rose-500/5' : ''
                  }`}
                >
                  {e.breakGlass ? (
                    <ShieldAlert className="size-4 text-rose-500" aria-label="Break-glass" />
                  ) : (
                    <Eye className="size-4 text-muted-foreground" aria-hidden />
                  )}
                  <span className="font-medium">{e.actorName}</span>
                  <span className="text-muted-foreground">
                    {ACTION_LABEL[e.action] ?? e.action}
                  </span>
                  {e.patientName ? (
                    <span className="font-medium">{e.patientName}</span>
                  ) : null}
                  {e.breakGlass ? <Badge variant="destructive">Break-glass</Badge> : null}
                  <span className="ms-auto text-xs text-muted-foreground">
                    {formatDateTime(e.occurredAt)} · {e.ip}
                  </span>
                  {e.reason ? (
                    <p className="w-full pt-1 text-xs italic text-muted-foreground">
                      Reason: {e.reason}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

function Kpi({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
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

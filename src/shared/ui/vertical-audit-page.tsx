import { useMemo, useState } from 'react'
import { Eye, Search, ShieldAlert } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
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
import { Skeleton } from '@/shared/ui/skeleton'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { formatDateTime } from '@/shared/lib/format'

/**
 * Generic audit-overview page used by every vertical (medical already
 * has a bespoke one with break-glass; dental + school + others render
 * through this shared shell). Pass a fetched event list and the page
 * owns search / filter / display.
 *
 * Keeps event shape minimal so callers can adapt their own model.
 */

export type VerticalAuditEvent = {
  id: string
  actorName: string
  /** Human label for the action — e.g. "Opened patient chart". */
  action: string
  /** Subject of the action (patient/student name, claim id, etc). */
  subjectName?: string | null
  /** Subject type label — used as a filter chip. */
  subjectType?: string
  occurredAt: string
  ip?: string
  /** When true, row is tinted rose and treated as privileged. */
  privileged?: boolean
  /** Free-text reason — only set when the action required justification. */
  reason?: string | null
}

type Props = {
  title: string
  description: string
  breadcrumbs?: { label: string; href?: string }[]
  events: VerticalAuditEvent[]
  isLoading?: boolean
  /** Optional subject-type filter options. Auto-derived from events when not given. */
  subjectTypes?: string[]
}

export function VerticalAuditPage({
  title,
  description,
  breadcrumbs,
  events,
  isLoading,
  subjectTypes,
}: Props) {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string>('all')
  const debounced = useDebouncedValue(search, 200)

  const allTypes = useMemo(() => {
    if (subjectTypes) return subjectTypes
    return Array.from(new Set(events.map((e) => e.subjectType).filter(Boolean) as string[]))
  }, [events, subjectTypes])

  const filtered = useMemo(() => {
    let list = events
    if (type !== 'all') list = list.filter((e) => e.subjectType === type)
    if (debounced) {
      const needle = debounced.toLowerCase()
      list = list.filter(
        (e) =>
          e.actorName.toLowerCase().includes(needle) ||
          (e.subjectName ?? '').toLowerCase().includes(needle) ||
          e.action.toLowerCase().includes(needle),
      )
    }
    return list
  }, [events, type, debounced])

  const privileged = events.filter((e) => e.privileged).length
  const last7d = useMemo(() => {
    const since = Date.now() - 7 * 86_400_000
    return events.filter((e) => new Date(e.occurredAt).getTime() >= since).length
  }, [events])

  return (
    <PageContainer>
      <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Events (7 days)" value={last7d} />
        <Kpi
          label="Privileged"
          value={privileged}
          tone={privileged > 0 ? 'text-rose-700 dark:text-rose-400' : ''}
        />
        <Kpi label="Total events" value={events.length} />
        <Kpi label="Subjects" value={allTypes.length} />
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <InputGroup className="w-full sm:max-w-xs">
              <InputGroupAddon align="inline-start">
                <Search className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search actor, subject, or action…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            {allTypes.length > 0 ? (
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subject types</SelectItem>
                  {allTypes.map((tt) => (
                    <SelectItem key={tt} value={tt}>
                      {tt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No audit events match the filter.
            </p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {filtered.slice(0, 100).map((e) => (
                <li
                  key={e.id}
                  className={`flex flex-wrap items-center gap-2 rounded-md border p-2.5 ${
                    e.privileged ? 'border-rose-500/40 bg-rose-500/5' : ''
                  }`}
                >
                  {e.privileged ? (
                    <ShieldAlert className="size-4 text-rose-500" aria-label="Privileged" />
                  ) : (
                    <Eye className="size-4 text-muted-foreground" aria-hidden />
                  )}
                  <span className="font-medium">{e.actorName}</span>
                  <span className="text-muted-foreground">{e.action}</span>
                  {e.subjectName ? (
                    <span className="font-medium">{e.subjectName}</span>
                  ) : null}
                  {e.subjectType ? (
                    <Badge variant="outline" className="capitalize">
                      {e.subjectType}
                    </Badge>
                  ) : null}
                  {e.privileged ? <Badge variant="destructive">Privileged</Badge> : null}
                  <span className="ms-auto text-xs text-muted-foreground">
                    {formatDateTime(e.occurredAt)}
                    {e.ip ? ` · ${e.ip}` : ''}
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

function Kpi({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone ?? ''}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

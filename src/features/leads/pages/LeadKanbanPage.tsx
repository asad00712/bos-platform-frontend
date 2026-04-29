import { useMemo } from 'react'
import { Link } from 'react-router'
import { LayoutGrid, List, Plus } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { formatCurrency } from '@/shared/lib/format'

import { useTenant } from '@/shared/hooks/useTenant'
import { useHasPermission } from '@/shared/auth/useHasPermission'
import { useOwnerLookup } from '@/features/crm/hooks'
import type { Lead, LeadStatus } from '@/types/crm'
import { routes } from '@/routes/routeMap'

import { useLeadsList, useLeadStatuses, useSetLeadStatus } from '../hooks'
import { LeadPriorityBadge } from '../components/LeadPriorityBadge'
import { NewLeadDialog } from '../components/NewLeadDialog'

export function LeadKanbanPage() {
  const { tenant } = useTenant()
  const canCreate = useHasPermission('tenant:leads:create')
  const canMove = useHasPermission('tenant:leads:update')

  const list = useLeadsList(tenant.id, {})
  const statusesQ = useLeadStatuses(tenant.id)
  const ownersQ = useOwnerLookup(tenant.id)
  const setStatus = useSetLeadStatus(tenant.id)

  const statuses = useMemo(
    () => (statusesQ.data ?? []).filter((s) => s.isActive),
    [statusesQ.data],
  )
  const leadsByStatus = useMemo(() => {
    const map = new Map<string, Lead[]>()
    statuses.forEach((s) => map.set(s.id, []))
    map.set('__none__', [])
    ;(list.data?.items ?? []).forEach((l) => {
      const key = l.statusId ?? '__none__'
      const bucket = map.get(key)
      if (bucket) bucket.push(l)
      else map.set(key, [l])
    })
    return map
  }, [list.data, statuses])

  const owners = ownersQ.data ?? []

  return (
    <PageContainer>
      <PageHeader
        title="Lead pipeline"
        description="Drag-free kanban — change status from each card."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={routes.app.crm.leads()}>
                <List /> List
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={routes.app.crm.leadStatuses()}>Pipeline statuses</Link>
            </Button>
            {canCreate ? (
              <NewLeadDialog
                trigger={
                  <Button>
                    <Plus /> New lead
                  </Button>
                }
              />
            ) : null}
          </div>
        }
      />

      {list.isLoading || statusesQ.isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {statuses.map((s) => (
            <KanbanColumn
              key={s.id}
              status={s}
              leads={leadsByStatus.get(s.id) ?? []}
              statuses={statuses}
              owners={owners}
              canMove={canMove}
              onChangeStatus={(leadId, statusId) =>
                setStatus.mutate({ id: leadId, statusId })
              }
            />
          ))}
          {(leadsByStatus.get('__none__')?.length ?? 0) > 0 ? (
            <KanbanColumn
              status={null}
              leads={leadsByStatus.get('__none__') ?? []}
              statuses={statuses}
              owners={owners}
              canMove={canMove}
              onChangeStatus={(leadId, statusId) =>
                setStatus.mutate({ id: leadId, statusId })
              }
            />
          ) : null}
        </div>
      )}

      <p className="hidden">
        <LayoutGrid />
      </p>
    </PageContainer>
  )
}

function KanbanColumn({
  status,
  leads,
  statuses,
  owners,
  canMove,
  onChangeStatus,
}: {
  status: LeadStatus | null
  leads: Lead[]
  statuses: LeadStatus[]
  owners: { userId: string; name: string }[]
  canMove: boolean
  onChangeStatus: (leadId: string, statusId: string) => void
}) {
  const accent = status?.color ?? 'oklch(0.7 0.05 260)'
  const total = leads.reduce((s, l) => s + (l.estimatedValue ?? 0), 0)
  const ownerById = (id: string | null) =>
    id ? owners.find((o) => o.userId === id) : undefined

  return (
    <div className="flex flex-col rounded-lg border bg-muted/30 p-2">
      <div className="flex items-center justify-between gap-2 px-1.5 py-1">
        <div className="inline-flex items-center gap-2 min-w-0">
          <span
            className="size-1.5 rounded-full shrink-0"
            style={{ background: accent }}
          />
          <p className="truncate text-sm font-medium">
            {status?.name ?? 'No status'}
          </p>
          <span className="text-[11px] text-muted-foreground">
            {leads.length}
          </span>
        </div>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {formatCurrency(total, 'USD', { maximumFractionDigits: 0 })}
        </span>
      </div>
      <div className="space-y-2 px-0.5 pb-1">
        {leads.length === 0 ? (
          <div className="rounded-md border border-dashed bg-background/50 px-2 py-6 text-center text-[11px] text-muted-foreground">
            No leads
          </div>
        ) : (
          leads.map((l) => {
            const owner = ownerById(l.ownerUserId)
            return (
              <Card key={l.id} data-surface="flat">
                <CardContent className="space-y-2 p-3">
                  <Link
                    to={routes.app.crm.lead(l.id)}
                    className="block min-w-0 hover:underline"
                  >
                    <p className="truncate text-sm font-medium">
                      {l.firstName} {l.lastName ?? ''}
                    </p>
                    {l.company ? (
                      <p className="truncate text-[11px] text-muted-foreground">
                        {l.company}
                      </p>
                    ) : null}
                  </Link>
                  <div className="flex items-center justify-between gap-2">
                    <LeadPriorityBadge priority={l.priority} />
                    {l.estimatedValue != null ? (
                      <span className="text-[11px] font-medium tabular-nums">
                        {formatCurrency(l.estimatedValue, 'USD', {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] text-muted-foreground">
                      {owner?.name ?? 'Unassigned'}
                    </span>
                    {canMove ? (
                      <Select
                        value={l.statusId ?? ''}
                        onValueChange={(v) => onChangeStatus(l.id, v)}
                      >
                        <SelectTrigger
                          size="sm"
                          className="h-6 px-1.5 text-[11px]"
                          aria-label="Move to status"
                        >
                          <SelectValue placeholder="Move…" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  ChevronLeft,
  Hammer,
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
  Workflow as WorkflowIcon,
} from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

import { formatDateTime, formatPercent, formatRelative } from '@/shared/lib/format'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useTenant } from '@/shared/hooks/useTenant'

import {
  useDeleteWorkflow,
  useRuns,
  useSetWorkflowStatus,
  useWorkflow,
} from '../hooks'
import {
  RunStatusBadge,
  TriggerKindBadge,
  WorkflowStatusBadge,
} from '../components/Badges'

export function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const { has } = usePermissions()

  const query = useWorkflow(tenant.id, id)
  const runs = useRuns(tenant.id, id)
  const setStatus = useSetWorkflowStatus(tenant.id)
  const remove = useDeleteWorkflow(tenant.id)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const canWrite = has('automation:write')

  if (query.isLoading || !query.data) {
    return (
      <PageContainer>
        <PageHeader title="Loading…" />
        <Card>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <PageHeader title="Workflow" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <WorkflowIcon />
            </EmptyMedia>
            <EmptyTitle>Workflow not found</EmptyTitle>
            <EmptyDescription>
              {(query.error as Error)?.message ?? 'It may have been removed.'}
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to="/app/automation">
              <ChevronLeft /> Back to automations
            </Link>
          </Button>
        </Empty>
      </PageContainer>
    )
  }

  const w = query.data
  const handleDelete = async () => {
    await remove.mutateAsync(w.id)
    setDeleteOpen(false)
    navigate('/app/automation')
  }

  return (
    <PageContainer>
      <PageHeader
        title={w.name}
        description={w.description || undefined}
        breadcrumbs={[
          { label: 'Automations', href: '/app/automation' },
          { label: w.name },
        ]}
        actions={
          canWrite ? (
            <>
              {w.status === 'active' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatus.mutate({ id: w.id, status: 'paused' })}
                  disabled={setStatus.isPending}
                >
                  <Pause /> Pause
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setStatus.mutate({ id: w.id, status: 'active' })}
                  disabled={setStatus.isPending}
                >
                  <Play /> Activate
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="More">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setStatus.mutate({ id: w.id, status: 'draft' })}
                  >
                    Mark as draft
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 /> Delete workflow
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-5 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <WorkflowStatusBadge status={w.status} />
              <TriggerKindBadge kind={w.trigger.kind} />
              <span className="text-xs text-muted-foreground">{w.trigger.label}</span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Steps ({w.steps.length})
              </p>
              {w.steps.length === 0 ? (
                <Empty className="py-10">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Hammer />
                    </EmptyMedia>
                    <EmptyTitle>No steps yet</EmptyTitle>
                    <EmptyDescription>
                      The visual builder ships in Phase 9. For now, steps are read-only.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <ol className="space-y-2">
                  {w.steps.map((s, i) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-3 rounded-md border bg-card/50 px-3 py-2"
                    >
                      <span className="grid size-6 place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {i + 1}
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{s.label}</p>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {s.kind}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              30-day stats
            </p>
            <Stat label="Runs" value={String(w.runs30d)} />
            <Stat
              label="Success rate"
              value={w.runs30d === 0 ? '—' : formatPercent(w.successRate, 0)}
            />
            <Stat
              label="Last run"
              value={w.lastRunAt ? formatRelative(w.lastRunAt) : 'never'}
            />
            <Stat label="Created" value={formatDateTime(w.createdAt)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Recent runs
          </p>
          {runs.isLoading || !runs.data ? (
            <Skeleton className="h-32 w-full" />
          ) : runs.data.items.length === 0 ? (
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyTitle>No runs yet</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Started</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Triggered by</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.data.items.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="text-sm">{formatRelative(r.startedAt)}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {formatDateTime(r.startedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <RunStatusBadge status={r.status} />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {r.triggeredBy}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.durationMs > 0 ? `${(r.durationMs / 1000).toFixed(1)}s` : '—'}
                    </TableCell>
                    <TableCell>
                      {r.error ? (
                        <span className="text-xs text-destructive">{r.error}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete workflow?</DialogTitle>
            <DialogDescription>
              Permanently removes this workflow and its run history. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Keep
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={remove.isPending}
            >
              {remove.isPending ? 'Deleting…' : 'Delete workflow'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

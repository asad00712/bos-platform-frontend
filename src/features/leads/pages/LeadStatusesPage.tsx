import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { Badge } from '@/shared/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { Workflow } from 'lucide-react'

import { useTenant } from '@/shared/hooks/useTenant'
import { useActiveBranchStore } from '@/stores/activeBranch.store'
import { useHasPermission } from '@/shared/auth/useHasPermission'
import type { LeadStatus } from '@/types/crm'

import {
  useCreateLeadStatus,
  useDeleteLeadStatus,
  useLeadStatuses,
  useUpdateLeadStatus,
} from '../hooks'

export function LeadStatusesPage() {
  const { tenant } = useTenant()
  const branchId = useActiveBranchStore((s) => s.branchId) ?? 'br-main'
  const canManage = useHasPermission('tenant:leads:configure')

  const query = useLeadStatuses(tenant.id)
  const createM = useCreateLeadStatus(tenant.id)
  const updateM = useUpdateLeadStatus(tenant.id)
  const removeM = useDeleteLeadStatus(tenant.id)

  const [dialog, setDialog] = useState<
    | { mode: 'closed' }
    | { mode: 'create' }
    | { mode: 'edit'; status: LeadStatus }
    | { mode: 'delete'; status: LeadStatus }
  >({ mode: 'closed' })

  const statuses = query.data ?? []

  const move = (id: string, direction: 1 | -1) => {
    const sorted = [...statuses].sort((a, b) => a.displayOrder - b.displayOrder)
    const idx = sorted.findIndex((s) => s.id === id)
    if (idx < 0) return
    const swapWith = idx + direction
    if (swapWith < 0 || swapWith >= sorted.length) return
    const a = sorted[idx]
    const b = sorted[swapWith]
    updateM.mutate({ id: a.id, patch: { displayOrder: b.displayOrder } })
    updateM.mutate({ id: b.id, patch: { displayOrder: a.displayOrder } })
  }

  return (
    <PageContainer>
      <PageHeader
        title="Pipeline statuses"
        description="Stages a lead can sit in. Drag-reorder via the up/down arrows; system stages can't be deleted."
        actions={
          canManage ? (
            <Button onClick={() => setDialog({ mode: 'create' })}>
              <Plus /> New status
            </Button>
          ) : undefined
        }
      />

      {statuses.length === 0 && !query.isLoading ? (
        <Card>
          <CardContent className="p-6">
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Workflow />
                </EmptyMedia>
                <EmptyTitle>No statuses yet</EmptyTitle>
                <EmptyDescription>
                  Create your first pipeline stage to start tracking leads.
                </EmptyDescription>
              </EmptyHeader>
              {canManage ? (
                <Button onClick={() => setDialog({ mode: 'create' })}>
                  <Plus /> New status
                </Button>
              ) : null}
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {[...statuses]
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((s, i, arr) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center gap-3 px-5 py-3"
                  >
                    <span className="grid size-8 place-items-center text-muted-foreground">
                      <GripVertical className="size-4" />
                    </span>
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ background: s.color ?? 'var(--muted-foreground)' }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{s.name}</p>
                        {s.isSystem ? (
                          <Badge variant="outline" className="text-[10px]">
                            system
                          </Badge>
                        ) : null}
                        {!s.isActive ? (
                          <Badge variant="outline" className="text-[10px]">
                            inactive
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        order {s.displayOrder} · {s.color ?? 'no colour'}
                      </p>
                    </div>
                    {canManage ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Move up"
                          disabled={i === 0}
                          onClick={() => move(s.id, -1)}
                        >
                          <ArrowUp />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Move down"
                          disabled={i === arr.length - 1}
                          onClick={() => move(s.id, 1)}
                        >
                          <ArrowDown />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDialog({ mode: 'edit', status: s })}
                        >
                          Edit
                        </Button>
                        {!s.isSystem ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete"
                            onClick={() => setDialog({ mode: 'delete', status: s })}
                          >
                            <Trash2 className="text-destructive" />
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <StatusFormDialog
        state={dialog}
        branchId={branchId}
        onClose={() => setDialog({ mode: 'closed' })}
        onCreate={(input) =>
          createM.mutateAsync(input).then(() => setDialog({ mode: 'closed' }))
        }
        onUpdate={(id, patch) =>
          updateM.mutateAsync({ id, patch }).then(() => setDialog({ mode: 'closed' }))
        }
        onDelete={(id) =>
          removeM.mutateAsync(id).then(() => setDialog({ mode: 'closed' }))
        }
        isWriting={createM.isPending || updateM.isPending || removeM.isPending}
      />
    </PageContainer>
  )
}

type DialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; status: LeadStatus }
  | { mode: 'delete'; status: LeadStatus }

function StatusFormDialog({
  state,
  branchId,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  isWriting,
}: {
  state: DialogState
  branchId: string
  onClose: () => void
  onCreate: (input: { branchId: string; name: string; color?: string }) => Promise<void>
  onUpdate: (
    id: string,
    patch: Partial<{ name: string; color: string | null; isActive: boolean }>,
  ) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isWriting: boolean
}) {
  const open = state.mode !== 'closed'
  const editing = state.mode === 'edit' ? state.status : null
  const deleting = state.mode === 'delete' ? state.status : null

  const [name, setName] = useState('')
  const [color, setColor] = useState('#94A3B8')
  const [isActive, setActive] = useState(true)

  const editingId = editing?.id ?? null
  useEffect(() => {
    if (state.mode === 'edit') {
      setName(state.status.name)
      setColor(state.status.color ?? '#94A3B8')
      setActive(state.status.isActive)
    }
    if (state.mode === 'create') {
      setName('')
      setColor('#94A3B8')
      setActive(true)
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [state.mode, editingId])

  if (deleting) {
    return (
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {deleting.name}?</DialogTitle>
            <DialogDescription>
              Leads currently in this stage will be unassigned. System stages
              cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(deleting.id)}
              disabled={isWriting}
            >
              {isWriting ? 'Deleting…' : 'Delete status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit status' : 'New status'}</DialogTitle>
          <DialogDescription>
            Pipeline stages define where a lead sits in your sales process.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Name</Label>
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Colour</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border bg-background"
                aria-label="Status colour"
              />
              <Input value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>
          {editing ? (
            <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-[11px] text-muted-foreground">
                  Inactive stages don&apos;t appear in pickers or kanban.
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setActive} />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={isWriting || !name.trim()}
            onClick={() => {
              if (editing) {
                void onUpdate(editing.id, { name, color, isActive })
              } else {
                void onCreate({ branchId, name, color })
              }
            }}
          >
            {isWriting ? 'Saving…' : editing ? 'Save changes' : 'Create status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

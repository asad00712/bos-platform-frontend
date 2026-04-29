import { useEffect, useState } from 'react'
import { Pencil, Plus, Radio, Trash2 } from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
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

import { useTenant } from '@/shared/hooks/useTenant'
import { useHasPermission } from '@/shared/auth/useHasPermission'
import type { SourceLookup } from '../api/crm.contracts'

import {
  useCreateSource,
  useDeleteSource,
  useSourceLookup,
  useUpdateSource,
} from '../hooks'

export function SourcesPage() {
  const { tenant } = useTenant()
  const canManage = useHasPermission('tenant:contact-sources:manage')

  const query = useSourceLookup(tenant.id)
  const createM = useCreateSource(tenant.id)
  const updateM = useUpdateSource(tenant.id)
  const removeM = useDeleteSource(tenant.id)

  const [dialog, setDialog] = useState<
    | { mode: 'closed' }
    | { mode: 'create' }
    | { mode: 'edit'; source: SourceLookup }
    | { mode: 'delete'; source: SourceLookup }
  >({ mode: 'closed' })

  const sources = query.data ?? []

  return (
    <div className="space-y-4">
      <PageHeader
        title="Contact sources"
        description="Where contacts and leads come from. System sources can't be deleted."
        actions={
          canManage ? (
            <Button onClick={() => setDialog({ mode: 'create' })}>
              <Plus /> New source
            </Button>
          ) : undefined
        }
      />

      {sources.length === 0 && !query.isLoading ? (
        <Card>
          <CardContent className="p-6">
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Radio />
                </EmptyMedia>
                <EmptyTitle>No sources yet</EmptyTitle>
                <EmptyDescription>
                  Track where new leads come in from.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {sources.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-3"
                >
                  <Radio className="size-4 text-muted-foreground" />
                  <p className="font-medium">{s.name}</p>
                  {s.isSystem ? (
                    <Badge variant="outline" className="text-[10px]">
                      system
                    </Badge>
                  ) : null}
                  <span className="ms-auto inline-flex items-center gap-1">
                    {canManage ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit"
                          onClick={() => setDialog({ mode: 'edit', source: s })}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete"
                          disabled={s.isSystem}
                          onClick={() => setDialog({ mode: 'delete', source: s })}
                        >
                          <Trash2 className="text-destructive" />
                        </Button>
                      </>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <SourceFormDialog
        state={dialog}
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
    </div>
  )
}

type DialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; source: SourceLookup }
  | { mode: 'delete'; source: SourceLookup }

function SourceFormDialog({
  state,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  isWriting,
}: {
  state: DialogState
  onClose: () => void
  onCreate: (input: { name: string }) => Promise<void>
  onUpdate: (id: string, patch: Partial<{ name: string }>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isWriting: boolean
}) {
  const open = state.mode !== 'closed'
  const editing = state.mode === 'edit' ? state.source : null
  const deleting = state.mode === 'delete' ? state.source : null

  const [name, setName] = useState('')

  const editingId = editing?.id ?? null
  useEffect(() => {
    if (state.mode === 'edit') setName(state.source.name)
    if (state.mode === 'create') setName('')
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [state.mode, editingId])

  if (deleting) {
    return (
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {deleting.name}?</DialogTitle>
            <DialogDescription>
              Contacts using this source will fall back to no source. System
              sources can&apos;t be deleted.
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
              {isWriting ? 'Deleting…' : 'Delete source'}
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
          <DialogTitle>{editing ? 'Edit source' : 'New source'}</DialogTitle>
          <DialogDescription>
            Sources let you measure which channels produce the most contacts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Name</Label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Trade show"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={isWriting || !name.trim()}
            onClick={() => {
              if (editing) {
                void onUpdate(editing.id, { name })
              } else {
                void onCreate({ name })
              }
            }}
          >
            {isWriting ? 'Saving…' : editing ? 'Save changes' : 'Create source'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

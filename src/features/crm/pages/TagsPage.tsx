import { useEffect, useState } from 'react'
import { Pencil, Plus, Tag as TagIcon, Trash2 } from 'lucide-react'

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
import type { TagLookup } from '../api/crm.contracts'

import {
  useCreateTag,
  useDeleteTag,
  useTagLookup,
  useUpdateTag,
} from '../hooks'

export function TagsPage() {
  const { tenant } = useTenant()
  const canManage = useHasPermission('tenant:tags:manage')

  const query = useTagLookup(tenant.id)
  const createM = useCreateTag(tenant.id)
  const updateM = useUpdateTag(tenant.id)
  const removeM = useDeleteTag(tenant.id)

  const [dialog, setDialog] = useState<
    | { mode: 'closed' }
    | { mode: 'create' }
    | { mode: 'edit'; tag: TagLookup }
    | { mode: 'delete'; tag: TagLookup }
  >({ mode: 'closed' })

  const tags = query.data ?? []

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tags"
        description="Reusable labels for contacts and leads. Tag library is shared across the tenant."
        actions={
          canManage ? (
            <Button onClick={() => setDialog({ mode: 'create' })}>
              <Plus /> New tag
            </Button>
          ) : undefined
        }
      />

      {tags.length === 0 && !query.isLoading ? (
        <Card>
          <CardContent className="p-6">
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <TagIcon />
                </EmptyMedia>
                <EmptyTitle>No tags yet</EmptyTitle>
                <EmptyDescription>
                  Create reusable labels to segment your CRM.
                </EmptyDescription>
              </EmptyHeader>
              {canManage ? (
                <Button onClick={() => setDialog({ mode: 'create' })}>
                  <Plus /> New tag
                </Button>
              ) : null}
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {tags.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-3"
                >
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ background: t.color ?? 'var(--muted-foreground)' }}
                  />
                  <Badge variant="outline" className="font-medium">
                    {t.name}
                  </Badge>
                  <span className="ms-auto inline-flex items-center gap-1">
                    {canManage ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit"
                          onClick={() => setDialog({ mode: 'edit', tag: t })}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete"
                          onClick={() => setDialog({ mode: 'delete', tag: t })}
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

      <TagFormDialog
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
  | { mode: 'edit'; tag: TagLookup }
  | { mode: 'delete'; tag: TagLookup }

function TagFormDialog({
  state,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  isWriting,
}: {
  state: DialogState
  onClose: () => void
  onCreate: (input: { name: string; color: string | null }) => Promise<void>
  onUpdate: (id: string, patch: Partial<{ name: string; color: string | null }>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isWriting: boolean
}) {
  const open = state.mode !== 'closed'
  const editing = state.mode === 'edit' ? state.tag : null
  const deleting = state.mode === 'delete' ? state.tag : null

  const [name, setName] = useState('')
  const [color, setColor] = useState('#94A3B8')

  const editingId = editing?.id ?? null
  useEffect(() => {
    if (state.mode === 'edit') {
      setName(state.tag.name)
      setColor(state.tag.color ?? '#94A3B8')
    }
    if (state.mode === 'create') {
      setName('')
      setColor('#94A3B8')
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
              This removes the tag from the library and from any contacts
              currently labeled with it.
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
              {isWriting ? 'Deleting…' : 'Delete tag'}
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
          <DialogTitle>{editing ? 'Edit tag' : 'New tag'}</DialogTitle>
          <DialogDescription>
            Tags are tenant-wide. Pick a colour to make them easy to spot.
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
                aria-label="Tag colour"
              />
              <Input value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
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
                void onUpdate(editing.id, { name, color })
              } else {
                void onCreate({ name, color })
              }
            }}
          >
            {isWriting ? 'Saving…' : editing ? 'Save changes' : 'Create tag'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

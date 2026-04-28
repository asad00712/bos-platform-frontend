import { useEffect, useState } from 'react'
import { Building2, MoreHorizontal, Plus, Star, Trash2 } from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
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
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { useHasPermission } from '@/shared/auth/useHasPermission'
import { formatDate } from '@/shared/lib/format'

import type { Branch } from '@/types/crm'
import {
  useBranches,
  useCreateBranch,
  useDeleteBranch,
  useUpdateBranch,
} from '../hooks'

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
}

export function BranchesPage() {
  const query = useBranches()
  const create = useCreateBranch()
  const update = useUpdateBranch()
  const remove = useDeleteBranch()

  const canManage = useHasPermission('tenant:branches:manage')

  const [dialog, setDialog] = useState<
    | { mode: 'closed' }
    | { mode: 'create' }
    | { mode: 'edit'; branch: Branch }
    | { mode: 'delete'; branch: Branch }
  >({ mode: 'closed' })

  const branches = query.data ?? []

  return (
    <div className="space-y-4">
      <PageHeader
        title="Branches"
        description="Locations under this tenant. Every CRM record is scoped to a branch."
        actions={
          canManage ? (
            <Button onClick={() => setDialog({ mode: 'create' })}>
              <Plus /> New branch
            </Button>
          ) : undefined
        }
      />

      {query.isLoading ? (
        <Card>
          <CardContent className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </CardContent>
        </Card>
      ) : branches.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Building2 />
                </EmptyMedia>
                <EmptyTitle>No branches yet</EmptyTitle>
                <EmptyDescription>
                  Add your first location to scope contacts, leads, and team
                  membership.
                </EmptyDescription>
              </EmptyHeader>
              {canManage ? (
                <Button onClick={() => setDialog({ mode: 'create' })}>
                  <Plus /> New branch
                </Button>
              ) : null}
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {branches.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-4"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted">
                    <Building2 className="size-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{b.name}</p>
                      {b.isHeadquarters ? (
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                      ) : null}
                      <Badge variant={b.isActive ? 'default' : 'outline'}>
                        {b.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      /{b.slug} · created {formatDate(b.createdAt)}
                    </p>
                  </div>
                  {canManage ? (
                    <div className="flex items-center gap-2">
                      <div className="hidden items-center gap-2 sm:flex">
                        <Switch
                          checked={b.isActive}
                          onCheckedChange={(v) =>
                            update.mutate({ id: b.id, patch: { isActive: v } })
                          }
                          aria-label="Active"
                        />
                        <span className="text-xs text-muted-foreground">
                          Active
                        </span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="More actions"
                          >
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setDialog({ mode: 'edit', branch: b })}
                          >
                            Edit branch
                          </DropdownMenuItem>
                          {!b.isHeadquarters ? (
                            <DropdownMenuItem
                              onClick={() =>
                                update.mutate({
                                  id: b.id,
                                  patch: { isHeadquarters: true },
                                })
                              }
                            >
                              <Star /> Make headquarters
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={b.isHeadquarters}
                            onClick={() =>
                              setDialog({ mode: 'delete', branch: b })
                            }
                          >
                            <Trash2 /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <BranchFormDialog
        state={dialog}
        onClose={() => setDialog({ mode: 'closed' })}
        onCreate={(input) => create.mutateAsync(input).then(() => setDialog({ mode: 'closed' }))}
        onUpdate={(id, patch) =>
          update.mutateAsync({ id, patch }).then(() => setDialog({ mode: 'closed' }))
        }
        onDelete={(id) =>
          remove.mutateAsync(id).then(() => setDialog({ mode: 'closed' }))
        }
        isWriting={create.isPending || update.isPending || remove.isPending}
      />
    </div>
  )
}

type DialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; branch: Branch }
  | { mode: 'delete'; branch: Branch }

function BranchFormDialog({
  state,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  isWriting,
}: {
  state: DialogState
  onClose: () => void
  onCreate: (input: { name: string; slug: string; isHeadquarters?: boolean; isActive?: boolean }) => Promise<void>
  onUpdate: (
    id: string,
    patch: Partial<{ name: string; slug: string; isHeadquarters: boolean; isActive: boolean }>,
  ) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isWriting: boolean
}) {
  const open = state.mode !== 'closed'
  const editing = state.mode === 'edit' ? state.branch : null
  const deleting = state.mode === 'delete' ? state.branch : null

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [isHeadquarters, setHQ] = useState(false)
  const [isActive, setActive] = useState(true)

  const reset = (b?: Branch) => {
    setName(b?.name ?? '')
    setSlug(b?.slug ?? '')
    setHQ(b?.isHeadquarters ?? false)
    setActive(b?.isActive ?? true)
  }

  /* Re-seed form whenever the dialog target changes. */
  const editingId = editing?.id ?? null
  useEffect(() => {
    if (state.mode === 'edit') reset(state.branch)
    if (state.mode === 'create') reset()
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [state.mode, editingId])

  if (deleting) {
    return (
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {deleting.name}?</DialogTitle>
            <DialogDescription>
              This permanently removes the branch and any data scoped to it.
              Headquarters branches cannot be deleted.
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
              {isWriting ? 'Deleting…' : 'Delete branch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onClose()
          reset()
        } else if (editing) {
          reset(editing)
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit branch' : 'New branch'}</DialogTitle>
          <DialogDescription>
            Branches scope contacts, leads, and staff. Set one as headquarters
            for the default selection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Name</Label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!editing && (slug === '' || slug === slugify(name))) {
                  setSlug(slugify(e.target.value))
                }
              }}
            />
          </div>
          <div>
            <Label className="text-xs">Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="downtown"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Used in URLs and internal references. Lowercase, hyphens only.
            </p>
          </div>
          <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
            <div>
              <p className="text-sm font-medium">Headquarters</p>
              <p className="text-[11px] text-muted-foreground">
                Default branch when no selection persists.
              </p>
            </div>
            <Switch checked={isHeadquarters} onCheckedChange={setHQ} />
          </div>
          <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-[11px] text-muted-foreground">
                Inactive branches don&apos;t appear in pickers.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={isWriting || !name.trim() || !slug.trim()}
            onClick={() => {
              if (editing) {
                void onUpdate(editing.id, { name, slug, isHeadquarters, isActive })
              } else {
                void onCreate({ name, slug, isHeadquarters, isActive })
                reset()
              }
            }}
          >
            {isWriting
              ? 'Saving…'
              : editing
                ? 'Save changes'
                : 'Create branch'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

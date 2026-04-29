import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  Lock,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

import { useHasPermission } from '@/shared/auth/useHasPermission'
import type { TenantPermission, TenantRole } from '@/types/crm'

import {
  useCreateRole,
  useDeleteRole,
  usePermissionCatalog,
  useRoles,
  useUpdateRole,
} from '../hooks'

export function RolesPage() {
  const canManage = useHasPermission('tenant:roles:manage')

  const rolesQ = useRoles()
  const permsQ = usePermissionCatalog()
  const create = useCreateRole()
  const update = useUpdateRole()
  const remove = useDeleteRole()

  const [selected, setSelected] = useState<TenantRole | null>(null)
  const [isCreating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<TenantRole | null>(null)

  const roles = rolesQ.data ?? []
  const catalog = permsQ.data ?? []

  if (selected) {
    return (
      <RoleEditor
        role={selected}
        catalog={catalog}
        readOnly={!canManage || selected.isSystem}
        onClose={() => setSelected(null)}
        onSave={(patch) =>
          update.mutateAsync({ id: selected.id, patch }).then(() => setSelected(null))
        }
        isSaving={update.isPending}
      />
    )
  }

  if (isCreating) {
    return (
      <RoleEditor
        role={null}
        catalog={catalog}
        readOnly={false}
        onClose={() => setCreating(false)}
        onSave={(patch) =>
          create
            .mutateAsync({
              name: patch.name ?? 'New role',
              description: patch.description ?? undefined,
              permissionSlugs: patch.permissionSlugs ?? [],
            })
            .then(() => setCreating(false))
        }
        isSaving={create.isPending}
      />
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Roles & permissions"
        description="Each role bundles a set of permission slugs. Members inherit the role's slugs at request time."
        actions={
          canManage ? (
            <Button onClick={() => setCreating(true)}>
              <Plus /> New role
            </Button>
          ) : undefined
        }
      />

      {rolesQ.isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {roles.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-md bg-muted text-muted-foreground">
                      <ShieldCheck className="size-4" />
                    </span>
                    <div>
                      <p className="font-medium leading-tight">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.permissionSlugs.length} permission
                        {r.permissionSlugs.length === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1">
                    {r.isSystem ? (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="size-3" /> System
                      </Badge>
                    ) : null}
                  </div>
                </div>
                {r.description ? (
                  <p className="text-sm text-muted-foreground">
                    {r.description}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-1">
                  {r.permissionSlugs.slice(0, 6).map((slug) => (
                    <Badge
                      key={slug}
                      variant="outline"
                      className="font-mono text-[10px]"
                    >
                      {slug}
                    </Badge>
                  ))}
                  {r.permissionSlugs.length > 6 ? (
                    <Badge variant="outline" className="text-[10px]">
                      +{r.permissionSlugs.length - 6}
                    </Badge>
                  ) : null}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelected(r)}
                  >
                    <Pencil />{' '}
                    {!canManage || r.isSystem ? 'View' : 'Edit'}
                  </Button>
                  {canManage && !r.isSystem ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete role"
                      onClick={() => setConfirmDelete(r)}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(confirmDelete)}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {confirmDelete?.name}?</DialogTitle>
            <DialogDescription>
              Members assigned to this role lose its permissions immediately.
              System roles can&apos;t be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => {
                if (!confirmDelete) return
                void remove.mutateAsync(confirmDelete.id).then(() => setConfirmDelete(null))
              }}
            >
              {remove.isPending ? 'Deleting…' : 'Delete role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ─────────────────── Role editor ─────────────────── */

function RoleEditor({
  role,
  catalog,
  readOnly,
  onClose,
  onSave,
  isSaving,
}: {
  role: TenantRole | null
  catalog: TenantPermission[]
  readOnly: boolean
  onClose: () => void
  onSave: (patch: {
    name?: string
    description?: string | null
    permissionSlugs?: string[]
  }) => Promise<void>
  isSaving: boolean
}) {
  const [name, setName] = useState(role?.name ?? '')
  const [description, setDescription] = useState(role?.description ?? '')
  const [slugs, setSlugs] = useState<Set<string>>(
    new Set(role?.permissionSlugs ?? []),
  )

  useEffect(() => {
    setName(role?.name ?? '')
    setDescription(role?.description ?? '')
    setSlugs(new Set(role?.permissionSlugs ?? []))
  }, [role?.id, role?.permissionSlugs, role?.name, role?.description])

  const grouped = useMemo(() => {
    const map = new Map<string, TenantPermission[]>()
    catalog.forEach((p) => {
      const arr = map.get(p.module) ?? []
      arr.push(p)
      map.set(p.module, arr)
    })
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [catalog])

  const toggle = (slug: string) => {
    if (readOnly) return
    setSlugs((curr) => {
      const next = new Set(curr)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const toggleModule = (_module: string, allSlugs: string[]) => {
    if (readOnly) return
    setSlugs((curr) => {
      const next = new Set(curr)
      const allOn = allSlugs.every((s) => next.has(s))
      if (allOn) {
        allSlugs.forEach((s) => next.delete(s))
      } else {
        allSlugs.forEach((s) => next.add(s))
      }
      return next
    })
  }

  const handleSave = () => {
    void onSave({
      name,
      description: description || null,
      permissionSlugs: Array.from(slugs),
    })
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={role ? role.name : 'New role'}
        description={
          role?.isSystem
            ? 'System role — view-only.'
            : 'Pick the permission slugs this role grants. Changes apply immediately on save.'
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ChevronLeft /> Back to roles
            </Button>
            {!readOnly ? (
              <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
                {isSaving ? 'Saving…' : role ? 'Save changes' : 'Create role'}
              </Button>
            ) : null}
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={readOnly}
                placeholder="Short summary"
              />
            </div>
          </div>
          {role?.isSystem ? (
            <Textarea
              className="hidden"
              value=""
              readOnly
              aria-hidden
            />
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Permissions</p>
            <p className="text-xs text-muted-foreground">
              {slugs.size} of {catalog.length} selected
            </p>
          </div>

          {grouped.map(([module, perms]) => {
            const moduleSlugs = perms.map((p) => p.slug)
            const allOn = moduleSlugs.every((s) => slugs.has(s))
            const someOn = moduleSlugs.some((s) => slugs.has(s))
            return (
              <div key={module} className="rounded-md border">
                <button
                  type="button"
                  onClick={() => toggleModule(module, moduleSlugs)}
                  disabled={readOnly}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="inline-flex items-center gap-2 text-sm font-medium capitalize">
                    <Checkbox
                      checked={allOn ? true : someOn ? 'indeterminate' : false}
                    />
                    {module.replace(/-/g, ' ')}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {moduleSlugs.filter((s) => slugs.has(s)).length} /{' '}
                    {moduleSlugs.length}
                  </span>
                </button>
                <ul className="divide-y border-t">
                  {perms.map((p) => {
                    const checked = slugs.has(p.slug)
                    return (
                      <li
                        key={p.slug}
                        className={
                          'flex items-center gap-3 px-3 py-2 text-sm' +
                          (readOnly ? ' opacity-90' : '')
                        }
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggle(p.slug)}
                          disabled={readOnly}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-[11px] text-muted-foreground">
                            {p.slug}
                          </p>
                          <p className="text-sm">{p.description}</p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

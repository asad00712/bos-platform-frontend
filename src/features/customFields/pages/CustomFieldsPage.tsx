import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

import { useTenant } from '@/shared/hooks/useTenant'
import { useActiveBranchStore } from '@/stores/activeBranch.store'
import { useHasPermission } from '@/shared/auth/useHasPermission'
import type {
  CustomField,
  CustomFieldEntity,
  CustomFieldOption,
  CustomFieldType,
} from '@/types/crm'

import {
  useCreateCustomField,
  useCustomFields,
  useDeleteCustomField,
  useUpdateCustomField,
} from '../hooks'

const TYPE_LABEL: Record<CustomFieldType, string> = {
  text: 'Text',
  textarea: 'Long text',
  number: 'Number',
  date: 'Date',
  datetime: 'Date + time',
  boolean: 'Yes / no',
  select: 'Single select',
  multi_select: 'Multi select',
  url: 'URL',
  email: 'Email',
  phone: 'Phone',
}

const TYPE_OPTIONS: CustomFieldType[] = [
  'text',
  'textarea',
  'number',
  'date',
  'datetime',
  'boolean',
  'select',
  'multi_select',
  'url',
  'email',
  'phone',
]

export function CustomFieldsPage() {
  const { tenant } = useTenant()
  const branchId = useActiveBranchStore((s) => s.branchId) ?? 'br-main'
  const canManage = useHasPermission('tenant:custom-fields:manage')

  const [entity, setEntity] = useState<CustomFieldEntity>('contact')

  const query = useCustomFields(tenant.id, entity)
  const createM = useCreateCustomField(tenant.id)
  const updateM = useUpdateCustomField(tenant.id)
  const removeM = useDeleteCustomField(tenant.id)

  const [dialog, setDialog] = useState<
    | { mode: 'closed' }
    | { mode: 'create' }
    | { mode: 'edit'; field: CustomField }
    | { mode: 'delete'; field: CustomField }
  >({ mode: 'closed' })

  const fields = query.data ?? []

  const move = (id: string, dir: 1 | -1) => {
    const sorted = [...fields].sort((a, b) => a.displayOrder - b.displayOrder)
    const idx = sorted.findIndex((f) => f.id === id)
    if (idx < 0) return
    const swap = idx + dir
    if (swap < 0 || swap >= sorted.length) return
    const a = sorted[idx]
    const b = sorted[swap]
    updateM.mutate({ id: a.id, patch: { displayOrder: b.displayOrder } })
    updateM.mutate({ id: b.id, patch: { displayOrder: a.displayOrder } })
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Custom fields"
        description="Per-tenant fields rendered into contact and lead forms. Backed by tenant-template.custom_field_definitions."
        actions={
          canManage ? (
            <Button onClick={() => setDialog({ mode: 'create' })}>
              <Plus /> New field
            </Button>
          ) : undefined
        }
      />

      <Tabs value={entity} onValueChange={(v) => setEntity(v as CustomFieldEntity)}>
        <TabsList>
          <TabsTrigger value="contact">Contact fields</TabsTrigger>
          <TabsTrigger value="lead">Lead fields</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="mt-4">
          <FieldList
            fields={fields}
            isLoading={query.isLoading}
            canManage={canManage}
            onEdit={(f) => setDialog({ mode: 'edit', field: f })}
            onDelete={(f) => setDialog({ mode: 'delete', field: f })}
            onMove={move}
            onCreate={() => setDialog({ mode: 'create' })}
          />
        </TabsContent>

        <TabsContent value="lead" className="mt-4">
          <FieldList
            fields={fields}
            isLoading={query.isLoading}
            canManage={canManage}
            onEdit={(f) => setDialog({ mode: 'edit', field: f })}
            onDelete={(f) => setDialog({ mode: 'delete', field: f })}
            onMove={move}
            onCreate={() => setDialog({ mode: 'create' })}
          />
        </TabsContent>
      </Tabs>

      <FieldFormDialog
        state={dialog}
        branchId={branchId}
        entity={entity}
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

function FieldList({
  fields,
  isLoading,
  canManage,
  onEdit,
  onDelete,
  onMove,
  onCreate,
}: {
  fields: CustomField[]
  isLoading: boolean
  canManage: boolean
  onEdit: (f: CustomField) => void
  onDelete: (f: CustomField) => void
  onMove: (id: string, dir: 1 | -1) => void
  onCreate: () => void
}) {
  if (!isLoading && fields.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Sparkles />
              </EmptyMedia>
              <EmptyTitle>No custom fields yet</EmptyTitle>
              <EmptyDescription>
                Add per-tenant fields to capture data the standard schema
                doesn&apos;t cover.
              </EmptyDescription>
            </EmptyHeader>
            {canManage ? (
              <Button onClick={onCreate}>
                <Plus /> New field
              </Button>
            ) : null}
          </Empty>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y">
          {[...fields]
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((f, i, arr) => (
              <li
                key={f.id}
                className="flex flex-wrap items-center gap-3 px-5 py-3"
              >
                <GripVertical className="size-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{f.label}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {TYPE_LABEL[f.type]}
                    </Badge>
                    {f.required ? (
                      <Badge variant="outline" className="text-[10px]">
                        required
                      </Badge>
                    ) : null}
                    {!f.isActive ? (
                      <Badge variant="outline" className="text-[10px]">
                        inactive
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    key: <code>{f.key}</code>
                    {f.helpText ? ` · ${f.helpText}` : ''}
                  </p>
                </div>
                {canManage ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Move up"
                      disabled={i === 0}
                      onClick={() => onMove(f.id, -1)}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Move down"
                      disabled={i === arr.length - 1}
                      onClick={() => onMove(f.id, 1)}
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit"
                      onClick={() => onEdit(f)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => onDelete(f)}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
        </ul>
      </CardContent>
    </Card>
  )
}

type DialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; field: CustomField }
  | { mode: 'delete'; field: CustomField }

function FieldFormDialog({
  state,
  branchId,
  entity,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  isWriting,
}: {
  state: DialogState
  branchId: string
  entity: CustomFieldEntity
  onClose: () => void
  onCreate: (input: {
    branchId: string
    entity: CustomFieldEntity
    key: string
    label: string
    type: CustomFieldType
    required?: boolean
    options?: CustomFieldOption[]
    helpText?: string | null
  }) => Promise<void>
  onUpdate: (
    id: string,
    patch: Partial<{
      label: string
      type: CustomFieldType
      required: boolean
      isActive: boolean
      options: CustomFieldOption[]
      helpText: string | null
    }>,
  ) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isWriting: boolean
}) {
  const open = state.mode !== 'closed'
  const editing = state.mode === 'edit' ? state.field : null
  const deleting = state.mode === 'delete' ? state.field : null

  const [key, setKey] = useState('')
  const [label, setLabel] = useState('')
  const [type, setType] = useState<CustomFieldType>('text')
  const [required, setRequired] = useState(false)
  const [isActive, setActive] = useState(true)
  const [helpText, setHelpText] = useState('')
  const [options, setOptions] = useState<CustomFieldOption[]>([])
  const [optDraft, setOptDraft] = useState('')

  const editingId = editing?.id ?? null
  useEffect(() => {
    if (state.mode === 'edit') {
      const f = state.field
      setKey(f.key)
      setLabel(f.label)
      setType(f.type)
      setRequired(f.required)
      setActive(f.isActive)
      setHelpText(f.helpText ?? '')
      setOptions(f.options)
    }
    if (state.mode === 'create') {
      setKey('')
      setLabel('')
      setType('text')
      setRequired(false)
      setActive(true)
      setHelpText('')
      setOptions([])
      setOptDraft('')
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [state.mode, editingId])

  const supportsOptions = type === 'select' || type === 'multi_select'

  const slugifyKey = (input: string) =>
    input
      .trim()
      .replace(/[^a-zA-Z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/^([0-9])/, '_$1')

  const addOption = () => {
    const trimmed = optDraft.trim()
    if (!trimmed) return
    const value = slugifyKey(trimmed).toLowerCase()
    if (options.some((o) => o.value === value)) {
      setOptDraft('')
      return
    }
    setOptions([...options, { value, label: trimmed }])
    setOptDraft('')
  }

  if (deleting) {
    return (
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {deleting.label}?</DialogTitle>
            <DialogDescription>
              Records that have a value for this field keep the value, but
              the field stops appearing in forms and detail pages.
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
              {isWriting ? 'Deleting…' : 'Delete field'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit field' : 'New custom field'}</DialogTitle>
          <DialogDescription>
            Custom fields appear in the {entity} form and detail page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Label</Label>
              <Input
                autoFocus
                value={label}
                onChange={(e) => {
                  setLabel(e.target.value)
                  if (!editing && (key === '' || key === slugifyKey(label))) {
                    setKey(slugifyKey(e.target.value).toLowerCase())
                  }
                }}
              />
            </div>
            <div>
              <Label className="text-xs">Key</Label>
              <Input
                value={key}
                onChange={(e) => setKey(slugifyKey(e.target.value))}
                placeholder="snake_case"
                disabled={Boolean(editing)}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as CustomFieldType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {supportsOptions ? (
            <div>
              <Label className="text-xs">Options</Label>
              <div className="flex flex-wrap gap-1.5">
                {options.map((o) => (
                  <Badge key={o.value} variant="outline" className="gap-1">
                    {o.label}
                    <button
                      type="button"
                      aria-label={`Remove ${o.label}`}
                      onClick={() =>
                        setOptions(options.filter((x) => x.value !== o.value))
                      }
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="mt-1.5 flex gap-1.5">
                <Input
                  value={optDraft}
                  onChange={(e) => setOptDraft(e.target.value)}
                  placeholder="Add option…"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addOption()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addOption}>
                  Add
                </Button>
              </div>
            </div>
          ) : null}

          <div>
            <Label className="text-xs">Help text</Label>
            <Input
              value={helpText}
              onChange={(e) => setHelpText(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
            <div>
              <p className="text-sm font-medium">Required</p>
              <p className="text-[11px] text-muted-foreground">
                Forms validate this field on submit.
              </p>
            </div>
            <Switch checked={required} onCheckedChange={setRequired} />
          </div>

          {editing ? (
            <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-[11px] text-muted-foreground">
                  Inactive fields don&apos;t render but values stay safe.
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
            disabled={isWriting || !label.trim() || !key.trim()}
            onClick={() => {
              if (editing) {
                void onUpdate(editing.id, {
                  label,
                  type,
                  required,
                  isActive,
                  options: supportsOptions ? options : [],
                  helpText: helpText || null,
                })
              } else {
                void onCreate({
                  branchId,
                  entity,
                  key,
                  label,
                  type,
                  required,
                  options: supportsOptions ? options : [],
                  helpText: helpText || null,
                })
              }
            }}
          >
            {isWriting ? 'Saving…' : editing ? 'Save changes' : 'Create field'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

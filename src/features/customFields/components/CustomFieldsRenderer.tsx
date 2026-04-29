import { useMemo } from 'react'

import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Badge } from '@/shared/ui/badge'

import { useTenant } from '@/shared/hooks/useTenant'
import type { CustomField, CustomFieldEntity } from '@/types/crm'

import { useCustomFields } from '../hooks'

const SENTINEL = '__none__'

export type CustomFieldValueMap = Record<string, unknown>

type Props = {
  entity: CustomFieldEntity
  value: CustomFieldValueMap
  onChange: (next: CustomFieldValueMap) => void
}

/**
 * Renders the active custom-field set for the given entity. Values flow
 * through a single onChange callback so the host form just stores a
 * `customFieldValues: CustomFieldValueMap` blob and calls our renderer.
 *
 * Inactive fields are skipped. Field order respects `displayOrder`.
 */
export function CustomFieldsRenderer({ entity, value, onChange }: Props) {
  const { tenant } = useTenant()
  const query = useCustomFields(tenant.id, entity)
  const fields = useMemo(
    () => (query.data ?? []).filter((f) => f.isActive),
    [query.data],
  )

  if (fields.length === 0) return null

  const setField = (key: string, next: unknown) =>
    onChange({ ...value, [key]: next })

  return (
    <div className="space-y-3 rounded-md border bg-muted/20 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Custom fields
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <FieldInput key={f.id} field={f} value={value[f.key]} setField={setField} />
        ))}
      </div>
    </div>
  )
}

function FieldInput({
  field: f,
  value,
  setField,
}: {
  field: CustomField
  value: unknown
  setField: (key: string, next: unknown) => void
}) {
  const required = f.required

  switch (f.type) {
    case 'text':
    case 'url':
    case 'email':
    case 'phone':
      return (
        <FieldShell field={f}>
          <Input
            value={(value as string | undefined) ?? ''}
            onChange={(e) => setField(f.key, e.target.value)}
            type={f.type === 'url' ? 'url' : f.type === 'email' ? 'email' : f.type === 'phone' ? 'tel' : 'text'}
            required={required}
          />
        </FieldShell>
      )
    case 'textarea':
      return (
        <FieldShell field={f} fullWidth>
          <Textarea
            rows={3}
            value={(value as string | undefined) ?? ''}
            onChange={(e) => setField(f.key, e.target.value)}
            required={required}
          />
        </FieldShell>
      )
    case 'number':
      return (
        <FieldShell field={f}>
          <Input
            type="number"
            inputMode="decimal"
            value={(value as number | string | undefined)?.toString() ?? ''}
            onChange={(e) => {
              const v = e.target.value
              setField(f.key, v === '' ? undefined : Number.parseFloat(v))
            }}
            required={required}
          />
        </FieldShell>
      )
    case 'date':
      return (
        <FieldShell field={f}>
          <Input
            type="date"
            value={(value as string | undefined) ?? ''}
            onChange={(e) => setField(f.key, e.target.value || undefined)}
            required={required}
          />
        </FieldShell>
      )
    case 'datetime':
      return (
        <FieldShell field={f}>
          <Input
            type="datetime-local"
            value={(value as string | undefined) ?? ''}
            onChange={(e) => setField(f.key, e.target.value || undefined)}
            required={required}
          />
        </FieldShell>
      )
    case 'boolean':
      return (
        <FieldShell field={f}>
          <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
            <span className="text-sm">{f.label}</span>
            <Switch
              checked={Boolean(value)}
              onCheckedChange={(v) => setField(f.key, v)}
            />
          </div>
        </FieldShell>
      )
    case 'select':
      return (
        <FieldShell field={f}>
          <Select
            value={(value as string | undefined) ?? SENTINEL}
            onValueChange={(v) => setField(f.key, v === SENTINEL ? undefined : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SENTINEL}>—</SelectItem>
              {f.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>
      )
    case 'multi_select': {
      const arr = Array.isArray(value) ? (value as string[]) : []
      const toggle = (v: string) =>
        setField(
          f.key,
          arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v],
        )
      return (
        <FieldShell field={f} fullWidth>
          <div className="flex flex-wrap gap-1.5">
            {f.options.map((o) => {
              const active = arr.includes(o.value)
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggle(o.value)}
                  className="inline-flex"
                >
                  <Badge variant={active ? 'default' : 'outline'}>
                    {o.label}
                  </Badge>
                </button>
              )
            })}
          </div>
        </FieldShell>
      )
    }
    default:
      return null
  }
}

function FieldShell({
  field: f,
  fullWidth,
  children,
}: {
  field: CustomField
  fullWidth?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={fullWidth ? 'sm:col-span-2' : undefined}>
      <Label className="text-xs">
        {f.label}
        {f.required ? (
          <span className="ms-1 text-destructive">*</span>
        ) : null}
      </Label>
      {children}
      {f.helpText ? (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{f.helpText}</p>
      ) : null}
    </div>
  )
}

import { Search, X } from 'lucide-react'
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
import { Button } from '@/shared/ui/button'

import { useTenant } from '@/shared/hooks/useTenant'
import { useOwnerLookup, useSourceLookup, useTagLookup } from '../hooks'
import type { ListFilters } from '../api/crm.contracts'

type Props = {
  value: ListFilters
  onChange: (next: ListFilters) => void
}

const STATUS_OPTIONS: { label: string; value: ListFilters['status'] | 'all' }[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Archived', value: 'archived' },
]

export function ContactFilters({ value, onChange }: Props) {
  const { tenant } = useTenant()
  const sourcesQ = useSourceLookup(tenant.id)
  const tagsQ = useTagLookup(tenant.id)
  const ownersQ = useOwnerLookup(tenant.id)

  const isFiltered =
    Boolean(value.search) ||
    Boolean(value.status) ||
    Boolean(value.sourceId) ||
    Boolean(value.tagId) ||
    Boolean(value.ownerUserId)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="w-full sm:max-w-xs">
        <InputGroupAddon align="inline-start">
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search by name, email, phone, company…"
          value={value.search ?? ''}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
        />
      </InputGroup>

      <Select
        value={value.status ?? 'all'}
        onValueChange={(v) =>
          onChange({
            ...value,
            status: v === 'all' ? undefined : (v as ListFilters['status']),
          })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={String(o.value)}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.sourceId ?? 'all'}
        onValueChange={(v) =>
          onChange({ ...value, sourceId: v === 'all' ? undefined : v })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sources</SelectItem>
          {(sourcesQ.data ?? []).map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.tagId ?? 'all'}
        onValueChange={(v) =>
          onChange({ ...value, tagId: v === 'all' ? undefined : v })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tags</SelectItem>
          {(tagsQ.data ?? []).map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.ownerUserId ?? 'all'}
        onValueChange={(v) =>
          onChange({ ...value, ownerUserId: v === 'all' ? undefined : v })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Owner" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All owners</SelectItem>
          {(ownersQ.data ?? []).map((o) => (
            <SelectItem key={o.userId} value={o.userId}>
              {o.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isFiltered ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({})}
          aria-label="Clear filters"
        >
          <X /> Clear
        </Button>
      ) : null}
    </div>
  )
}

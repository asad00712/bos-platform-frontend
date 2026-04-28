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

import type { ListFilters } from '../api/crm.contracts'

type Props = {
  value: ListFilters
  onChange: (next: ListFilters) => void
}

const STATUS_OPTIONS: { label: string; value: ListFilters['status'] | 'all' }[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Lead', value: 'lead' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Archived', value: 'archived' },
]

const SOURCE_OPTIONS: { label: string; value: ListFilters['source'] | 'all' }[] = [
  { label: 'All sources', value: 'all' },
  { label: 'Manual', value: 'manual' },
  { label: 'Website', value: 'website' },
  { label: 'Import', value: 'import' },
  { label: 'Referral', value: 'referral' },
  { label: 'Integration', value: 'integration' },
]

export function ContactFilters({ value, onChange }: Props) {
  const isFiltered =
    Boolean(value.search) ||
    Boolean(value.status) ||
    Boolean(value.source) ||
    Boolean(value.tag)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="w-full sm:max-w-xs">
        <InputGroupAddon align="inline-start">
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search by name, email, phone…"
          value={value.search ?? ''}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
        />
      </InputGroup>

      <Select
        value={value.status ?? 'all'}
        onValueChange={(v) =>
          onChange({ ...value, status: v === 'all' ? undefined : (v as ListFilters['status']) })
        }
      >
        <SelectTrigger className="w-[150px]">
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
        value={value.source ?? 'all'}
        onValueChange={(v) =>
          onChange({ ...value, source: v === 'all' ? undefined : (v as ListFilters['source']) })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          {SOURCE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={String(o.value)}>
              {o.label}
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

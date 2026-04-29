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
import { useOwnerLookup } from '@/features/crm/hooks'

import type { LeadFilters } from '../api/leads.api'
import { useLeadStatuses } from '../hooks'

type Props = {
  value: LeadFilters
  onChange: (next: LeadFilters) => void
}

export function LeadsFilters({ value, onChange }: Props) {
  const { tenant } = useTenant()
  const ownersQ = useOwnerLookup(tenant.id)
  const statusesQ = useLeadStatuses(tenant.id)

  const isFiltered =
    Boolean(value.search) ||
    Boolean(value.statusId) ||
    Boolean(value.priority) ||
    Boolean(value.ownerUserId)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="w-full sm:max-w-xs">
        <InputGroupAddon align="inline-start">
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search name, email, company…"
          value={value.search ?? ''}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
        />
      </InputGroup>

      <Select
        value={value.statusId ?? 'all'}
        onValueChange={(v) =>
          onChange({ ...value, statusId: v === 'all' ? undefined : v })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {(statusesQ.data ?? []).map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.priority ?? 'all'}
        onValueChange={(v) =>
          onChange({
            ...value,
            priority: v === 'all' ? undefined : (v as LeadFilters['priority']),
          })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
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

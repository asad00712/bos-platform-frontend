import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Spinner } from '@/shared/ui/spinner'
import { cn } from '@/shared/lib/utils'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useTenant } from '@/shared/hooks/useTenant'

import { useEmployeeList } from '../hooks'

type Props = {
  value: string | null | undefined
  onChange: (id: string | null) => void
  placeholder?: string
}

export function EmployeeCombobox({ value, onChange, placeholder = 'Select employee…' }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search, 200)
  const { tenant } = useTenant()
  const list = useEmployeeList(tenant.id, { search: debounced || undefined })

  const items = list.data?.items ?? []
  const current = items.find((c) => c.id === value)
  const label = current ? `${current.firstName} ${current.lastName}` : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" type="button" className="w-full justify-between">
          <span className={cn(!label && 'text-muted-foreground')}>
            {label ?? placeholder}
          </span>
          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search employees…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {list.isLoading ? (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            ) : (
              <>
                <CommandEmpty>No employees found.</CommandEmpty>
                <CommandGroup>
                  {items.map((e) => {
                    const display = `${e.firstName} ${e.lastName}`
                    return (
                      <CommandItem
                        key={e.id}
                        value={e.id}
                        onSelect={() => {
                          onChange(e.id)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'size-4',
                            value === e.id ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <div className="flex-1 space-y-0.5">
                          <div className="text-sm">{display}</div>
                          <div className="text-xs text-muted-foreground">
                            {e.jobTitle} · {e.department}
                          </div>
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

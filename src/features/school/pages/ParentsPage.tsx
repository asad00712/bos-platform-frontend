import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Search, Users } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group'

import { useTenant } from '@/shared/hooks/useTenant'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

import { useParentsList } from '../hooks'

type ParentRow = {
  id: string
  firstName: string
  lastName: string
  relationship: string
  email: string | null
  phone: string | null
  primary: boolean
  childCount: number
  childrenNames: string[]
}

export function ParentsPage() {
  const { tenant } = useTenant()
  const q = useParentsList(tenant.id)
  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search, 200)

  const rows = useMemo<ParentRow[]>(() => {
    const items = q.data?.items ?? []
    if (!debounced) return items
    const needle = debounced.toLowerCase()
    return items.filter(
      (r) =>
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(needle) ||
        (r.email?.toLowerCase().includes(needle) ?? false) ||
        r.childrenNames.some((c) => c.toLowerCase().includes(needle)),
    )
  }, [q.data, debounced])

  const columns: ColumnDef<ParentRow>[] = [
    {
      accessorKey: 'firstName',
      header: 'Parent / guardian',
      cell: ({ row }) => {
        const p = row.original
        const initials =
          `${p.firstName[0] ?? ''}${p.lastName[0] ?? ''}`.toUpperCase()
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="font-medium leading-tight">
                {p.firstName} {p.lastName}
              </div>
              <div className="text-xs capitalize text-muted-foreground">
                {p.relationship}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'email',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="space-y-0.5 text-sm">
          <p>{row.original.email ?? '—'}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.phone ?? '—'}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'childCount',
      header: 'Children',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.childrenNames.slice(0, 3).map((n) => (
            <Badge key={n} variant="outline" className="text-[11px]">
              {n}
            </Badge>
          ))}
          {row.original.childCount > 3 ? (
            <Badge variant="secondary" className="text-[11px]">
              +{row.original.childCount - 3}
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: 'primary',
      header: 'Primary',
      cell: ({ row }) =>
        row.original.primary ? <Badge>Primary</Badge> : <span className="text-xs text-muted-foreground">—</span>,
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Parents & guardians"
        description={
          q.isLoading
            ? 'Loading…'
            : `${rows.length} ${rows.length === 1 ? 'guardian' : 'guardians'}`
        }
      />
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={rows}
            isLoading={q.isLoading}
            stickyHeader={false}
            pageSize={15}
            emptyTitle="No guardians found"
            emptyDescription="Try a different search."
            emptyIcon={<Users />}
            toolbar={
              <InputGroup className="w-full sm:max-w-xs">
                <InputGroupAddon align="inline-start">
                  <Search className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search by name, email, or child…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            }
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

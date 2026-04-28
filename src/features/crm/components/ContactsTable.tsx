import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight, Mail, MoreHorizontal, Phone, Trash2, UserSquare } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { DataTable } from '@/shared/ui/data-table'
import { formatCurrency, formatRelative } from '@/shared/lib/format'
import { routes } from '@/routes/routeMap'

import { useTenant } from '@/shared/hooks/useTenant'
import { useDeleteContact } from '../hooks'
import type { Contact } from '../api/crm.contracts'
import { ContactStatusBadge } from './ContactStatusBadge'

type Props = {
  data: Contact[] | undefined
  isLoading?: boolean
  toolbar?: React.ReactNode
}

export function ContactsTable({ data, isLoading, toolbar }: Props) {
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const remove = useDeleteContact(tenant.id)

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: 'firstName',
      header: 'Name',
      cell: ({ row }) => {
        const c = row.original
        return (
          <button
            type="button"
            onClick={() => navigate(routes.app.crm.contact(c.id))}
            className="flex items-center gap-3 text-start"
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">
                {(c.firstName[0] ?? '') + (c.lastName[0] ?? '')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="font-medium leading-tight">
                {c.firstName} {c.lastName}
              </div>
              {c.email ? (
                <div className="text-xs text-muted-foreground">{c.email}</div>
              ) : null}
            </div>
          </button>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <ContactStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) =>
        row.original.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {row.original.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: 'ownerName',
      header: 'Owner',
      cell: ({ row }) =>
        row.original.ownerName ? (
          <span className="text-sm">{row.original.ownerName}</span>
        ) : (
          <span className="text-xs text-muted-foreground">Unassigned</span>
        ),
    },
    {
      accessorKey: 'lastActivityAt',
      header: 'Last activity',
      cell: ({ row }) =>
        row.original.lastActivityAt ? (
          <span className="text-sm text-muted-foreground">
            {formatRelative(row.original.lastActivityAt)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: 'ltv',
      header: () => <div className="text-right">LTV</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.original.ltv, row.original.currency, {
            maximumFractionDigits: 0,
          })}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const c = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open"
              onClick={() => navigate(routes.app.crm.contact(c.id))}
            >
              <ChevronRight />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More actions">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(routes.app.crm.contact(c.id))}>
                  <UserSquare /> Open
                </DropdownMenuItem>
                {c.email ? (
                  <DropdownMenuItem onClick={() => (window.location.href = `mailto:${c.email}`)}>
                    <Mail /> Email
                  </DropdownMenuItem>
                ) : null}
                {c.phone ? (
                  <DropdownMenuItem onClick={() => (window.location.href = `tel:${c.phone}`)}>
                    <Phone /> Call
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => remove.mutate(c.id)}
                >
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      toolbar={toolbar}
      pageSize={10}
      stickyHeader={false}
      emptyTitle="No contacts match"
      emptyDescription="Try adjusting your filters or create a new contact."
      emptyIcon={<UserSquare />}
    />
  )
}

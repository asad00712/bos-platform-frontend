import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Plus, Trash2, Users } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { DataTable } from '@/shared/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

import { useTenant } from '@/shared/hooks/useTenant'
import { formatRelative } from '@/shared/lib/format'

import {
  useChangeMemberRole,
  useMembers,
  useRemoveMember,
  useRoles,
} from '../hooks'
import type { Member } from '../api/settings.contracts'
import { InviteMemberDialog } from '../components/InviteMemberDialog'
import { SectionPanel } from '../components/SectionPanel'

const STATUS_VARIANT = {
  active: 'default',
  invited: 'secondary',
  inactive: 'outline',
} as const

const STATUS_LABEL = {
  active: 'Active',
  invited: 'Invited',
  inactive: 'Inactive',
} as const

export function MembersPage() {
  const { tenant } = useTenant()
  const list = useMembers(tenant.id)
  const roles = useRoles(tenant.id)
  const remove = useRemoveMember(tenant.id)
  const changeRole = useChangeMemberRole(tenant.id)

  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: 'firstName',
      header: 'Member',
      cell: ({ row }) => {
        const m = row.original
        const initials = (
          (m.firstName[0] ?? '') + (m.lastName[0] ?? '')
        ).toUpperCase() || (m.email[0] ?? '·').toUpperCase()
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="text-sm font-medium leading-tight">
                {[m.firstName, m.lastName].filter(Boolean).join(' ') || m.email}
              </div>
              <div className="text-xs text-muted-foreground">{m.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'roleName',
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.roleName}</Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status]}>
          {STATUS_LABEL[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: 'lastActiveAt',
      header: 'Last active',
      cell: ({ row }) =>
        row.original.lastActiveAt ? (
          <span className="text-sm text-muted-foreground">
            {formatRelative(row.original.lastActiveAt)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const m = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Change role</DropdownMenuLabel>
                {(roles.data?.items ?? [])
                  .filter((r) => r.id !== m.roleId)
                  .map((r) => (
                    <DropdownMenuItem
                      key={r.id}
                      onClick={() =>
                        changeRole.mutate({ id: m.id, roleId: r.id })
                      }
                    >
                      {r.name}
                    </DropdownMenuItem>
                  ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => remove.mutate(m.id)}
                >
                  <Trash2 /> Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <SectionPanel
      title="Members"
      description={`${list.data?.total ?? 0} ${list.data?.total === 1 ? 'member' : 'members'} across all roles.`}
      actions={
        <InviteMemberDialog
          trigger={
            <Button>
              <Plus /> Invite member
            </Button>
          }
        />
      }
    >
      <DataTable
        columns={columns}
        data={list.data?.items}
        isLoading={list.isLoading}
        stickyHeader={false}
        pageSize={10}
        emptyTitle="No members yet"
        emptyDescription="Invite your team to start collaborating."
        emptyIcon={<Users />}
      />
    </SectionPanel>
  )
}

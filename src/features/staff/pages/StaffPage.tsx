import { useState } from 'react'
import { Mail, MoreHorizontal, Plus, Trash2, UserPlus, Users, X } from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent } from '@/shared/ui/card'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Switch } from '@/shared/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { formatRelative } from '@/shared/lib/format'

import { useTenant } from '@/shared/hooks/useTenant'
import { useHasPermission } from '@/shared/auth/useHasPermission'
import { useRoles } from '@/features/roles'
import { useBranches } from '@/features/branches'
import type { Staff, StaffStatus } from '@/types/crm'

import {
  useCancelInvite,
  useInviteStaff,
  useRemoveStaff,
  useSetStaffRole,
  useSetStaffRoundRobin,
  useStaff,
  useStaffInvites,
} from '../hooks'
import { InviteStaffDialog } from '../components/InviteStaffDialog'

const STATUS_VARIANT: Record<StaffStatus, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  invited: 'secondary',
  suspended: 'outline',
  removed: 'outline',
}

const STATUS_LABEL: Record<StaffStatus, string> = {
  active: 'Active',
  invited: 'Invited',
  suspended: 'Suspended',
  removed: 'Removed',
}

export function StaffPage() {
  const { tenant } = useTenant()
  const canInvite = useHasPermission('tenant:users:invite')
  const canManage = useHasPermission('tenant:users:manage_roles')
  const canRoundRobin = useHasPermission('tenant:staff:round_robin')

  const staffQ = useStaff(tenant.id)
  const invitesQ = useStaffInvites(tenant.id)
  const rolesQ = useRoles()
  const branchesQ = useBranches()

  const setRole = useSetStaffRole(tenant.id)
  const setRR = useSetStaffRoundRobin(tenant.id)
  const removeM = useRemoveStaff(tenant.id)
  const inviteM = useInviteStaff(tenant.id)
  const cancelM = useCancelInvite(tenant.id)

  const [confirmRemove, setConfirmRemove] = useState<Staff | null>(null)

  const staff = staffQ.data ?? []
  const invites = (invitesQ.data ?? []).filter((i) => !i.acceptedAt)
  const roles = rolesQ.data ?? []
  const branches = branchesQ.data ?? []

  const roleNameById = (id: string) => roles.find((r) => r.id === id)?.name ?? id
  const branchNameById = (id: string) => branches.find((b) => b.id === id)?.name ?? id

  return (
    <div className="space-y-4">
      <PageHeader
        title="Staff"
        description="Members of this tenant. Invite teammates, assign roles, toggle round-robin availability."
        actions={
          canInvite ? (
            <InviteStaffDialog
              trigger={
                <Button>
                  <UserPlus /> Invite
                </Button>
              }
            />
          ) : undefined
        }
      />

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">
            Members
            <Badge variant="outline" className="ms-1.5 text-[10px]">
              {staff.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="invites">
            Pending invites
            <Badge variant="outline" className="ms-1.5 text-[10px]">
              {invites.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          {staffQ.isLoading ? (
            <Card>
              <CardContent className="space-y-3 p-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </CardContent>
            </Card>
          ) : staff.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <Empty className="py-12">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Users />
                    </EmptyMedia>
                    <EmptyTitle>No teammates yet</EmptyTitle>
                    <EmptyDescription>
                      Invite the first member to start working together.
                    </EmptyDescription>
                  </EmptyHeader>
                  {canInvite ? (
                    <InviteStaffDialog
                      trigger={
                        <Button>
                          <Plus /> Invite
                        </Button>
                      }
                    />
                  ) : null}
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {staff.map((m) => {
                    const initials = (
                      (m.firstName?.[0] ?? '') + (m.lastName?.[0] ?? '')
                    ).toUpperCase()
                    const fullName =
                      [m.firstName, m.lastName].filter(Boolean).join(' ') ||
                      m.email
                    const primaryRoleId = m.roleIds[0]
                    return (
                      <li
                        key={m.userId}
                        className="flex flex-wrap items-center gap-3 px-5 py-3"
                      >
                        <Avatar className="size-9">
                          <AvatarFallback className="text-xs">
                            {initials || '·'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium">{fullName}</p>
                            <Badge variant={STATUS_VARIANT[m.status]}>
                              {STATUS_LABEL[m.status]}
                            </Badge>
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {m.email} · {m.branchIds.map(branchNameById).join(', ')}
                          </p>
                          {m.invitedAt && !m.joinedAt ? (
                            <p className="text-[11px] text-muted-foreground">
                              Invited {formatRelative(m.invitedAt)}
                            </p>
                          ) : m.joinedAt ? (
                            <p className="text-[11px] text-muted-foreground">
                              Joined {formatRelative(m.joinedAt)}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                          {canManage ? (
                            <Select
                              value={primaryRoleId}
                              onValueChange={(v) =>
                                setRole.mutate({
                                  userId: m.userId,
                                  roleIds: [v],
                                })
                              }
                            >
                              <SelectTrigger size="sm" className="w-36 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((r) => (
                                  <SelectItem key={r.id} value={r.id}>
                                    {r.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline">
                              {roleNameById(primaryRoleId)}
                            </Badge>
                          )}

                          {canRoundRobin && m.status === 'active' ? (
                            <div className="hidden items-center gap-1.5 sm:flex">
                              <Switch
                                checked={m.roundRobinAvailable}
                                onCheckedChange={(v) =>
                                  setRR.mutate({ userId: m.userId, available: v })
                                }
                                aria-label="Round robin"
                              />
                              <span className="text-[11px] text-muted-foreground">
                                RR
                              </span>
                            </div>
                          ) : null}

                          {canManage ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label="More"
                                >
                                  <MoreHorizontal />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                  {fullName}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    (window.location.href = `mailto:${m.email}`)
                                  }
                                >
                                  <Mail /> Email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => setConfirmRemove(m)}
                                >
                                  <Trash2 /> Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : null}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invites" className="mt-4">
          {invites.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <Empty className="py-12">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Mail />
                    </EmptyMedia>
                    <EmptyTitle>No pending invites</EmptyTitle>
                    <EmptyDescription>
                      When you invite a teammate, the link lands in their email.
                    </EmptyDescription>
                  </EmptyHeader>
                  {canInvite ? (
                    <InviteStaffDialog
                      trigger={
                        <Button>
                          <Plus /> New invite
                        </Button>
                      }
                    />
                  ) : null}
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {invites.map((i) => (
                    <li
                      key={i.id}
                      className="flex flex-wrap items-center gap-3 px-5 py-3"
                    >
                      <Mail className="size-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{i.email}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {roleNameById(i.roleId)} ·{' '}
                          {branchNameById(i.branchId)} · invited{' '}
                          {formatRelative(i.invitedAt)} · expires{' '}
                          {formatRelative(i.expiresAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard?.writeText(i.id)}
                      >
                        Copy token
                      </Button>
                      {canInvite ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Cancel invite"
                          onClick={() => cancelM.mutate(i.id)}
                        >
                          <X />
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={Boolean(confirmRemove)}
        onOpenChange={(o) => !o && setConfirmRemove(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove {confirmRemove?.email}?</DialogTitle>
            <DialogDescription>
              They lose access immediately. Records they own keep the
              `ownedByUserId` reference; reassignment is up to you.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={removeM.isPending}
              onClick={() => {
                if (!confirmRemove) return
                void removeM
                  .mutateAsync(confirmRemove.userId)
                  .then(() => setConfirmRemove(null))
              }}
            >
              {removeM.isPending ? 'Removing…' : 'Remove member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="hidden">
        <span>{inviteM.isPending}</span>
      </p>
    </div>
  )
}

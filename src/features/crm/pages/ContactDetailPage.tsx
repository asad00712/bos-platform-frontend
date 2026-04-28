import { Link, useNavigate, useParams } from 'react-router'
import { useState } from 'react'
import {
  Calendar,
  ChevronLeft,
  Mail,
  MoreHorizontal,
  Phone,
  Receipt,
  Trash2,
  UserSquare,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'

import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

import { formatCurrency, formatDate, formatRelative } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'
import { useHasPermission } from '@/shared/auth/useHasPermission'
import { routes } from '@/routes/routeMap'

import {
  useContact,
  useDeleteContact,
  useOwnerLookup,
  useSourceLookup,
  useTagLookup,
  useUpdateContact,
} from '../hooks'
import type { ContactInput } from '../api/crm.contracts'
import { ContactActivityTimeline } from '../components/ContactActivityTimeline'
import { ContactForm } from '../components/ContactForm'
import { ContactStatusBadge } from '../components/ContactStatusBadge'

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { tenant } = useTenant()
  const canWrite = useHasPermission('tenant:contacts:update')

  const query = useContact(tenant.id, id)
  const update = useUpdateContact(tenant.id)
  const remove = useDeleteContact(tenant.id)

  const tagsQ = useTagLookup(tenant.id)
  const sourcesQ = useSourceLookup(tenant.id)
  const ownersQ = useOwnerLookup(tenant.id)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (query.isLoading || !query.data) {
    return (
      <PageContainer>
        <PageHeader title="Loading…" description="" />
        <Card>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <PageHeader title="Contact" description="" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserSquare />
            </EmptyMedia>
            <EmptyTitle>Contact not found</EmptyTitle>
            <EmptyDescription>
              {(query.error as Error)?.message ?? 'It may have been removed.'}
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to={routes.app.crm.root()}>
              <ChevronLeft /> Back to contacts
            </Link>
          </Button>
        </Empty>
      </PageContainer>
    )
  }

  const c = query.data
  const fullName = `${c.firstName} ${c.lastName ?? ''}`.trim()
  const initials = `${c.firstName[0] ?? ''}${c.lastName?.[0] ?? ''}`.toUpperCase()
  const owner = ownersQ.data?.find((o) => o.userId === c.ownerUserId)
  const source = sourcesQ.data?.find((s) => s.id === c.sourceId)
  const tags = (tagsQ.data ?? []).filter((t) => c.tagIds.includes(t.id))
  const addressLines = c.address
    ? [
        c.address.line1,
        [c.address.city, c.address.state, c.address.postalCode]
          .filter(Boolean)
          .join(', '),
        c.address.country,
      ].filter(Boolean)
    : []

  const handleEditSubmit = async (values: ContactInput) => {
    await update.mutateAsync({ id: c.id, patch: values })
    setEditOpen(false)
  }

  const handleDeleteConfirm = async () => {
    await remove.mutateAsync(c.id)
    setDeleteOpen(false)
    navigate(routes.app.crm.root())
  }

  return (
    <PageContainer>
      <PageHeader
        title={fullName}
        description={c.email ?? c.phone ?? c.company ?? undefined}
        breadcrumbs={[
          { label: t('navigation.crm'), href: routes.app.crm.root() },
          { label: fullName },
        ]}
        actions={
          <>
            {c.email ? (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${c.email}`}>
                  <Mail /> Email
                </a>
              </Button>
            ) : null}
            {c.phone ? (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${c.phone}`}>
                  <Phone /> Call
                </a>
              </Button>
            ) : null}
            {canWrite ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="More">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    Edit contact
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarFallback className="text-sm">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-semibold leading-tight">{fullName}</p>
                <ContactStatusBadge status={c.status} />
              </div>
            </div>

            <dl className="space-y-3 text-sm">
              <DetailRow label="Email" value={c.email ?? '—'} />
              <DetailRow label="Phone" value={c.phone ?? '—'} />
              <DetailRow label="Company" value={c.company ?? '—'} />
              <DetailRow label="Job title" value={c.jobTitle ?? '—'} />
              <DetailRow
                label="Owner"
                value={
                  owner ? (
                    owner.name
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )
                }
              />
              <DetailRow label="Source" value={source?.name ?? '—'} />
              <DetailRow label="Vertical" value={c.vertical ?? '—'} />
              <DetailRow
                label="LTV"
                value={formatCurrency(c.ltv, c.currency, { maximumFractionDigits: 0 })}
              />
              {c.birthday ? (
                <DetailRow label="Birthday" value={formatDate(c.birthday)} />
              ) : null}
              <DetailRow label="Created" value={formatDate(c.createdAt)} />
              {c.lastActivityAt ? (
                <DetailRow
                  label="Last activity"
                  value={formatRelative(c.lastActivityAt)}
                />
              ) : null}
            </dl>

            {addressLines.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Address
                </p>
                <p className="whitespace-pre-line text-sm">
                  {addressLines.join('\n')}
                </p>
              </div>
            ) : null}

            {tags.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="lg:col-span-8">
          <Tabs defaultValue="activity">
            <TabsList>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="appointments">
                <Calendar className="size-3" /> Appointments
              </TabsTrigger>
              <TabsTrigger value="invoices">
                <Receipt className="size-3" /> Invoices
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardContent className="p-5">
                  <ContactActivityTimeline contactId={c.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardContent className="p-5">
                  {c.notes ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {c.notes}
                    </p>
                  ) : (
                    <Empty className="py-10">
                      <EmptyHeader>
                        <EmptyTitle>No notes yet</EmptyTitle>
                        <EmptyDescription>
                          Add internal notes via the edit dialog.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="mt-4">
              <Card>
                <CardContent className="p-5">
                  <Empty className="py-10">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Calendar />
                      </EmptyMedia>
                      <EmptyTitle>No appointments</EmptyTitle>
                      <EmptyDescription>
                        Once linked to scheduling, upcoming and past appointments
                        appear here.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices" className="mt-4">
              <Card>
                <CardContent className="p-5">
                  <Empty className="py-10">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Receipt />
                      </EmptyMedia>
                      <EmptyTitle>No invoices</EmptyTitle>
                      <EmptyDescription>
                        Once billing connects, this contact&apos;s invoices and
                        payments will show up.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit contact</DialogTitle>
            <DialogDescription>
              Update name, contact info, address, status, or notes.
            </DialogDescription>
          </DialogHeader>
          <ContactForm
            defaultValues={{
              branchId: c.branchId,
              firstName: c.firstName,
              lastName: c.lastName ?? undefined,
              email: c.email ?? '',
              phone: c.phone ?? '',
              company: c.company ?? undefined,
              jobTitle: c.jobTitle ?? undefined,
              address: c.address ?? undefined,
              status: c.status,
              sourceId: c.sourceId ?? undefined,
              ownerUserId: c.ownerUserId ?? undefined,
              vertical: c.vertical ?? undefined,
              birthday: c.birthday ?? undefined,
              tagIds: c.tagIds,
              notes: c.notes ?? '',
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditOpen(false)}
            submitLabel="Save changes"
            isSubmitting={update.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete contact?</DialogTitle>
            <DialogDescription>
              This permanently removes {fullName} and any associated data.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={remove.isPending}
            >
              {remove.isPending ? 'Deleting…' : 'Delete contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-end">{value}</dd>
    </div>
  )
}

import { Link, useNavigate, useParams } from 'react-router'
import { useState } from 'react'
import {
  ArrowRightLeft,
  ChevronLeft,
  Mail,
  MoreHorizontal,
  Phone,
  Trash2,
  Workflow,
} from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'

import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

import { formatCurrency, formatDate, formatRelative } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'
import { useHasPermission } from '@/shared/auth/useHasPermission'
import { useOwnerLookup, useSourceLookup } from '@/features/crm/hooks'
import { routes } from '@/routes/routeMap'

import type { LeadInput } from '../api/leads.api'
import {
  useDeleteLead,
  useLead,
  useLeadStatuses,
  useSetLeadStatus,
  useUpdateLead,
} from '../hooks'
import { LeadActivityList } from '../components/LeadActivityList'
import { LeadForm } from '../components/LeadForm'
import { LeadPriorityBadge } from '../components/LeadPriorityBadge'
import { LeadStatusChip } from '../components/LeadStatusChip'
import { ConvertLeadDialog } from '../components/ConvertLeadDialog'

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const canWrite = useHasPermission('tenant:leads:update')

  const query = useLead(tenant.id, id)
  const update = useUpdateLead(tenant.id)
  const remove = useDeleteLead(tenant.id)
  const setStatus = useSetLeadStatus(tenant.id)

  const sourcesQ = useSourceLookup(tenant.id)
  const ownersQ = useOwnerLookup(tenant.id)
  const statusesQ = useLeadStatuses(tenant.id)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [convertOpen, setConvertOpen] = useState(false)

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
        <PageHeader title="Lead" description="" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Workflow />
            </EmptyMedia>
            <EmptyTitle>Lead not found</EmptyTitle>
            <EmptyDescription>
              {(query.error as Error)?.message ?? 'It may have been removed.'}
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to={routes.app.crm.leads()}>
              <ChevronLeft /> Back to leads
            </Link>
          </Button>
        </Empty>
      </PageContainer>
    )
  }

  const l = query.data
  const fullName = `${l.firstName} ${l.lastName ?? ''}`.trim()
  const initials = `${l.firstName[0] ?? ''}${l.lastName?.[0] ?? ''}`.toUpperCase()
  const owner = ownersQ.data?.find((o) => o.userId === l.ownerUserId)
  const source = sourcesQ.data?.find((s) => s.id === l.sourceId)
  const status = statusesQ.data?.find((s) => s.id === l.statusId)
  const isConverted = Boolean(l.convertedAt)

  const handleEditSubmit = async (values: LeadInput) => {
    await update.mutateAsync({ id: l.id, patch: values })
    setEditOpen(false)
  }

  const handleDeleteConfirm = async () => {
    await remove.mutateAsync(l.id)
    setDeleteOpen(false)
    navigate(routes.app.crm.leads())
  }

  return (
    <PageContainer>
      <PageHeader
        title={fullName}
        description={l.email ?? l.phone ?? l.company ?? undefined}
        breadcrumbs={[
          { label: 'CRM', href: routes.app.crm.root() },
          { label: 'Leads', href: routes.app.crm.leads() },
          { label: fullName },
        ]}
        actions={
          <>
            {l.email ? (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${l.email}`}>
                  <Mail /> Email
                </a>
              </Button>
            ) : null}
            {l.phone ? (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${l.phone}`}>
                  <Phone /> Call
                </a>
              </Button>
            ) : null}
            {canWrite && !isConverted ? (
              <Button onClick={() => setConvertOpen(true)} size="sm">
                <ArrowRightLeft /> Convert
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
                    Edit lead
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
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <LeadStatusChip status={status} />
                  <LeadPriorityBadge priority={l.priority} />
                </div>
              </div>
            </div>

            {canWrite ? (
              <div>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Stage
                </p>
                <Select
                  value={l.statusId ?? ''}
                  onValueChange={(v) => setStatus.mutate({ id: l.id, statusId: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Set status" />
                  </SelectTrigger>
                  <SelectContent>
                    {(statusesQ.data ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <dl className="space-y-3 text-sm">
              <DetailRow label="Email" value={l.email ?? '—'} />
              <DetailRow label="Phone" value={l.phone ?? '—'} />
              <DetailRow label="Company" value={l.company ?? '—'} />
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
              <DetailRow
                label="Estimated"
                value={
                  l.estimatedValue != null
                    ? formatCurrency(l.estimatedValue, 'USD', {
                        maximumFractionDigits: 0,
                      })
                    : '—'
                }
              />
              <DetailRow label="Created" value={formatDate(l.createdAt)} />
              {l.convertedAt ? (
                <DetailRow label="Converted" value={formatRelative(l.convertedAt)} />
              ) : null}
            </dl>

            {l.contactId ? (
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link to={routes.app.crm.contact(l.contactId)}>
                  Open linked contact
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <div className="lg:col-span-8">
          <Tabs defaultValue="activity">
            <TabsList>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardContent className="p-5">
                  <LeadActivityList leadId={l.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardContent className="p-5">
                  {l.notes ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {l.notes}
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
          </Tabs>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit lead</DialogTitle>
            <DialogDescription>
              Update name, contact, status, priority, value, or notes.
            </DialogDescription>
          </DialogHeader>
          <LeadForm
            defaultValues={{
              branchId: l.branchId,
              firstName: l.firstName,
              lastName: l.lastName ?? undefined,
              email: l.email ?? '',
              phone: l.phone ?? '',
              company: l.company ?? undefined,
              sourceId: l.sourceId ?? undefined,
              statusId: l.statusId ?? undefined,
              priority: l.priority,
              estimatedValue: l.estimatedValue ?? undefined,
              ownerUserId: l.ownerUserId ?? undefined,
              notes: l.notes ?? '',
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditOpen(false)}
            submitLabel="Save changes"
            isSubmitting={update.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete lead?</DialogTitle>
            <DialogDescription>
              This permanently removes {fullName} and any associated
              activities. Cannot be undone.
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
              {remove.isPending ? 'Deleting…' : 'Delete lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConvertLeadDialog lead={l} open={convertOpen} onOpenChange={setConvertOpen} />
    </PageContainer>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-end">{value}</dd>
    </div>
  )
}

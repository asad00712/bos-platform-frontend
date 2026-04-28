import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  CalendarDays,
  ChevronLeft,
  Mail,
  MoreHorizontal,
  Phone,
  Trash2,
  UserSquare,
} from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
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

import { formatDate, formatDateTime, formatTime } from '@/shared/lib/format'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useTenant } from '@/shared/hooks/useTenant'
import { routes } from '@/routes/routeMap'

import {
  useAppointment,
  useCancelAppointment,
  useDeleteAppointment,
  useUpdateAppointment,
} from '../hooks'
import type { AppointmentInput } from '../api/scheduling.contracts'
import { AppointmentForm } from '../components/AppointmentForm'
import { AppointmentStatusBadge } from '../components/AppointmentStatusBadge'

export function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const { has } = usePermissions()

  const query = useAppointment(tenant.id, id)
  const update = useUpdateAppointment(tenant.id)
  const cancel = useCancelAppointment(tenant.id)
  const remove = useDeleteAppointment(tenant.id)

  const [editOpen, setEditOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const canWrite = has('scheduling:write')

  if (query.isLoading || !query.data) {
    return (
      <PageContainer>
        <PageHeader title="Loading…" />
        <Card>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <PageHeader title="Appointment" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarDays />
            </EmptyMedia>
            <EmptyTitle>Appointment not found</EmptyTitle>
            <EmptyDescription>
              {(query.error as Error)?.message ?? 'It may have been removed.'}
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to={routes.app.scheduling.root()}>
              <ChevronLeft /> Back to calendar
            </Link>
          </Button>
        </Empty>
      </PageContainer>
    )
  }

  const a = query.data
  const start = new Date(a.startsAt)
  const end = new Date(a.endsAt)

  const handleEditSubmit = async (values: AppointmentInput) => {
    await update.mutateAsync({ id: a.id, patch: values })
    setEditOpen(false)
  }

  const handleCancelConfirm = async () => {
    await cancel.mutateAsync({ id: a.id, reason: null })
    setCancelOpen(false)
  }

  const handleDeleteConfirm = async () => {
    await remove.mutateAsync(a.id)
    setDeleteOpen(false)
    navigate(routes.app.scheduling.root())
  }

  return (
    <PageContainer>
      <PageHeader
        title={a.title}
        breadcrumbs={[
          { label: 'Scheduling', href: routes.app.scheduling.root() },
          { label: a.title },
        ]}
        actions={
          canWrite ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  Edit appointment
                </DropdownMenuItem>
                {a.status !== 'cancelled' ? (
                  <DropdownMenuItem onClick={() => setCancelOpen(true)}>
                    Cancel appointment
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <AppointmentStatusBadge status={a.status} />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {a.kind.replace('_', ' ')}
              </span>
            </div>

            <h2 className="text-xl font-semibold">{a.title}</h2>

            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <DetailRow
                label="When"
                value={
                  <>
                    <div>{formatDate(start, { dateStyle: 'full' })}</div>
                    <div className="text-muted-foreground">
                      {formatTime(start)} – {formatTime(end)}
                    </div>
                  </>
                }
              />
              <DetailRow label="Staff" value={a.staffName ?? '—'} />
              <DetailRow label="Resource" value={a.resourceName ?? '—'} />
              <DetailRow label="Created" value={formatDateTime(a.createdAt)} />
            </dl>

            {a.notes ? (
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Notes
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {a.notes}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Contact
            </p>
            {a.contactId ? (
              <div className="space-y-3">
                <Button variant="ghost" size="sm" asChild className="-ms-2">
                  <Link to={routes.app.crm.contact(a.contactId)}>
                    <UserSquare />
                    {a.contactName ?? 'Open contact'}
                  </Link>
                </Button>
                {a.contactEmail ? (
                  <Button variant="outline" size="sm" asChild className="w-full justify-start">
                    <a href={`mailto:${a.contactEmail}`}>
                      <Mail /> {a.contactEmail}
                    </a>
                  </Button>
                ) : null}
                {a.contactPhone ? (
                  <Button variant="outline" size="sm" asChild className="w-full justify-start">
                    <a href={`tel:${a.contactPhone}`}>
                      <Phone /> {a.contactPhone}
                    </a>
                  </Button>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No contact linked.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit appointment</DialogTitle>
            <DialogDescription>Update timing, status, or details.</DialogDescription>
          </DialogHeader>
          <AppointmentForm
            defaultValues={{
              title: a.title,
              startsAt: a.startsAt,
              endsAt: a.endsAt,
              status: a.status,
              kind: a.kind,
              contactId: a.contactId ?? null,
              staffName: a.staffName ?? '',
              resourceId: a.resourceId ?? null,
              notes: a.notes ?? '',
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditOpen(false)}
            submitLabel="Save changes"
            isSubmitting={update.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Cancel confirm */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel appointment?</DialogTitle>
            <DialogDescription>
              This marks the appointment as cancelled. The contact will be notified
              if reminders are configured.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              Keep appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={cancel.isPending}
            >
              {cancel.isPending ? 'Cancelling…' : 'Cancel appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete appointment?</DialogTitle>
            <DialogDescription>
              Permanently removes this appointment and any reminders.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Keep
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={remove.isPending}
            >
              {remove.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm">{value}</dd>
    </div>
  )
}

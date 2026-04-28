import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  ChevronLeft,
  Mail,
  MoreHorizontal,
  Phone,
  Trash2,
  Users,
} from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
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

import { formatDate } from '@/shared/lib/format'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useTenant } from '@/shared/hooks/useTenant'
import { routes } from '@/routes/routeMap'

import {
  useDeleteEmployee,
  useEmployee,
  useUpdateEmployee,
} from '../hooks'
import type { EmployeeInput } from '../api/hrm.contracts'
import { EmployeeForm } from '../components/EmployeeForm'
import { EmployeeStatusBadge } from '../components/StatusBadges'
import { ClockInOutCard } from '../components/ClockInOutCard'

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const { has } = usePermissions()

  const query = useEmployee(tenant.id, id)
  const update = useUpdateEmployee(tenant.id)
  const remove = useDeleteEmployee(tenant.id)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const canWrite = has('hrm:write')

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
        <PageHeader title="Employee" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>Employee not found</EmptyTitle>
            <EmptyDescription>
              {(query.error as Error)?.message ?? 'They may have been removed.'}
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to={routes.app.hrm.employees()}>
              <ChevronLeft /> Back to team
            </Link>
          </Button>
        </Empty>
      </PageContainer>
    )
  }

  const e = query.data
  const fullName = `${e.firstName} ${e.lastName}`
  const initials = `${e.firstName[0] ?? ''}${e.lastName[0] ?? ''}`.toUpperCase()

  const handleEditSubmit = async (values: EmployeeInput) => {
    await update.mutateAsync({ id: e.id, patch: values })
    setEditOpen(false)
  }
  const handleDeleteConfirm = async () => {
    await remove.mutateAsync(e.id)
    setDeleteOpen(false)
    navigate(routes.app.hrm.employees())
  }

  return (
    <PageContainer>
      <PageHeader
        title={fullName}
        description={`${e.jobTitle} · ${e.department}`}
        breadcrumbs={[
          { label: 'Team', href: routes.app.hrm.employees() },
          { label: fullName },
        ]}
        actions={
          <>
            {e.email ? (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${e.email}`}>
                  <Mail /> Email
                </a>
              </Button>
            ) : null}
            {e.phone ? (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${e.phone}`}>
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
                    Edit employee
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 /> Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-5 p-5">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarFallback className="text-sm">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <div className="text-base font-semibold">{fullName}</div>
                <EmployeeStatusBadge status={e.status} />
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <DetailRow label="Email" value={e.email ?? '—'} />
              <DetailRow label="Phone" value={e.phone ?? '—'} />
              <DetailRow label="Department" value={e.department} />
              <DetailRow label="Job title" value={e.jobTitle} />
              <DetailRow
                label="Type"
                value={e.employmentType.replace('_', ' ')}
                capitalize
              />
              <DetailRow
                label="Started"
                value={formatDate(e.startDate, { dateStyle: 'medium' })}
              />
              <DetailRow label="Manager" value={e.managerName ?? '—'} />
              <DetailRow
                label="PTO balance"
                value={`${e.ptoBalanceDays} days`}
              />
            </dl>

            {e.notes ? (
              <div className="space-y-1 border-t pt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Notes
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{e.notes}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <ClockInOutCard employeeId={e.id} employeeName={fullName} />
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit employee</DialogTitle>
            <DialogDescription>Update role, department, or status.</DialogDescription>
          </DialogHeader>
          <EmployeeForm
            defaultValues={{
              firstName: e.firstName,
              lastName: e.lastName,
              email: e.email ?? '',
              phone: e.phone ?? '',
              jobTitle: e.jobTitle,
              department: e.department,
              employmentType: e.employmentType,
              status: e.status,
              startDate: e.startDate,
              managerName: e.managerName,
              notes: e.notes ?? '',
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditOpen(false)}
            submitLabel="Save changes"
            isSubmitting={update.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Remove confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove employee?</DialogTitle>
            <DialogDescription>
              This permanently removes {fullName} from your team. Past attendance
              and leave records stay for audit.
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
              {remove.isPending ? 'Removing…' : 'Remove employee'}
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
  capitalize,
}: {
  label: string
  value: React.ReactNode
  capitalize?: boolean
}) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className={`text-sm ${capitalize ? 'capitalize' : ''}`}>{value}</dd>
    </div>
  )
}

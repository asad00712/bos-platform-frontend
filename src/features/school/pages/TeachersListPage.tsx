import type { ColumnDef } from '@tanstack/react-table'
import { GraduationCap, Mail, Phone } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'

import { formatDate } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import type { Teacher } from '../api/school.contracts'
import { useTeachersList } from '../hooks'

export function TeachersListPage() {
  const { tenant } = useTenant()
  const q = useTeachersList(tenant.id)

  const columns: ColumnDef<Teacher>[] = [
    {
      accessorKey: 'firstName',
      header: 'Teacher',
      cell: ({ row }) => {
        const t = row.original
        const initials =
          `${t.firstName[0] ?? ''}${t.lastName[0] ?? ''}`.toUpperCase()
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="font-medium leading-tight">
                {t.firstName} {t.lastName}
                {t.isHomeroom ? (
                  <Badge variant="outline" className="ms-1 text-[10px]">
                    Homeroom
                  </Badge>
                ) : null}
              </div>
              <div className="text-xs text-muted-foreground">
                {t.employeeNumber}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'qualification',
      header: 'Qualification',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.qualification}
        </span>
      ),
    },
    {
      accessorKey: 'subjects',
      header: 'Subjects',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.subjects.map((s) => (
            <Badge key={s} variant="outline" className="text-[11px]">
              {s}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'classesAssigned',
      header: 'Classes',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.classesAssigned.join(' · ') || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'joinedAt',
      header: 'Joined',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.original.joinedAt, { dateStyle: 'medium' })}
        </span>
      ),
    },
    {
      id: 'contact',
      header: () => <div className="text-right">Contact</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          {row.original.email ? (
            <Button variant="ghost" size="icon" asChild aria-label="Email">
              <a href={`mailto:${row.original.email}`}>
                <Mail />
              </a>
            </Button>
          ) : null}
          {row.original.phone ? (
            <Button variant="ghost" size="icon" asChild aria-label="Call">
              <a href={`tel:${row.original.phone}`}>
                <Phone />
              </a>
            </Button>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Teachers"
        description={
          q.isLoading
            ? 'Loading…'
            : `${q.data?.items.length ?? 0} faculty members`
        }
      />
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={q.data?.items}
            isLoading={q.isLoading}
            stickyHeader={false}
            emptyTitle="No teachers"
            emptyDescription="Add faculty members to assign subjects and homerooms."
            emptyIcon={<GraduationCap />}
            noPagination
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

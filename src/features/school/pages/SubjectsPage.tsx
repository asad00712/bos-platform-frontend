import type { ColumnDef } from '@tanstack/react-table'
import { BookOpen } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'

import { useTenant } from '@/shared/hooks/useTenant'

import type { Subject } from '../api/school.contracts'
import { useSubjectsList } from '../hooks'

const CATEGORY_TONE: Record<Subject['category'], string> = {
  core: 'bg-primary/10 text-primary border-primary/30',
  language: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300',
  science: 'bg-sky-500/10 text-sky-700 border-sky-500/30 dark:text-sky-300',
  arts: 'bg-violet-500/10 text-violet-700 border-violet-500/30 dark:text-violet-300',
  sports: 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300',
  elective: 'bg-muted text-muted-foreground border-border',
}

export function SubjectsPage() {
  const { tenant } = useTenant()
  const q = useSubjectsList(tenant.id)

  const columns: ColumnDef<Subject>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Subject',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs capitalize ${CATEGORY_TONE[row.original.category]}`}
        >
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: 'weeklyPeriods',
      header: 'Periods/wk',
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.weeklyPeriods}</span>
      ),
    },
    {
      accessorKey: 'classCount',
      header: 'Classes',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs tabular-nums">
          {row.original.classCount}
        </Badge>
      ),
    },
    {
      accessorKey: 'teacherCount',
      header: 'Teachers',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs tabular-nums">
          {row.original.teacherCount}
        </Badge>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Subjects"
        description={
          q.isLoading
            ? 'Loading…'
            : `${q.data?.items.length ?? 0} subjects`
        }
      />
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={q.data?.items}
            isLoading={q.isLoading}
            stickyHeader={false}
            emptyTitle="No subjects defined"
            emptyDescription="Configure subjects to build the timetable."
            emptyIcon={<BookOpen />}
            noPagination
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

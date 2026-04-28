import { Link } from 'react-router'
import { Layers } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

import { useTenant } from '@/shared/hooks/useTenant'
import { useClassesList } from '../hooks'

export function ClassesListPage() {
  const { tenant } = useTenant()
  const q = useClassesList(tenant.id)

  if (q.isLoading || !q.data) {
    return (
      <PageContainer>
        <PageHeader title="Classes" description="Loading…" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      </PageContainer>
    )
  }

  if (q.data.items.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Classes" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Layers />
            </EmptyMedia>
            <EmptyTitle>No classes yet</EmptyTitle>
            <EmptyDescription>
              Create classes and sections to organize students.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Classes"
        description={`${q.data.items.length} classes · ${q.data.items.reduce(
          (sum, c) => sum + c.totalStudents,
          0,
        )} students`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {q.data.items.map((c) => (
          <Card key={c.id}>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Grade level {c.level} · {c.totalStudents} students
                  </p>
                </div>
                <Badge variant="outline">
                  {c.sectionCount} section{c.sectionCount === 1 ? '' : 's'}
                </Badge>
              </div>
              <ul className="space-y-2 border-t pt-3">
                {c.sections.map((s) => {
                  const utilization = s.capacity > 0 ? s.enrolled / s.capacity : 0
                  return (
                    <li key={s.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          Section {s.sectionName}
                        </span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {s.enrolled} / {s.capacity}
                        </span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={
                            utilization >= 0.9
                              ? 'h-full bg-rose-500'
                              : utilization >= 0.75
                                ? 'h-full bg-amber-500'
                                : 'h-full bg-primary'
                          }
                          style={{ width: `${utilization * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {s.homeroomTeacher ?? 'No homeroom assigned'}
                        {s.roomName ? ` · Room ${s.roomName}` : ''}
                      </p>
                    </li>
                  )
                })}
              </ul>
              <div className="border-t pt-3">
                <Link
                  to={`/app/school/timetable?classId=${c.id}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View timetable →
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}

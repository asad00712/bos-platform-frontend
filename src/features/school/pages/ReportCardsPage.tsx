import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { FileText, Search, Trophy } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group'
import { Skeleton } from '@/shared/ui/skeleton'

import { formatPercent } from '@/shared/lib/format'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useTenant } from '@/shared/hooks/useTenant'

import { useReportCards } from '../hooks'

export function ReportCardsPage() {
  const { tenant } = useTenant()
  const q = useReportCards(tenant.id)

  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search, 200)

  const items = useMemo(() => {
    const list = q.data?.items ?? []
    if (!debounced) return list
    const needle = debounced.toLowerCase()
    return list.filter(
      (rc) =>
        rc.studentName.toLowerCase().includes(needle) ||
        rc.className.toLowerCase().includes(needle),
    )
  }, [q.data, debounced])

  return (
    <PageContainer>
      <PageHeader
        title="Report cards"
        description={
          q.isLoading
            ? 'Loading…'
            : `${items.length} ${items.length === 1 ? 'report card' : 'report cards'} · current term`
        }
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <InputGroup className="w-full sm:max-w-xs">
            <InputGroupAddon align="inline-start">
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search students…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          {q.isLoading ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <FileText className="size-8 opacity-50" />
              <p>No report cards match.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((rc) => (
                <Card key={rc.id} className="border">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          to={`/app/school/students/${rc.studentId}`}
                          className="font-medium hover:underline"
                        >
                          {rc.studentName}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {rc.className} · Section {rc.sectionName} ·{' '}
                          {rc.termName}
                        </p>
                      </div>
                      {rc.rank ? (
                        <Badge className="gap-1">
                          <Trophy className="size-3" /> Rank {rc.rank}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="flex items-baseline gap-3">
                      <p className="text-2xl font-semibold tabular-nums">
                        {formatPercent(rc.percentage, 1)}
                      </p>
                      <Badge variant="outline" className="font-mono">
                        {rc.overallGrade}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {rc.totalMarks} / {rc.totalMaxMarks}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-t pt-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Attendance</p>
                        <p className="font-medium tabular-nums">
                          {formatPercent(rc.attendanceRate, 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conduct</p>
                        <p className="font-medium">{rc.conduct}</p>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/app/school/students/${rc.studentId}`}>
                          View →
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

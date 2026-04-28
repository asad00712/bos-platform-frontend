import { Link } from 'react-router'
import { Building2, Home, User } from 'lucide-react'

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

import type { HostelRoom } from '../api/school.contracts'
import { useHostel } from '../hooks'

const TYPE_TONE: Record<HostelRoom['type'], string> = {
  boys: 'border-sky-500/40 text-sky-700 bg-sky-500/5 dark:text-sky-300',
  girls: 'border-rose-500/40 text-rose-700 bg-rose-500/5 dark:text-rose-300',
  staff: 'border-violet-500/40 text-violet-700 bg-violet-500/5 dark:text-violet-300',
}

export function HostelPage() {
  const { tenant } = useTenant()
  const q = useHostel(tenant.id)

  if (q.isLoading || !q.data) {
    return (
      <PageContainer>
        <PageHeader title="Hostel" description="Loading…" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      </PageContainer>
    )
  }

  if (q.data.items.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Hostel" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Home />
            </EmptyMedia>
            <EmptyTitle>No hostel rooms configured</EmptyTitle>
            <EmptyDescription>
              Add buildings and rooms to manage residential placements.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </PageContainer>
    )
  }

  // Group rooms by building
  const byBuilding = q.data.items.reduce<Record<string, HostelRoom[]>>(
    (acc, r) => {
      ;(acc[r.building] ??= []).push(r)
      return acc
    },
    {},
  )

  const occupancy = q.data.totals.capacity > 0
    ? q.data.totals.occupied / q.data.totals.capacity
    : 0

  return (
    <PageContainer>
      <PageHeader
        title="Hostel"
        description={`${q.data.totals.rooms} rooms · ${q.data.totals.occupied} / ${q.data.totals.capacity} beds (${(occupancy * 100).toFixed(0)}%)`}
      />

      {Object.entries(byBuilding).map(([building, rooms]) => (
        <div key={building} className="space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {building}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((r) => (
              <Card key={r.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-base font-semibold">Room {r.roomNumber}</p>
                      <p className="text-xs tabular-nums text-muted-foreground">
                        {r.occupied} / {r.capacity} beds
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${TYPE_TONE[r.type]}`}
                    >
                      {r.type}
                    </span>
                  </div>
                  {r.occupants.length > 0 ? (
                    <ul className="space-y-1.5 border-t pt-3">
                      {r.occupants.map((o) => (
                        <li key={o.studentId} className="flex items-center gap-2 text-sm">
                          <User className="size-3.5 text-muted-foreground" />
                          <Link
                            to={`/app/school/students/${o.studentId}`}
                            className="truncate font-medium hover:underline"
                          >
                            {o.studentName}
                          </Link>
                          <Badge variant="outline" className="ms-auto text-[10px]">
                            {o.className}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="border-t pt-3 text-xs text-muted-foreground">
                      Vacant
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </PageContainer>
  )
}

import { Bus, MapPin, Phone, User } from 'lucide-react'

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

import { useTransportRoutes } from '../hooks'

export function TransportPage() {
  const { tenant } = useTenant()
  const q = useTransportRoutes(tenant.id)

  if (q.isLoading || !q.data) {
    return (
      <PageContainer>
        <PageHeader title="Transport" description="Loading…" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </PageContainer>
    )
  }

  if (q.data.items.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Transport" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Bus />
            </EmptyMedia>
            <EmptyTitle>No transport routes</EmptyTitle>
            <EmptyDescription>
              Add routes, vehicles, and stops to manage student pickup.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Transport"
        description={`${q.data.items.length} routes · ${q.data.items.reduce(
          (sum, r) => sum + r.studentsAssigned,
          0,
        )} students riding`}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {q.data.items.map((r) => {
          const utilization = r.capacity > 0 ? r.studentsAssigned / r.capacity : 0
          return (
            <Card key={r.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Vehicle {r.vehicleNumber}
                    </p>
                  </div>
                  <Badge variant="outline" className="tabular-nums">
                    {r.studentsAssigned} / {r.capacity}
                  </Badge>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
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

                <div className="grid grid-cols-2 gap-3 border-t pt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <User className="size-3.5 text-muted-foreground" />
                    <span>{r.driverName}</span>
                  </div>
                  {r.driverPhone ? (
                    <a
                      href={`tel:${r.driverPhone}`}
                      className="flex items-center gap-1.5 hover:underline"
                    >
                      <Phone className="size-3.5 text-muted-foreground" />
                      {r.driverPhone}
                    </a>
                  ) : null}
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Stops ({r.stops.length})
                  </p>
                  <ul className="space-y-1.5">
                    {r.stops.map((s, i) => (
                      <li
                        key={`${r.id}-${i}`}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold tabular-nums text-primary">
                          {i + 1}
                        </span>
                        <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate">{s.name}</span>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {s.morningPickup} · {s.afternoonDrop}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </PageContainer>
  )
}

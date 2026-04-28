import {
  Dumbbell,
  GraduationCap,
  Scale,
  ShoppingBag,
  Smile,
  Sparkles,
  Stethoscope,
  Utensils,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { Panel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatCompact } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'
import { useActiveVerticals } from '../hooks'
import type { Widget } from './types'

const VERTICAL_ICON: Record<string, LucideIcon> = {
  dental: Smile,
  medical: Stethoscope,
  law: Scale,
  restaurant: Utensils,
  school: GraduationCap,
  gym: Dumbbell,
  salon: Sparkles,
  retail: ShoppingBag,
}

const STATUS_VARIANT = {
  live: 'default',
  beta: 'secondary',
  dev: 'outline',
} as const

function ActiveVerticalsGridComponent() {
  const { tenant } = useTenant()
  const query = useActiveVerticals(tenant.id)

  return (
    <Panel title="Active verticals" description="Per-vertical adoption snapshot">
      {query.isLoading || !query.data ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {query.data.items.map((v) => {
            const Icon = VERTICAL_ICON[v.id] ?? Smile
            return (
              <Card key={v.id} className="border bg-card/50">
                <CardContent className="flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between">
                    <span className="grid size-8 place-items-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="size-4" />
                    </span>
                    <Badge variant={STATUS_VARIANT[v.status]} className="text-[10px] uppercase">
                      {v.status}
                    </Badge>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-tight">{v.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCompact(v.customers)} customers
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </Panel>
  )
}

export const ActiveVerticalsWidget: Widget = {
  id: 'dashboard.active-verticals',
  Component: ActiveVerticalsGridComponent,
  permission: 'dashboard:view',
  span: { col: 8 },
}

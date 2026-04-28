import {
  Activity,
  CalendarDays,
  LifeBuoy,
  Receipt,
  Sparkles,
  UserPlus,
} from 'lucide-react'

import { Panel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatRelative } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'

import { useRecentActivity } from '../hooks'
import type { Widget } from './types'
import type { Activity as ActivityType } from '../api/dashboard.contracts'

/**
 * Type-coded icon chips — each activity type owns a color family so the
 * eye can scan the feed without reading. Two-layer chip (background tint
 * + ring) for proper contrast in light + dark.
 */
const ICON_MAP: Record<
  ActivityType['type'],
  { Icon: typeof Activity; tone: string }
> = {
  invoice: {
    Icon: Receipt,
    tone: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400',
  },
  appointment: {
    Icon: CalendarDays,
    tone: 'bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-400',
  },
  lead: {
    Icon: UserPlus,
    tone: 'bg-violet-500/10 text-violet-700 ring-violet-500/20 dark:text-violet-400',
  },
  support: {
    Icon: LifeBuoy,
    tone: 'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400',
  },
  system: {
    Icon: Sparkles,
    tone: 'bg-muted text-muted-foreground ring-border/60',
  },
}

function RecentActivityFeedComponent() {
  const { tenant } = useTenant()
  const query = useRecentActivity(tenant.id)

  return (
    <Panel
      title="Recent activity"
      description="Live across CRM, billing, scheduling, support"
      actions={
        <a href="#" className="text-xs font-medium text-primary hover:underline">
          View all
        </a>
      }
    >
      {query.isLoading || !query.data ? (
        <ul className="space-y-3.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex gap-3">
              <Skeleton className="size-9 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </li>
          ))}
        </ul>
      ) : query.data.items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <Activity className="size-7 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">
            When something happens, you'll see it here.
          </p>
        </div>
      ) : (
        <ul className="-mx-2 space-y-1">
          {query.data.items.map((a) => {
            const { Icon, tone } = ICON_MAP[a.type] ?? ICON_MAP.system
            return (
              <li
                key={a.id}
                className="group flex items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent/40"
              >
                <span
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-lg ring-1 ring-inset',
                    tone,
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="break-words text-sm leading-snug">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelative(a.occurredAt)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

export const RecentActivityWidget: Widget = {
  id: 'dashboard.recent-activity',
  Component: RecentActivityFeedComponent,
  permission: 'dashboard:view',
  span: { col: 4 },
}

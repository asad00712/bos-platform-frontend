import { Link } from 'react-router'
import { Megaphone, Pin } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Panel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatRelative } from '@/shared/lib/format'

import type { Widget } from '@/features/dashboard/widgets/types'
import { useAnnouncementsList } from '../hooks'

function AnnouncementsComponent() {
  const { tenant } = useTenant()
  const q = useAnnouncementsList(tenant.id)

  const items = (q.data?.items ?? []).slice(0, 5)

  return (
    <Panel
      title="Announcements"
      description="Pinned first, then by date"
      actions={
        <Link
          to="/app/school/announcements"
          className="text-xs font-medium text-primary hover:underline"
        >
          All →
        </Link>
      }
    >
      {q.isLoading || !q.data ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
          <Megaphone className="size-7 opacity-50" />
          <p>No announcements yet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((a) => (
            <li key={a.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {a.pinned ? <Pin className="size-3.5 text-primary" /> : null}
                  <p className="text-sm font-medium">{a.title}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px] uppercase">
                  {a.audience}
                </Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {a.body}
              </p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {a.authorName} · {formatRelative(a.publishedAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export const AnnouncementsWidget: Widget = {
  id: 'school.dashboard.announcements',
  Component: AnnouncementsComponent,
  permission: 'dashboard:view',
  span: { col: 6 },
}

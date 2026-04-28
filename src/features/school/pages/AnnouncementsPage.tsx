import { Megaphone, Pin } from 'lucide-react'

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

import { formatRelative } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import { useAnnouncementsList } from '../hooks'

const AUDIENCE_TONE: Record<string, string> = {
  school: 'bg-primary/10 text-primary border-primary/30',
  class: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300',
  staff: 'bg-violet-500/10 text-violet-700 border-violet-500/30 dark:text-violet-300',
  parents: 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300',
}

export function AnnouncementsPage() {
  const { tenant } = useTenant()
  const q = useAnnouncementsList(tenant.id)

  if (q.isLoading || !q.data) {
    return (
      <PageContainer>
        <PageHeader title="Announcements" description="Loading…" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      </PageContainer>
    )
  }

  if (q.data.items.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Announcements" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Megaphone />
            </EmptyMedia>
            <EmptyTitle>No announcements</EmptyTitle>
            <EmptyDescription>
              Broadcast updates to the school, classes, parents, or staff.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </PageContainer>
    )
  }

  const pinned = q.data.items.filter((a) => a.pinned)
  const others = q.data.items.filter((a) => !a.pinned)

  return (
    <PageContainer>
      <PageHeader
        title="Announcements"
        description={`${q.data.items.length} broadcasts`}
      />

      {pinned.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pinned
          </h2>
          {pinned.map((a) => (
            <AnnouncementCard key={a.id} a={a} pinned />
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        {pinned.length > 0 ? (
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recent
          </h2>
        ) : null}
        {others.map((a) => (
          <AnnouncementCard key={a.id} a={a} />
        ))}
      </div>
    </PageContainer>
  )
}

function AnnouncementCard({
  a,
  pinned,
}: {
  a: {
    id: string
    title: string
    body: string
    audience: 'school' | 'class' | 'staff' | 'parents'
    scope: string | null
    authorName: string
    publishedAt: string
  }
  pinned?: boolean
}) {
  return (
    <Card className={pinned ? 'border-primary/40' : undefined}>
      <CardContent className="space-y-2 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {pinned ? <Pin className="size-3.5 text-primary" /> : null}
            <h3 className="font-semibold">{a.title}</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${AUDIENCE_TONE[a.audience] ?? ''}`}
            >
              {a.audience}
            </span>
            {a.scope ? (
              <Badge variant="outline" className="text-[10px]">
                {a.scope}
              </Badge>
            ) : null}
          </div>
        </div>
        <p className="whitespace-pre-line text-sm leading-relaxed">{a.body}</p>
        <p className="text-xs text-muted-foreground">
          {a.authorName} · {formatRelative(a.publishedAt)}
        </p>
      </CardContent>
    </Card>
  )
}

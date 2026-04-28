import { Link } from 'react-router'
import {
  AtSign,
  Bell,
  CalendarDays,
  CheckCheck,
  LifeBuoy,
  Receipt,
  Settings as SettingsIcon,
  Sparkles,
  UserPlus,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { cn } from '@/shared/lib/utils'
import { formatRelative } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import { useMarkAllRead, useMarkRead, useNotificationsList } from '../hooks'
import type { Notification, NotificationKind } from '../api/notifications.contracts'

const ICON: Record<NotificationKind, { Icon: LucideIcon; tone: string }> = {
  appointment: { Icon: CalendarDays, tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  invoice: { Icon: Receipt, tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  lead: { Icon: UserPlus, tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  support: { Icon: LifeBuoy, tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  system: { Icon: Sparkles, tone: 'bg-muted text-muted-foreground' },
  mention: { Icon: AtSign, tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
}

export function NotificationsListPage() {
  const { tenant } = useTenant()
  const list = useNotificationsList(tenant.id)
  const markRead = useMarkRead(tenant.id)
  const markAll = useMarkAllRead(tenant.id)

  const unread = list.data?.unread ?? 0

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        description={
          list.isLoading
            ? 'Loading…'
            : `${unread} ${unread === 1 ? 'unread' : 'unread'}`
        }
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/app/notifications/preferences">
                <SettingsIcon /> Preferences
              </Link>
            </Button>
            {unread > 0 ? (
              <Button
                size="sm"
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
              >
                <CheckCheck /> Mark all read
              </Button>
            ) : null}
          </>
        }
      />

      <Card>
        <CardContent className="p-0">
          {list.isLoading ? (
            <ul className="space-y-3 p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="flex gap-3">
                  <Skeleton className="size-9 rounded-md" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </li>
              ))}
            </ul>
          ) : !list.data || list.data.items.length === 0 ? (
            <Empty className="py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Bell />
                </EmptyMedia>
                <EmptyTitle>You're all caught up</EmptyTitle>
                <EmptyDescription>
                  New events, invoices, leads, and tickets will land here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="divide-y">
              {list.data.items.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onClick={() => !n.read && markRead.mutate(n.id)}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

function NotificationRow({
  notification,
  onClick,
}: {
  notification: Notification
  onClick: () => void
}) {
  const { Icon, tone } = ICON[notification.kind]
  const className = cn(
    'flex items-start gap-3 px-5 py-3 transition hover:bg-accent/40',
    notification.href ? 'cursor-pointer' : '',
    !notification.read && 'bg-primary/5',
  )

  const inner = (
    <>
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-md', tone)}>
        <Icon className="size-4" />
      </span>
      <div className="flex-1 space-y-0.5">
        <p className={cn('text-sm', notification.read ? 'font-medium' : 'font-semibold')}>
          {notification.title}
        </p>
        {notification.body ? (
          <p className="text-sm text-muted-foreground">{notification.body}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {formatRelative(notification.occurredAt)}
        </p>
      </div>
      {!notification.read ? (
        <span aria-label="Unread" className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
      ) : null}
    </>
  )

  return (
    <li>
      {notification.href ? (
        <Link to={notification.href} onClick={onClick} className={className}>
          {inner}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={cn(className, 'w-full text-start')}>
          {inner}
        </button>
      )}
    </li>
  )
}

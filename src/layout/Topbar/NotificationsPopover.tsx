import { Link } from 'react-router'
import { Bell, BellOff, Check, CircleAlert, CircleCheck, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { cn } from '@/shared/lib/utils'
import { formatRelative } from '@/shared/lib/format'
import {
  useNotifications,
  type AppNotification,
} from '@/stores/notifications.store'

const KIND_ICON: Record<AppNotification['kind'], typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: CircleAlert,
  error: CircleAlert,
  mention: Bell,
}

const KIND_TONE: Record<AppNotification['kind'], string> = {
  info: 'bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-400',
  success:
    'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400',
  warning:
    'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400',
  error: 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-400',
  mention: 'bg-violet-500/10 text-violet-700 ring-violet-500/20 dark:text-violet-400',
}

export function NotificationsPopover() {
  const { t } = useTranslation()
  const items = useNotifications((s) => s.items)
  const muted = useNotifications((s) => s.mutedCategories)
  const visible = items.filter(
    (i) => !i.snoozedUntil || new Date(i.snoozedUntil).getTime() <= Date.now(),
  )
  const unread = visible.filter(
    (i) => !i.readAt && !muted.includes(i.category),
  ).length
  const markAllRead = useNotifications((s) => s.markAllRead)
  const markRead = useNotifications((s) => s.markRead)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('topbar.notifications')}
          className="relative"
        >
          <Bell />
          {unread > 0 ? (
            <span
              aria-hidden
              className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold leading-4 text-white"
            >
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <p className="text-sm font-semibold">{t('topbar.notifications')}</p>
          <div className="flex items-center gap-1">
            {unread > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllRead}
                className="h-7 gap-1 text-xs"
              >
                <Check className="size-3" />
                Mark all read
              </Button>
            ) : null}
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
              <Link to="/app/notifications">View all</Link>
            </Button>
          </div>
        </div>

        {visible.length === 0 ? (
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BellOff />
              </EmptyMedia>
              <EmptyTitle>{t('topbar.noNotifications')}</EmptyTitle>
              <EmptyDescription>
                When something happens you care about, it'll land here in real time.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ScrollArea className="h-[420px]">
            <ul className="divide-y">
              {visible.slice(0, 12).map((n) => {
                const Icon = KIND_ICON[n.kind]
                const isMuted = muted.includes(n.category)
                return (
                  <li key={n.id}>
                    <Link
                      to={n.to ?? '/app/notifications'}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        'flex items-start gap-3 px-3 py-2.5 transition-colors hover:bg-accent/40',
                        !n.readAt && 'bg-primary/[0.04]',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 grid size-7 shrink-0 place-items-center rounded-md ring-1 ring-inset',
                          KIND_TONE[n.kind],
                        )}
                      >
                        <Icon className="size-3.5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="break-words text-sm font-medium leading-tight">
                          {n.title}
                        </p>
                        {n.body ? (
                          <p className="break-words text-xs text-muted-foreground">
                            {n.body}
                          </p>
                        ) : null}
                        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="capitalize">{n.category}</span>
                          <span>·</span>
                          <span>{formatRelative(n.occurredAt)}</span>
                          {isMuted ? (
                            <>
                              <span>·</span>
                              <span>muted</span>
                            </>
                          ) : null}
                        </p>
                      </div>
                      {!n.readAt ? (
                        <span
                          aria-label="Unread"
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                        />
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Mail, MoreHorizontal, Send, UserSquare } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { cn } from '@/shared/lib/utils'
import { formatDateTime, formatRelative } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'
import { routes } from '@/routes/routeMap'

import { useMarkRead, useSendMessage, useThread } from '../hooks'
import type { Message } from '../api/communication.contracts'
import { ChannelBadge, ChannelIcon } from './ChannelBadge'

type Props = {
  threadId: string | null
}

export function ThreadDetail({ threadId }: Props) {
  const { tenant } = useTenant()
  const query = useThread(tenant.id, threadId ?? undefined)
  const markRead = useMarkRead(tenant.id)
  const send = useSendMessage(tenant.id)

  const [reply, setReply] = useState('')

  useEffect(() => {
    setReply('')
    if (query.data?.unread && threadId) {
      markRead.mutate(threadId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, query.data?.unread])

  if (!threadId) {
    return (
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Mail />
          </EmptyMedia>
          <EmptyTitle>Pick a conversation</EmptyTitle>
          <EmptyDescription>
            Select a thread from the list to read and reply.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (query.isLoading || !query.data) {
    return (
      <div className="space-y-4 p-5">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  const t = query.data

  const handleSend = async () => {
    if (!reply.trim()) return
    await send.mutateAsync({
      threadId: t.id,
      contactId: t.contactId,
      channel: t.channel,
      subject: t.subject ?? undefined,
      body: reply.trim(),
    })
    setReply('')
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b p-4">
        <div className="flex items-start gap-3">
          <ChannelIcon channel={t.channel} />
          <div className="space-y-0.5">
            <p className="text-sm font-semibold">
              {t.subject ?? `${t.contactName ?? 'Conversation'}`}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <ChannelBadge channel={t.channel} />
              {t.contactId ? (
                <Button variant="link" size="sm" className="h-auto px-0" asChild>
                  <Link to={routes.app.crm.contact(t.contactId)}>
                    <UserSquare className="size-3" />
                    {t.contactName}
                  </Link>
                </Button>
              ) : t.contactName ? (
                <span>{t.contactName}</span>
              ) : null}
              <span>·</span>
              <span>{t.messageCount} messages</span>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>Mark unread</DropdownMenuItem>
            <DropdownMenuItem disabled>Snooze</DropdownMenuItem>
            <DropdownMenuItem disabled>Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {t.messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      <footer className="border-t p-4">
        <Card>
          <CardContent className="space-y-3 p-3">
            <Textarea
              placeholder={
                t.channel === 'note'
                  ? 'Add an internal note…'
                  : t.channel === 'sms'
                    ? 'Type your SMS reply…'
                    : 'Type your email reply…'
              }
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Replying via <ChannelBadge channel={t.channel} />
              </span>
              <Button
                onClick={handleSend}
                disabled={send.isPending || reply.trim().length === 0}
              >
                <Send /> {send.isPending ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </footer>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isOutbound = message.direction === 'outbound'
  const isInternal = message.direction === 'internal'
  const initials = (message.fromName.split(' ').map((p) => p[0] ?? '').join('') || '·').toUpperCase()

  return (
    <div
      className={cn(
        'flex gap-3',
        isOutbound && 'flex-row-reverse',
      )}
    >
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className={cn('min-w-0 flex-1 space-y-1', isOutbound && 'items-end')}>
        <div
          className={cn(
            'flex flex-wrap items-center gap-2 text-xs text-muted-foreground',
            isOutbound && 'justify-end',
          )}
        >
          <span className="font-medium text-foreground">{message.fromName}</span>
          {isInternal ? <span className="text-amber-600">internal note</span> : null}
          <span title={formatDateTime(message.occurredAt)}>
            {formatRelative(message.occurredAt)}
          </span>
        </div>
        <div
          className={cn(
            'inline-block max-w-full rounded-lg border px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap',
            isOutbound && 'bg-primary text-primary-foreground border-transparent',
            isInternal && 'bg-amber-500/10 text-foreground border-amber-500/30',
            !isOutbound && !isInternal && 'bg-muted',
          )}
        >
          {message.subject && message.channel === 'email' && !isOutbound ? (
            <div
              className={cn(
                'mb-1 text-xs font-medium',
                isOutbound ? 'opacity-80' : 'text-muted-foreground',
              )}
            >
              {message.subject}
            </div>
          ) : null}
          {message.body}
        </div>
      </div>
    </div>
  )
}

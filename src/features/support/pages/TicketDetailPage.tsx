import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ChevronLeft, LifeBuoy, Send } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import { cn } from '@/shared/lib/utils'

import { formatDateTime, formatRelative } from '@/shared/lib/format'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useTenant } from '@/shared/hooks/useTenant'
import { useSessionStore } from '@/stores/session.store'

import {
  useChangeTicketStatus,
  useReplyTicket,
  useTicket,
} from '../hooks'
import type { TicketStatus } from '../api/support.contracts'
import {
  TicketPriorityBadge,
  TicketStatusBadge,
} from '../components/Badges'

const STATUSES: TicketStatus[] = [
  'open',
  'in_progress',
  'waiting',
  'resolved',
  'closed',
]

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const { has } = usePermissions()
  const user = useSessionStore((s) => s.user)

  const query = useTicket(tenant.id, id)
  const reply = useReplyTicket(tenant.id)
  const changeStatus = useChangeTicketStatus(tenant.id)

  const [body, setBody] = useState('')

  const canManage = has('settings:manage')
  const requesterName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.email ||
    'You'

  if (query.isLoading || !query.data) {
    return (
      <PageContainer>
        <PageHeader title="Loading…" />
        <Card>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <PageHeader title="Ticket" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LifeBuoy />
            </EmptyMedia>
            <EmptyTitle>Ticket not found</EmptyTitle>
            <EmptyDescription>
              {(query.error as Error)?.message ?? 'It may have been removed.'}
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to="/app/support/tickets">
              <ChevronLeft /> Back to tickets
            </Link>
          </Button>
        </Empty>
      </PageContainer>
    )
  }

  const t = query.data

  const handleReply = async () => {
    if (!body.trim()) return
    await reply.mutateAsync({
      id: t.id,
      input: { body: body.trim() },
      authorName: requesterName,
    })
    setBody('')
  }

  return (
    <PageContainer>
      <PageHeader
        title={t.subject}
        description={`${t.number} · ${t.category}`}
        breadcrumbs={[
          { label: 'Support', href: '/app/support' },
          { label: 'Tickets', href: '/app/support/tickets' },
          { label: t.number },
        ]}
        actions={
          <>
            <TicketPriorityBadge priority={t.priority} />
            {canManage ? (
              <Select
                value={t.status}
                onValueChange={(v) =>
                  changeStatus.mutate({ id: t.id, status: v as TicketStatus })
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <TicketStatusBadge status={t.status} />
            )}
          </>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start gap-3">
            <Avatar className="size-9">
              <AvatarFallback className="text-xs">
                {(t.requesterName.split(' ').map((p) => p[0] ?? '').join('') || '·').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{t.requesterName}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(t.createdAt)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{t.requesterEmail}</p>
              <p className="whitespace-pre-wrap pt-2 text-sm leading-relaxed">
                {t.body}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Conversation
          </p>
          {t.replies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No replies yet. Add one below.
            </p>
          ) : (
            <ul className="space-y-4">
              {t.replies.map((r) => {
                const isCustomer = r.authorType === 'customer'
                const isSystem = r.authorType === 'system'
                return (
                  <li
                    key={r.id}
                    className={cn(
                      'flex gap-3',
                      isCustomer && 'flex-row-reverse',
                    )}
                  >
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback className="text-xs">
                        {(r.authorName.split(' ').map((p) => p[0] ?? '').join('') || '·').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn('min-w-0 flex-1', isCustomer && 'flex flex-col items-end')}>
                      <div
                        className={cn(
                          'flex flex-wrap items-center gap-2 text-xs text-muted-foreground',
                          isCustomer && 'justify-end',
                        )}
                      >
                        <span className="font-medium text-foreground">{r.authorName}</span>
                        <span title={formatDateTime(r.occurredAt)}>
                          {formatRelative(r.occurredAt)}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'mt-1 inline-block max-w-full rounded-lg border px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap',
                          isCustomer && 'bg-primary text-primary-foreground border-transparent',
                          isSystem && 'bg-amber-500/10 text-foreground border-amber-500/30',
                          !isCustomer && !isSystem && 'bg-muted',
                        )}
                      >
                        {r.body}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <Textarea
            placeholder="Reply to this ticket…"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleReply}
              disabled={reply.isPending || body.trim().length === 0}
            >
              <Send /> {reply.isPending ? 'Sending…' : 'Send reply'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

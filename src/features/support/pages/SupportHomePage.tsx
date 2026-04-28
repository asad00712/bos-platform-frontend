import { Link } from 'react-router'
import {
  ArrowRight,
  BookOpen,
  LifeBuoy,
  Plus,
  Search,
} from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group'

import { useTenant } from '@/shared/hooks/useTenant'

import { useHelpArticles, useTicketList } from '../hooks'
import { TicketStatusBadge } from '../components/Badges'
import { NewTicketDialog } from '../components/NewTicketDialog'

export function SupportHomePage() {
  const { tenant } = useTenant()
  const help = useHelpArticles(tenant.id)
  const recent = useTicketList(tenant.id, {})

  const recentItems = recent.data?.items.slice(0, 3) ?? []

  return (
    <PageContainer>
      <PageHeader
        title="Support"
        description="Find answers fast or open a ticket — we usually respond within an hour."
        actions={
          <NewTicketDialog
            trigger={
              <Button>
                <Plus /> New ticket
              </Button>
            }
          />
        }
      />

      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Search the help center
          </p>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput placeholder="What do you need help with?" />
          </InputGroup>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Popular articles
            </p>
            <Button variant="link" size="sm" disabled>
              Browse all
            </Button>
          </div>
          {help.isLoading || !help.data ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {help.data.items.map((a) => (
                <Card key={a.id}>
                  <CardContent className="space-y-2 p-5">
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 place-items-center rounded-md bg-muted text-muted-foreground">
                        <BookOpen className="size-4" />
                      </span>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium leading-tight">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.excerpt}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {a.category}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Recent tickets
            </p>
            <Button variant="link" size="sm" asChild>
              <Link to="/app/support/tickets">
                View all <ArrowRight />
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {recent.isLoading ? (
                <div className="space-y-3 p-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : recentItems.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
                  <LifeBuoy className="size-8 opacity-50" />
                  <p>No tickets yet.</p>
                </div>
              ) : (
                <ul className="divide-y">
                  {recentItems.map((t) => (
                    <li key={t.id}>
                      <Link
                        to={`/app/support/tickets/${t.id}`}
                        className="flex items-start gap-3 p-4 transition hover:bg-accent/40"
                      >
                        <div className="flex-1 space-y-0.5">
                          <p className="text-sm font-medium leading-tight">
                            {t.subject}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t.number} · {t.category}
                          </p>
                        </div>
                        <TicketStatusBadge status={t.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

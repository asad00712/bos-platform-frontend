import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Plus, Search, X } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useTenant } from '@/shared/hooks/useTenant'

import { useThreadList } from '../hooks'
import type { Channel, InboxFilters } from '../api/communication.contracts'
import { ThreadList } from '../components/ThreadList'
import { ThreadDetail } from '../components/ThreadDetail'
import { ComposeDialog } from '../components/ComposeDialog'

const CHANNEL_OPTIONS: { label: string; value: Channel | 'all' }[] = [
  { label: 'All channels', value: 'all' },
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'Internal notes', value: 'note' },
]

export function InboxPage() {
  const { tenant } = useTenant()
  const { has } = usePermissions()
  const [searchParams, setSearchParams] = useSearchParams()

  const [filters, setFilters] = useState<InboxFilters>({})
  const debouncedSearch = useDebouncedValue(filters.search ?? '', 250)
  const queryFilters = useMemo<InboxFilters>(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch],
  )

  const list = useThreadList(tenant.id, queryFilters)
  const canWrite = has('communication:write')

  const selectedId = searchParams.get('thread')
  useEffect(() => {
    // Auto-select the first thread once the list lands.
    if (!selectedId && list.data && list.data.items.length > 0) {
      setSearchParams(
        (p) => {
          const np = new URLSearchParams(p)
          np.set('thread', list.data!.items[0].id)
          return np
        },
        { replace: true },
      )
    }
  }, [list.data, selectedId, setSearchParams])

  const setSelected = (id: string) => {
    setSearchParams((p) => {
      const np = new URLSearchParams(p)
      np.set('thread', id)
      return np
    })
  }

  const total = list.data?.total ?? 0
  const isFiltered =
    Boolean(filters.search) || Boolean(filters.channel) || Boolean(filters.unreadOnly)

  return (
    <PageContainer>
      <PageHeader
        title="Inbox"
        description={
          list.isLoading
            ? 'Loading…'
            : `${total} ${total === 1 ? 'conversation' : 'conversations'}`
        }
        actions={
          canWrite ? (
            <ComposeDialog
              trigger={
                <Button>
                  <Plus /> New message
                </Button>
              }
              onSent={(id) => setSelected(id)}
            />
          ) : undefined
        }
      />

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid h-[calc(100vh-280px)] min-h-[520px] grid-cols-1 lg:grid-cols-[360px_1fr]">
            <aside className="flex flex-col border-r">
              <div className="space-y-3 border-b p-3">
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Search className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Search conversations…"
                    value={filters.search ?? ''}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </InputGroup>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={filters.channel ?? 'all'}
                    onValueChange={(v) =>
                      setFilters({
                        ...filters,
                        channel: v === 'all' ? undefined : (v as Channel),
                      })
                    }
                  >
                    <SelectTrigger className="h-8 w-[150px]">
                      <SelectValue placeholder="Channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNEL_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={String(o.value)}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label className="flex items-center gap-2 text-xs">
                    <Switch
                      checked={Boolean(filters.unreadOnly)}
                      onCheckedChange={(v) =>
                        setFilters({ ...filters, unreadOnly: v ? true : undefined })
                      }
                    />
                    Unread
                  </label>
                  {isFiltered ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({})}
                    >
                      <X /> Clear
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ThreadList
                  threads={list.data?.items}
                  isLoading={list.isLoading}
                  selectedId={selectedId}
                  onSelect={setSelected}
                />
              </div>
            </aside>

            <section className="min-w-0">
              <ThreadDetail threadId={selectedId} />
            </section>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

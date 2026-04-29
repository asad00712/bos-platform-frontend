import { useMemo, useState } from 'react'
import { CheckSquare, Plus, Search, X } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

import { useTenant } from '@/shared/hooks/useTenant'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useHasPermission } from '@/shared/auth/useHasPermission'
import { useOwnerLookup } from '@/features/crm/hooks'
import type { Task, TaskPriority, TaskStatus } from '@/types/crm'

import type { TaskFilters } from '../api/tasks.api'
import { useTasks } from '../hooks'
import { TaskFormDialog } from '../components/TaskFormDialog'
import { TaskRow } from '../components/TaskRow'

type TabKey = 'open' | 'all' | 'done'

export function TasksPage() {
  const { tenant } = useTenant()
  const canCreate = useHasPermission('tenant:tasks:create')

  const ownersQ = useOwnerLookup(tenant.id)

  const [tab, setTab] = useState<TabKey>('open')
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState<TaskPriority | 'all'>('all')
  const [assignee, setAssignee] = useState<string>('all')
  const debounced = useDebouncedValue(search, 250)

  const queryFilters = useMemo<TaskFilters>(() => {
    return {
      search: debounced || undefined,
      priority: priority === 'all' ? undefined : priority,
      assigneeUserId: assignee === 'all' ? undefined : assignee,
    }
  }, [debounced, priority, assignee])

  const list = useTasks(tenant.id, queryFilters)

  const tasks = list.data ?? []
  const filtered = filterByTab(tasks, tab)

  const counts = useMemo(() => {
    return {
      open: tasks.filter((t) => isOpen(t.status)).length,
      done: tasks.filter((t) => t.status === 'done').length,
      all: tasks.length,
    }
  }, [tasks])

  const isFiltered =
    Boolean(search) || priority !== 'all' || assignee !== 'all'

  return (
    <PageContainer>
      <PageHeader
        title="Tasks"
        description={
          list.isLoading
            ? 'Loading tasks…'
            : `${counts.open} open · ${counts.done} done · ${counts.all} total`
        }
        actions={
          canCreate ? (
            <TaskFormDialog
              trigger={
                <Button>
                  <Plus /> New task
                </Button>
              }
            />
          ) : undefined
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <InputGroup className="w-full sm:max-w-xs">
              <InputGroupAddon align="inline-start">
                <Search className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search title, description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>

            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as TaskPriority | 'all')}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                {(ownersQ.data ?? []).map((o) => (
                  <SelectItem key={o.userId} value={o.userId}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isFiltered ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setPriority('all')
                  setAssignee('all')
                }}
              >
                <X /> Clear
              </Button>
            ) : null}
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
            <TabsList>
              <TabsTrigger value="open">
                Open
                <span className="ms-1.5 text-[10px] text-muted-foreground">
                  {counts.open}
                </span>
              </TabsTrigger>
              <TabsTrigger value="done">
                Done
                <span className="ms-1.5 text-[10px] text-muted-foreground">
                  {counts.done}
                </span>
              </TabsTrigger>
              <TabsTrigger value="all">
                All
                <span className="ms-1.5 text-[10px] text-muted-foreground">
                  {counts.all}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {list.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Empty className="py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CheckSquare />
                </EmptyMedia>
                <EmptyTitle>
                  {tab === 'done' ? 'Nothing checked off yet' : 'No tasks'}
                </EmptyTitle>
                <EmptyDescription>
                  {tab === 'done'
                    ? 'Completed work appears here.'
                    : isFiltered
                      ? 'Adjust your filters or create a new task.'
                      : 'Capture work that needs doing — link tasks to contacts or leads to surface them on those records.'}
                </EmptyDescription>
              </EmptyHeader>
              {canCreate && tab !== 'done' ? (
                <TaskFormDialog
                  trigger={
                    <Button>
                      <Plus /> New task
                    </Button>
                  }
                />
              ) : null}
            </Empty>
          ) : (
            <ul className="divide-y rounded-md border bg-card">
              {filtered.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground">
        Tasks aren&apos;t backed by a live BE controller yet — they live in
        the FE mock store. Phase J will swap to <code>/tasks</code> once the
        BE service ships.
      </p>
    </PageContainer>
  )
}

function isOpen(status: TaskStatus): boolean {
  return status === 'open' || status === 'in_progress'
}

function filterByTab(tasks: Task[], tab: TabKey): Task[] {
  if (tab === 'open') return tasks.filter((t) => isOpen(t.status))
  if (tab === 'done') return tasks.filter((t) => t.status === 'done')
  return tasks
}

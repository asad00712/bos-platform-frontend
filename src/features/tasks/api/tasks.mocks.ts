import type { Task, TaskPriority, TaskRelatedEntity } from '@/types/crm'

const MAIN = 'br-main'

let store: Task[] = [
  {
    id: 'tk-1',
    branchId: MAIN,
    title: 'Follow up with Sarah on whitening package',
    description: 'She asked for pricing on whitening + cleaning bundle.',
    status: 'in_progress',
    priority: 'high',
    dueAt: hoursFromNow(6),
    completedAt: null,
    assigneeUserId: 'user-maya',
    createdByUserId: 'user-ahmed',
    relatedEntity: 'contact',
    relatedEntityId: 'c-1001',
    createdAt: hoursAgo(20),
    updatedAt: hoursAgo(2),
  },
  {
    id: 'tk-2',
    branchId: MAIN,
    title: 'Send Lara case study deck',
    description: '30-person law firm comparison; reference Q3 multi-office rollout.',
    status: 'open',
    priority: 'high',
    dueAt: daysFromNow(2),
    completedAt: null,
    assigneeUserId: 'user-maya',
    createdByUserId: 'user-maya',
    relatedEntity: 'lead',
    relatedEntityId: 'ld-3',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'tk-3',
    branchId: MAIN,
    title: 'Quarterly insurance verification — Aetna patients',
    description: null,
    status: 'open',
    priority: 'medium',
    dueAt: daysFromNow(7),
    completedAt: null,
    assigneeUserId: 'user-ahmed',
    createdByUserId: 'user-owner',
    relatedEntity: null,
    relatedEntityId: null,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: 'tk-4',
    branchId: MAIN,
    title: 'Update onboarding email template',
    description: 'New brand voice + photo of Op 3.',
    status: 'done',
    priority: 'low',
    dueAt: daysAgo(2),
    completedAt: daysAgo(1),
    assigneeUserId: 'user-maya',
    createdByUserId: 'user-owner',
    relatedEntity: null,
    relatedEntityId: null,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(1),
  },
  {
    id: 'tk-5',
    branchId: MAIN,
    title: 'Review Bella Italia retention proposal',
    description: 'Send back marked-up version this week.',
    status: 'open',
    priority: 'medium',
    dueAt: daysFromNow(4),
    completedAt: null,
    assigneeUserId: 'user-ahmed',
    createdByUserId: 'user-ahmed',
    relatedEntity: 'contact',
    relatedEntityId: 'c-1004',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
]

export type TaskInput = {
  branchId: string
  title: string
  description?: string
  status?: Task['status']
  priority?: TaskPriority
  dueAt?: string
  assigneeUserId?: string
  relatedEntity?: TaskRelatedEntity
  relatedEntityId?: string
}

export type TaskFilters = {
  search?: string
  status?: Task['status']
  priority?: TaskPriority
  assigneeUserId?: string
}

export const taskMocks = {
  list(filters: TaskFilters & { branchId?: string }): Task[] {
    const search = filters.search?.trim().toLowerCase()
    return store.filter((t) => {
      if (filters.branchId && t.branchId !== filters.branchId) return false
      if (filters.status && t.status !== filters.status) return false
      if (filters.priority && t.priority !== filters.priority) return false
      if (filters.assigneeUserId && t.assigneeUserId !== filters.assigneeUserId) return false
      if (search) {
        const hay = `${t.title} ${t.description ?? ''}`.toLowerCase()
        if (!hay.includes(search)) return false
      }
      return true
    })
  },

  byEntity(entity: TaskRelatedEntity, entityId: string): Task[] {
    return store
      .filter((t) => t.relatedEntity === entity && t.relatedEntityId === entityId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  },

  get(id: string): Task | null {
    return store.find((t) => t.id === id) ?? null
  },

  create(input: TaskInput, createdByUserId: string): Task {
    const now = new Date().toISOString()
    const next: Task = {
      id: `tk-${Date.now()}`,
      branchId: input.branchId,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? 'open',
      priority: input.priority ?? 'medium',
      dueAt: input.dueAt ?? null,
      completedAt: null,
      assigneeUserId: input.assigneeUserId ?? null,
      createdByUserId,
      relatedEntity: input.relatedEntity ?? null,
      relatedEntityId: input.relatedEntityId ?? null,
      createdAt: now,
      updatedAt: now,
    }
    store = [next, ...store]
    return next
  },

  update(id: string, patch: Partial<TaskInput>): Task | null {
    const idx = store.findIndex((t) => t.id === id)
    if (idx < 0) return null
    const current = store[idx]
    const goingDone = patch.status === 'done' && current.status !== 'done'
    const reopened = current.status === 'done' && patch.status && patch.status !== 'done'
    store[idx] = {
      ...current,
      title: patch.title ?? current.title,
      description: patch.description !== undefined ? (patch.description || null) : current.description,
      status: patch.status ?? current.status,
      priority: patch.priority ?? current.priority,
      dueAt: patch.dueAt !== undefined ? (patch.dueAt || null) : current.dueAt,
      assigneeUserId:
        patch.assigneeUserId !== undefined
          ? (patch.assigneeUserId || null)
          : current.assigneeUserId,
      relatedEntity: patch.relatedEntity ?? current.relatedEntity,
      relatedEntityId:
        patch.relatedEntityId !== undefined
          ? (patch.relatedEntityId || null)
          : current.relatedEntityId,
      completedAt: goingDone
        ? new Date().toISOString()
        : reopened
          ? null
          : current.completedAt,
      updatedAt: new Date().toISOString(),
    }
    return store[idx]
  },

  remove(id: string): boolean {
    const before = store.length
    store = store.filter((t) => t.id !== id)
    return store.length < before
  },
}

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3_600_000).toISOString()
}
function hoursFromNow(n: number): string {
  return new Date(Date.now() + n * 3_600_000).toISOString()
}
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}
function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toISOString()
}

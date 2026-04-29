import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'
import { useActiveBranchStore } from '@/stores/activeBranch.store'
import { useSessionStore } from '@/stores/session.store'
import type { Task, TaskRelatedEntity } from '@/types/crm'

import { taskMocks, type TaskFilters, type TaskInput } from './tasks.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

const TASKS_LIVE = false /* BE controllers ship in a follow-up; until then
                          all calls go through mocks regardless of
                          VITE_USE_MOCKS so we don't 404. */

export const tasksApi = {
  async list(filters: TaskFilters): Promise<Task[]> {
    if (env.useMocks || !TASKS_LIVE) {
      await delay()
      const branchId = useActiveBranchStore.getState().branchId ?? undefined
      return taskMocks.list({ ...filters, branchId })
    }
    const qs = new URLSearchParams()
    if (filters.search) qs.set('search', filters.search)
    if (filters.status) qs.set('status', filters.status.toUpperCase())
    if (filters.priority) qs.set('priority', filters.priority.toUpperCase())
    if (filters.assigneeUserId) qs.set('assigneeUserId', filters.assigneeUserId)
    const data = await apiRequest<{ data: Task[]; total: number }>(
      `/tasks?${qs.toString()}`,
    )
    return data.data
  },

  async byEntity(entity: TaskRelatedEntity, entityId: string): Promise<Task[]> {
    if (env.useMocks || !TASKS_LIVE) {
      await delay()
      return taskMocks.byEntity(entity, entityId)
    }
    const data = await apiRequest<{ data: Task[]; total: number }>(
      `/tasks?relatedEntity=${entity}&relatedEntityId=${entityId}`,
    )
    return data.data
  },

  async get(id: string): Promise<Task> {
    if (env.useMocks || !TASKS_LIVE) {
      await delay()
      const found = taskMocks.get(id)
      if (!found) throw new Error('Task not found')
      return found
    }
    return apiRequest<Task>(`/tasks/${id}`)
  },

  async create(input: TaskInput): Promise<Task> {
    const userId = useSessionStore.getState().user?.id ?? 'user-current'
    if (env.useMocks || !TASKS_LIVE) {
      await delay()
      return taskMocks.create(input, userId)
    }
    return apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        ...input,
        priority: input.priority?.toUpperCase(),
        status: input.status?.toUpperCase(),
      }),
    })
  },

  async update(id: string, patch: Partial<TaskInput>): Promise<Task> {
    if (env.useMocks || !TASKS_LIVE) {
      await delay()
      const updated = taskMocks.update(id, patch)
      if (!updated) throw new Error('Task not found')
      return updated
    }
    return apiRequest<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...patch,
        priority: patch.priority?.toUpperCase(),
        status: patch.status?.toUpperCase(),
      }),
    })
  },

  async remove(id: string): Promise<void> {
    if (env.useMocks || !TASKS_LIVE) {
      await delay()
      const ok = taskMocks.remove(id)
      if (!ok) throw new Error('Task not found')
      return
    }
    await apiRequest<void>(`/tasks/${id}`, { method: 'DELETE' })
  },
}

export type { TaskFilters, TaskInput }

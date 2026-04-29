import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'
import { useSessionStore } from '@/stores/session.store'
import {
  activityFromLeadDto,
  activityToCreateDto,
  isFeOnlyActivityKind,
} from '@/api/adapters/crm'
import type { Activity, ActivityEntity, ActivityInput } from '@/types/crm'

import { activityMocks } from './activities.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export const activitiesApi = {
  async list(entity: ActivityEntity, entityId: string): Promise<Activity[]> {
    if (env.useMocks) {
      await delay()
      return activityMocks.list(entity, entityId)
    }
    if (entity === 'lead') {
      const data = await apiRequest<{
        items: unknown[]
        total: number
        page: number
        limit: number
      }>(`/leads/${entityId}/activities`)
      return (data.items as Parameters<typeof activityFromLeadDto>[0][]).map(
        activityFromLeadDto,
      )
    }
    /* contact activities — BE doesn't expose a dedicated endpoint yet, so
     * the FE keeps these in mocks regardless of the VITE_USE_MOCKS flag. */
    return activityMocks.list(entity, entityId)
  },

  async create(
    entity: ActivityEntity,
    entityId: string,
    input: ActivityInput,
  ): Promise<Activity> {
    const userId = useSessionStore.getState().user?.id ?? 'user-current'

    if (env.useMocks || entity === 'contact' || isFeOnlyActivityKind(input.kind)) {
      await delay()
      return activityMocks.create(entity, entityId, input, userId)
    }
    /* BE-backed lead activity */
    const data = await apiRequest<unknown>(`/leads/${entityId}/activities`, {
      method: 'POST',
      body: JSON.stringify(activityToCreateDto(input)),
    })
    return activityFromLeadDto(data as Parameters<typeof activityFromLeadDto>[0])
  },

  async setTaskStatus(
    id: string,
    taskStatus: NonNullable<Activity['taskStatus']>,
  ): Promise<Activity> {
    if (env.useMocks) {
      await delay()
      const updated = activityMocks.setTaskStatus(id, taskStatus)
      if (!updated) throw new Error('Activity not found')
      return updated
    }
    const data = await apiRequest<unknown>(`/activities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ taskStatus: taskStatus.toUpperCase() }),
    })
    return activityFromLeadDto(data as Parameters<typeof activityFromLeadDto>[0])
  },

  async remove(id: string): Promise<void> {
    if (env.useMocks) {
      await delay()
      const ok = activityMocks.remove(id)
      if (!ok) throw new Error('Activity not found')
      return
    }
    await apiRequest<void>(`/activities/${id}`, { method: 'DELETE' })
  },
}

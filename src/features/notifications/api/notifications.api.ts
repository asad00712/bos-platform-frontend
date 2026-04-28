import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'

import {
  notificationPreferencesSchema,
  notificationSchema,
  notificationsResponseSchema,
  type Notification,
  type NotificationPreferences,
  type NotificationsResponse,
} from './notifications.contracts'
import { notificationsMocks } from './notifications.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export const notificationsApi = {
  async list(): Promise<NotificationsResponse> {
    if (env.useMocks) {
      await delay()
      return notificationsResponseSchema.parse(notificationsMocks.list())
    }
    const data = await apiRequest<unknown>('/notifications')
    return notificationsResponseSchema.parse(data)
  },
  async markRead(id: string): Promise<Notification> {
    if (env.useMocks) {
      await delay()
      const result = notificationsMocks.markRead(id)
      if (!result) throw new Error('Notification not found')
      return notificationSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/notifications/${id}/read`, {
      method: 'POST',
    })
    return notificationSchema.parse(data)
  },
  async markAllRead(): Promise<NotificationsResponse> {
    if (env.useMocks) {
      await delay()
      return notificationsResponseSchema.parse(notificationsMocks.markAllRead())
    }
    const data = await apiRequest<unknown>('/notifications/read-all', {
      method: 'POST',
    })
    return notificationsResponseSchema.parse(data)
  },
  async preferences(): Promise<NotificationPreferences> {
    if (env.useMocks) {
      await delay()
      return notificationPreferencesSchema.parse(notificationsMocks.preferences())
    }
    const data = await apiRequest<unknown>('/notifications/preferences')
    return notificationPreferencesSchema.parse(data)
  },
  async savePreferences(input: NotificationPreferences): Promise<NotificationPreferences> {
    if (env.useMocks) {
      await delay()
      return notificationPreferencesSchema.parse(
        notificationsMocks.savePreferences(input),
      )
    }
    const data = await apiRequest<unknown>('/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
    return notificationPreferencesSchema.parse(data)
  },
}

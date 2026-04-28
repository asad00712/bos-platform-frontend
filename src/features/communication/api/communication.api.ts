import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'

import {
  messageSchema,
  templatesResponseSchema,
  threadDetailSchema,
  threadsResponseSchema,
  type InboxFilters,
  type Message,
  type MessageInput,
  type TemplatesResponse,
  type ThreadDetail,
  type ThreadsResponse,
} from './communication.contracts'
import { communicationMocks } from './communication.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export const communicationApi = {
  async listThreads(filters: InboxFilters): Promise<ThreadsResponse> {
    if (env.useMocks) {
      await delay()
      return threadsResponseSchema.parse(communicationMocks.listThreads(filters))
    }
    const qs = new URLSearchParams()
    if (filters.search) qs.set('search', filters.search)
    if (filters.channel) qs.set('channel', filters.channel)
    if (filters.unreadOnly) qs.set('unreadOnly', 'true')
    const data = await apiRequest<unknown>(`/communication/threads?${qs.toString()}`)
    return threadsResponseSchema.parse(data)
  },

  async getThread(id: string): Promise<ThreadDetail> {
    if (env.useMocks) {
      await delay()
      const result = communicationMocks.getThread(id)
      if (!result) throw new Error('Thread not found')
      return threadDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/communication/threads/${id}`)
    return threadDetailSchema.parse(data)
  },

  async markRead(id: string): Promise<ThreadDetail> {
    if (env.useMocks) {
      await delay()
      const result = communicationMocks.markRead(id)
      if (!result) throw new Error('Thread not found')
      return threadDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/communication/threads/${id}/read`, {
      method: 'POST',
    })
    return threadDetailSchema.parse(data)
  },

  async send(
    input: MessageInput,
  ): Promise<{ thread: ThreadDetail; message: Message }> {
    if (env.useMocks) {
      await delay()
      const result = communicationMocks.send(input)
      return {
        thread: threadDetailSchema.parse(result.thread),
        message: messageSchema.parse(result.message),
      }
    }
    const data = await apiRequest<{ thread: unknown; message: unknown }>(
      '/communication/messages',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    )
    return {
      thread: threadDetailSchema.parse(data.thread),
      message: messageSchema.parse(data.message),
    }
  },

  async templates(): Promise<TemplatesResponse> {
    if (env.useMocks) {
      await delay()
      return templatesResponseSchema.parse(communicationMocks.templates())
    }
    const data = await apiRequest<unknown>('/communication/templates')
    return templatesResponseSchema.parse(data)
  },
}

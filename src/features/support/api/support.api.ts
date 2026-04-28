import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'

import {
  helpArticlesResponseSchema,
  ticketDetailSchema,
  ticketsResponseSchema,
  type HelpArticlesResponse,
  type Ticket,
  type TicketDetail,
  type TicketFilters,
  type TicketInput,
  type TicketReplyInput,
  type TicketsResponse,
} from './support.contracts'
import { supportMocks } from './support.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export const supportApi = {
  async list(filters: TicketFilters): Promise<TicketsResponse> {
    if (env.useMocks) {
      await delay()
      return ticketsResponseSchema.parse(supportMocks.list(filters))
    }
    const qs = new URLSearchParams()
    if (filters.search) qs.set('search', filters.search)
    if (filters.status) qs.set('status', filters.status)
    if (filters.priority) qs.set('priority', filters.priority)
    const data = await apiRequest<unknown>(`/support/tickets?${qs.toString()}`)
    return ticketsResponseSchema.parse(data)
  },

  async get(id: string): Promise<TicketDetail> {
    if (env.useMocks) {
      await delay()
      const result = supportMocks.get(id)
      if (!result) throw new Error('Ticket not found')
      return ticketDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/support/tickets/${id}`)
    return ticketDetailSchema.parse(data)
  },

  async create(
    input: TicketInput,
    requester: { name: string; email: string },
  ): Promise<TicketDetail> {
    if (env.useMocks) {
      await delay()
      return ticketDetailSchema.parse(
        supportMocks.create(input, requester.name, requester.email),
      )
    }
    const data = await apiRequest<unknown>('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return ticketDetailSchema.parse(data)
  },

  async reply(
    id: string,
    input: TicketReplyInput,
    authorName: string,
  ): Promise<TicketDetail> {
    if (env.useMocks) {
      await delay()
      const result = supportMocks.reply(id, input, authorName)
      if (!result) throw new Error('Ticket not found')
      return ticketDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/support/tickets/${id}/replies`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return ticketDetailSchema.parse(data)
  },

  async changeStatus(id: string, status: Ticket['status']): Promise<TicketDetail> {
    if (env.useMocks) {
      await delay()
      const result = supportMocks.changeStatus(id, status)
      if (!result) throw new Error('Ticket not found')
      return ticketDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/support/tickets/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    })
    return ticketDetailSchema.parse(data)
  },

  async helpArticles(): Promise<HelpArticlesResponse> {
    if (env.useMocks) {
      await delay()
      return helpArticlesResponseSchema.parse(supportMocks.helpArticles())
    }
    const data = await apiRequest<unknown>('/support/help-articles')
    return helpArticlesResponseSchema.parse(data)
  },
}

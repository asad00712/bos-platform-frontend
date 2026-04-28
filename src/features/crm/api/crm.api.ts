import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'

import {
  contactDetailSchema,
  contactsListResponseSchema,
  contactActivityListSchema,
  segmentsResponseSchema,
  type ContactActivityList,
  type ContactDetail,
  type ContactInput,
  type ContactsListResponse,
  type ListFilters,
  type SegmentsResponse,
} from './crm.contracts'
import { crmMocks } from './crm.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export const crmApi = {
  async listContacts(filters: ListFilters): Promise<ContactsListResponse> {
    if (env.useMocks) {
      await delay()
      return contactsListResponseSchema.parse(crmMocks.list(filters))
    }
    const qs = new URLSearchParams()
    if (filters.search) qs.set('search', filters.search)
    if (filters.status) qs.set('status', filters.status)
    if (filters.source) qs.set('source', filters.source)
    if (filters.tag) qs.set('tag', filters.tag)
    const data = await apiRequest<unknown>(`/crm/contacts?${qs.toString()}`)
    return contactsListResponseSchema.parse(data)
  },

  async getContact(id: string): Promise<ContactDetail> {
    if (env.useMocks) {
      await delay()
      const result = crmMocks.get(id)
      if (!result) throw new Error('Contact not found')
      return contactDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/crm/contacts/${id}`)
    return contactDetailSchema.parse(data)
  },

  async createContact(input: ContactInput): Promise<ContactDetail> {
    if (env.useMocks) {
      await delay()
      return contactDetailSchema.parse(crmMocks.create(input))
    }
    const data = await apiRequest<unknown>('/crm/contacts', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return contactDetailSchema.parse(data)
  },

  async updateContact(id: string, patch: Partial<ContactInput>): Promise<ContactDetail> {
    if (env.useMocks) {
      await delay()
      const result = crmMocks.update(id, patch)
      if (!result) throw new Error('Contact not found')
      return contactDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/crm/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    return contactDetailSchema.parse(data)
  },

  async deleteContact(id: string): Promise<void> {
    if (env.useMocks) {
      await delay()
      const ok = crmMocks.remove(id)
      if (!ok) throw new Error('Contact not found')
      return
    }
    await apiRequest<void>(`/crm/contacts/${id}`, { method: 'DELETE' })
  },

  async listSegments(): Promise<SegmentsResponse> {
    if (env.useMocks) {
      await delay()
      return segmentsResponseSchema.parse(crmMocks.segments())
    }
    const data = await apiRequest<unknown>('/crm/segments')
    return segmentsResponseSchema.parse(data)
  },

  async listContactActivities(id: string): Promise<ContactActivityList> {
    if (env.useMocks) {
      await delay()
      return contactActivityListSchema.parse(crmMocks.activities(id))
    }
    const data = await apiRequest<unknown>(`/crm/contacts/${id}/activities`)
    return contactActivityListSchema.parse(data)
  },
}

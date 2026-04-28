import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'

import {
  contactSchema,
  contactsListResponseSchema,
  contactActivityListSchema,
  segmentsResponseSchema,
  type Contact,
  type ContactActivityList,
  type ContactInput,
  type ContactsListResponse,
  type ListFilters,
  type OwnerLookup,
  type SegmentsResponse,
  type SourceLookup,
  type TagLookup,
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
    if (filters.sourceId) qs.set('sourceId', filters.sourceId)
    if (filters.tagId) qs.set('tagId', filters.tagId)
    if (filters.ownerUserId) qs.set('ownerUserId', filters.ownerUserId)
    const data = await apiRequest<unknown>(`/contacts?${qs.toString()}`)
    return contactsListResponseSchema.parse(data)
  },

  async getContact(id: string): Promise<Contact> {
    if (env.useMocks) {
      await delay()
      const result = crmMocks.get(id)
      if (!result) throw new Error('Contact not found')
      return contactSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/contacts/${id}`)
    return contactSchema.parse(data)
  },

  async createContact(input: ContactInput): Promise<Contact> {
    if (env.useMocks) {
      await delay()
      return contactSchema.parse(crmMocks.create(input))
    }
    const data = await apiRequest<unknown>('/contacts', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return contactSchema.parse(data)
  },

  async updateContact(id: string, patch: Partial<ContactInput>): Promise<Contact> {
    if (env.useMocks) {
      await delay()
      const result = crmMocks.update(id, patch)
      if (!result) throw new Error('Contact not found')
      return contactSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    return contactSchema.parse(data)
  },

  async deleteContact(id: string): Promise<void> {
    if (env.useMocks) {
      await delay()
      const ok = crmMocks.remove(id)
      if (!ok) throw new Error('Contact not found')
      return
    }
    await apiRequest<void>(`/contacts/${id}`, { method: 'DELETE' })
  },

  async listSegments(): Promise<SegmentsResponse> {
    if (env.useMocks) {
      await delay()
      return segmentsResponseSchema.parse(crmMocks.segments())
    }
    const data = await apiRequest<unknown>('/contact-lists')
    return segmentsResponseSchema.parse(data)
  },

  async listContactActivities(id: string): Promise<ContactActivityList> {
    if (env.useMocks) {
      await delay()
      return contactActivityListSchema.parse(crmMocks.activities(id))
    }
    const data = await apiRequest<unknown>(`/contacts/${id}/activities`)
    return contactActivityListSchema.parse(data)
  },

  /* lookup tables — until BE entities have dedicated FE features (Phase F),
   * served from local mocks. Real wiring happens in Phase F. */
  async listTags(): Promise<TagLookup[]> {
    if (env.useMocks) {
      await delay()
      return crmMocks.tags()
    }
    return apiRequest<TagLookup[]>('/tags')
  },

  async listSources(): Promise<SourceLookup[]> {
    if (env.useMocks) {
      await delay()
      return crmMocks.sources()
    }
    return apiRequest<SourceLookup[]>('/contact-sources')
  },

  async listOwners(): Promise<OwnerLookup[]> {
    if (env.useMocks) {
      await delay()
      return crmMocks.owners()
    }
    return apiRequest<OwnerLookup[]>('/staff')
  },
}

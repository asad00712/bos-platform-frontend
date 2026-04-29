import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'
import { useActiveBranchStore } from '@/stores/activeBranch.store'
import {
  activityFromLeadDto,
  adaptListResponse,
  leadFromDto,
  leadStatusFromDto,
  leadToCreateDto,
} from '@/api/adapters/crm'
import type { Activity, Lead, LeadStatus } from '@/types/crm'

import { leadMocks } from './leads.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export type LeadInput = {
  branchId: string
  firstName: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  sourceId?: string
  statusId?: string
  priority?: 'low' | 'medium' | 'high'
  estimatedValue?: number
  ownerUserId?: string
  notes?: string
}

export type LeadFilters = {
  search?: string
  statusId?: string
  priority?: 'low' | 'medium' | 'high'
  ownerUserId?: string
}

export const leadsApi = {
  async list(filters: LeadFilters): Promise<{ items: Lead[]; total: number }> {
    if (env.useMocks) {
      await delay()
      const branchId = useActiveBranchStore.getState().branchId ?? undefined
      return leadMocks.list({ ...filters, branchId })
    }
    const qs = new URLSearchParams()
    if (filters.search) qs.set('search', filters.search)
    if (filters.statusId) qs.set('statusId', filters.statusId)
    if (filters.priority) qs.set('priority', filters.priority.toUpperCase())
    if (filters.ownerUserId) qs.set('ownedByUserId', filters.ownerUserId)
    const data = await apiRequest<{ data: unknown[]; total: number; page?: number; limit?: number }>(
      `/leads?${qs.toString()}`,
    )
    const adapted = adaptListResponse(
      data as { data: Parameters<typeof leadFromDto>[0][]; total: number; page?: number; limit?: number },
      leadFromDto,
    )
    return { items: adapted.items, total: adapted.total }
  },

  async get(id: string): Promise<Lead> {
    if (env.useMocks) {
      await delay()
      const found = leadMocks.get(id)
      if (!found) throw new Error('Lead not found')
      return found
    }
    const data = await apiRequest<unknown>(`/leads/${id}`)
    return leadFromDto(data as Parameters<typeof leadFromDto>[0])
  },

  async create(input: LeadInput): Promise<Lead> {
    if (env.useMocks) {
      await delay()
      return leadMocks.create(input)
    }
    const data = await apiRequest<unknown>('/leads', {
      method: 'POST',
      body: JSON.stringify(leadToCreateDto(input)),
    })
    return leadFromDto(data as Parameters<typeof leadFromDto>[0])
  },

  async update(id: string, patch: Partial<LeadInput>): Promise<Lead> {
    if (env.useMocks) {
      await delay()
      const updated = leadMocks.update(id, patch)
      if (!updated) throw new Error('Lead not found')
      return updated
    }
    const data = await apiRequest<unknown>(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...patch,
        priority: patch.priority ? patch.priority.toUpperCase() : undefined,
      }),
    })
    return leadFromDto(data as Parameters<typeof leadFromDto>[0])
  },

  async remove(id: string): Promise<void> {
    if (env.useMocks) {
      await delay()
      const ok = leadMocks.remove(id)
      if (!ok) throw new Error('Lead not found')
      return
    }
    await apiRequest<void>(`/leads/${id}`, { method: 'DELETE' })
  },

  async setStatus(id: string, statusId: string): Promise<Lead> {
    if (env.useMocks) {
      await delay()
      const updated = leadMocks.setStatus(id, statusId)
      if (!updated) throw new Error('Lead not found')
      return updated
    }
    return leadsApi.update(id, { statusId })
  },

  async convert(id: string, convertedByUserId: string): Promise<{ lead: Lead; contactId: string }> {
    if (env.useMocks) {
      await delay()
      const result = leadMocks.convert(id, convertedByUserId)
      if (!result) throw new Error('Lead not found')
      return result
    }
    const data = await apiRequest<{ lead: unknown; contactId: string }>(
      `/leads/${id}/convert`,
      { method: 'POST', body: JSON.stringify({}) },
    )
    return {
      lead: leadFromDto(data.lead as Parameters<typeof leadFromDto>[0]),
      contactId: data.contactId,
    }
  },

  /* ── statuses ─────────────────────────────────────── */
  async listStatuses(): Promise<LeadStatus[]> {
    if (env.useMocks) {
      await delay()
      const branchId = useActiveBranchStore.getState().branchId ?? undefined
      return leadMocks.listStatuses(branchId)
    }
    const data = await apiRequest<{ data: unknown[]; total: number }>('/lead-statuses')
    return adaptListResponse(
      data as { data: Parameters<typeof leadStatusFromDto>[0][]; total: number },
      leadStatusFromDto,
    ).items
  },

  async createStatus(input: {
    branchId: string
    name: string
    color?: string
    displayOrder?: number
  }): Promise<LeadStatus> {
    if (env.useMocks) {
      await delay()
      return leadMocks.createStatus(input)
    }
    const data = await apiRequest<unknown>('/lead-statuses', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return leadStatusFromDto(data as Parameters<typeof leadStatusFromDto>[0])
  },

  async updateStatus(
    id: string,
    patch: Partial<{ name: string; color: string | null; displayOrder: number; isActive: boolean }>,
  ): Promise<LeadStatus> {
    if (env.useMocks) {
      await delay()
      const updated = leadMocks.updateStatus(id, patch)
      if (!updated) throw new Error('Status not found')
      return updated
    }
    const data = await apiRequest<unknown>(`/lead-statuses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    return leadStatusFromDto(data as Parameters<typeof leadStatusFromDto>[0])
  },

  async removeStatus(id: string): Promise<void> {
    if (env.useMocks) {
      await delay()
      const ok = leadMocks.removeStatus(id)
      if (!ok) throw new Error('Cannot remove status')
      return
    }
    await apiRequest<void>(`/lead-statuses/${id}`, { method: 'DELETE' })
  },

  /* ── activities ────────────────────────────────────── */
  async listActivities(leadId: string): Promise<Activity[]> {
    if (env.useMocks) {
      await delay()
      return leadMocks.listActivities(leadId)
    }
    const data = await apiRequest<{ items: unknown[]; total: number; page: number; limit: number }>(
      `/leads/${leadId}/activities`,
    )
    return (data.items as Parameters<typeof activityFromLeadDto>[0][]).map(
      activityFromLeadDto,
    )
  },
}

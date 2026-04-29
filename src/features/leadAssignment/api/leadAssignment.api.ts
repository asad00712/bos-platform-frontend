import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'
import { useActiveBranchStore } from '@/stores/activeBranch.store'
import type { LeadAssignmentConfig, LeadWebhook } from '@/types/crm'

import {
  leadAssignmentMocks,
  type LeadAssignmentConfigInput,
  type LeadWebhookInput,
} from './leadAssignment.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export const leadAssignmentApi = {
  /* ── config ─────────────────────────────────────────── */
  async getConfig(branchId: string): Promise<LeadAssignmentConfig> {
    if (env.useMocks) {
      await delay()
      return leadAssignmentMocks.getConfig(branchId)
    }
    return apiRequest<LeadAssignmentConfig>(
      `/lead-assignment-config?branchId=${branchId}`,
    )
  },

  async setConfig(input: LeadAssignmentConfigInput): Promise<LeadAssignmentConfig> {
    if (env.useMocks) {
      await delay()
      return leadAssignmentMocks.setConfig(input)
    }
    return apiRequest<LeadAssignmentConfig>('/lead-assignment-config', {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  },

  /* ── webhooks ───────────────────────────────────────── */
  async listWebhooks(): Promise<LeadWebhook[]> {
    if (env.useMocks) {
      await delay()
      const branchId = useActiveBranchStore.getState().branchId ?? undefined
      return leadAssignmentMocks.listWebhooks(branchId)
    }
    const data = await apiRequest<{ data: LeadWebhook[]; total: number }>(
      '/lead-webhooks',
    )
    return data.data
  },

  async createWebhook(input: LeadWebhookInput): Promise<LeadWebhook> {
    if (env.useMocks) {
      await delay()
      return leadAssignmentMocks.createWebhook(input)
    }
    return apiRequest<LeadWebhook>('/lead-webhooks', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  async updateWebhook(
    id: string,
    patch: Partial<{ name: string; isActive: boolean }>,
  ): Promise<LeadWebhook> {
    if (env.useMocks) {
      await delay()
      const updated = leadAssignmentMocks.updateWebhook(id, patch)
      if (!updated) throw new Error('Webhook not found')
      return updated
    }
    return apiRequest<LeadWebhook>(`/lead-webhooks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
  },

  async regenerateToken(id: string): Promise<LeadWebhook> {
    if (env.useMocks) {
      await delay()
      const updated = leadAssignmentMocks.regenerateWebhookToken(id)
      if (!updated) throw new Error('Webhook not found')
      return updated
    }
    return apiRequest<LeadWebhook>(`/lead-webhooks/${id}/regenerate-token`, {
      method: 'POST',
    })
  },

  async removeWebhook(id: string): Promise<void> {
    if (env.useMocks) {
      await delay()
      const ok = leadAssignmentMocks.removeWebhook(id)
      if (!ok) throw new Error('Webhook not found')
      return
    }
    await apiRequest<void>(`/lead-webhooks/${id}`, { method: 'DELETE' })
  },
}

export type { LeadAssignmentConfigInput, LeadWebhookInput }

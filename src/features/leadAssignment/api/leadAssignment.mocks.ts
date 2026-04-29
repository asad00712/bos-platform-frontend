import type { LeadAssignmentConfig, LeadWebhook } from '@/types/crm'
import { apiBaseUrl } from '@/api/http'

const MAIN = 'br-main'
const DOWNTOWN = 'br-downtown'

let configStore: LeadAssignmentConfig[] = [
  {
    branchId: MAIN,
    isActive: true,
    eligibleRoleIds: ['role-staff', 'role-manager'],
    updatedAt: new Date(Date.now() - 14 * 86_400_000).toISOString(),
  },
  {
    branchId: DOWNTOWN,
    isActive: false,
    eligibleRoleIds: [],
    updatedAt: new Date(Date.now() - 60 * 86_400_000).toISOString(),
  },
]

function buildPublicUrl(token: string): string {
  /* `apiBaseUrl` looks like `http://localhost:3001/api/v1`; the public
   * webhook lives at `/api/v1/webhooks/leads/:token`. We only need the
   * origin for display + clipboard, so just append. */
  return `${apiBaseUrl.replace(/\/$/, '')}/webhooks/leads/${token}`
}

let webhookStore: LeadWebhook[] = [
  {
    id: 'wh-website',
    branchId: MAIN,
    name: 'Website contact form',
    token: 'whk_demo_website_a1b2c3',
    isActive: true,
    publicUrl: buildPublicUrl('whk_demo_website_a1b2c3'),
    lastDeliveryAt: new Date(Date.now() - 4 * 3_600_000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3_600_000).toISOString(),
  },
  {
    id: 'wh-fb-campaign',
    branchId: MAIN,
    name: 'Facebook lead-ads (manual)',
    token: 'whk_demo_fbads_x9y8z7',
    isActive: false,
    publicUrl: buildPublicUrl('whk_demo_fbads_x9y8z7'),
    lastDeliveryAt: null,
    createdAt: new Date(Date.now() - 14 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86_400_000).toISOString(),
  },
]

function randomToken(): string {
  return (
    'whk_' +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  )
}

export type LeadAssignmentConfigInput = {
  branchId: string
  isActive: boolean
  eligibleRoleIds: string[]
}

export type LeadWebhookInput = {
  branchId: string
  name: string
  isActive?: boolean
}

export const leadAssignmentMocks = {
  /* ── config ─────────────────────────────────────────── */
  getConfig(branchId: string): LeadAssignmentConfig {
    return (
      configStore.find((c) => c.branchId === branchId) ?? {
        branchId,
        isActive: false,
        eligibleRoleIds: [],
        updatedAt: new Date().toISOString(),
      }
    )
  },

  setConfig(input: LeadAssignmentConfigInput): LeadAssignmentConfig {
    const existing = configStore.find((c) => c.branchId === input.branchId)
    const next: LeadAssignmentConfig = {
      branchId: input.branchId,
      isActive: input.isActive,
      eligibleRoleIds: input.eligibleRoleIds,
      updatedAt: new Date().toISOString(),
    }
    if (existing) {
      configStore = configStore.map((c) => (c.branchId === input.branchId ? next : c))
    } else {
      configStore = [...configStore, next]
    }
    return next
  },

  /* ── webhooks ───────────────────────────────────────── */
  listWebhooks(branchId?: string): LeadWebhook[] {
    return branchId ? webhookStore.filter((w) => w.branchId === branchId) : [...webhookStore]
  },

  createWebhook(input: LeadWebhookInput): LeadWebhook {
    const now = new Date().toISOString()
    const token = randomToken()
    const next: LeadWebhook = {
      id: `wh-${Date.now()}`,
      branchId: input.branchId,
      name: input.name,
      token,
      isActive: input.isActive ?? true,
      publicUrl: buildPublicUrl(token),
      lastDeliveryAt: null,
      createdAt: now,
      updatedAt: now,
    }
    webhookStore = [...webhookStore, next]
    return next
  },

  updateWebhook(
    id: string,
    patch: Partial<{ name: string; isActive: boolean }>,
  ): LeadWebhook | null {
    const idx = webhookStore.findIndex((w) => w.id === id)
    if (idx < 0) return null
    webhookStore[idx] = {
      ...webhookStore[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    return webhookStore[idx]
  },

  regenerateWebhookToken(id: string): LeadWebhook | null {
    const idx = webhookStore.findIndex((w) => w.id === id)
    if (idx < 0) return null
    const token = randomToken()
    webhookStore[idx] = {
      ...webhookStore[idx],
      token,
      publicUrl: buildPublicUrl(token),
      updatedAt: new Date().toISOString(),
    }
    return webhookStore[idx]
  },

  removeWebhook(id: string): boolean {
    const before = webhookStore.length
    webhookStore = webhookStore.filter((w) => w.id !== id)
    return webhookStore.length < before
  },
}

import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'
import type { TenantBranding } from '@/types/tenant'

import {
  integrationsResponseSchema,
  membersResponseSchema,
  memberSchema,
  organizationProfileSchema,
  rolesResponseSchema,
  type BrandingInput,
  type IntegrationsResponse,
  type InviteInput,
  type Member,
  type MembersResponse,
  type OrganizationProfile,
  type OrganizationProfileInput,
  type RolesResponse,
} from './settings.contracts'
import { settingsMocks } from './settings.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export const settingsApi = {
  async organization(): Promise<OrganizationProfile> {
    if (env.useMocks) {
      await delay()
      return organizationProfileSchema.parse(settingsMocks.organization())
    }
    const data = await apiRequest<unknown>('/settings/organization')
    return organizationProfileSchema.parse(data)
  },

  async saveOrganization(input: OrganizationProfileInput): Promise<OrganizationProfile> {
    if (env.useMocks) {
      await delay()
      return organizationProfileSchema.parse(settingsMocks.saveOrganization(input))
    }
    const data = await apiRequest<unknown>('/settings/organization', {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
    return organizationProfileSchema.parse(data)
  },

  async branding(): Promise<TenantBranding> {
    if (env.useMocks) {
      await delay()
      return settingsMocks.branding()
    }
    return apiRequest<TenantBranding>('/settings/branding')
  },

  async saveBranding(input: BrandingInput): Promise<TenantBranding> {
    if (env.useMocks) {
      await delay()
      return settingsMocks.saveBranding(input)
    }
    return apiRequest<TenantBranding>('/settings/branding', {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  },

  async members(): Promise<MembersResponse> {
    if (env.useMocks) {
      await delay()
      return membersResponseSchema.parse(settingsMocks.members())
    }
    const data = await apiRequest<unknown>('/settings/members')
    return membersResponseSchema.parse(data)
  },

  async invite(input: InviteInput): Promise<Member> {
    if (env.useMocks) {
      await delay()
      return memberSchema.parse(settingsMocks.invite(input))
    }
    const data = await apiRequest<unknown>('/settings/members', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return memberSchema.parse(data)
  },

  async removeMember(id: string): Promise<void> {
    if (env.useMocks) {
      await delay()
      const ok = settingsMocks.removeMember(id)
      if (!ok) throw new Error('Member not found')
      return
    }
    await apiRequest<void>(`/settings/members/${id}`, { method: 'DELETE' })
  },

  async changeMemberRole(id: string, roleId: string): Promise<Member> {
    if (env.useMocks) {
      await delay()
      const result = settingsMocks.changeMemberRole(id, roleId)
      if (!result) throw new Error('Member not found')
      return memberSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/settings/members/${id}/role`, {
      method: 'POST',
      body: JSON.stringify({ roleId }),
    })
    return memberSchema.parse(data)
  },

  async roles(): Promise<RolesResponse> {
    if (env.useMocks) {
      await delay()
      return rolesResponseSchema.parse(settingsMocks.roles())
    }
    const data = await apiRequest<unknown>('/settings/roles')
    return rolesResponseSchema.parse(data)
  },

  async integrations(): Promise<IntegrationsResponse> {
    if (env.useMocks) {
      await delay()
      return integrationsResponseSchema.parse(settingsMocks.integrations())
    }
    const data = await apiRequest<unknown>('/settings/integrations')
    return integrationsResponseSchema.parse(data)
  },
}

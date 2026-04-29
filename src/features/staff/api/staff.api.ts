import { apiRequest } from '@/api/http'
import { adaptListResponse, staffFromDto } from '@/api/adapters/crm'
import { env } from '@/shared/lib/env'
import { useActiveBranchStore } from '@/stores/activeBranch.store'
import type { Staff, StaffInvite } from '@/types/crm'

import { staffMocks, type StaffInviteInput } from './staff.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export const staffApi = {
  async list(): Promise<Staff[]> {
    if (env.useMocks) {
      await delay()
      const branchId = useActiveBranchStore.getState().branchId ?? undefined
      return staffMocks.list(branchId)
    }
    const data = await apiRequest<{ data: unknown[]; total: number }>('/staff')
    return adaptListResponse(
      data as { data: Parameters<typeof staffFromDto>[0][]; total: number },
      staffFromDto,
    ).items
  },

  async invites(): Promise<StaffInvite[]> {
    if (env.useMocks) {
      await delay()
      return staffMocks.invites()
    }
    const data = await apiRequest<{ data: StaffInvite[]; total: number }>(
      '/staff/invites',
    )
    return data.data
  },

  async invite(input: StaffInviteInput): Promise<StaffInvite> {
    if (env.useMocks) {
      await delay()
      return staffMocks.invite(input).invite
    }
    return apiRequest<StaffInvite>('/staff/invite', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  async cancelInvite(id: string): Promise<void> {
    if (env.useMocks) {
      await delay()
      const ok = staffMocks.cancelInvite(id)
      if (!ok) throw new Error('Invite not found')
      return
    }
    await apiRequest<void>(`/staff/invites/${id}`, { method: 'DELETE' })
  },

  async setRole(userId: string, roleIds: string[]): Promise<Staff> {
    if (env.useMocks) {
      await delay()
      const updated = staffMocks.setRole(userId, roleIds)
      if (!updated) throw new Error('Member not found')
      return updated
    }
    const data = await apiRequest<unknown>(`/staff/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ roleIds }),
    })
    return staffFromDto(data as Parameters<typeof staffFromDto>[0])
  },

  async setRoundRobin(userId: string, available: boolean): Promise<Staff> {
    if (env.useMocks) {
      await delay()
      const updated = staffMocks.setRoundRobin(userId, available)
      if (!updated) throw new Error('Member not found')
      return updated
    }
    const data = await apiRequest<unknown>(`/staff/${userId}/round-robin`, {
      method: 'PATCH',
      body: JSON.stringify({ available }),
    })
    return staffFromDto(data as Parameters<typeof staffFromDto>[0])
  },

  async remove(userId: string): Promise<void> {
    if (env.useMocks) {
      await delay()
      const ok = staffMocks.remove(userId)
      if (!ok) throw new Error('Member not found')
      return
    }
    await apiRequest<void>(`/staff/${userId}`, { method: 'DELETE' })
  },

  /* ── invite-accept (auth-service flow) ─────────────────────────── */
  async describeInvite(token: string): Promise<StaffInvite | null> {
    if (env.useMocks) {
      await delay()
      return staffMocks.describeInvite(token)
    }
    return apiRequest<StaffInvite | null>(`/auth/invites/${token}`, {
      auth: false,
      branchScope: false,
    })
  },

  async acceptInvite(input: {
    token: string
    firstName: string
    lastName?: string
    password: string
  }): Promise<{ invite: StaffInvite; staff: Staff }> {
    if (env.useMocks) {
      await delay()
      return staffMocks.acceptInvite(input)
    }
    const data = await apiRequest<{ invite: StaffInvite; user: unknown }>(
      '/auth/invites/accept',
      {
        method: 'POST',
        body: JSON.stringify(input),
        auth: false,
        branchScope: false,
      },
    )
    return {
      invite: data.invite,
      staff: staffFromDto(data.user as Parameters<typeof staffFromDto>[0]),
    }
  },
}

export type { StaffInviteInput }

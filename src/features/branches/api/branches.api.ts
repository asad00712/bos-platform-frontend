import { apiRequest } from '@/api/http'
import { adaptListResponse, branchFromDto } from '@/api/adapters/crm'
import { env } from '@/shared/lib/env'
import type { Branch } from '@/types/crm'
import { branchMocks } from './branches.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export type BranchInput = {
  name: string
  slug: string
  isHeadquarters?: boolean
  isActive?: boolean
}

export const branchesApi = {
  async list(): Promise<Branch[]> {
    if (env.useMocks) {
      await delay()
      return branchMocks.list()
    }
    const data = await apiRequest<{ data: unknown[]; total: number }>(
      '/branches',
      { branchScope: false },
    )
    return adaptListResponse(data as { data: Parameters<typeof branchFromDto>[0][]; total: number }, branchFromDto).items
  },

  async create(input: BranchInput): Promise<Branch> {
    if (env.useMocks) {
      await delay()
      return branchMocks.create(input)
    }
    const data = await apiRequest<unknown>('/branches', {
      method: 'POST',
      body: JSON.stringify(input),
      branchScope: false,
    })
    return branchFromDto(data as Parameters<typeof branchFromDto>[0])
  },

  async update(id: string, patch: Partial<BranchInput>): Promise<Branch> {
    if (env.useMocks) {
      await delay()
      const updated = branchMocks.update(id, patch)
      if (!updated) throw new Error('Branch not found')
      return updated
    }
    const data = await apiRequest<unknown>(`/branches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
      branchScope: false,
    })
    return branchFromDto(data as Parameters<typeof branchFromDto>[0])
  },

  async remove(id: string): Promise<void> {
    if (env.useMocks) {
      await delay()
      const ok = branchMocks.remove(id)
      if (!ok) throw new Error('Branch not found')
      return
    }
    await apiRequest<void>(`/branches/${id}`, {
      method: 'DELETE',
      branchScope: false,
    })
  },
}

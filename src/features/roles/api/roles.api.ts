import { apiRequest } from '@/api/http'
import { adaptListResponse, roleFromDto } from '@/api/adapters/crm'
import { env } from '@/shared/lib/env'
import type { TenantPermission, TenantRole } from '@/types/crm'

import { roleMocks } from './roles.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export type RoleInput = {
  name: string
  description?: string
  permissionSlugs: string[]
}

export const rolesApi = {
  async list(): Promise<TenantRole[]> {
    if (env.useMocks) {
      await delay()
      return roleMocks.list()
    }
    const data = await apiRequest<{ data: unknown[]; total: number }>('/roles')
    return adaptListResponse(
      data as { data: Parameters<typeof roleFromDto>[0][]; total: number },
      roleFromDto,
    ).items
  },

  async get(id: string): Promise<TenantRole> {
    if (env.useMocks) {
      await delay()
      const role = roleMocks.get(id)
      if (!role) throw new Error('Role not found')
      return role
    }
    const data = await apiRequest<unknown>(`/roles/${id}`)
    return roleFromDto(data as Parameters<typeof roleFromDto>[0])
  },

  async create(input: RoleInput): Promise<TenantRole> {
    if (env.useMocks) {
      await delay()
      return roleMocks.create(input)
    }
    const data = await apiRequest<unknown>('/roles', {
      method: 'POST',
      body: JSON.stringify({
        ...input,
        permissions: input.permissionSlugs.map((slug) => ({ slug })),
      }),
    })
    return roleFromDto(data as Parameters<typeof roleFromDto>[0])
  },

  async update(
    id: string,
    patch: Partial<{ name: string; description: string | null; permissionSlugs: string[] }>,
  ): Promise<TenantRole> {
    if (env.useMocks) {
      await delay()
      const updated = roleMocks.update(id, patch)
      if (!updated) throw new Error('Role not found')
      return updated
    }
    const data = await apiRequest<unknown>(`/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...patch,
        permissions: patch.permissionSlugs?.map((slug) => ({ slug })),
      }),
    })
    return roleFromDto(data as Parameters<typeof roleFromDto>[0])
  },

  async remove(id: string): Promise<void> {
    if (env.useMocks) {
      await delay()
      const ok = roleMocks.remove(id)
      if (!ok) throw new Error('Cannot delete system role')
      return
    }
    await apiRequest<void>(`/roles/${id}`, { method: 'DELETE' })
  },

  async listPermissions(): Promise<TenantPermission[]> {
    if (env.useMocks) {
      await delay()
      return roleMocks.listPermissions()
    }
    const data = await apiRequest<{ data: TenantPermission[]; total: number }>(
      '/permissions',
    )
    return data.data
  },

  /**
   * Returns the permission slugs the *current* user holds, derived from
   * their role. Will be replaced by /auth/me-driven loading once the BE
   * exposes the user's roles.
   */
  async currentPermissions(): Promise<{ roleId: string; slugs: string[] }> {
    if (env.useMocks) {
      await delay()
      const roleId = roleMocks.currentRoleId()
      const role = roleMocks.get(roleId)
      return { roleId, slugs: role?.permissionSlugs ?? [] }
    }
    const data = await apiRequest<{ roleId: string; slugs: string[] }>(
      '/auth/me/permissions',
    )
    return data
  },

  setCurrentRole(roleId: string): void {
    roleMocks.setCurrentRole(roleId)
  },
}

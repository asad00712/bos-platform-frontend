import type { Branch } from '@/types/crm'
import type { BranchInput } from './branches.api'

const TENANT_ID = 'demo-dental-tenant'

let store: Branch[] = [
  {
    id: 'br-main',
    tenantId: TENANT_ID,
    name: 'Main office',
    slug: 'main',
    isActive: true,
    isHeadquarters: true,
    createdAt: new Date(Date.now() - 365 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 86_400_000).toISOString(),
  },
  {
    id: 'br-downtown',
    tenantId: TENANT_ID,
    name: 'Downtown clinic',
    slug: 'downtown',
    isActive: true,
    isHeadquarters: false,
    createdAt: new Date(Date.now() - 180 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 86_400_000).toISOString(),
  },
  {
    id: 'br-westside',
    tenantId: TENANT_ID,
    name: 'Westside satellite',
    slug: 'westside',
    isActive: false,
    isHeadquarters: false,
    createdAt: new Date(Date.now() - 90 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86_400_000).toISOString(),
  },
]

export const branchMocks = {
  list(): Branch[] {
    return [...store]
  },

  create(input: BranchInput): Branch {
    const now = new Date().toISOString()
    const branch: Branch = {
      id: `br-${Date.now()}`,
      tenantId: TENANT_ID,
      name: input.name,
      slug: input.slug,
      isActive: input.isActive ?? true,
      isHeadquarters: input.isHeadquarters ?? false,
      createdAt: now,
      updatedAt: now,
    }
    if (branch.isHeadquarters) {
      store = store.map((b) => ({ ...b, isHeadquarters: false }))
    }
    store = [...store, branch]
    return branch
  },

  update(id: string, patch: Partial<BranchInput>): Branch | null {
    const idx = store.findIndex((b) => b.id === id)
    if (idx < 0) return null
    if (patch.isHeadquarters) {
      store = store.map((b) => ({ ...b, isHeadquarters: false }))
    }
    const next: Branch = {
      ...store[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    } as Branch
    store[idx] = next
    return next
  },

  remove(id: string): boolean {
    const before = store.length
    store = store.filter((b) => b.id !== id)
    return store.length < before
  },
}

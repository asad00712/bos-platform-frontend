import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Branch } from '@/types/crm'

/**
 * Active branch context. Every CRM-core list/create call appends `branchId`
 * from this store. Components consume `useActiveBranchId()` and the topbar
 * BranchPicker (Phase C) writes back via `setBranchId`.
 *
 * `branches` is a hydration cache populated by the branches feature when
 * data lands; it's stored here so the picker has a stable list to render
 * without a duplicate query.
 */

type ActiveBranchState = {
  branchId: string | null
  branches: Branch[]
  setBranchId: (id: string | null) => void
  setBranches: (branches: Branch[]) => void
  /** Pick the first headquarters/active branch when nothing is selected. */
  ensureSelection: () => void
}

export const useActiveBranchStore = create<ActiveBranchState>()(
  persist(
    (set, get) => ({
      branchId: null,
      branches: [],
      setBranchId: (id) => set({ branchId: id }),
      setBranches: (branches) => {
        set({ branches })
        const current = get().branchId
        if (!current || !branches.some((b) => b.id === current)) {
          const fallback =
            branches.find((b) => b.isHeadquarters && b.isActive) ??
            branches.find((b) => b.isActive) ??
            branches[0] ??
            null
          set({ branchId: fallback?.id ?? null })
        }
      },
      ensureSelection: () => {
        const { branchId, branches } = get()
        if (branchId) return
        const fallback =
          branches.find((b) => b.isHeadquarters && b.isActive) ??
          branches.find((b) => b.isActive) ??
          branches[0] ??
          null
        if (fallback) set({ branchId: fallback.id })
      },
    }),
    {
      name: 'bos.activeBranch',
      version: 1,
      partialize: (state) => ({ branchId: state.branchId }),
    },
  ),
)

export const useActiveBranchId = () =>
  useActiveBranchStore((s) => s.branchId)

export const useActiveBranch = () =>
  useActiveBranchStore((s) =>
    s.branchId ? (s.branches.find((b) => b.id === s.branchId) ?? null) : null,
  )

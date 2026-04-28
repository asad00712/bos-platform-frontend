import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Per-user, per-module saved views — a saved view is a named bundle of
 * `(filters, sort, columns, viewMode)` for a list page. Persisted to
 * localStorage so it survives reload; in production the backend would
 * sync these per-user.
 *
 * Modules call `useSavedViews('crm.contacts')` (the module key) to get
 * a slice + mutators scoped to that page.
 *
 * Built-in views (e.g. "All", "Mine") are NOT stored here — modules
 * compose them on top of user-saved ones in their toolbar config.
 */

export type SavedView = {
  id: string
  /** Module key — "crm.contacts", "scheduling.calendar", etc. */
  scope: string
  label: string
  /** Opaque payload per module (filters + sort + viewMode + column visibility). */
  payload: Record<string, unknown>
  /** Pinned views show in the toolbar chip strip; otherwise they live behind a menu. */
  pinned: boolean
  createdAt: string
}

type SavedViewsStore = {
  views: SavedView[]
  add: (input: Omit<SavedView, 'id' | 'createdAt'>) => SavedView
  update: (id: string, patch: Partial<SavedView>) => void
  remove: (id: string) => void
  clearScope: (scope: string) => void
  /** Convenience selector for a scope. */
  byScope: (scope: string) => SavedView[]
}

export const useSavedViews = create<SavedViewsStore>()(
  persist(
    (set, get) => ({
      views: [],
      add: (input) => {
        const view: SavedView = {
          ...input,
          id: `view-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ views: [...s.views, view] }))
        return view
      },
      update: (id, patch) =>
        set((s) => ({
          views: s.views.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        })),
      remove: (id) =>
        set((s) => ({ views: s.views.filter((v) => v.id !== id) })),
      clearScope: (scope) =>
        set((s) => ({ views: s.views.filter((v) => v.scope !== scope) })),
      byScope: (scope) => get().views.filter((v) => v.scope === scope),
    }),
    { name: 'bos.saved-views', version: 1 },
  ),
)

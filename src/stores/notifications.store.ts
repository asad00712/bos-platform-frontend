import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Live notification stream. In production this is fed by a WS / SSE
 * channel; for the demo we expose `push()` so any flow can simulate a
 * live event. Notifications are persisted so unread counts survive
 * reload, and `mute(category)` honours user-set silences.
 */

export type NotificationCategory =
  | 'billing'
  | 'scheduling'
  | 'crm'
  | 'support'
  | 'medical'
  | 'system'

export type NotificationKind = 'info' | 'success' | 'warning' | 'error' | 'mention'

export type AppNotification = {
  id: string
  category: NotificationCategory
  kind: NotificationKind
  title: string
  body?: string
  /** Optional deep-link target when the user clicks the notification. */
  to?: string
  occurredAt: string
  readAt: string | null
  snoozedUntil: string | null
}

type NotificationsStore = {
  items: AppNotification[]
  mutedCategories: NotificationCategory[]
  /** Push a new notification (used by demo wiring + future WS feed). */
  push: (
    n: Omit<AppNotification, 'id' | 'occurredAt' | 'readAt' | 'snoozedUntil'>,
  ) => AppNotification
  markRead: (id: string) => void
  markAllRead: () => void
  snooze: (id: string, hours: number) => void
  remove: (id: string) => void
  toggleMute: (cat: NotificationCategory) => void
  clear: () => void
  /** Selectors. */
  unreadCount: () => number
  visible: () => AppNotification[]
}

export const useNotifications = create<NotificationsStore>()(
  persist(
    (set, get) => ({
      items: [],
      mutedCategories: [],
      push: (input) => {
        const n: AppNotification = {
          ...input,
          id: `ntf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          occurredAt: new Date().toISOString(),
          readAt: null,
          snoozedUntil: null,
        }
        set((s) => ({ items: [n, ...s.items].slice(0, 200) }))
        return n
      },
      markRead: (id) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id && !i.readAt ? { ...i, readAt: new Date().toISOString() } : i,
          ),
        })),
      markAllRead: () =>
        set((s) => ({
          items: s.items.map((i) =>
            i.readAt ? i : { ...i, readAt: new Date().toISOString() },
          ),
        })),
      snooze: (id, hours) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  snoozedUntil: new Date(
                    Date.now() + hours * 3600 * 1000,
                  ).toISOString(),
                }
              : i,
          ),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      toggleMute: (cat) =>
        set((s) => ({
          mutedCategories: s.mutedCategories.includes(cat)
            ? s.mutedCategories.filter((c) => c !== cat)
            : [...s.mutedCategories, cat],
        })),
      clear: () => set({ items: [] }),
      unreadCount: () => {
        const now = Date.now()
        return get().items.filter(
          (i) =>
            !i.readAt &&
            !get().mutedCategories.includes(i.category) &&
            (!i.snoozedUntil || new Date(i.snoozedUntil).getTime() <= now),
        ).length
      },
      visible: () => {
        const now = Date.now()
        return get().items.filter(
          (i) => !i.snoozedUntil || new Date(i.snoozedUntil).getTime() <= now,
        )
      },
    }),
    { name: 'bos.notifications', version: 1 },
  ),
)

import { routes } from '@/routes/routeMap'
import type {
  Notification,
  NotificationPreferences,
  NotificationsResponse,
} from './notifications.contracts'

function minutesAgo(n: number): string {
  return new Date(Date.now() - n * 60_000).toISOString()
}
function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3_600_000).toISOString()
}
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

let items: Notification[] = [
  {
    id: 'ntf-001',
    kind: 'invoice',
    title: 'Invoice INV-2026-184 paid',
    body: 'Sarah Mitchell paid $3,200 by card.',
    href: routes.app.billing.invoice('inv-184'),
    read: false,
    occurredAt: minutesAgo(2),
  },
  {
    id: 'ntf-002',
    kind: 'appointment',
    title: 'New appointment booked',
    body: 'Dr. Ahmed at 3:00 PM today with Maria Garcia.',
    href: routes.app.scheduling.root(),
    read: false,
    occurredAt: minutesAgo(14),
  },
  {
    id: 'ntf-003',
    kind: 'lead',
    title: 'New lead added',
    body: 'Al-Rashid Law (₹18k potential).',
    href: routes.app.crm.contact('c-1002'),
    read: true,
    occurredAt: hoursAgo(1),
  },
  {
    id: 'ntf-004',
    kind: 'support',
    title: 'Support ticket #TKT-089 escalated',
    body: 'SLA breach risk · response overdue by 2h.',
    href: '/app/support/tickets/tkt-089',
    read: false,
    occurredAt: hoursAgo(2),
  },
  {
    id: 'ntf-005',
    kind: 'invoice',
    title: 'Invoice INV-2026-141 overdue 32 days',
    body: '$4,100 outstanding from Ahmed Khan.',
    href: routes.app.billing.invoice('inv-141'),
    read: true,
    occurredAt: hoursAgo(3),
  },
  {
    id: 'ntf-006',
    kind: 'mention',
    title: 'Maya mentioned you on a contact',
    body: '"Heads up team: pricing on Al-Rashid call…"',
    href: routes.app.crm.contact('c-1002'),
    read: true,
    occurredAt: daysAgo(1),
  },
  {
    id: 'ntf-007',
    kind: 'system',
    title: 'Branding updated',
    body: 'Owner changed primary color to Dental cyan.',
    href: '/app/settings/branding',
    read: true,
    occurredAt: daysAgo(2),
  },
]

let prefs: NotificationPreferences = {
  appointment: { email: true, sms: true, push: true },
  invoice: { email: true, sms: false, push: true },
  lead: { email: true, sms: false, push: true },
  support: { email: true, sms: true, push: true },
  system: { email: false, sms: false, push: true },
  mention: { email: true, sms: false, push: true },
}

export const notificationsMocks = {
  list(): NotificationsResponse {
    const sorted = [...items].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    return {
      items: sorted,
      unread: sorted.filter((i) => !i.read).length,
    }
  },
  markRead(id: string): Notification | null {
    const idx = items.findIndex((i) => i.id === id)
    if (idx < 0) return null
    items[idx] = { ...items[idx], read: true }
    return items[idx]
  },
  markAllRead(): NotificationsResponse {
    items = items.map((i) => ({ ...i, read: true }))
    return notificationsMocks.list()
  },
  preferences(): NotificationPreferences {
    return prefs
  },
  savePreferences(next: NotificationPreferences): NotificationPreferences {
    prefs = next
    return prefs
  },
}

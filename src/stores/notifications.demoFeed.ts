import { useNotifications } from './notifications.store'

/**
 * Lightweight "live feed" simulator. In production this is replaced by a
 * WS / SSE channel that calls `useNotifications.getState().push(...)` on
 * every server-pushed event.
 *
 * Demo behaviour:
 *   • Seeds 4 example notifications on first call (idempotent — keyed off
 *     `_demoFeedSeeded` flag in localStorage).
 *   • Every 90 seconds pushes one rotating event so the unread badge feels
 *     alive without spamming. Disable in tests with VITE_DISABLE_DEMO_FEED.
 */
const SEED_KEY = 'bos.notifications.seeded'

const SEEDS: Parameters<ReturnType<typeof useNotifications.getState>['push']>[0][] = [
  {
    category: 'billing',
    kind: 'success',
    title: 'Invoice INV-2026-184 paid',
    body: 'Sarah Mitchell · $3,200 — settled via Stripe',
    to: '/app/billing/invoices',
  },
  {
    category: 'scheduling',
    kind: 'info',
    title: 'New appointment booked',
    body: 'Dr. Hassan · 3:00 PM today · Khalid Al-Saud',
    to: '/app/medical/schedule',
  },
  {
    category: 'crm',
    kind: 'mention',
    title: 'Lead added — Al-Rashid Law',
    body: '₹18k potential · routed to your queue',
    to: '/app/crm',
  },
  {
    category: 'support',
    kind: 'warning',
    title: 'Support ticket TKT-089 escalated',
    body: 'SLA breach risk — response due in 47 minutes',
    to: '/app/support/tickets',
  },
]

const ROTATION: typeof SEEDS = [
  {
    category: 'medical',
    kind: 'error',
    title: 'Critical lab result for Yusra Khan',
    body: 'TSH 18.4 mIU/L — review and notify patient',
    to: '/app/medical/labs/inbox',
  },
  {
    category: 'billing',
    kind: 'warning',
    title: 'Claim CLM-7821 denied',
    body: 'CARC 197 · authorisation missing — resubmit available',
    to: '/app/medical/billing',
  },
  {
    category: 'system',
    kind: 'info',
    title: 'Backup completed',
    body: 'Daily snapshot for Acme Dental Clinic — 4.2 GB',
  },
]

export function startDemoNotificationFeed(): () => void {
  const store = useNotifications.getState()
  let seeded = false
  try {
    seeded = localStorage.getItem(SEED_KEY) === '1'
  } catch {
    /* ignore */
  }
  if (!seeded) {
    for (const s of SEEDS) store.push(s)
    try {
      localStorage.setItem(SEED_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  let i = 0
  const tick = () => {
    const next = ROTATION[i % ROTATION.length]!
    useNotifications.getState().push(next)
    i++
  }
  const handle = window.setInterval(tick, 90_000)
  return () => window.clearInterval(handle)
}

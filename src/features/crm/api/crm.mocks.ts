import type {
  Contact,
  ContactActivityList,
  ContactDetail,
  ContactInput,
  ContactsListResponse,
  ListFilters,
  SegmentsResponse,
} from './crm.contracts'

const TENANT_CURRENCY = 'USD'

const seed: Contact[] = [
  {
    id: 'c-1001',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.m@example.com',
    phone: '+1 415 555 0182',
    status: 'active',
    source: 'referral',
    vertical: 'Dental',
    tags: ['vip', 'recall-due'],
    ltv: 12_400,
    currency: TENANT_CURRENCY,
    ownerName: 'Dr. Ahmed',
    lastActivityAt: hoursAgo(2),
    createdAt: daysAgo(220),
  },
  {
    id: 'c-1002',
    firstName: 'Khalid',
    lastName: 'Al-Rashid',
    email: 'khalid@al-rashid-law.com',
    phone: '+971 50 123 4567',
    status: 'lead',
    source: 'website',
    vertical: 'Law',
    tags: ['high-value'],
    ltv: 0,
    currency: TENANT_CURRENCY,
    ownerName: 'Maya',
    lastActivityAt: hoursAgo(26),
    createdAt: daysAgo(8),
  },
  {
    id: 'c-1003',
    firstName: 'Greenfield',
    lastName: 'Academy',
    email: 'admin@greenfieldschool.edu',
    phone: '+92 300 456 7890',
    status: 'active',
    source: 'integration',
    vertical: 'School',
    tags: ['enterprise'],
    ltv: 9_400,
    currency: TENANT_CURRENCY,
    ownerName: 'Owner',
    lastActivityAt: daysAgo(2),
    createdAt: daysAgo(105),
  },
  {
    id: 'c-1004',
    firstName: 'Bella',
    lastName: 'Italia',
    email: 'reservations@bella-italia.it',
    phone: '+39 06 555 1234',
    status: 'active',
    source: 'manual',
    vertical: 'Restaurant',
    tags: [],
    ltv: 4_750,
    currency: TENANT_CURRENCY,
    ownerName: 'Maya',
    lastActivityAt: daysAgo(4),
    createdAt: daysAgo(150),
  },
  {
    id: 'c-1005',
    firstName: 'Ahmed',
    lastName: 'Khan',
    email: 'ahmed.khan@clinic.com',
    phone: '+92 321 678 1234',
    status: 'inactive',
    source: 'manual',
    vertical: 'Medical',
    tags: ['paused'],
    ltv: 2_100,
    currency: TENANT_CURRENCY,
    ownerName: 'Dr. Ahmed',
    lastActivityAt: daysAgo(45),
    createdAt: daysAgo(360),
  },
  {
    id: 'c-1006',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.g@example.com',
    phone: '+34 612 345 678',
    status: 'lead',
    source: 'import',
    vertical: 'Dental',
    tags: ['follow-up'],
    ltv: 0,
    currency: TENANT_CURRENCY,
    ownerName: 'Maya',
    lastActivityAt: daysAgo(1),
    createdAt: daysAgo(3),
  },
  {
    id: 'c-1007',
    firstName: 'Tariq',
    lastName: 'Bajwa',
    email: 'tariq@studio.com',
    phone: null,
    status: 'archived',
    source: 'manual',
    vertical: 'Dental',
    tags: [],
    ltv: 850,
    currency: TENANT_CURRENCY,
    ownerName: null,
    lastActivityAt: daysAgo(180),
    createdAt: daysAgo(540),
  },
]

let store: Contact[] = [...seed]

export const crmMocks = {
  list(filters: ListFilters): ContactsListResponse {
    const search = filters.search?.trim().toLowerCase()
    const items = store.filter((c) => {
      if (filters.status && c.status !== filters.status) return false
      if (filters.source && c.source !== filters.source) return false
      if (filters.tag && !c.tags.includes(filters.tag)) return false
      if (search) {
        const haystack = `${c.firstName} ${c.lastName} ${c.email ?? ''} ${c.phone ?? ''} ${(c.tags ?? []).join(' ')}`.toLowerCase()
        if (!haystack.includes(search)) return false
      }
      return true
    })
    return { items, total: items.length }
  },

  get(id: string): ContactDetail | null {
    const c = store.find((x) => x.id === id)
    if (!c) return null
    return {
      ...c,
      notes:
        c.id === 'c-1001'
          ? 'Prefers afternoons. Insurance via Aetna. Allergic to latex.'
          : c.id === 'c-1002'
            ? 'Multi-office firm; potential ₹18k retainer. Decision Q2.'
            : null,
      address:
        c.id === 'c-1001'
          ? { line1: '12 Pine Street', city: 'San Francisco', country: 'USA' }
          : null,
      birthday: c.id === 'c-1001' ? '1986-03-12' : null,
      preferredLocale: c.id === 'c-1001' ? 'en-US' : null,
    }
  },

  create(input: ContactInput): ContactDetail {
    const id = `c-${Date.now()}`
    const now = new Date().toISOString()
    const created: Contact = {
      id,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email && input.email.length > 0 ? input.email : null,
      phone: input.phone && input.phone.length > 0 ? input.phone : null,
      status: input.status,
      source: input.source,
      vertical: null,
      tags: input.tags,
      ltv: 0,
      currency: TENANT_CURRENCY,
      ownerName: null,
      lastActivityAt: now,
      createdAt: now,
    }
    store = [created, ...store]
    return {
      ...created,
      notes: input.notes ?? null,
      address: null,
      birthday: null,
      preferredLocale: null,
    }
  },

  update(id: string, patch: Partial<ContactInput>): ContactDetail | null {
    const idx = store.findIndex((x) => x.id === id)
    if (idx < 0) return null
    const current = store[idx]
    const next: Contact = {
      ...current,
      firstName: patch.firstName ?? current.firstName,
      lastName: patch.lastName ?? current.lastName,
      email: patch.email !== undefined ? (patch.email || null) : current.email,
      phone: patch.phone !== undefined ? (patch.phone || null) : current.phone,
      status: patch.status ?? current.status,
      source: patch.source ?? current.source,
      tags: patch.tags ?? current.tags,
      lastActivityAt: new Date().toISOString(),
    }
    store[idx] = next
    return crmMocks.get(id)
  },

  remove(id: string): boolean {
    const before = store.length
    store = store.filter((x) => x.id !== id)
    return store.length < before
  },

  segments(): SegmentsResponse {
    return {
      items: [
        { id: 'seg.vip', name: 'VIPs', count: store.filter((c) => c.tags.includes('vip')).length, color: 'oklch(0.7 0.18 50)' },
        { id: 'seg.leads', name: 'Active leads', count: store.filter((c) => c.status === 'lead').length, color: 'oklch(0.6 0.18 280)' },
        { id: 'seg.recall', name: 'Recall due', count: store.filter((c) => c.tags.includes('recall-due')).length, color: 'oklch(0.65 0.13 220)' },
        { id: 'seg.inactive', name: 'Inactive 90+ days', count: store.filter((c) => c.status === 'inactive').length, color: 'oklch(0.65 0.05 260)' },
        { id: 'seg.enterprise', name: 'Enterprise', count: store.filter((c) => c.tags.includes('enterprise')).length, color: 'oklch(0.55 0.18 295)' },
      ],
    }
  },

  activities(id: string): ContactActivityList {
    if (id !== 'c-1001') return { items: [] }
    return {
      items: [
        { id: 'act-1', kind: 'invoice', title: 'Invoice #INV-2026-184 paid', body: '$3,200 — Aetna', occurredAt: hoursAgo(2), authorName: 'system' },
        { id: 'act-2', kind: 'appointment', title: 'Appointment booked', body: 'Crown fitting · Dr. Ahmed', occurredAt: hoursAgo(14), authorName: 'Maya' },
        { id: 'act-3', kind: 'note', title: 'Call summary', body: 'Confirmed insurance, asked about whitening packages.', occurredAt: daysAgo(2), authorName: 'Maya' },
        { id: 'act-4', kind: 'email', title: 'Recall reminder sent', body: '6-month checkup', occurredAt: daysAgo(7), authorName: 'system' },
      ],
    }
  },
}

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3_600_000).toISOString()
}
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

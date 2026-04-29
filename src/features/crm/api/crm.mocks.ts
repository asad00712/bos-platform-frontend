import type {
  Contact,
  ContactActivityList,
  ContactInput,
  ContactsListResponse,
  ListFilters,
  OwnerLookup,
  SegmentsResponse,
  SourceLookup,
  TagLookup,
} from './crm.contracts'

const TENANT_CURRENCY = 'USD'
const DEFAULT_BRANCH = 'br-main'

/* ── lookup tables (mock equivalents of BE entities) ─────────────────────── */

let tagLibrary: TagLookup[] = [
  { id: 'tag-vip', name: 'vip', color: 'oklch(0.7 0.18 50)' },
  { id: 'tag-recall-due', name: 'recall-due', color: 'oklch(0.65 0.13 220)' },
  { id: 'tag-high-value', name: 'high-value', color: 'oklch(0.7 0.16 295)' },
  { id: 'tag-enterprise', name: 'enterprise', color: 'oklch(0.55 0.18 295)' },
  { id: 'tag-paused', name: 'paused', color: 'oklch(0.65 0.05 260)' },
  { id: 'tag-follow-up', name: 'follow-up', color: 'oklch(0.7 0.13 30)' },
]

let sourceLibrary: SourceLookup[] = [
  { id: 'src-manual', name: 'Manual', isSystem: true },
  { id: 'src-website', name: 'Website', isSystem: true },
  { id: 'src-import', name: 'Import', isSystem: true },
  { id: 'src-referral', name: 'Referral', isSystem: true },
  { id: 'src-integration', name: 'Integration', isSystem: true },
]

const ownerLibrary: OwnerLookup[] = [
  { userId: 'user-ahmed', name: 'Dr. Ahmed', email: 'ahmed@acme-dental.com' },
  { userId: 'user-maya', name: 'Maya', email: 'maya@acme-dental.com' },
  { userId: 'user-owner', name: 'Owner', email: 'owner@acme-dental.com' },
]

/* ── seed contacts (BE-aligned shape) ────────────────────────────────────── */

const seed: Contact[] = [
  {
    id: 'c-1001',
    branchId: DEFAULT_BRANCH,
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.m@example.com',
    phone: '+1 415 555 0182',
    company: null,
    jobTitle: null,
    address: {
      line1: '12 Pine Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postalCode: '94110',
    },
    sourceId: 'src-referral',
    originLeadId: null,
    status: 'active',
    ownerUserId: 'user-ahmed',
    notes: 'Prefers afternoons. Insurance via Aetna. Allergic to latex.',
    vertical: 'Dental',
    ltv: 12_400,
    currency: TENANT_CURRENCY,
    birthday: '1986-03-12',
    preferredLocale: 'en-US',
    lastActivityAt: hoursAgo(2),
    tagIds: ['tag-vip', 'tag-recall-due'],
    customFieldValues: { insuranceProvider: 'aetna', allergies: 'Latex' } as Record<string, unknown>,
    createdAt: daysAgo(220),
    updatedAt: hoursAgo(2),
  },
  {
    id: 'c-1002',
    branchId: DEFAULT_BRANCH,
    firstName: 'Khalid',
    lastName: 'Al-Rashid',
    email: 'khalid@al-rashid-law.com',
    phone: '+971 50 123 4567',
    company: 'Al-Rashid Law',
    jobTitle: 'Managing Partner',
    address: null,
    sourceId: 'src-website',
    originLeadId: null,
    status: 'active',
    ownerUserId: 'user-maya',
    notes: 'Multi-office firm; potential ₹18k retainer. Decision Q2.',
    vertical: 'Law',
    ltv: 0,
    currency: TENANT_CURRENCY,
    birthday: null,
    preferredLocale: null,
    lastActivityAt: hoursAgo(26),
    tagIds: ['tag-high-value'],
    createdAt: daysAgo(8),
    updatedAt: hoursAgo(26),
  },
  {
    id: 'c-1003',
    branchId: DEFAULT_BRANCH,
    firstName: 'Greenfield',
    lastName: 'Academy',
    email: 'admin@greenfieldschool.edu',
    phone: '+92 300 456 7890',
    company: 'Greenfield Academy',
    jobTitle: null,
    address: null,
    sourceId: 'src-integration',
    originLeadId: null,
    status: 'active',
    ownerUserId: 'user-owner',
    notes: null,
    vertical: 'School',
    ltv: 9_400,
    currency: TENANT_CURRENCY,
    birthday: null,
    preferredLocale: null,
    lastActivityAt: daysAgo(2),
    tagIds: ['tag-enterprise'],
    createdAt: daysAgo(105),
    updatedAt: daysAgo(2),
  },
  {
    id: 'c-1004',
    branchId: DEFAULT_BRANCH,
    firstName: 'Bella',
    lastName: 'Italia',
    email: 'reservations@bella-italia.it',
    phone: '+39 06 555 1234',
    company: 'Bella Italia',
    jobTitle: 'General Manager',
    address: null,
    sourceId: 'src-manual',
    originLeadId: null,
    status: 'active',
    ownerUserId: 'user-maya',
    notes: null,
    vertical: 'Restaurant',
    ltv: 4_750,
    currency: TENANT_CURRENCY,
    birthday: null,
    preferredLocale: null,
    lastActivityAt: daysAgo(4),
    tagIds: [],
    createdAt: daysAgo(150),
    updatedAt: daysAgo(4),
  },
  {
    id: 'c-1005',
    branchId: DEFAULT_BRANCH,
    firstName: 'Ahmed',
    lastName: 'Khan',
    email: 'ahmed.khan@clinic.com',
    phone: '+92 321 678 1234',
    company: null,
    jobTitle: null,
    address: null,
    sourceId: 'src-manual',
    originLeadId: null,
    status: 'inactive',
    ownerUserId: 'user-ahmed',
    notes: null,
    vertical: 'Medical',
    ltv: 2_100,
    currency: TENANT_CURRENCY,
    birthday: null,
    preferredLocale: null,
    lastActivityAt: daysAgo(45),
    tagIds: ['tag-paused'],
    createdAt: daysAgo(360),
    updatedAt: daysAgo(45),
  },
  {
    id: 'c-1007',
    branchId: DEFAULT_BRANCH,
    firstName: 'Tariq',
    lastName: 'Bajwa',
    email: 'tariq@studio.com',
    phone: null,
    company: 'Bajwa Studio',
    jobTitle: 'Photographer',
    address: null,
    sourceId: 'src-manual',
    originLeadId: null,
    status: 'archived',
    ownerUserId: null,
    notes: null,
    vertical: 'Dental',
    ltv: 850,
    currency: TENANT_CURRENCY,
    birthday: null,
    preferredLocale: null,
    lastActivityAt: daysAgo(180),
    tagIds: [],
    createdAt: daysAgo(540),
    updatedAt: daysAgo(180),
  },
]

let store: Contact[] = [...seed]

export const crmMocks = {
  list(filters: ListFilters & { branchId?: string }): ContactsListResponse {
    const search = filters.search?.trim().toLowerCase()
    const items = store.filter((c) => {
      if (filters.branchId && c.branchId !== filters.branchId) return false
      if (filters.status && c.status !== filters.status) return false
      if (filters.sourceId && c.sourceId !== filters.sourceId) return false
      if (filters.tagId && !c.tagIds.includes(filters.tagId)) return false
      if (filters.ownerUserId && c.ownerUserId !== filters.ownerUserId) return false
      if (search) {
        const tagNames = c.tagIds
          .map((id) => tagLibrary.find((t) => t.id === id)?.name ?? '')
          .join(' ')
        const haystack =
          `${c.firstName} ${c.lastName ?? ''} ${c.email ?? ''} ${c.phone ?? ''} ${c.company ?? ''} ${tagNames}`.toLowerCase()
        if (!haystack.includes(search)) return false
      }
      return true
    })
    return { items, total: items.length }
  },

  get(id: string): Contact | null {
    return store.find((x) => x.id === id) ?? null
  },

  create(input: ContactInput): Contact {
    const id = `c-${Date.now()}`
    const now = new Date().toISOString()
    const created: Contact = {
      id,
      branchId: input.branchId,
      firstName: input.firstName,
      lastName: input.lastName ?? null,
      email: input.email && input.email.length > 0 ? input.email : null,
      phone: input.phone && input.phone.length > 0 ? input.phone : null,
      company: input.company ?? null,
      jobTitle: input.jobTitle ?? null,
      address: input.address
        ? {
            line1: input.address.line1 ?? null,
            city: input.address.city ?? null,
            state: input.address.state ?? null,
            country: input.address.country ?? null,
            postalCode: input.address.postalCode ?? null,
          }
        : null,
      sourceId: input.sourceId ?? null,
      originLeadId: null,
      status: input.status ?? 'active',
      ownerUserId: input.ownerUserId ?? null,
      notes: input.notes ?? null,
      vertical: input.vertical ?? null,
      ltv: 0,
      currency: TENANT_CURRENCY,
      birthday: input.birthday ?? null,
      preferredLocale: input.preferredLocale ?? null,
      lastActivityAt: now,
      tagIds: input.tagIds ?? [],
      customFieldValues: input.customFieldValues ?? {},
      createdAt: now,
      updatedAt: now,
    }
    store = [created, ...store]
    return created
  },

  update(id: string, patch: Partial<ContactInput>): Contact | null {
    const idx = store.findIndex((x) => x.id === id)
    if (idx < 0) return null
    const current = store[idx]
    const next: Contact = {
      ...current,
      firstName: patch.firstName ?? current.firstName,
      lastName: patch.lastName !== undefined ? (patch.lastName || null) : current.lastName,
      email: patch.email !== undefined ? (patch.email || null) : current.email,
      phone: patch.phone !== undefined ? (patch.phone || null) : current.phone,
      company: patch.company !== undefined ? (patch.company || null) : current.company,
      jobTitle: patch.jobTitle !== undefined ? (patch.jobTitle || null) : current.jobTitle,
      address: patch.address
        ? {
            line1: patch.address.line1 ?? current.address?.line1 ?? null,
            city: patch.address.city ?? current.address?.city ?? null,
            state: patch.address.state ?? current.address?.state ?? null,
            country: patch.address.country ?? current.address?.country ?? null,
            postalCode: patch.address.postalCode ?? current.address?.postalCode ?? null,
          }
        : current.address,
      sourceId: patch.sourceId !== undefined ? (patch.sourceId || null) : current.sourceId,
      status: patch.status ?? current.status,
      ownerUserId:
        patch.ownerUserId !== undefined ? (patch.ownerUserId || null) : current.ownerUserId,
      notes: patch.notes !== undefined ? (patch.notes || null) : current.notes,
      vertical: patch.vertical !== undefined ? (patch.vertical || null) : current.vertical,
      birthday: patch.birthday !== undefined ? (patch.birthday || null) : current.birthday,
      preferredLocale:
        patch.preferredLocale !== undefined
          ? (patch.preferredLocale || null)
          : current.preferredLocale,
      tagIds: patch.tagIds ?? current.tagIds,
      customFieldValues: patch.customFieldValues ?? current.customFieldValues,
      lastActivityAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    store[idx] = next
    return next
  },

  remove(id: string): boolean {
    const before = store.length
    store = store.filter((x) => x.id !== id)
    return store.length < before
  },

  segments(): SegmentsResponse {
    return {
      items: [
        {
          id: 'seg.vip',
          name: 'VIPs',
          count: store.filter((c) => c.tagIds.includes('tag-vip')).length,
          color: 'oklch(0.7 0.18 50)',
        },
        {
          id: 'seg.recall',
          name: 'Recall due',
          count: store.filter((c) => c.tagIds.includes('tag-recall-due')).length,
          color: 'oklch(0.65 0.13 220)',
        },
        {
          id: 'seg.inactive',
          name: 'Inactive 90+ days',
          count: store.filter((c) => c.status === 'inactive').length,
          color: 'oklch(0.65 0.05 260)',
        },
        {
          id: 'seg.enterprise',
          name: 'Enterprise',
          count: store.filter((c) => c.tagIds.includes('tag-enterprise')).length,
          color: 'oklch(0.55 0.18 295)',
        },
      ],
    }
  },

  activities(id: string): ContactActivityList {
    if (id !== 'c-1001') return { items: [] }
    return {
      items: [
        {
          id: 'act-1',
          kind: 'invoice',
          title: 'Invoice #INV-2026-184 paid',
          body: '$3,200 — Aetna',
          occurredAt: hoursAgo(2),
          authorName: 'system',
        },
        {
          id: 'act-2',
          kind: 'appointment',
          title: 'Appointment booked',
          body: 'Crown fitting · Dr. Ahmed',
          occurredAt: hoursAgo(14),
          authorName: 'Maya',
        },
        {
          id: 'act-3',
          kind: 'note',
          title: 'Call summary',
          body: 'Confirmed insurance, asked about whitening packages.',
          occurredAt: daysAgo(2),
          authorName: 'Maya',
        },
        {
          id: 'act-4',
          kind: 'email',
          title: 'Recall reminder sent',
          body: '6-month checkup',
          occurredAt: daysAgo(7),
          authorName: 'system',
        },
      ],
    }
  },

  /* lookups */
  tags(): TagLookup[] {
    return tagLibrary
  },
  sources(): SourceLookup[] {
    return sourceLibrary
  },
  owners(): OwnerLookup[] {
    return ownerLibrary
  },

  /* tag CRUD ─────────────────────────────────────────────────────────── */
  createTag(input: { name: string; color?: string | null }): TagLookup {
    const tag: TagLookup = {
      id: `tag-${Date.now()}`,
      name: input.name,
      color: input.color ?? null,
    }
    tagLibrary = [...tagLibrary, tag]
    return tag
  },
  updateTag(id: string, patch: Partial<{ name: string; color: string | null }>): TagLookup | null {
    const idx = tagLibrary.findIndex((t) => t.id === id)
    if (idx < 0) return null
    tagLibrary[idx] = { ...tagLibrary[idx], ...patch }
    return tagLibrary[idx]
  },
  removeTag(id: string): boolean {
    const before = tagLibrary.length
    tagLibrary = tagLibrary.filter((t) => t.id !== id)
    /* unset on contacts */
    store = store.map((c) => ({ ...c, tagIds: c.tagIds.filter((tid) => tid !== id) }))
    return tagLibrary.length < before
  },

  /* source CRUD ──────────────────────────────────────────────────────── */
  createSource(input: { name: string }): SourceLookup {
    const src: SourceLookup = {
      id: `src-${Date.now()}`,
      name: input.name,
      isSystem: false,
    }
    sourceLibrary = [...sourceLibrary, src]
    return src
  },
  updateSource(id: string, patch: Partial<{ name: string }>): SourceLookup | null {
    const idx = sourceLibrary.findIndex((s) => s.id === id)
    if (idx < 0) return null
    sourceLibrary[idx] = { ...sourceLibrary[idx], ...patch }
    return sourceLibrary[idx]
  },
  removeSource(id: string): boolean {
    const target = sourceLibrary.find((s) => s.id === id)
    if (!target || target.isSystem) return false
    const before = sourceLibrary.length
    sourceLibrary = sourceLibrary.filter((s) => s.id !== id)
    /* unset on contacts */
    store = store.map((c) => (c.sourceId === id ? { ...c, sourceId: null } : c))
    return sourceLibrary.length < before
  },
}

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3_600_000).toISOString()
}
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

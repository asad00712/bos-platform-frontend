import type { Lead, LeadStatus, Activity } from '@/types/crm'
import type { LeadInput } from './leads.api'

const TENANT_BRANCH = 'br-main'
const SECOND_BRANCH = 'br-downtown'

let leadStatusStore: LeadStatus[] = [
  {
    id: 'ls-new',
    branchId: TENANT_BRANCH,
    name: 'New',
    color: '#94A3B8',
    displayOrder: 1,
    isSystem: true,
    isActive: true,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(365),
  },
  {
    id: 'ls-contacted',
    branchId: TENANT_BRANCH,
    name: 'Contacted',
    color: '#60A5FA',
    displayOrder: 2,
    isSystem: false,
    isActive: true,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(365),
  },
  {
    id: 'ls-qualified',
    branchId: TENANT_BRANCH,
    name: 'Qualified',
    color: '#A78BFA',
    displayOrder: 3,
    isSystem: false,
    isActive: true,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(365),
  },
  {
    id: 'ls-proposal',
    branchId: TENANT_BRANCH,
    name: 'Proposal sent',
    color: '#F59E0B',
    displayOrder: 4,
    isSystem: false,
    isActive: true,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(365),
  },
  {
    id: 'ls-won',
    branchId: TENANT_BRANCH,
    name: 'Won',
    color: '#10B981',
    displayOrder: 5,
    isSystem: true,
    isActive: true,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(365),
  },
  {
    id: 'ls-lost',
    branchId: TENANT_BRANCH,
    name: 'Lost',
    color: '#EF4444',
    displayOrder: 6,
    isSystem: true,
    isActive: true,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(365),
  },
]

let leadStore: Lead[] = [
  {
    id: 'ld-1',
    branchId: TENANT_BRANCH,
    contactId: null,
    firstName: 'Hannah',
    lastName: 'Park',
    email: 'hannah.p@example.com',
    phone: '+1 415 555 0144',
    company: 'Park Wellness',
    sourceId: 'src-website',
    statusId: 'ls-new',
    priority: 'high',
    estimatedValue: 12500,
    ownerUserId: 'user-maya',
    notes: 'Asked about whitening + Invisalign bundle.',
    convertedAt: null,
    convertedByUserId: null,
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(3),
  },
  {
    id: 'ld-2',
    branchId: TENANT_BRANCH,
    contactId: null,
    firstName: 'Daniel',
    lastName: 'Kim',
    email: 'daniel.kim@studio.io',
    phone: '+1 415 555 0188',
    company: 'Kim Studio',
    sourceId: 'src-referral',
    statusId: 'ls-contacted',
    priority: 'medium',
    estimatedValue: 4800,
    ownerUserId: 'user-ahmed',
    notes: null,
    convertedAt: null,
    convertedByUserId: null,
    createdAt: daysAgo(2),
    updatedAt: hoursAgo(20),
  },
  {
    id: 'ld-3',
    branchId: TENANT_BRANCH,
    contactId: null,
    firstName: 'Lara',
    lastName: 'Nasser',
    email: 'lara@example.com',
    phone: null,
    company: null,
    sourceId: 'src-website',
    statusId: 'ls-qualified',
    priority: 'high',
    estimatedValue: 18000,
    ownerUserId: 'user-maya',
    notes: 'Founder of a 30-person law firm. Q2 decision.',
    convertedAt: null,
    convertedByUserId: null,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
  {
    id: 'ld-4',
    branchId: TENANT_BRANCH,
    contactId: null,
    firstName: 'Owen',
    lastName: 'Reyes',
    email: 'owen@reyesmedia.com',
    phone: '+1 213 555 0212',
    company: 'Reyes Media',
    sourceId: 'src-import',
    statusId: 'ls-proposal',
    priority: 'medium',
    estimatedValue: 9400,
    ownerUserId: 'user-owner',
    notes: 'Sent pricing on 2026-04-22, awaiting reply.',
    convertedAt: null,
    convertedByUserId: null,
    createdAt: daysAgo(14),
    updatedAt: daysAgo(7),
  },
  {
    id: 'ld-5',
    branchId: TENANT_BRANCH,
    contactId: null,
    firstName: 'Pria',
    lastName: 'Subramaniam',
    email: 'pria.s@example.com',
    phone: '+91 98 123 45678',
    company: null,
    sourceId: 'src-manual',
    statusId: 'ls-lost',
    priority: 'low',
    estimatedValue: 2200,
    ownerUserId: 'user-ahmed',
    notes: 'Went with a competitor on price.',
    convertedAt: null,
    convertedByUserId: null,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(20),
  },
  {
    id: 'ld-6',
    branchId: SECOND_BRANCH,
    contactId: null,
    firstName: 'Marco',
    lastName: 'Bianchi',
    email: 'marco@bianchi.it',
    phone: null,
    company: 'Bianchi Bistro',
    sourceId: 'src-referral',
    statusId: 'ls-new',
    priority: 'medium',
    estimatedValue: 6500,
    ownerUserId: null,
    notes: null,
    convertedAt: null,
    convertedByUserId: null,
    createdAt: hoursAgo(8),
    updatedAt: hoursAgo(8),
  },
]

const activityStore: Activity[] = [
  {
    id: 'la-1',
    entity: 'lead',
    entityId: 'ld-1',
    kind: 'note',
    direction: null,
    subject: 'Initial enquiry summary',
    body: 'Asked about whitening packages and Invisalign timeline. Sounds price-sensitive but motivated.',
    outcome: null,
    durationSeconds: null,
    recordingUrl: null,
    transcriptUrl: null,
    scheduledAt: null,
    completedAt: null,
    dueAt: null,
    taskStatus: null,
    createdByUserId: 'user-maya',
    assignedToUserId: null,
    metadata: null,
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(3),
  },
  {
    id: 'la-2',
    entity: 'lead',
    entityId: 'ld-2',
    kind: 'call',
    direction: 'outbound',
    subject: 'Discovery call',
    body: 'Walked through scheduling + automation. Sending pricing tomorrow.',
    outcome: 'spoke',
    durationSeconds: 22 * 60,
    recordingUrl: null,
    transcriptUrl: null,
    scheduledAt: null,
    completedAt: hoursAgo(20),
    dueAt: null,
    taskStatus: null,
    createdByUserId: 'user-ahmed',
    assignedToUserId: null,
    metadata: null,
    createdAt: hoursAgo(20),
    updatedAt: hoursAgo(20),
  },
  {
    id: 'la-3',
    entity: 'lead',
    entityId: 'ld-3',
    kind: 'task',
    direction: null,
    subject: 'Send case study deck',
    body: 'Lara asked for the multi-office case study by Wed.',
    outcome: null,
    durationSeconds: null,
    recordingUrl: null,
    transcriptUrl: null,
    scheduledAt: null,
    completedAt: null,
    dueAt: daysAgo(-3),
    taskStatus: 'open',
    createdByUserId: 'user-maya',
    assignedToUserId: 'user-maya',
    metadata: null,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
]

export const leadMocks = {
  /* ── leads ─────────────────────────────────────────── */
  list(filters: {
    branchId?: string
    search?: string
    statusId?: string
    priority?: string
    ownerUserId?: string
  }): { items: Lead[]; total: number } {
    const search = filters.search?.trim().toLowerCase()
    const items = leadStore.filter((l) => {
      if (filters.branchId && l.branchId !== filters.branchId) return false
      if (filters.statusId && l.statusId !== filters.statusId) return false
      if (filters.priority && l.priority !== filters.priority) return false
      if (filters.ownerUserId && l.ownerUserId !== filters.ownerUserId) return false
      if (search) {
        const hay =
          `${l.firstName} ${l.lastName ?? ''} ${l.email ?? ''} ${l.phone ?? ''} ${l.company ?? ''}`.toLowerCase()
        if (!hay.includes(search)) return false
      }
      return true
    })
    return { items, total: items.length }
  },

  get(id: string): Lead | null {
    return leadStore.find((l) => l.id === id) ?? null
  },

  create(input: LeadInput): Lead {
    const id = `ld-${Date.now()}`
    const now = new Date().toISOString()
    const lead: Lead = {
      id,
      branchId: input.branchId,
      contactId: null,
      firstName: input.firstName,
      lastName: input.lastName ?? null,
      email: input.email && input.email.length > 0 ? input.email : null,
      phone: input.phone ?? null,
      company: input.company ?? null,
      sourceId: input.sourceId ?? null,
      statusId: input.statusId ?? leadStatusStore.find((s) => s.isSystem && s.name === 'New')?.id ?? null,
      priority: input.priority ?? 'medium',
      estimatedValue: input.estimatedValue ?? null,
      ownerUserId: input.ownerUserId ?? null,
      notes: input.notes ?? null,
      convertedAt: null,
      convertedByUserId: null,
      customFieldValues: input.customFieldValues ?? {},
      createdAt: now,
      updatedAt: now,
    }
    leadStore = [lead, ...leadStore]
    return lead
  },

  update(id: string, patch: Partial<LeadInput>): Lead | null {
    const idx = leadStore.findIndex((l) => l.id === id)
    if (idx < 0) return null
    const current = leadStore[idx]
    const next: Lead = {
      ...current,
      firstName: patch.firstName ?? current.firstName,
      lastName: patch.lastName !== undefined ? (patch.lastName || null) : current.lastName,
      email: patch.email !== undefined ? (patch.email || null) : current.email,
      phone: patch.phone !== undefined ? (patch.phone || null) : current.phone,
      company: patch.company !== undefined ? (patch.company || null) : current.company,
      sourceId: patch.sourceId !== undefined ? (patch.sourceId || null) : current.sourceId,
      statusId: patch.statusId !== undefined ? (patch.statusId || null) : current.statusId,
      priority: patch.priority ?? current.priority,
      estimatedValue:
        patch.estimatedValue !== undefined ? patch.estimatedValue : current.estimatedValue,
      ownerUserId:
        patch.ownerUserId !== undefined ? (patch.ownerUserId || null) : current.ownerUserId,
      notes: patch.notes !== undefined ? (patch.notes || null) : current.notes,
      customFieldValues: patch.customFieldValues ?? current.customFieldValues,
      updatedAt: new Date().toISOString(),
    }
    leadStore[idx] = next
    return next
  },

  remove(id: string): boolean {
    const before = leadStore.length
    leadStore = leadStore.filter((l) => l.id !== id)
    return leadStore.length < before
  },

  setStatus(id: string, statusId: string): Lead | null {
    return leadMocks.update(id, { statusId })
  },

  convert(id: string, convertedByUserId: string): { lead: Lead; contactId: string } | null {
    const idx = leadStore.findIndex((l) => l.id === id)
    if (idx < 0) return null
    const now = new Date().toISOString()
    const wonStatus = leadStatusStore.find((s) => s.name === 'Won')
    const newContactId = `c-${Date.now()}`
    leadStore[idx] = {
      ...leadStore[idx],
      contactId: newContactId,
      statusId: wonStatus?.id ?? leadStore[idx].statusId,
      convertedAt: now,
      convertedByUserId,
      updatedAt: now,
    }
    return { lead: leadStore[idx], contactId: newContactId }
  },

  /* ── statuses ──────────────────────────────────────── */
  listStatuses(branchId?: string): LeadStatus[] {
    return leadStatusStore
      .filter((s) => (branchId ? s.branchId === branchId : true))
      .sort((a, b) => a.displayOrder - b.displayOrder)
  },

  createStatus(input: {
    branchId: string
    name: string
    color?: string
    displayOrder?: number
  }): LeadStatus {
    const now = new Date().toISOString()
    const next: LeadStatus = {
      id: `ls-${Date.now()}`,
      branchId: input.branchId,
      name: input.name,
      color: input.color ?? null,
      displayOrder:
        input.displayOrder ??
        (leadStatusStore.filter((s) => s.branchId === input.branchId).length + 1),
      isSystem: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }
    leadStatusStore = [...leadStatusStore, next]
    return next
  },

  updateStatus(
    id: string,
    patch: Partial<{ name: string; color: string | null; displayOrder: number; isActive: boolean }>,
  ): LeadStatus | null {
    const idx = leadStatusStore.findIndex((s) => s.id === id)
    if (idx < 0) return null
    leadStatusStore[idx] = {
      ...leadStatusStore[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    return leadStatusStore[idx]
  },

  removeStatus(id: string): boolean {
    const target = leadStatusStore.find((s) => s.id === id)
    if (!target || target.isSystem) return false
    const before = leadStatusStore.length
    leadStatusStore = leadStatusStore.filter((s) => s.id !== id)
    /* unset on leads */
    leadStore = leadStore.map((l) => (l.statusId === id ? { ...l, statusId: null } : l))
    return leadStatusStore.length < before
  },

  /* ── activities ────────────────────────────────────── */
  listActivities(leadId: string): Activity[] {
    return activityStore
      .filter((a) => a.entity === 'lead' && a.entityId === leadId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  },
}

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3_600_000).toISOString()
}
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

/**
 * Mock store for the unified activity timeline.
 *
 * Lead-attached activities round-trip through `crm-core` once wired; contact
 * activities are FE-only until the BE exposes a contact-activity endpoint
 * (the BE currently only models LeadActivity). Both surfaces feed the same
 * UI via the unified `Activity` shape.
 */

import type {
  Activity,
  ActivityEntity,
  ActivityInput,
  ActivityKind,
} from '@/types/crm'

let store: Activity[] = [
  /* contact c-1001 — preserves the prior demo activities, now under the
   * unified shape. FE-only kinds (invoice, appointment) live alongside
   * BE-backed kinds (note, email). */
  {
    id: 'act-c1-1',
    entity: 'contact',
    entityId: 'c-1001',
    kind: 'invoice',
    direction: null,
    subject: 'Invoice #INV-2026-184 paid',
    body: '$3,200 — Aetna',
    outcome: null,
    durationSeconds: null,
    recordingUrl: null,
    transcriptUrl: null,
    scheduledAt: null,
    completedAt: hoursAgo(2),
    dueAt: null,
    taskStatus: null,
    createdByUserId: 'system',
    assignedToUserId: null,
    metadata: null,
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
  },
  {
    id: 'act-c1-2',
    entity: 'contact',
    entityId: 'c-1001',
    kind: 'appointment',
    direction: null,
    subject: 'Crown fitting',
    body: 'Dr. Ahmed · Op 3',
    outcome: null,
    durationSeconds: null,
    recordingUrl: null,
    transcriptUrl: null,
    scheduledAt: hoursAgo(14),
    completedAt: null,
    dueAt: null,
    taskStatus: null,
    createdByUserId: 'user-maya',
    assignedToUserId: null,
    metadata: null,
    createdAt: hoursAgo(14),
    updatedAt: hoursAgo(14),
  },
  {
    id: 'act-c1-3',
    entity: 'contact',
    entityId: 'c-1001',
    kind: 'note',
    direction: null,
    subject: 'Call summary',
    body: 'Confirmed insurance, asked about whitening packages.',
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
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: 'act-c1-4',
    entity: 'contact',
    entityId: 'c-1001',
    kind: 'email',
    direction: 'outbound',
    subject: 'Recall reminder sent',
    body: '6-month checkup',
    outcome: null,
    durationSeconds: null,
    recordingUrl: null,
    transcriptUrl: null,
    scheduledAt: null,
    completedAt: daysAgo(7),
    dueAt: null,
    taskStatus: null,
    createdByUserId: 'system',
    assignedToUserId: null,
    metadata: null,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
  },

  /* lead activities — already seeded in leads.mocks.ts but mirrored here so
   * the unified store owns the canonical timeline. The leads mock keeps
   * its own list for backward-compat; this store is the path forward. */
  {
    id: 'act-l1-1',
    entity: 'lead',
    entityId: 'ld-1',
    kind: 'note',
    direction: null,
    subject: 'Initial enquiry summary',
    body: 'Asked about whitening + Invisalign timeline. Price-sensitive but motivated.',
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
    id: 'act-l2-1',
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
    id: 'act-l3-1',
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

export const activityMocks = {
  list(entity: ActivityEntity, entityId: string): Activity[] {
    return store
      .filter((a) => a.entity === entity && a.entityId === entityId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  },

  create(
    entity: ActivityEntity,
    entityId: string,
    input: ActivityInput,
    createdByUserId: string,
  ): Activity {
    const now = new Date().toISOString()
    const next: Activity = {
      id: `act-${Date.now()}`,
      entity,
      entityId,
      kind: input.kind,
      direction: input.direction ?? null,
      subject: input.subject ?? null,
      body: input.body ?? null,
      outcome: input.outcome ?? null,
      durationSeconds: input.durationSeconds ?? null,
      recordingUrl: input.recordingUrl ?? null,
      transcriptUrl: input.transcriptUrl ?? null,
      scheduledAt: input.scheduledAt ?? null,
      completedAt: input.completedAt ?? null,
      dueAt: input.dueAt ?? null,
      taskStatus: input.taskStatus ?? (input.kind === 'task' ? 'open' : null),
      createdByUserId,
      assignedToUserId: input.assignedToUserId ?? null,
      metadata: input.metadata ?? null,
      createdAt: now,
      updatedAt: now,
    }
    store = [next, ...store]
    return next
  },

  setTaskStatus(id: string, taskStatus: NonNullable<Activity['taskStatus']>): Activity | null {
    const idx = store.findIndex((a) => a.id === id)
    if (idx < 0) return null
    store[idx] = { ...store[idx], taskStatus, updatedAt: new Date().toISOString() }
    return store[idx]
  },

  remove(id: string): boolean {
    const before = store.length
    store = store.filter((a) => a.id !== id)
    return store.length < before
  },

  /** Used by the leads feature to merge legacy seed activities. */
  ensureSeed(seedActivities: Activity[]): void {
    const known = new Set(store.map((a) => a.id))
    seedActivities.forEach((a) => {
      if (!known.has(a.id)) store.push(a)
    })
  },
}

export type { ActivityKind }

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3_600_000).toISOString()
}
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

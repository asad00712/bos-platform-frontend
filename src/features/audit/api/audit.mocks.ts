import type {
  AuditEntry,
  AuditFilters,
  AuditResponse,
  Session,
  SessionsResponse,
} from './audit.contracts'

function minutesAgo(n: number): string {
  return new Date(Date.now() - n * 60_000).toISOString()
}
function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3_600_000).toISOString()
}
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

const entries: AuditEntry[] = [
  {
    id: 'aud-001',
    action: 'login',
    resource: 'session',
    resourceId: 'sess-current',
    resourceLabel: 'Web · Chrome on macOS',
    actorName: 'Owner',
    actorEmail: 'owner@acmedental.com',
    ipAddress: '203.0.113.4',
    occurredAt: minutesAgo(2),
    summary: 'Owner signed in from 203.0.113.4',
  },
  {
    id: 'aud-002',
    action: 'create',
    resource: 'invoice',
    resourceId: 'inv-202',
    resourceLabel: 'INV-2026-202',
    actorName: 'Maya Patel',
    actorEmail: 'maya@acmedental.com',
    ipAddress: '203.0.113.4',
    occurredAt: hoursAgo(1),
    summary: 'Created draft invoice INV-2026-202 for Maria Garcia',
  },
  {
    id: 'aud-003',
    action: 'update',
    resource: 'invoice',
    resourceId: 'inv-184',
    resourceLabel: 'INV-2026-184',
    actorName: 'Maya Patel',
    actorEmail: 'maya@acmedental.com',
    ipAddress: '203.0.113.4',
    occurredAt: hoursAgo(2),
    summary: 'Recorded payment $3,200 on INV-2026-184',
  },
  {
    id: 'aud-004',
    action: 'permission_change',
    resource: 'role',
    resourceId: 'role.billing',
    resourceLabel: 'Billing role',
    actorName: 'Owner',
    actorEmail: 'owner@acmedental.com',
    ipAddress: '203.0.113.4',
    occurredAt: hoursAgo(3),
    summary: 'Granted reports:read to Billing role',
  },
  {
    id: 'aud-005',
    action: 'invite',
    resource: 'employee',
    resourceId: 'mem-006',
    resourceLabel: 'noah@acmedental.com',
    actorName: 'Owner',
    actorEmail: 'owner@acmedental.com',
    ipAddress: '203.0.113.4',
    occurredAt: hoursAgo(20),
    summary: 'Invited Noah Williams as Billing',
  },
  {
    id: 'aud-006',
    action: 'export',
    resource: 'contact',
    resourceId: null,
    resourceLabel: 'Contacts list',
    actorName: 'Maya Patel',
    actorEmail: 'maya@acmedental.com',
    ipAddress: '203.0.113.4',
    occurredAt: daysAgo(1),
    summary: 'Exported 42 contacts to CSV',
  },
  {
    id: 'aud-007',
    action: 'delete',
    resource: 'document',
    resourceId: 'doc-old',
    resourceLabel: 'Old whitening template',
    actorName: 'Maya Patel',
    actorEmail: 'maya@acmedental.com',
    ipAddress: '203.0.113.4',
    occurredAt: daysAgo(2),
    summary: 'Deleted document Old whitening template',
  },
  {
    id: 'aud-008',
    action: 'view',
    resource: 'contact',
    resourceId: 'c-1001',
    resourceLabel: 'Sarah Mitchell',
    actorName: 'Dr. Ahmed',
    actorEmail: 'ahmed@acmedental.com',
    ipAddress: '198.51.100.21',
    occurredAt: daysAgo(2),
    summary: 'Viewed Sarah Mitchell',
  },
  {
    id: 'aud-009',
    action: 'logout',
    resource: 'session',
    resourceId: 'sess-prev',
    resourceLabel: 'Web · Safari on iPhone',
    actorName: 'Owner',
    actorEmail: 'owner@acmedental.com',
    ipAddress: '203.0.113.4',
    occurredAt: daysAgo(3),
    summary: 'Owner signed out',
  },
  {
    id: 'aud-010',
    action: 'update',
    resource: 'tenant',
    resourceId: 'demo-dental-tenant',
    resourceLabel: 'Branding',
    actorName: 'Owner',
    actorEmail: 'owner@acmedental.com',
    ipAddress: '203.0.113.4',
    occurredAt: daysAgo(5),
    summary: 'Updated tenant branding (primary color)',
  },
]

const sessions: Session[] = [
  {
    id: 'sess-current',
    memberName: 'Owner',
    memberEmail: 'owner@acmedental.com',
    ipAddress: '203.0.113.4',
    userAgent: 'Chrome 132 on macOS',
    location: 'San Francisco, US',
    createdAt: minutesAgo(2),
    lastActiveAt: minutesAgo(0),
    current: true,
  },
  {
    id: 'sess-002',
    memberName: 'Maya Patel',
    memberEmail: 'maya@acmedental.com',
    ipAddress: '203.0.113.4',
    userAgent: 'Chrome 131 on Windows',
    location: 'San Francisco, US',
    createdAt: hoursAgo(2),
    lastActiveAt: minutesAgo(8),
    current: false,
  },
  {
    id: 'sess-003',
    memberName: 'Dr. Ahmed',
    memberEmail: 'ahmed@acmedental.com',
    ipAddress: '198.51.100.21',
    userAgent: 'Mobile Safari 17 on iOS',
    location: 'Karachi, PK',
    createdAt: hoursAgo(8),
    lastActiveAt: hoursAgo(1),
    current: false,
  },
  {
    id: 'sess-004',
    memberName: 'Tomás Hidalgo',
    memberEmail: 'tomas@acmedental.com',
    ipAddress: '192.0.2.55',
    userAgent: 'Firefox 130 on Windows',
    location: 'San Francisco, US',
    createdAt: hoursAgo(4),
    lastActiveAt: hoursAgo(2),
    current: false,
  },
]

function applyFilters(items: AuditEntry[], f: AuditFilters): AuditEntry[] {
  const q = f.search?.trim().toLowerCase()
  return items.filter((e) => {
    if (f.action && e.action !== f.action) return false
    if (f.resource && e.resource !== f.resource) return false
    if (q) {
      const hay = `${e.summary} ${e.actorName} ${e.resourceLabel ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

export const auditMocks = {
  list(filters: AuditFilters): AuditResponse {
    const items = applyFilters(entries, filters).sort((a, b) =>
      b.occurredAt.localeCompare(a.occurredAt),
    )
    return { items, total: items.length }
  },
  sessions(): SessionsResponse {
    return { items: sessions }
  },
}

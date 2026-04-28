/**
 * Adapter layer between `crm-core` BE DTOs and FE domain types.
 *
 * BE conventions kept out of components:
 * - UPPERCASE enums (`'ACTIVE'`, `'NOTE'`, `'LOW'`)
 * - Pagination shape `{data, total, page, limit}`
 * - Flat address fields
 * - `ownedByUserId`, `createdByUserId` UUIDs (FE keeps `ownerUserId`, `createdByUserId`)
 *
 * Each adapter is bidirectional: `fromDto`/`toDto`. Round-tripping
 * preserves FE-only fields by reattaching them from the existing local
 * cache (handled in the api layer, not here).
 */

import type {
  Activity,
  ActivityDirection,
  ActivityInput,
  ActivityKind,
  Branch,
  CallOutcome,
  Contact,
  ContactInput,
  ContactList,
  ContactSource,
  LeadActivityType,
  Lead,
  LeadInput,
  LeadPriority,
  LeadStatus as LeadStatusType,
  Paginated,
  Tag,
  TaskStatus,
  TenantRole,
  Staff,
  ContactStatus,
} from '@/types/crm'

/* ─────────────────── pagination ─────────────────── */

type BeListEnvelope<T> = {
  data: T[]
  total: number
  page?: number
  limit?: number
}

export function adaptListResponse<DtoT, OutT>(
  envelope: BeListEnvelope<DtoT>,
  mapItem: (dto: DtoT) => OutT,
): Paginated<OutT> {
  return {
    items: envelope.data.map(mapItem),
    total: envelope.total,
    page: envelope.page ?? 1,
    limit: envelope.limit ?? envelope.data.length,
  }
}

/* ─────────────────── enums ─────────────────── */

const CONTACT_STATUS_TO_BE: Record<ContactStatus, string> = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  archived: 'ARCHIVED',
}

const CONTACT_STATUS_FROM_BE: Record<string, ContactStatus> = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
}

const LEAD_PRIORITY_TO_BE: Record<LeadPriority, string> = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
}

const LEAD_PRIORITY_FROM_BE: Record<string, LeadPriority> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
}

const ACTIVITY_TYPE_TO_BE: Record<LeadActivityType, string> = {
  note: 'NOTE',
  call: 'CALL',
  email: 'EMAIL',
  sms: 'SMS',
  whatsapp: 'WHATSAPP',
  meeting: 'MEETING',
  task: 'TASK',
}

const ACTIVITY_TYPE_FROM_BE: Record<string, LeadActivityType> = {
  NOTE: 'note',
  CALL: 'call',
  EMAIL: 'email',
  SMS: 'sms',
  WHATSAPP: 'whatsapp',
  MEETING: 'meeting',
  TASK: 'task',
}

const FE_ONLY_ACTIVITY_KINDS = new Set<ActivityKind>([
  'appointment',
  'invoice',
  'system',
])

export function isFeOnlyActivityKind(k: ActivityKind): boolean {
  return FE_ONLY_ACTIVITY_KINDS.has(k)
}

const ACTIVITY_DIRECTION_TO_BE: Record<ActivityDirection, string> = {
  inbound: 'INBOUND',
  outbound: 'OUTBOUND',
}

const ACTIVITY_DIRECTION_FROM_BE: Record<string, ActivityDirection> = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
}

const CALL_OUTCOME_TO_BE: Record<CallOutcome, string> = {
  spoke: 'SPOKE',
  no_answer: 'NO_ANSWER',
  voicemail: 'VOICEMAIL',
  busy: 'BUSY',
  wrong_number: 'WRONG_NUMBER',
  call_back_requested: 'CALL_BACK_REQUESTED',
}

const CALL_OUTCOME_FROM_BE: Record<string, CallOutcome> = {
  SPOKE: 'spoke',
  NO_ANSWER: 'no_answer',
  VOICEMAIL: 'voicemail',
  BUSY: 'busy',
  WRONG_NUMBER: 'wrong_number',
  CALL_BACK_REQUESTED: 'call_back_requested',
}

const TASK_STATUS_TO_BE: Record<TaskStatus, string> = {
  open: 'OPEN',
  in_progress: 'IN_PROGRESS',
  done: 'DONE',
  cancelled: 'CANCELLED',
}

const TASK_STATUS_FROM_BE: Record<string, TaskStatus> = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  CANCELLED: 'cancelled',
}

/* ─────────────────── primitive helpers ─────────────────── */

function toIso(value: string | Date | null | undefined): string {
  if (!value) return new Date().toISOString()
  return value instanceof Date ? value.toISOString() : value
}

function toIsoOrNull(value: string | Date | null | undefined): string | null {
  if (value == null) return null
  return value instanceof Date ? value.toISOString() : value
}

/* ─────────────────── branches ─────────────────── */

type BranchDto = {
  id: string
  tenantId: string
  name: string
  slug: string
  isActive: boolean
  isHeadquarters: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

export function branchFromDto(dto: BranchDto): Branch {
  return {
    id: dto.id,
    tenantId: dto.tenantId,
    name: dto.name,
    slug: dto.slug,
    isActive: dto.isActive,
    isHeadquarters: dto.isHeadquarters,
    createdAt: toIso(dto.createdAt),
    updatedAt: toIso(dto.updatedAt),
  }
}

/* ─────────────────── tags ─────────────────── */

type TagDto = {
  id: string
  branchId: string
  name: string
  color: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

export function tagFromDto(dto: TagDto): Tag {
  return {
    id: dto.id,
    branchId: dto.branchId,
    name: dto.name,
    color: dto.color,
    createdAt: toIso(dto.createdAt),
    updatedAt: toIso(dto.updatedAt),
  }
}

/* ─────────────────── contact sources ─────────────────── */

type ContactSourceDto = {
  id: string
  branchId: string
  name: string
  isSystem: boolean
  isActive: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

export function contactSourceFromDto(dto: ContactSourceDto): ContactSource {
  return {
    id: dto.id,
    branchId: dto.branchId,
    name: dto.name,
    isSystem: dto.isSystem,
    isActive: dto.isActive,
    createdAt: toIso(dto.createdAt),
    updatedAt: toIso(dto.updatedAt),
  }
}

/* ─────────────────── contact lists ─────────────────── */

type ContactListDto = {
  id: string
  branchId: string
  name: string
  description: string | null
  listType: string
  isActive: boolean
  memberCount: number
  createdAt: string | Date
  updatedAt: string | Date
}

export function contactListFromDto(dto: ContactListDto): ContactList {
  return {
    id: dto.id,
    branchId: dto.branchId,
    name: dto.name,
    description: dto.description,
    listType: 'static',
    isActive: dto.isActive,
    memberCount: dto.memberCount,
    createdAt: toIso(dto.createdAt),
    updatedAt: toIso(dto.updatedAt),
  }
}

/* ─────────────────── contacts ─────────────────── */

type ContactDto = {
  id: string
  branchId: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  company: string | null
  jobTitle: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  postalCode: string | null
  sourceId: string | null
  originLeadId: string | null
  status: string
  ownedByUserId: string | null
  notes: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

/** FE-only fields the BE doesn't know about — preserved client-side only. */
export type ContactFeOnlyFields = {
  vertical?: string | null
  ltv?: number
  currency?: string
  birthday?: string | null
  preferredLocale?: string | null
  lastActivityAt?: string | null
  tagIds?: string[]
}

export function contactFromDto(
  dto: ContactDto,
  feOnly?: ContactFeOnlyFields,
): Contact {
  return {
    id: dto.id,
    branchId: dto.branchId,
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    phone: dto.phone,
    company: dto.company,
    jobTitle: dto.jobTitle,
    address:
      dto.address || dto.city || dto.state || dto.country || dto.postalCode
        ? {
            line1: dto.address,
            city: dto.city,
            state: dto.state,
            country: dto.country,
            postalCode: dto.postalCode,
          }
        : null,
    sourceId: dto.sourceId,
    originLeadId: dto.originLeadId,
    status: CONTACT_STATUS_FROM_BE[dto.status] ?? 'active',
    ownerUserId: dto.ownedByUserId,
    notes: dto.notes,
    vertical: feOnly?.vertical ?? null,
    ltv: feOnly?.ltv ?? 0,
    currency: feOnly?.currency ?? 'USD',
    birthday: feOnly?.birthday ?? null,
    preferredLocale: feOnly?.preferredLocale ?? null,
    lastActivityAt: feOnly?.lastActivityAt ?? null,
    tagIds: feOnly?.tagIds ?? [],
    createdAt: toIso(dto.createdAt),
    updatedAt: toIso(dto.updatedAt),
  }
}

export function contactToCreateDto(input: ContactInput) {
  return {
    branchId: input.branchId,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email || undefined,
    phone: input.phone,
    company: input.company,
    jobTitle: input.jobTitle,
    address: input.address?.line1 ?? undefined,
    city: input.address?.city ?? undefined,
    state: input.address?.state ?? undefined,
    country: input.address?.country ?? undefined,
    postalCode: input.address?.postalCode ?? undefined,
    sourceId: input.sourceId,
    status: input.status ? CONTACT_STATUS_TO_BE[input.status] : 'ACTIVE',
    ownedByUserId: input.ownerUserId,
    notes: input.notes,
  }
}

/* ─────────────────── leads ─────────────────── */

type LeadDto = {
  id: string
  branchId: string
  contactId: string | null
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  company: string | null
  sourceId: string | null
  statusId: string | null
  priority: string
  estimatedValue: number | null
  ownedByUserId: string | null
  notes: string | null
  convertedAt: string | Date | null
  convertedByUserId: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

export function leadFromDto(dto: LeadDto): Lead {
  return {
    id: dto.id,
    branchId: dto.branchId,
    contactId: dto.contactId,
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    phone: dto.phone,
    company: dto.company,
    sourceId: dto.sourceId,
    statusId: dto.statusId,
    priority: LEAD_PRIORITY_FROM_BE[dto.priority] ?? 'medium',
    estimatedValue: dto.estimatedValue,
    ownerUserId: dto.ownedByUserId,
    notes: dto.notes,
    convertedAt: toIsoOrNull(dto.convertedAt),
    convertedByUserId: dto.convertedByUserId,
    createdAt: toIso(dto.createdAt),
    updatedAt: toIso(dto.updatedAt),
  }
}

export function leadToCreateDto(input: LeadInput) {
  return {
    branchId: input.branchId,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email || undefined,
    phone: input.phone,
    company: input.company,
    sourceId: input.sourceId,
    statusId: input.statusId,
    priority: input.priority ? LEAD_PRIORITY_TO_BE[input.priority] : 'MEDIUM',
    estimatedValue: input.estimatedValue,
    ownedByUserId: input.ownerUserId,
    notes: input.notes,
  }
}

/* ─────────────────── lead statuses ─────────────────── */

type LeadStatusDto = {
  id: string
  branchId: string
  name: string
  color: string | null
  displayOrder: number
  isSystem: boolean
  isActive: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

export function leadStatusFromDto(dto: LeadStatusDto): LeadStatusType {
  return {
    id: dto.id,
    branchId: dto.branchId,
    name: dto.name,
    color: dto.color,
    displayOrder: dto.displayOrder,
    isSystem: dto.isSystem,
    isActive: dto.isActive,
    createdAt: toIso(dto.createdAt),
    updatedAt: toIso(dto.updatedAt),
  }
}

/* ─────────────────── activities (lead-activities) ─────────────────── */

type LeadActivityDto = {
  id: string
  leadId: string
  type: string
  direction: string | null
  subject: string | null
  body: string | null
  outcome: string | null
  durationSeconds: number | null
  recordingUrl: string | null
  transcriptUrl: string | null
  scheduledAt: string | Date | null
  completedAt: string | Date | null
  dueAt: string | Date | null
  taskStatus: string | null
  createdByUserId: string
  assignedToUserId: string | null
  metadata: unknown
  createdAt: string | Date
  updatedAt: string | Date
}

export function activityFromLeadDto(dto: LeadActivityDto): Activity {
  return {
    id: dto.id,
    entity: 'lead',
    entityId: dto.leadId,
    kind: ACTIVITY_TYPE_FROM_BE[dto.type] ?? 'note',
    direction: dto.direction
      ? (ACTIVITY_DIRECTION_FROM_BE[dto.direction] ?? null)
      : null,
    subject: dto.subject,
    body: dto.body,
    outcome: dto.outcome ? (CALL_OUTCOME_FROM_BE[dto.outcome] ?? null) : null,
    durationSeconds: dto.durationSeconds,
    recordingUrl: dto.recordingUrl,
    transcriptUrl: dto.transcriptUrl,
    scheduledAt: toIsoOrNull(dto.scheduledAt),
    completedAt: toIsoOrNull(dto.completedAt),
    dueAt: toIsoOrNull(dto.dueAt),
    taskStatus: dto.taskStatus
      ? (TASK_STATUS_FROM_BE[dto.taskStatus] ?? null)
      : null,
    createdByUserId: dto.createdByUserId,
    assignedToUserId: dto.assignedToUserId,
    metadata: (dto.metadata as Record<string, unknown> | null) ?? null,
    createdAt: toIso(dto.createdAt),
    updatedAt: toIso(dto.updatedAt),
  }
}

export function activityToCreateDto(input: ActivityInput) {
  if (isFeOnlyActivityKind(input.kind)) {
    throw new Error(
      `Activity kind "${input.kind}" is FE-only and cannot be sent to BE.`,
    )
  }
  return {
    type: ACTIVITY_TYPE_TO_BE[input.kind as LeadActivityType],
    direction: input.direction
      ? ACTIVITY_DIRECTION_TO_BE[input.direction]
      : undefined,
    subject: input.subject,
    body: input.body,
    outcome: input.outcome ? CALL_OUTCOME_TO_BE[input.outcome] : undefined,
    durationSeconds: input.durationSeconds,
    recordingUrl: input.recordingUrl,
    transcriptUrl: input.transcriptUrl,
    scheduledAt: input.scheduledAt,
    completedAt: input.completedAt,
    dueAt: input.dueAt,
    taskStatus: input.taskStatus
      ? TASK_STATUS_TO_BE[input.taskStatus]
      : undefined,
    assignedToUserId: input.assignedToUserId,
    metadata: input.metadata,
  }
}

/* ─────────────────── roles ─────────────────── */

type RoleDto = {
  id: string
  branchId: string
  name: string
  description: string | null
  isSystem: boolean
  permissions: { slug: string }[]
  createdAt: string | Date
  updatedAt: string | Date
}

export function roleFromDto(dto: RoleDto): TenantRole {
  return {
    id: dto.id,
    branchId: dto.branchId,
    name: dto.name,
    description: dto.description,
    isSystem: dto.isSystem,
    permissionSlugs: dto.permissions.map((p) => p.slug),
    createdAt: toIso(dto.createdAt),
    updatedAt: toIso(dto.updatedAt),
  }
}

/* ─────────────────── staff ─────────────────── */

type StaffDto = {
  userId: string
  tenantId: string
  email: string
  firstName: string | null
  lastName: string | null
  status: string
  roles: { id: string }[]
  branches: { id: string }[]
  roundRobinAvailable: boolean
  invitedAt: string | Date | null
  joinedAt: string | Date | null
}

const STAFF_STATUS_FROM_BE: Record<string, Staff['status']> = {
  ACTIVE: 'active',
  INVITED: 'invited',
  SUSPENDED: 'suspended',
  REMOVED: 'removed',
}

export function staffFromDto(dto: StaffDto): Staff {
  return {
    userId: dto.userId,
    tenantId: dto.tenantId,
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    status: STAFF_STATUS_FROM_BE[dto.status] ?? 'active',
    roleIds: dto.roles.map((r) => r.id),
    branchIds: dto.branches.map((b) => b.id),
    roundRobinAvailable: dto.roundRobinAvailable,
    invitedAt: toIsoOrNull(dto.invitedAt),
    joinedAt: toIsoOrNull(dto.joinedAt),
  }
}

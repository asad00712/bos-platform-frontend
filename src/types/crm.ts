/**
 * CRM domain types — aligned with `crm-core` (port 3002) DTOs.
 *
 * Naming policy: FE uses lowercase enum unions and camelCase fields. The
 * adapter layer (`src/api/adapters/crm.ts`) maps to/from BE's UPPERCASE
 * enums and `{data, total, page, limit}` pagination shape. Components
 * never import BE shapes directly.
 *
 * FE-only fields (not present on BE) live alongside BE-backed fields and
 * are documented inline. They survive round-trips because the adapter
 * preserves them on the local cache only.
 */

/* ─────────────────── shared primitives ─────────────────── */

export type Paginated<T> = {
  items: T[]
  total: number
  page: number
  limit: number
}

/* ─────────────────── branches ─────────────────── */

export type Branch = {
  id: string
  tenantId: string
  name: string
  slug: string
  isActive: boolean
  isHeadquarters: boolean
  createdAt: string
  updatedAt: string
}

/* ─────────────────── tags ─────────────────── */

export type Tag = {
  id: string
  branchId: string
  name: string
  color: string | null
  createdAt: string
  updatedAt: string
}

/* ─────────────────── contact sources ─────────────────── */

export type ContactSource = {
  id: string
  branchId: string
  name: string
  isSystem: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/* ─────────────────── contact lists (segments) ─────────────────── */

export type ContactListType = 'static'

export type ContactList = {
  id: string
  branchId: string
  name: string
  description: string | null
  listType: ContactListType
  isActive: boolean
  memberCount: number
  /** FE-only — display tint when rendered as a chip in the segments grid. */
  color?: string
  createdAt: string
  updatedAt: string
}

/* ─────────────────── contacts ─────────────────── */

export type ContactStatus = 'active' | 'inactive' | 'archived'

export type ContactAddress = {
  /** FE-only nested shape; adapter flattens to `address/city/state/country/postalCode`. */
  line1: string | null
  city: string | null
  state: string | null
  country: string | null
  postalCode: string | null
}

export type Contact = {
  id: string
  branchId: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  company: string | null
  jobTitle: string | null
  address: ContactAddress | null
  sourceId: string | null
  /** Soft ref — which lead created this contact (BE field). */
  originLeadId: string | null
  status: ContactStatus
  ownerUserId: string | null
  notes: string | null
  /** FE-only — per-contact sub-classifier (Patient/Student/Client/etc.). */
  vertical: string | null
  /** FE-only — denormalized lifetime value display. */
  ltv: number
  /** FE-only — currency for ltv display. */
  currency: string
  /** FE-only — birthday on detail page. */
  birthday: string | null
  /** FE-only — preferred locale on detail page. */
  preferredLocale: string | null
  /** FE-only — derived from activities (latest occurredAt). */
  lastActivityAt: string | null
  tagIds: string[]
  createdAt: string
  updatedAt: string
}

export type ContactInput = {
  branchId: string
  firstName: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  jobTitle?: string
  address?: ContactAddress
  sourceId?: string
  status?: ContactStatus
  ownerUserId?: string
  notes?: string
  /* FE-only inputs — preserved locally, ignored by BE until modules ship */
  vertical?: string
  birthday?: string
  preferredLocale?: string
  tagIds?: string[]
}

export type ContactFilters = {
  search?: string
  status?: ContactStatus
  sourceId?: string
  tagId?: string
  ownerUserId?: string
  page?: number
  limit?: number
}

/* ─────────────────── leads ─────────────────── */

export type LeadPriority = 'low' | 'medium' | 'high'

export type LeadStatus = {
  id: string
  branchId: string
  name: string
  color: string | null
  displayOrder: number
  isSystem: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type Lead = {
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
  priority: LeadPriority
  estimatedValue: number | null
  ownerUserId: string | null
  notes: string | null
  convertedAt: string | null
  convertedByUserId: string | null
  /** Per-tenant custom-field values, keyed by field.key. */
  customFieldValues?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type LeadInput = {
  branchId: string
  firstName: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  sourceId?: string
  statusId?: string
  priority?: LeadPriority
  estimatedValue?: number
  ownerUserId?: string
  notes?: string
}

export type LeadFilters = {
  search?: string
  statusId?: string
  priority?: LeadPriority
  ownerUserId?: string
  page?: number
  limit?: number
}

/* ─────────────────── lead activities ─────────────────── */

/** BE-backed kinds. */
export type LeadActivityType =
  | 'note'
  | 'call'
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'meeting'
  | 'task'

/** FE-only kinds rendered in the same timeline. */
export type FeOnlyActivityKind = 'appointment' | 'invoice' | 'system'

export type ActivityKind = LeadActivityType | FeOnlyActivityKind

export type ActivityDirection = 'inbound' | 'outbound'

export type CallOutcome =
  | 'spoke'
  | 'no_answer'
  | 'voicemail'
  | 'busy'
  | 'wrong_number'
  | 'call_back_requested'

export type TaskStatus = 'open' | 'in_progress' | 'done' | 'cancelled'

export type ActivityEntity = 'lead' | 'contact'

/**
 * Unified activity envelope. BE-backed activities round-trip through the
 * adapter; FE-only kinds are persisted locally only.
 */
export type Activity = {
  id: string
  /** Lead or contact this activity belongs to. */
  entity: ActivityEntity
  entityId: string
  /** BE-backed `type` for `entity === 'lead'`. For FE-only kinds use this too. */
  kind: ActivityKind
  direction: ActivityDirection | null
  subject: string | null
  body: string | null
  outcome: CallOutcome | null
  durationSeconds: number | null
  recordingUrl: string | null
  transcriptUrl: string | null
  scheduledAt: string | null
  completedAt: string | null
  dueAt: string | null
  taskStatus: TaskStatus | null
  createdByUserId: string
  assignedToUserId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export type ActivityInput = {
  kind: ActivityKind
  direction?: ActivityDirection
  subject?: string
  body?: string
  outcome?: CallOutcome
  durationSeconds?: number
  recordingUrl?: string
  transcriptUrl?: string
  scheduledAt?: string
  completedAt?: string
  dueAt?: string
  taskStatus?: TaskStatus
  assignedToUserId?: string
  metadata?: Record<string, unknown>
}

/* ─────────────────── custom fields ─────────────────── */

export type CustomFieldEntity = 'contact' | 'lead'

export type CustomFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'multi_select'
  | 'url'
  | 'email'
  | 'phone'

export type CustomFieldOption = {
  value: string
  label: string
}

export type CustomField = {
  id: string
  branchId: string
  entity: CustomFieldEntity
  key: string
  label: string
  type: CustomFieldType
  required: boolean
  isActive: boolean
  displayOrder: number
  options: CustomFieldOption[]
  helpText: string | null
  createdAt: string
  updatedAt: string
}

export type CustomFieldValue = {
  fieldId: string
  value: string | number | boolean | string[] | null
}

/* ─────────────────── roles + permissions ─────────────────── */

/**
 * BE permission slug — `tenant:contacts:view_branch`, etc. Distinct from
 * the FE `Permission` union in `types/tenant.ts` which is a feature-flag
 * style enum used for legacy gating.
 */
export type TenantPermissionSlug = string

export type TenantPermission = {
  slug: TenantPermissionSlug
  module: string
  action: string
  description: string | null
}

export type TenantRole = {
  id: string
  branchId: string
  name: string
  description: string | null
  isSystem: boolean
  permissionSlugs: TenantPermissionSlug[]
  createdAt: string
  updatedAt: string
}

/* ─────────────────── staff ─────────────────── */

export type StaffStatus = 'active' | 'invited' | 'suspended' | 'removed'

export type Staff = {
  userId: string
  tenantId: string
  email: string
  firstName: string | null
  lastName: string | null
  status: StaffStatus
  roleIds: string[]
  branchIds: string[]
  roundRobinAvailable: boolean
  invitedAt: string | null
  joinedAt: string | null
}

export type StaffInvite = {
  id: string
  email: string
  roleId: string
  branchId: string
  invitedAt: string
  expiresAt: string
  acceptedAt: string | null
  invitedByUserId: string
}

/* ─────────────────── lead assignment + webhooks ─────────────────── */

export type LeadAssignmentConfig = {
  branchId: string
  isActive: boolean
  eligibleRoleIds: string[]
  updatedAt: string
}

export type LeadWebhook = {
  id: string
  branchId: string
  name: string
  token: string
  isActive: boolean
  /** Public ingestion URL — built from gateway base + `/webhooks/leads/{token}`. */
  publicUrl: string
  lastDeliveryAt: string | null
  createdAt: string
  updatedAt: string
}

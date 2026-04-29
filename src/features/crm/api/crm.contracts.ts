import { z } from 'zod'

/**
 * Contact-feature contracts. Aligned with `crm-core` BE DTOs (see
 * `src/types/crm.ts` + `src/api/adapters/crm.ts`) but kept as the
 * feature-local zod source of truth for forms + parsing.
 *
 * FE-only fields (no BE column) are flagged inline. They survive the
 * round-trip via mocks/local cache and will become real once the
 * corresponding BE module ships.
 */

/* -------------------- shared -------------------- */

export const contactStatusSchema = z.enum(['active', 'inactive', 'archived'])
export type ContactStatus = z.infer<typeof contactStatusSchema>

/* -------------------- contact -------------------- */

export const contactAddressSchema = z.object({
  line1: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().nullable(),
  postalCode: z.string().nullable(),
})
export type ContactAddress = z.infer<typeof contactAddressSchema>

export const contactSchema = z.object({
  id: z.string(),
  branchId: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  company: z.string().nullable(),
  jobTitle: z.string().nullable(),
  address: contactAddressSchema.nullable(),
  sourceId: z.string().nullable(),
  originLeadId: z.string().nullable(),
  status: contactStatusSchema,
  ownerUserId: z.string().nullable(),
  notes: z.string().nullable(),
  /** Per-tenant custom-field values, keyed by field.key. */
  customFieldValues: z.record(z.string(), z.unknown()).optional(),
  /* FE-only --------------------------------------- */
  /** Per-vertical sub-classification (Patient/Student/Client/etc). */
  vertical: z.string().nullable(),
  /** Lifetime value in tenant currency. */
  ltv: z.number().default(0),
  currency: z.string().default('USD'),
  birthday: z.string().nullable(),
  preferredLocale: z.string().nullable(),
  /** Derived from latest activity. */
  lastActivityAt: z.string().nullable(),
  /** Tag IDs — the tag library is loaded separately. */
  tagIds: z.array(z.string()).default([]),
  /* ------------------------------------------------ */
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Contact = z.infer<typeof contactSchema>

/* -------------------- list endpoint -------------------- */

export const listFiltersSchema = z.object({
  search: z.string().optional(),
  status: contactStatusSchema.optional(),
  sourceId: z.string().optional(),
  tagId: z.string().optional(),
  ownerUserId: z.string().optional(),
})
export type ListFilters = z.infer<typeof listFiltersSchema>

export const contactsListResponseSchema = z.object({
  items: z.array(contactSchema),
  total: z.number(),
})
export type ContactsListResponse = z.infer<typeof contactsListResponseSchema>

/* -------------------- create / update payloads -------------------- */

export const contactInputSchema = z.object({
  branchId: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  address: contactAddressSchema.partial().optional(),
  sourceId: z.string().optional(),
  status: contactStatusSchema.default('active'),
  ownerUserId: z.string().optional(),
  notes: z.string().optional(),
  /* FE-only inputs */
  vertical: z.string().optional(),
  birthday: z.string().optional(),
  preferredLocale: z.string().optional(),
  tagIds: z.array(z.string()).default([]),
  customFieldValues: z.record(z.string(), z.unknown()).optional(),
})
export type ContactInput = z.infer<typeof contactInputSchema>

/* -------------------- segments (lightweight view over BE ContactList) ----------- */

export const segmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  count: z.number(),
  color: z.string().optional(),
})
export type Segment = z.infer<typeof segmentSchema>

export const segmentsResponseSchema = z.object({
  items: z.array(segmentSchema),
})
export type SegmentsResponse = z.infer<typeof segmentsResponseSchema>

/* -------------------- activity timeline (FE-internal, Phase E rebuilds) -------- */

export const contactActivitySchema = z.object({
  id: z.string(),
  kind: z.enum(['note', 'email', 'sms', 'appointment', 'invoice', 'system']),
  title: z.string(),
  body: z.string().nullable(),
  occurredAt: z.string(),
  authorName: z.string().nullable(),
})
export type ContactActivity = z.infer<typeof contactActivitySchema>

export const contactActivityListSchema = z.object({
  items: z.array(contactActivitySchema),
})
export type ContactActivityList = z.infer<typeof contactActivityListSchema>

/* -------------------- lookup mocks (tags + sources + owners + branches) -------- */

export const tagLookupSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().nullable(),
})
export type TagLookup = z.infer<typeof tagLookupSchema>

export const sourceLookupSchema = z.object({
  id: z.string(),
  name: z.string(),
  isSystem: z.boolean(),
})
export type SourceLookup = z.infer<typeof sourceLookupSchema>

export const ownerLookupSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string().nullable(),
})
export type OwnerLookup = z.infer<typeof ownerLookupSchema>

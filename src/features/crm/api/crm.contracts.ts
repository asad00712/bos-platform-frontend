import { z } from 'zod'

/* -------------------- shared -------------------- */

export const contactStatusSchema = z.enum([
  'lead',
  'active',
  'inactive',
  'archived',
])
export type ContactStatus = z.infer<typeof contactStatusSchema>

export const contactSourceSchema = z.enum([
  'manual',
  'website',
  'import',
  'referral',
  'integration',
])
export type ContactSource = z.infer<typeof contactSourceSchema>

/* -------------------- contact -------------------- */

export const contactSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  status: contactStatusSchema,
  source: contactSourceSchema,
  /** Per-vertical sub-classification (Patient/Student/Client/etc). */
  vertical: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  /** Lifetime value in tenant currency. */
  ltv: z.number().default(0),
  currency: z.string().default('USD'),
  ownerName: z.string().nullable(),
  lastActivityAt: z.string().nullable(),
  createdAt: z.string(),
})
export type Contact = z.infer<typeof contactSchema>

export const contactDetailSchema = contactSchema.extend({
  notes: z.string().nullable(),
  address: z
    .object({
      line1: z.string().nullable(),
      city: z.string().nullable(),
      country: z.string().nullable(),
    })
    .nullable(),
  birthday: z.string().nullable(),
  preferredLocale: z.string().nullable(),
})
export type ContactDetail = z.infer<typeof contactDetailSchema>

/* -------------------- list endpoint -------------------- */

export const listFiltersSchema = z.object({
  search: z.string().optional(),
  status: contactStatusSchema.optional(),
  source: contactSourceSchema.optional(),
  tag: z.string().optional(),
})
export type ListFilters = z.infer<typeof listFiltersSchema>

export const contactsListResponseSchema = z.object({
  items: z.array(contactSchema),
  total: z.number(),
})
export type ContactsListResponse = z.infer<typeof contactsListResponseSchema>

/* -------------------- create / update payloads -------------------- */

export const contactInputSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().optional(),
  status: contactStatusSchema.default('lead'),
  source: contactSourceSchema.default('manual'),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
})
export type ContactInput = z.infer<typeof contactInputSchema>

/* -------------------- segments -------------------- */

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

/* -------------------- activity timeline (feature-internal) -------------------- */

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

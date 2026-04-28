import { z } from 'zod'

/* -------------------- enums -------------------- */

export const documentKindSchema = z.enum([
  'contract',
  'consent',
  'template',
  'invoice',
  'medical',
  'general',
])
export type DocumentKind = z.infer<typeof documentKindSchema>

export const documentStatusSchema = z.enum([
  'draft',
  'pending_review',
  'active',
  'archived',
])
export type DocumentStatus = z.infer<typeof documentStatusSchema>

export const signatureStatusSchema = z.enum([
  'pending',
  'sent',
  'signed',
  'declined',
  'expired',
])
export type SignatureStatus = z.infer<typeof signatureStatusSchema>

/* -------------------- core -------------------- */

export const documentVersionSchema = z.object({
  id: z.string(),
  versionNumber: z.number(),
  createdAt: z.string(),
  createdByName: z.string().nullable(),
  notes: z.string().nullable(),
  /** Mock URL; in real life this is an S3-signed URL. */
  fileUrl: z.string().nullable(),
  size: z.number(),
  mimeType: z.string(),
})
export type DocumentVersion = z.infer<typeof documentVersionSchema>

export const signatureRequestSchema = z.object({
  id: z.string(),
  signerName: z.string(),
  signerEmail: z.string(),
  status: signatureStatusSchema,
  sentAt: z.string().nullable(),
  signedAt: z.string().nullable(),
})
export type SignatureRequest = z.infer<typeof signatureRequestSchema>

export const documentSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: documentKindSchema,
  status: documentStatusSchema,
  ownerName: z.string().nullable(),
  contactId: z.string().nullable(),
  contactName: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  /** Latest version's mime + size for the list view. */
  mimeType: z.string(),
  size: z.number(),
  versionCount: z.number(),
  signatureCount: z.number(),
  pendingSignatures: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Document = z.infer<typeof documentSchema>

export const documentDetailSchema = documentSchema.extend({
  notes: z.string().nullable(),
  versions: z.array(documentVersionSchema),
  signatures: z.array(signatureRequestSchema),
})
export type DocumentDetail = z.infer<typeof documentDetailSchema>

/* -------------------- list -------------------- */

export const documentListFiltersSchema = z.object({
  search: z.string().optional(),
  kind: documentKindSchema.optional(),
  status: documentStatusSchema.optional(),
  tag: z.string().optional(),
})
export type DocumentListFilters = z.infer<typeof documentListFiltersSchema>

export const documentsListResponseSchema = z.object({
  items: z.array(documentSchema),
  total: z.number(),
})
export type DocumentsListResponse = z.infer<typeof documentsListResponseSchema>

/* -------------------- inputs -------------------- */

export const documentInputSchema = z.object({
  name: z.string().min(1),
  kind: documentKindSchema,
  status: documentStatusSchema,
  contactId: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  /** Mock-only; real upload flow returns a fileUrl from server. */
  fileName: z.string().optional(),
  size: z.number().optional(),
  mimeType: z.string().optional(),
})
export type DocumentInput = z.infer<typeof documentInputSchema>

export const signatureRequestInputSchema = z.object({
  signerName: z.string().min(1),
  signerEmail: z.string().email(),
})
export type SignatureRequestInput = z.infer<typeof signatureRequestInputSchema>

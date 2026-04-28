import { z } from 'zod'

/* -------------------- enums -------------------- */

export const auditActionSchema = z.enum([
  'create',
  'update',
  'delete',
  'view',
  'login',
  'logout',
  'permission_change',
  'export',
  'invite',
])
export type AuditAction = z.infer<typeof auditActionSchema>

export const auditResourceSchema = z.enum([
  'contact',
  'appointment',
  'invoice',
  'payment',
  'employee',
  'document',
  'message',
  'role',
  'tenant',
  'session',
  'system',
])
export type AuditResource = z.infer<typeof auditResourceSchema>

/* -------------------- entries -------------------- */

export const auditEntrySchema = z.object({
  id: z.string(),
  action: auditActionSchema,
  resource: auditResourceSchema,
  resourceId: z.string().nullable(),
  resourceLabel: z.string().nullable(),
  actorName: z.string(),
  actorEmail: z.string().nullable(),
  ipAddress: z.string().nullable(),
  occurredAt: z.string(),
  summary: z.string(),
})
export type AuditEntry = z.infer<typeof auditEntrySchema>

export const auditFiltersSchema = z.object({
  search: z.string().optional(),
  action: auditActionSchema.optional(),
  resource: auditResourceSchema.optional(),
})
export type AuditFilters = z.infer<typeof auditFiltersSchema>

export const auditResponseSchema = z.object({
  items: z.array(auditEntrySchema),
  total: z.number(),
})
export type AuditResponse = z.infer<typeof auditResponseSchema>

/* -------------------- sessions -------------------- */

export const sessionSchema = z.object({
  id: z.string(),
  memberName: z.string(),
  memberEmail: z.string(),
  ipAddress: z.string(),
  userAgent: z.string(),
  location: z.string().nullable(),
  createdAt: z.string(),
  lastActiveAt: z.string(),
  current: z.boolean(),
})
export type Session = z.infer<typeof sessionSchema>

export const sessionsResponseSchema = z.object({
  items: z.array(sessionSchema),
})
export type SessionsResponse = z.infer<typeof sessionsResponseSchema>

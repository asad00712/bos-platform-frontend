import { z } from 'zod'

/* -------------------- enums -------------------- */

export const channelSchema = z.enum(['email', 'sms', 'note', 'call'])
export type Channel = z.infer<typeof channelSchema>

export const messageDirectionSchema = z.enum(['inbound', 'outbound', 'internal'])
export type MessageDirection = z.infer<typeof messageDirectionSchema>

export const messageStatusSchema = z.enum([
  'queued',
  'sent',
  'delivered',
  'read',
  'failed',
])
export type MessageStatus = z.infer<typeof messageStatusSchema>

/* -------------------- core -------------------- */

export const messageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  channel: channelSchema,
  direction: messageDirectionSchema,
  status: messageStatusSchema,
  fromName: z.string(),
  toName: z.string().nullable(),
  subject: z.string().nullable(),
  body: z.string(),
  occurredAt: z.string(),
})
export type Message = z.infer<typeof messageSchema>

export const threadSchema = z.object({
  id: z.string(),
  channel: channelSchema,
  contactId: z.string().nullable(),
  contactName: z.string().nullable(),
  subject: z.string().nullable(),
  preview: z.string(),
  unread: z.boolean(),
  lastActivityAt: z.string(),
  messageCount: z.number(),
})
export type Thread = z.infer<typeof threadSchema>

export const threadDetailSchema = threadSchema.extend({
  messages: z.array(messageSchema),
})
export type ThreadDetail = z.infer<typeof threadDetailSchema>

/* -------------------- list -------------------- */

export const inboxFiltersSchema = z.object({
  search: z.string().optional(),
  channel: channelSchema.optional(),
  unreadOnly: z.boolean().optional(),
})
export type InboxFilters = z.infer<typeof inboxFiltersSchema>

export const threadsResponseSchema = z.object({
  items: z.array(threadSchema),
  total: z.number(),
})
export type ThreadsResponse = z.infer<typeof threadsResponseSchema>

/* -------------------- inputs -------------------- */

export const messageInputSchema = z.object({
  threadId: z.string().nullable().optional(),
  contactId: z.string().nullable().optional(),
  channel: channelSchema,
  subject: z.string().optional(),
  body: z.string().min(1),
})
export type MessageInput = z.infer<typeof messageInputSchema>

/* -------------------- templates -------------------- */

export const templateKindSchema = z.enum(['email', 'sms', 'system'])
export type TemplateKind = z.infer<typeof templateKindSchema>

export const messageTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: templateKindSchema,
  subject: z.string().nullable(),
  body: z.string(),
  /** Variables available in the body, for hint UI. */
  variables: z.array(z.string()).default([]),
})
export type MessageTemplate = z.infer<typeof messageTemplateSchema>

export const templatesResponseSchema = z.object({
  items: z.array(messageTemplateSchema),
})
export type TemplatesResponse = z.infer<typeof templatesResponseSchema>

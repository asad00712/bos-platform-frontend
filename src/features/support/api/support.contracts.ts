import { z } from 'zod'

export const ticketStatusSchema = z.enum([
  'open',
  'in_progress',
  'waiting',
  'resolved',
  'closed',
])
export type TicketStatus = z.infer<typeof ticketStatusSchema>

export const ticketPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent'])
export type TicketPriority = z.infer<typeof ticketPrioritySchema>

export const ticketReplyAuthorSchema = z.enum(['customer', 'agent', 'system'])
export type TicketReplyAuthor = z.infer<typeof ticketReplyAuthorSchema>

export const ticketReplySchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  authorType: ticketReplyAuthorSchema,
  authorName: z.string(),
  body: z.string(),
  occurredAt: z.string(),
})
export type TicketReply = z.infer<typeof ticketReplySchema>

export const ticketSchema = z.object({
  id: z.string(),
  number: z.string(),
  subject: z.string(),
  status: ticketStatusSchema,
  priority: ticketPrioritySchema,
  category: z.string(),
  requesterName: z.string(),
  requesterEmail: z.string(),
  assigneeName: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  replyCount: z.number(),
})
export type Ticket = z.infer<typeof ticketSchema>

export const ticketDetailSchema = ticketSchema.extend({
  body: z.string(),
  replies: z.array(ticketReplySchema),
})
export type TicketDetail = z.infer<typeof ticketDetailSchema>

export const ticketFiltersSchema = z.object({
  search: z.string().optional(),
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
})
export type TicketFilters = z.infer<typeof ticketFiltersSchema>

export const ticketsResponseSchema = z.object({
  items: z.array(ticketSchema),
  total: z.number(),
})
export type TicketsResponse = z.infer<typeof ticketsResponseSchema>

/* -------------------- inputs -------------------- */

export const ticketInputSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  category: z.string().min(1),
  priority: ticketPrioritySchema,
})
export type TicketInput = z.infer<typeof ticketInputSchema>

export const ticketReplyInputSchema = z.object({
  body: z.string().min(1),
})
export type TicketReplyInput = z.infer<typeof ticketReplyInputSchema>

/* -------------------- help articles -------------------- */

export const helpArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  excerpt: z.string(),
  category: z.string(),
  href: z.string(),
})
export type HelpArticle = z.infer<typeof helpArticleSchema>

export const helpArticlesResponseSchema = z.object({
  items: z.array(helpArticleSchema),
})
export type HelpArticlesResponse = z.infer<typeof helpArticlesResponseSchema>

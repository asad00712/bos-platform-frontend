import { z } from 'zod'

/* -------------------- enums -------------------- */

export const invoiceStatusSchema = z.enum([
  'draft',
  'sent',
  'partial',
  'paid',
  'overdue',
  'void',
])
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>

export const paymentMethodSchema = z.enum([
  'card',
  'cash',
  'bank_transfer',
  'check',
  'other',
])
export type PaymentMethod = z.infer<typeof paymentMethodSchema>

/* -------------------- line item -------------------- */

export const invoiceLineItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  /** Tax % applied to this line. */
  taxRate: z.number().default(0),
})
export type InvoiceLineItem = z.infer<typeof invoiceLineItemSchema>

/* -------------------- invoice (list shape) -------------------- */

export const invoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  status: invoiceStatusSchema,
  contactId: z.string().nullable(),
  contactName: z.string().nullable(),
  issuedAt: z.string(),
  dueAt: z.string(),
  /** Subtotal before tax/discount. */
  subtotal: z.number(),
  taxTotal: z.number(),
  /** % discount applied at invoice level. */
  discountRate: z.number().default(0),
  total: z.number(),
  amountPaid: z.number(),
  amountDue: z.number(),
  currency: z.string(),
})
export type Invoice = z.infer<typeof invoiceSchema>

/* -------------------- invoice detail -------------------- */

export const paymentSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  invoiceNumber: z.string(),
  contactName: z.string().nullable(),
  amount: z.number(),
  currency: z.string(),
  method: paymentMethodSchema,
  reference: z.string().nullable(),
  receivedAt: z.string(),
  notes: z.string().nullable(),
})
export type Payment = z.infer<typeof paymentSchema>

export const invoiceDetailSchema = invoiceSchema.extend({
  lineItems: z.array(invoiceLineItemSchema),
  notes: z.string().nullable(),
  payments: z.array(paymentSchema),
})
export type InvoiceDetail = z.infer<typeof invoiceDetailSchema>

/* -------------------- inputs -------------------- */

export const lineItemInputSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  taxRate: z.number().min(0).max(100),
})
export type LineItemInput = z.infer<typeof lineItemInputSchema>

export const invoiceInputSchema = z.object({
  contactId: z.string().nullable(),
  issuedAt: z.string(),
  dueAt: z.string(),
  status: invoiceStatusSchema,
  discountRate: z.number().min(0).max(100),
  notes: z.string().optional(),
  lineItems: z.array(lineItemInputSchema).min(1),
})
export type InvoiceInput = z.infer<typeof invoiceInputSchema>

export const paymentInputSchema = z.object({
  invoiceId: z.string(),
  amount: z.number().positive(),
  method: paymentMethodSchema,
  reference: z.string().optional(),
  receivedAt: z.string(),
  notes: z.string().optional(),
})
export type PaymentInput = z.infer<typeof paymentInputSchema>

/* -------------------- list / overview -------------------- */

export const invoiceListFiltersSchema = z.object({
  search: z.string().optional(),
  status: invoiceStatusSchema.optional(),
  contactId: z.string().optional(),
})
export type InvoiceListFilters = z.infer<typeof invoiceListFiltersSchema>

export const invoicesListResponseSchema = z.object({
  items: z.array(invoiceSchema),
  total: z.number(),
})
export type InvoicesListResponse = z.infer<typeof invoicesListResponseSchema>

export const paymentsListResponseSchema = z.object({
  items: z.array(paymentSchema),
  total: z.number(),
})
export type PaymentsListResponse = z.infer<typeof paymentsListResponseSchema>

export const billingOverviewSchema = z.object({
  currency: z.string(),
  outstanding: z.number(),
  overdue: z.number(),
  paidThisMonth: z.number(),
  draftCount: z.number(),
})
export type BillingOverview = z.infer<typeof billingOverviewSchema>

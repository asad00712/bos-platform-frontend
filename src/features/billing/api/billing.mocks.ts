import { computeTotals } from '../lib/totals'
import type {
  BillingOverview,
  Invoice,
  InvoiceDetail,
  InvoiceInput,
  InvoiceLineItem,
  InvoiceListFilters,
  InvoicesListResponse,
  Payment,
  PaymentInput,
  PaymentsListResponse,
} from './billing.contracts'

const CURRENCY = 'USD'

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}
function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toISOString()
}

type StoredInvoice = {
  id: string
  number: string
  status: Invoice['status']
  contactId: string | null
  contactName: string | null
  issuedAt: string
  dueAt: string
  discountRate: number
  notes: string | null
  lineItems: InvoiceLineItem[]
}

const seed: StoredInvoice[] = [
  {
    id: 'inv-184',
    number: 'INV-2026-184',
    status: 'paid',
    contactId: 'c-1001',
    contactName: 'Sarah Mitchell',
    issuedAt: daysAgo(8),
    dueAt: daysFromNow(7),
    discountRate: 0,
    notes: 'Aetna PPO billed; copay collected.',
    lineItems: [
      { id: 'li-184-1', description: 'Crown · porcelain', quantity: 1, unitPrice: 2_400, taxRate: 8 },
      { id: 'li-184-2', description: 'Local anesthesia', quantity: 1, unitPrice: 60, taxRate: 0 },
      { id: 'li-184-3', description: 'Imaging · single', quantity: 2, unitPrice: 95, taxRate: 8 },
    ],
  },
  {
    id: 'inv-141',
    number: 'INV-2026-141',
    status: 'overdue',
    contactId: 'c-1005',
    contactName: 'Ahmed Khan',
    issuedAt: daysAgo(45),
    dueAt: daysAgo(13),
    discountRate: 0,
    notes: null,
    lineItems: [
      { id: 'li-141-1', description: 'Cleaning · adult', quantity: 1, unitPrice: 180, taxRate: 0 },
      { id: 'li-141-2', description: 'Whitening session', quantity: 1, unitPrice: 320, taxRate: 8 },
    ],
  },
  {
    id: 'inv-201',
    number: 'INV-2026-201',
    status: 'sent',
    contactId: 'c-1002',
    contactName: 'Khalid Al-Rashid',
    issuedAt: daysAgo(3),
    dueAt: daysFromNow(11),
    discountRate: 0,
    notes: 'Net 14.',
    lineItems: [
      { id: 'li-201-1', description: 'Initial consult', quantity: 1, unitPrice: 250, taxRate: 0 },
    ],
  },
  {
    id: 'inv-202',
    number: 'INV-2026-202',
    status: 'draft',
    contactId: 'c-1006',
    contactName: 'Maria Garcia',
    issuedAt: daysAgo(0),
    dueAt: daysFromNow(14),
    discountRate: 5,
    notes: null,
    lineItems: [
      { id: 'li-202-1', description: 'New patient package', quantity: 1, unitPrice: 220, taxRate: 0 },
      { id: 'li-202-2', description: 'X-ray · panoramic', quantity: 1, unitPrice: 145, taxRate: 8 },
    ],
  },
  {
    id: 'inv-198',
    number: 'INV-2026-198',
    status: 'partial',
    contactId: 'c-1003',
    contactName: 'Greenfield Academy',
    issuedAt: daysAgo(15),
    dueAt: daysFromNow(0),
    discountRate: 10,
    notes: 'School plan — 50% on signup.',
    lineItems: [
      { id: 'li-198-1', description: 'Annual screening · 120 students', quantity: 120, unitPrice: 25, taxRate: 0 },
      { id: 'li-198-2', description: 'On-site supplies', quantity: 1, unitPrice: 480, taxRate: 8 },
    ],
  },
]

let invoices: StoredInvoice[] = [...seed]

const seedPayments: Payment[] = [
  {
    id: 'pay-1',
    invoiceId: 'inv-184',
    invoiceNumber: 'INV-2026-184',
    contactName: 'Sarah Mitchell',
    amount: 0,
    currency: CURRENCY,
    method: 'card',
    reference: 'ch_3PqW8Aabc',
    receivedAt: daysAgo(2),
    notes: null,
  },
  {
    id: 'pay-2',
    invoiceId: 'inv-198',
    invoiceNumber: 'INV-2026-198',
    contactName: 'Greenfield Academy',
    amount: 0,
    currency: CURRENCY,
    method: 'bank_transfer',
    reference: 'ACH-771-2026',
    receivedAt: daysAgo(10),
    notes: 'Partial — 50% deposit',
  },
]

let payments: Payment[] = []

function totalsOf(inv: StoredInvoice) {
  return computeTotals(inv.lineItems, inv.discountRate)
}

function listView(inv: StoredInvoice): Invoice {
  const t = totalsOf(inv)
  const paid = payments
    .filter((p) => p.invoiceId === inv.id)
    .reduce((sum, p) => sum + p.amount, 0)
  return {
    id: inv.id,
    number: inv.number,
    status: inv.status,
    contactId: inv.contactId,
    contactName: inv.contactName,
    issuedAt: inv.issuedAt,
    dueAt: inv.dueAt,
    subtotal: t.subtotal,
    taxTotal: t.taxTotal,
    discountRate: inv.discountRate,
    total: t.total,
    amountPaid: round2(paid),
    amountDue: round2(t.total - paid),
    currency: CURRENCY,
  }
}

function detailView(inv: StoredInvoice): InvoiceDetail {
  const list = listView(inv)
  return {
    ...list,
    lineItems: inv.lineItems,
    notes: inv.notes,
    payments: payments.filter((p) => p.invoiceId === inv.id),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/* Initialize seed payments now that helpers are defined. */
;(function initPayments() {
  // Paid invoice fully paid; partial gets 50% of total.
  const inv184 = seed.find((i) => i.id === 'inv-184')!
  const inv198 = seed.find((i) => i.id === 'inv-198')!
  seedPayments[0] = { ...seedPayments[0], amount: totalsOf(inv184).total }
  seedPayments[1] = { ...seedPayments[1], amount: round2(totalsOf(inv198).total * 0.5) }
  payments = [...seedPayments]
})()

export const billingMocks = {
  listInvoices(filters: InvoiceListFilters): InvoicesListResponse {
    const q = filters.search?.trim().toLowerCase()
    const items = invoices
      .filter((i) => {
        if (filters.status && i.status !== filters.status) return false
        if (filters.contactId && i.contactId !== filters.contactId) return false
        if (q) {
          const hay = `${i.number} ${i.contactName ?? ''}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .map(listView)
      .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
    return { items, total: items.length }
  },

  listPayments(): PaymentsListResponse {
    const items = [...payments].sort((a, b) =>
      b.receivedAt.localeCompare(a.receivedAt),
    )
    return { items, total: items.length }
  },

  getInvoice(id: string): InvoiceDetail | null {
    const inv = invoices.find((i) => i.id === id)
    return inv ? detailView(inv) : null
  },

  createInvoice(input: InvoiceInput): InvoiceDetail {
    const id = `inv-${Date.now()}`
    const number = `INV-${new Date().getFullYear()}-${(invoices.length + 200).toString()}`
    const lineItems: InvoiceLineItem[] = input.lineItems.map((li, i) => ({
      id: `li-${id}-${i + 1}`,
      ...li,
    }))
    const created: StoredInvoice = {
      id,
      number,
      status: input.status,
      contactId: input.contactId,
      contactName: null,
      issuedAt: input.issuedAt,
      dueAt: input.dueAt,
      discountRate: input.discountRate,
      notes: input.notes ?? null,
      lineItems,
    }
    invoices = [created, ...invoices]
    return detailView(created)
  },

  updateInvoice(id: string, patch: Partial<InvoiceInput>): InvoiceDetail | null {
    const idx = invoices.findIndex((i) => i.id === id)
    if (idx < 0) return null
    const cur = invoices[idx]
    const lineItems = patch.lineItems
      ? patch.lineItems.map((li, i) => ({ id: `li-${id}-${i + 1}`, ...li }))
      : cur.lineItems
    const next: StoredInvoice = {
      ...cur,
      contactId: patch.contactId !== undefined ? patch.contactId : cur.contactId,
      issuedAt: patch.issuedAt ?? cur.issuedAt,
      dueAt: patch.dueAt ?? cur.dueAt,
      status: patch.status ?? cur.status,
      discountRate: patch.discountRate ?? cur.discountRate,
      notes: patch.notes !== undefined ? patch.notes ?? null : cur.notes,
      lineItems,
    }
    invoices[idx] = next
    return detailView(next)
  },

  voidInvoice(id: string): InvoiceDetail | null {
    const idx = invoices.findIndex((i) => i.id === id)
    if (idx < 0) return null
    invoices[idx] = { ...invoices[idx], status: 'void' }
    return detailView(invoices[idx])
  },

  removeInvoice(id: string): boolean {
    const before = invoices.length
    invoices = invoices.filter((i) => i.id !== id)
    payments = payments.filter((p) => p.invoiceId !== id)
    return invoices.length < before
  },

  recordPayment(input: PaymentInput): Payment {
    const inv = invoices.find((i) => i.id === input.invoiceId)
    if (!inv) throw new Error('Invoice not found')
    const created: Payment = {
      id: `pay-${Date.now()}`,
      invoiceId: inv.id,
      invoiceNumber: inv.number,
      contactName: inv.contactName,
      amount: round2(input.amount),
      currency: CURRENCY,
      method: input.method,
      reference: input.reference ?? null,
      receivedAt: input.receivedAt,
      notes: input.notes ?? null,
    }
    payments = [created, ...payments]

    // Auto-update invoice status when total covered.
    const t = totalsOf(inv)
    const paid = payments
      .filter((p) => p.invoiceId === inv.id)
      .reduce((sum, p) => sum + p.amount, 0)
    if (paid >= t.total - 0.005) {
      const idx = invoices.findIndex((i) => i.id === inv.id)
      if (idx >= 0) invoices[idx] = { ...invoices[idx], status: 'paid' }
    } else if (paid > 0 && inv.status !== 'overdue') {
      const idx = invoices.findIndex((i) => i.id === inv.id)
      if (idx >= 0) invoices[idx] = { ...invoices[idx], status: 'partial' }
    }
    return created
  },

  overview(): BillingOverview {
    const list = invoices.map(listView)
    const outstanding = list
      .filter((i) => i.status !== 'paid' && i.status !== 'void')
      .reduce((s, i) => s + i.amountDue, 0)
    const overdue = list
      .filter((i) => i.status === 'overdue')
      .reduce((s, i) => s + i.amountDue, 0)
    const since = Date.now() - 30 * 86_400_000
    const paidThisMonth = payments
      .filter((p) => new Date(p.receivedAt).getTime() >= since)
      .reduce((s, p) => s + p.amount, 0)
    const draftCount = list.filter((i) => i.status === 'draft').length
    return {
      currency: CURRENCY,
      outstanding: round2(outstanding),
      overdue: round2(overdue),
      paidThisMonth: round2(paidThisMonth),
      draftCount,
    }
  },
}

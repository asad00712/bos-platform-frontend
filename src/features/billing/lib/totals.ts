import type {
  Invoice,
  InvoiceDetail,
  InvoiceLineItem,
  LineItemInput,
} from '../api/billing.contracts'

export type ComputedTotals = {
  subtotal: number
  taxTotal: number
  discountAmount: number
  total: number
}

/**
 * Compute invoice totals from line items + invoice-level discount.
 * Tax is calculated per line on its own line subtotal; the
 * invoice-level discount applies to (subtotal + tax).
 */
export function computeTotals(
  items: ReadonlyArray<InvoiceLineItem | LineItemInput>,
  discountRate = 0,
): ComputedTotals {
  let subtotal = 0
  let taxTotal = 0
  for (const li of items) {
    const lineSubtotal = li.quantity * li.unitPrice
    subtotal += lineSubtotal
    taxTotal += (lineSubtotal * (li.taxRate ?? 0)) / 100
  }
  const beforeDiscount = subtotal + taxTotal
  const discountAmount = (beforeDiscount * (discountRate ?? 0)) / 100
  const total = round2(beforeDiscount - discountAmount)
  return {
    subtotal: round2(subtotal),
    taxTotal: round2(taxTotal),
    discountAmount: round2(discountAmount),
    total,
  }
}

export function amountDue(invoice: Pick<InvoiceDetail | Invoice, 'total' | 'amountPaid'>): number {
  return round2(invoice.total - invoice.amountPaid)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'

import {
  billingOverviewSchema,
  invoiceDetailSchema,
  invoicesListResponseSchema,
  paymentSchema,
  paymentsListResponseSchema,
  type BillingOverview,
  type InvoiceDetail,
  type InvoiceInput,
  type InvoiceListFilters,
  type InvoicesListResponse,
  type Payment,
  type PaymentInput,
  type PaymentsListResponse,
} from './billing.contracts'
import { billingMocks } from './billing.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export const billingApi = {
  async listInvoices(filters: InvoiceListFilters): Promise<InvoicesListResponse> {
    if (env.useMocks) {
      await delay()
      return invoicesListResponseSchema.parse(billingMocks.listInvoices(filters))
    }
    const qs = new URLSearchParams()
    if (filters.search) qs.set('search', filters.search)
    if (filters.status) qs.set('status', filters.status)
    if (filters.contactId) qs.set('contactId', filters.contactId)
    const data = await apiRequest<unknown>(`/billing/invoices?${qs.toString()}`)
    return invoicesListResponseSchema.parse(data)
  },

  async listPayments(): Promise<PaymentsListResponse> {
    if (env.useMocks) {
      await delay()
      return paymentsListResponseSchema.parse(billingMocks.listPayments())
    }
    const data = await apiRequest<unknown>('/billing/payments')
    return paymentsListResponseSchema.parse(data)
  },

  async getInvoice(id: string): Promise<InvoiceDetail> {
    if (env.useMocks) {
      await delay()
      const result = billingMocks.getInvoice(id)
      if (!result) throw new Error('Invoice not found')
      return invoiceDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/billing/invoices/${id}`)
    return invoiceDetailSchema.parse(data)
  },

  async createInvoice(input: InvoiceInput): Promise<InvoiceDetail> {
    if (env.useMocks) {
      await delay()
      return invoiceDetailSchema.parse(billingMocks.createInvoice(input))
    }
    const data = await apiRequest<unknown>('/billing/invoices', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return invoiceDetailSchema.parse(data)
  },

  async updateInvoice(id: string, patch: Partial<InvoiceInput>): Promise<InvoiceDetail> {
    if (env.useMocks) {
      await delay()
      const result = billingMocks.updateInvoice(id, patch)
      if (!result) throw new Error('Invoice not found')
      return invoiceDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/billing/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    return invoiceDetailSchema.parse(data)
  },

  async voidInvoice(id: string): Promise<InvoiceDetail> {
    if (env.useMocks) {
      await delay()
      const result = billingMocks.voidInvoice(id)
      if (!result) throw new Error('Invoice not found')
      return invoiceDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/billing/invoices/${id}/void`, {
      method: 'POST',
    })
    return invoiceDetailSchema.parse(data)
  },

  async deleteInvoice(id: string): Promise<void> {
    if (env.useMocks) {
      await delay()
      const ok = billingMocks.removeInvoice(id)
      if (!ok) throw new Error('Invoice not found')
      return
    }
    await apiRequest<void>(`/billing/invoices/${id}`, { method: 'DELETE' })
  },

  async recordPayment(input: PaymentInput): Promise<Payment> {
    if (env.useMocks) {
      await delay()
      return paymentSchema.parse(billingMocks.recordPayment(input))
    }
    const data = await apiRequest<unknown>('/billing/payments', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return paymentSchema.parse(data)
  },

  async overview(): Promise<BillingOverview> {
    if (env.useMocks) {
      await delay()
      return billingOverviewSchema.parse(billingMocks.overview())
    }
    const data = await apiRequest<unknown>('/billing/overview')
    return billingOverviewSchema.parse(data)
  },
}

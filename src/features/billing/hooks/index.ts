import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { billingApi } from '../api/billing.api'
import type {
  InvoiceInput,
  InvoiceListFilters,
  PaymentInput,
} from '../api/billing.contracts'

export const billingKeys = {
  invoices: (tenantId: string, filters: InvoiceListFilters) =>
    ['billing.invoices', tenantId, filters] as const,
  invoice: (tenantId: string, id: string) =>
    ['billing.invoice', tenantId, id] as const,
  payments: (tenantId: string) => ['billing.payments', tenantId] as const,
  overview: (tenantId: string) => ['billing.overview', tenantId] as const,
}

export function useInvoiceList(tenantId: string, filters: InvoiceListFilters) {
  return useQuery({
    queryKey: billingKeys.invoices(tenantId, filters),
    queryFn: () => billingApi.listInvoices(filters),
    staleTime: 30_000,
  })
}

export function useInvoice(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: billingKeys.invoice(tenantId, id ?? ''),
    queryFn: () => billingApi.getInvoice(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

export function usePaymentList(tenantId: string) {
  return useQuery({
    queryKey: billingKeys.payments(tenantId),
    queryFn: billingApi.listPayments,
    staleTime: 30_000,
  })
}

export function useBillingOverview(tenantId: string) {
  return useQuery({
    queryKey: billingKeys.overview(tenantId),
    queryFn: billingApi.overview,
    staleTime: 60_000,
  })
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>, tenantId: string) {
  void qc.invalidateQueries({ queryKey: ['billing.invoices', tenantId] })
  void qc.invalidateQueries({ queryKey: billingKeys.payments(tenantId) })
  void qc.invalidateQueries({ queryKey: billingKeys.overview(tenantId) })
}

export function useCreateInvoice(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: InvoiceInput) => billingApi.createInvoice(input),
    onSuccess: (created) => {
      invalidateAll(qc, tenantId)
      toast.success('Invoice created', { description: created.number })
    },
    onError: (error: Error) => {
      toast.error('Could not create invoice', { description: error.message })
    },
  })
}

export function useUpdateInvoice(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<InvoiceInput> }) =>
      billingApi.updateInvoice(id, patch),
    onSuccess: (updated) => {
      invalidateAll(qc, tenantId)
      void qc.invalidateQueries({ queryKey: billingKeys.invoice(tenantId, updated.id) })
    },
    onError: (error: Error) => {
      toast.error('Could not update invoice', { description: error.message })
    },
  })
}

export function useVoidInvoice(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => billingApi.voidInvoice(id),
    onSuccess: (voided) => {
      invalidateAll(qc, tenantId)
      void qc.invalidateQueries({ queryKey: billingKeys.invoice(tenantId, voided.id) })
      toast.success('Invoice voided')
    },
    onError: (error: Error) => {
      toast.error('Could not void invoice', { description: error.message })
    },
  })
}

export function useDeleteInvoice(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => billingApi.deleteInvoice(id),
    onSuccess: () => {
      invalidateAll(qc, tenantId)
      toast.success('Invoice deleted')
    },
    onError: (error: Error) => {
      toast.error('Could not delete invoice', { description: error.message })
    },
  })
}

export function useRecordPayment(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: PaymentInput) => billingApi.recordPayment(input),
    onSuccess: (created) => {
      invalidateAll(qc, tenantId)
      void qc.invalidateQueries({ queryKey: billingKeys.invoice(tenantId, created.invoiceId) })
      toast.success('Payment recorded', {
        description: `${created.invoiceNumber}`,
      })
    },
    onError: (error: Error) => {
      toast.error('Could not record payment', { description: error.message })
    },
  })
}

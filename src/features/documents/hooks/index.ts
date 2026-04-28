import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { documentsApi } from '../api/documents.api'
import type {
  DocumentInput,
  DocumentListFilters,
  SignatureRequestInput,
} from '../api/documents.contracts'

export const docKeys = {
  list: (tenantId: string, filters: DocumentListFilters) =>
    ['documents', tenantId, filters] as const,
  detail: (tenantId: string, id: string) =>
    ['document', tenantId, id] as const,
}

export function useDocumentList(tenantId: string, filters: DocumentListFilters) {
  return useQuery({
    queryKey: docKeys.list(tenantId, filters),
    queryFn: () => documentsApi.list(filters),
    staleTime: 30_000,
  })
}

export function useDocument(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: docKeys.detail(tenantId, id ?? ''),
    queryFn: () => documentsApi.get(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>, tenantId: string) {
  void qc.invalidateQueries({ queryKey: ['documents', tenantId] })
}

export function useCreateDocument(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: DocumentInput) => documentsApi.create(input),
    onSuccess: (created) => {
      invalidateAll(qc, tenantId)
      toast.success('Document uploaded', { description: created.name })
    },
    onError: (error: Error) => {
      toast.error('Could not upload document', { description: error.message })
    },
  })
}

export function useUpdateDocument(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<DocumentInput> }) =>
      documentsApi.update(id, patch),
    onSuccess: (updated) => {
      invalidateAll(qc, tenantId)
      void qc.invalidateQueries({ queryKey: docKeys.detail(tenantId, updated.id) })
    },
    onError: (error: Error) => {
      toast.error('Could not update document', { description: error.message })
    },
  })
}

export function useDeleteDocument(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => documentsApi.remove(id),
    onSuccess: () => {
      invalidateAll(qc, tenantId)
      toast.success('Document deleted')
    },
    onError: (error: Error) => {
      toast.error('Could not delete document', { description: error.message })
    },
  })
}

export function useAddVersion(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string | null }) =>
      documentsApi.addVersion(id, notes),
    onSuccess: (updated) => {
      invalidateAll(qc, tenantId)
      void qc.invalidateQueries({ queryKey: docKeys.detail(tenantId, updated.id) })
      toast.success(`Version ${updated.versionCount} added`)
    },
    onError: (error: Error) => {
      toast.error('Could not add version', { description: error.message })
    },
  })
}

export function useRequestSignature(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: SignatureRequestInput
    }) => documentsApi.requestSignature(id, input),
    onSuccess: (updated, { input }) => {
      invalidateAll(qc, tenantId)
      void qc.invalidateQueries({ queryKey: docKeys.detail(tenantId, updated.id) })
      toast.success('Signature requested', { description: input.signerEmail })
    },
    onError: (error: Error) => {
      toast.error('Could not request signature', { description: error.message })
    },
  })
}

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { useActiveBranchId } from '@/stores/activeBranch.store'
import { crmApi } from '../api/crm.api'
import type { ContactInput, ListFilters } from '../api/crm.contracts'

export const crmKeys = {
  list: (tenantId: string, branchId: string | null, filters: ListFilters) =>
    ['crm.contacts', tenantId, branchId, filters] as const,
  detail: (tenantId: string, id: string) =>
    ['crm.contact', tenantId, id] as const,
  activities: (tenantId: string, id: string) =>
    ['crm.contact.activities', tenantId, id] as const,
  segments: (tenantId: string, branchId: string | null) =>
    ['crm.segments', tenantId, branchId] as const,
  tags: (tenantId: string, branchId: string | null) =>
    ['crm.tags', tenantId, branchId] as const,
  sources: (tenantId: string, branchId: string | null) =>
    ['crm.sources', tenantId, branchId] as const,
  owners: (tenantId: string) => ['crm.owners', tenantId] as const,
}

export function useContactList(tenantId: string, filters: ListFilters) {
  const branchId = useActiveBranchId()
  return useQuery({
    queryKey: crmKeys.list(tenantId, branchId, filters),
    queryFn: () => crmApi.listContacts(filters),
    staleTime: 30_000,
  })
}

export function useContact(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: crmKeys.detail(tenantId, id ?? ''),
    queryFn: () => crmApi.getContact(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

export function useContactActivities(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: crmKeys.activities(tenantId, id ?? ''),
    queryFn: () => crmApi.listContactActivities(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

export function useSegments(tenantId: string) {
  const branchId = useActiveBranchId()
  return useQuery({
    queryKey: crmKeys.segments(tenantId, branchId),
    queryFn: crmApi.listSegments,
    staleTime: 60_000,
  })
}

export function useTagLookup(tenantId: string) {
  const branchId = useActiveBranchId()
  return useQuery({
    queryKey: crmKeys.tags(tenantId, branchId),
    queryFn: crmApi.listTags,
    staleTime: 5 * 60_000,
  })
}

export function useSourceLookup(tenantId: string) {
  const branchId = useActiveBranchId()
  return useQuery({
    queryKey: crmKeys.sources(tenantId, branchId),
    queryFn: crmApi.listSources,
    staleTime: 5 * 60_000,
  })
}

export function useOwnerLookup(tenantId: string) {
  return useQuery({
    queryKey: crmKeys.owners(tenantId),
    queryFn: crmApi.listOwners,
    staleTime: 5 * 60_000,
  })
}

export function useCreateContact(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ContactInput) => crmApi.createContact(input),
    onSuccess: (created) => {
      void qc.invalidateQueries({ queryKey: ['crm.contacts', tenantId] })
      void qc.invalidateQueries({ queryKey: ['crm.segments', tenantId] })
      toast.success('Contact created', {
        description: [created.firstName, created.lastName].filter(Boolean).join(' '),
      })
    },
    onError: (error: Error) => {
      toast.error('Could not create contact', { description: error.message })
    },
  })
}

export function useUpdateContact(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ContactInput> }) =>
      crmApi.updateContact(id, patch),
    onSuccess: (updated) => {
      void qc.invalidateQueries({ queryKey: ['crm.contacts', tenantId] })
      void qc.invalidateQueries({ queryKey: crmKeys.detail(tenantId, updated.id) })
    },
    onError: (error: Error) => {
      toast.error('Could not update contact', { description: error.message })
    },
  })
}

export function useDeleteContact(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => crmApi.deleteContact(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['crm.contacts', tenantId] })
      toast.success('Contact deleted')
    },
    onError: (error: Error) => {
      toast.error('Could not delete contact', { description: error.message })
    },
  })
}

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { useActiveBranchId } from '@/stores/activeBranch.store'
import { useSessionStore } from '@/stores/session.store'
import { leadsApi, type LeadFilters, type LeadInput } from '../api/leads.api'

export const leadKeys = {
  list: (tenantId: string, branchId: string | null, filters: LeadFilters) =>
    ['leads.list', tenantId, branchId, filters] as const,
  detail: (tenantId: string, id: string) => ['leads.detail', tenantId, id] as const,
  activities: (tenantId: string, id: string) =>
    ['leads.activities', tenantId, id] as const,
  statuses: (tenantId: string, branchId: string | null) =>
    ['leads.statuses', tenantId, branchId] as const,
}

export function useLeadsList(tenantId: string, filters: LeadFilters) {
  const branchId = useActiveBranchId()
  return useQuery({
    queryKey: leadKeys.list(tenantId, branchId, filters),
    queryFn: () => leadsApi.list(filters),
    staleTime: 30_000,
  })
}

export function useLead(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: leadKeys.detail(tenantId, id ?? ''),
    queryFn: () => leadsApi.get(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

export function useLeadActivities(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: leadKeys.activities(tenantId, id ?? ''),
    queryFn: () => leadsApi.listActivities(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

export function useLeadStatuses(tenantId: string) {
  const branchId = useActiveBranchId()
  return useQuery({
    queryKey: leadKeys.statuses(tenantId, branchId),
    queryFn: leadsApi.listStatuses,
    staleTime: 60_000,
  })
}

export function useCreateLead(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: LeadInput) => leadsApi.create(input),
    onSuccess: (created) => {
      void qc.invalidateQueries({ queryKey: ['leads.list', tenantId] })
      toast.success('Lead created', {
        description: [created.firstName, created.lastName].filter(Boolean).join(' '),
      })
    },
    onError: (error: Error) => {
      toast.error('Could not create lead', { description: error.message })
    },
  })
}

export function useUpdateLead(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<LeadInput> }) =>
      leadsApi.update(id, patch),
    onSuccess: (updated) => {
      void qc.invalidateQueries({ queryKey: ['leads.list', tenantId] })
      void qc.invalidateQueries({ queryKey: leadKeys.detail(tenantId, updated.id) })
    },
    onError: (error: Error) => {
      toast.error('Could not update lead', { description: error.message })
    },
  })
}

export function useDeleteLead(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => leadsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['leads.list', tenantId] })
      toast.success('Lead removed')
    },
    onError: (error: Error) => {
      toast.error('Could not remove lead', { description: error.message })
    },
  })
}

export function useSetLeadStatus(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, statusId }: { id: string; statusId: string }) =>
      leadsApi.setStatus(id, statusId),
    onSuccess: (updated) => {
      void qc.invalidateQueries({ queryKey: ['leads.list', tenantId] })
      void qc.invalidateQueries({ queryKey: leadKeys.detail(tenantId, updated.id) })
    },
    onError: (error: Error) => {
      toast.error('Could not change status', { description: error.message })
    },
  })
}

export function useConvertLead(tenantId: string) {
  const qc = useQueryClient()
  const userId = useSessionStore((s) => s.user?.id ?? 'user-current')
  return useMutation({
    mutationFn: (id: string) => leadsApi.convert(id, userId),
    onSuccess: ({ lead }) => {
      void qc.invalidateQueries({ queryKey: ['leads.list', tenantId] })
      void qc.invalidateQueries({ queryKey: leadKeys.detail(tenantId, lead.id) })
      void qc.invalidateQueries({ queryKey: ['crm.contacts', tenantId] })
      toast.success('Lead converted to contact')
    },
    onError: (error: Error) => {
      toast.error('Could not convert lead', { description: error.message })
    },
  })
}

export function useCreateLeadStatus(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      branchId: string
      name: string
      color?: string
      displayOrder?: number
    }) => leadsApi.createStatus(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['leads.statuses', tenantId] })
    },
    onError: (error: Error) => {
      toast.error('Could not create status', { description: error.message })
    },
  })
}

export function useUpdateLeadStatus(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string
      patch: Partial<{
        name: string
        color: string | null
        displayOrder: number
        isActive: boolean
      }>
    }) => leadsApi.updateStatus(id, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['leads.statuses', tenantId] })
    },
    onError: (error: Error) => {
      toast.error('Could not update status', { description: error.message })
    },
  })
}

export function useDeleteLeadStatus(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => leadsApi.removeStatus(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['leads.statuses', tenantId] })
      void qc.invalidateQueries({ queryKey: ['leads.list', tenantId] })
    },
    onError: (error: Error) => {
      toast.error('Could not remove status', { description: error.message })
    },
  })
}

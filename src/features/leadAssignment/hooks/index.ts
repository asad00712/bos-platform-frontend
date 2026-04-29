import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { useActiveBranchId } from '@/stores/activeBranch.store'
import {
  leadAssignmentApi,
  type LeadAssignmentConfigInput,
  type LeadWebhookInput,
} from '../api/leadAssignment.api'

export const leadAssignmentKeys = {
  config: (branchId: string) => ['leadAssignment.config', branchId] as const,
  webhooks: (branchId: string | null) => ['leadAssignment.webhooks', branchId] as const,
}

export function useLeadAssignmentConfig(branchId: string | null) {
  return useQuery({
    queryKey: leadAssignmentKeys.config(branchId ?? ''),
    queryFn: () => leadAssignmentApi.getConfig(branchId!),
    enabled: Boolean(branchId),
    staleTime: 60_000,
  })
}

export function useSetLeadAssignmentConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: LeadAssignmentConfigInput) =>
      leadAssignmentApi.setConfig(input),
    onSuccess: (config) => {
      void qc.invalidateQueries({ queryKey: leadAssignmentKeys.config(config.branchId) })
      toast.success('Assignment config saved')
    },
    onError: (error: Error) => {
      toast.error('Could not save assignment config', { description: error.message })
    },
  })
}

export function useLeadWebhooks() {
  const branchId = useActiveBranchId()
  return useQuery({
    queryKey: leadAssignmentKeys.webhooks(branchId),
    queryFn: leadAssignmentApi.listWebhooks,
    staleTime: 60_000,
  })
}

export function useCreateLeadWebhook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: LeadWebhookInput) => leadAssignmentApi.createWebhook(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['leadAssignment.webhooks'] })
      toast.success('Webhook created')
    },
    onError: (error: Error) => {
      toast.error('Could not create webhook', { description: error.message })
    },
  })
}

export function useUpdateLeadWebhook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string
      patch: Partial<{ name: string; isActive: boolean }>
    }) => leadAssignmentApi.updateWebhook(id, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['leadAssignment.webhooks'] })
    },
    onError: (error: Error) => {
      toast.error('Could not update webhook', { description: error.message })
    },
  })
}

export function useRegenerateWebhookToken() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => leadAssignmentApi.regenerateToken(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['leadAssignment.webhooks'] })
      toast.success('Token regenerated')
    },
    onError: (error: Error) => {
      toast.error('Could not regenerate token', { description: error.message })
    },
  })
}

export function useDeleteLeadWebhook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => leadAssignmentApi.removeWebhook(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['leadAssignment.webhooks'] })
      toast.success('Webhook removed')
    },
    onError: (error: Error) => {
      toast.error('Could not remove webhook', { description: error.message })
    },
  })
}

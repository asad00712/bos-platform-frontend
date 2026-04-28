import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { automationApi } from '../api/automation.api'
import type {
  Workflow,
  WorkflowFilters,
  WorkflowInput,
} from '../api/automation.contracts'

export const automationKeys = {
  list: (tenantId: string, filters: WorkflowFilters) =>
    ['automation.workflows', tenantId, filters] as const,
  detail: (tenantId: string, id: string) =>
    ['automation.workflow', tenantId, id] as const,
  runs: (tenantId: string, workflowId?: string) =>
    ['automation.runs', tenantId, workflowId ?? 'all'] as const,
  templates: (tenantId: string) => ['automation.templates', tenantId] as const,
}

export function useWorkflowList(tenantId: string, filters: WorkflowFilters) {
  return useQuery({
    queryKey: automationKeys.list(tenantId, filters),
    queryFn: () => automationApi.list(filters),
    staleTime: 30_000,
  })
}

export function useWorkflow(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: automationKeys.detail(tenantId, id ?? ''),
    queryFn: () => automationApi.get(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

export function useRuns(tenantId: string, workflowId?: string) {
  return useQuery({
    queryKey: automationKeys.runs(tenantId, workflowId),
    queryFn: () => automationApi.runs(workflowId),
    staleTime: 15_000,
  })
}

export function useAutomationTemplates(tenantId: string) {
  return useQuery({
    queryKey: automationKeys.templates(tenantId),
    queryFn: automationApi.templates,
    staleTime: 5 * 60_000,
  })
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>, tenantId: string) {
  void qc.invalidateQueries({ queryKey: ['automation.workflows', tenantId] })
  void qc.invalidateQueries({ queryKey: ['automation.runs', tenantId] })
}

export function useCreateWorkflow(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: WorkflowInput) => automationApi.create(input),
    onSuccess: (created) => {
      invalidateAll(qc, tenantId)
      toast.success('Workflow created', { description: created.name })
    },
    onError: (error: Error) => {
      toast.error('Could not create workflow', { description: error.message })
    },
  })
}

export function useSetWorkflowStatus(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Workflow['status'] }) =>
      automationApi.setStatus(id, status),
    onSuccess: (updated) => {
      invalidateAll(qc, tenantId)
      void qc.invalidateQueries({
        queryKey: automationKeys.detail(tenantId, updated.id),
      })
      toast.success(
        updated.status === 'active'
          ? 'Workflow activated'
          : updated.status === 'paused'
            ? 'Workflow paused'
            : 'Workflow saved as draft',
      )
    },
    onError: (error: Error) => {
      toast.error('Could not change status', { description: error.message })
    },
  })
}

export function useDeleteWorkflow(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => automationApi.remove(id),
    onSuccess: () => {
      invalidateAll(qc, tenantId)
      toast.success('Workflow deleted')
    },
    onError: (error: Error) => {
      toast.error('Could not delete', { description: error.message })
    },
  })
}

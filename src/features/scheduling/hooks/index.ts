import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { schedulingApi } from '../api/scheduling.api'
import type {
  AppointmentInput,
  RangeQuery,
} from '../api/scheduling.contracts'

export const schedulingKeys = {
  list: (tenantId: string, query: RangeQuery) =>
    ['scheduling.appointments', tenantId, query] as const,
  detail: (tenantId: string, id: string) =>
    ['scheduling.appointment', tenantId, id] as const,
  resources: (tenantId: string) => ['scheduling.resources', tenantId] as const,
}

export function useAppointmentList(tenantId: string, query: RangeQuery) {
  return useQuery({
    queryKey: schedulingKeys.list(tenantId, query),
    queryFn: () => schedulingApi.list(query),
    staleTime: 30_000,
  })
}

export function useAppointment(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: schedulingKeys.detail(tenantId, id ?? ''),
    queryFn: () => schedulingApi.get(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

export function useResources(tenantId: string) {
  return useQuery({
    queryKey: schedulingKeys.resources(tenantId),
    queryFn: schedulingApi.resources,
    staleTime: 5 * 60_000,
  })
}

function invalidateLists(qc: ReturnType<typeof useQueryClient>, tenantId: string) {
  void qc.invalidateQueries({ queryKey: ['scheduling.appointments', tenantId] })
}

export function useCreateAppointment(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AppointmentInput) => schedulingApi.create(input),
    onSuccess: (created) => {
      invalidateLists(qc, tenantId)
      toast.success('Appointment created', { description: created.title })
    },
    onError: (error: Error) => {
      toast.error('Could not create appointment', { description: error.message })
    },
  })
}

export function useUpdateAppointment(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<AppointmentInput> }) =>
      schedulingApi.update(id, patch),
    onSuccess: (updated) => {
      invalidateLists(qc, tenantId)
      void qc.invalidateQueries({
        queryKey: schedulingKeys.detail(tenantId, updated.id),
      })
    },
    onError: (error: Error) => {
      toast.error('Could not update appointment', { description: error.message })
    },
  })
}

export function useCancelAppointment(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string | null }) =>
      schedulingApi.cancel(id, reason),
    onSuccess: (cancelled) => {
      invalidateLists(qc, tenantId)
      void qc.invalidateQueries({
        queryKey: schedulingKeys.detail(tenantId, cancelled.id),
      })
      toast.success('Appointment cancelled')
    },
    onError: (error: Error) => {
      toast.error('Could not cancel appointment', { description: error.message })
    },
  })
}

export function useDeleteAppointment(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => schedulingApi.remove(id),
    onSuccess: () => {
      invalidateLists(qc, tenantId)
      toast.success('Appointment deleted')
    },
    onError: (error: Error) => {
      toast.error('Could not delete appointment', { description: error.message })
    },
  })
}

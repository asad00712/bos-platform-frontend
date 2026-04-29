import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import type { Activity, ActivityEntity, ActivityInput } from '@/types/crm'
import { activitiesApi } from '../api/activities.api'

export const activityKeys = {
  list: (entity: ActivityEntity, entityId: string) =>
    ['activities', entity, entityId] as const,
}

export function useActivities(entity: ActivityEntity, entityId: string | undefined) {
  return useQuery({
    queryKey: activityKeys.list(entity, entityId ?? ''),
    queryFn: () => activitiesApi.list(entity, entityId!),
    enabled: Boolean(entityId),
    staleTime: 30_000,
  })
}

export function useCreateActivity(
  entity: ActivityEntity,
  entityId: string | undefined,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ActivityInput) =>
      activitiesApi.create(entity, entityId!, input),
    onSuccess: () => {
      if (!entityId) return
      void qc.invalidateQueries({ queryKey: activityKeys.list(entity, entityId) })
      /* For lead activities the BE also bumps lead.updatedAt — refresh
       * the parent so the Updated column tracks. */
      if (entity === 'lead') {
        void qc.invalidateQueries({ queryKey: ['leads.detail'] })
        void qc.invalidateQueries({ queryKey: ['leads.list'] })
      }
    },
    onError: (error: Error) => {
      toast.error('Could not save activity', { description: error.message })
    },
  })
}

export function useSetActivityTaskStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      taskStatus,
    }: {
      id: string
      taskStatus: NonNullable<Activity['taskStatus']>
    }) => activitiesApi.setTaskStatus(id, taskStatus),
    onSuccess: (updated) => {
      void qc.invalidateQueries({
        queryKey: activityKeys.list(updated.entity, updated.entityId),
      })
    },
    onError: (error: Error) => {
      toast.error('Could not update task', { description: error.message })
    },
  })
}

export function useDeleteActivity(entity: ActivityEntity, entityId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => activitiesApi.remove(id),
    onSuccess: () => {
      if (!entityId) return
      void qc.invalidateQueries({ queryKey: activityKeys.list(entity, entityId) })
    },
    onError: (error: Error) => {
      toast.error('Could not delete activity', { description: error.message })
    },
  })
}

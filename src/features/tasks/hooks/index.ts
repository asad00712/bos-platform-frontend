import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { useActiveBranchId } from '@/stores/activeBranch.store'
import type { Task, TaskRelatedEntity } from '@/types/crm'
import { tasksApi, type TaskFilters, type TaskInput } from '../api/tasks.api'

export const taskKeys = {
  list: (tenantId: string, branchId: string | null, filters: TaskFilters) =>
    ['tasks.list', tenantId, branchId, filters] as const,
  byEntity: (entity: TaskRelatedEntity, entityId: string) =>
    ['tasks.byEntity', entity, entityId] as const,
  detail: (id: string) => ['tasks.detail', id] as const,
}

export function useTasks(tenantId: string, filters: TaskFilters) {
  const branchId = useActiveBranchId()
  return useQuery({
    queryKey: taskKeys.list(tenantId, branchId, filters),
    queryFn: () => tasksApi.list(filters),
    staleTime: 30_000,
  })
}

export function useTasksForEntity(
  entity: TaskRelatedEntity,
  entityId: string | undefined,
) {
  return useQuery({
    queryKey: taskKeys.byEntity(entity, entityId ?? ''),
    queryFn: () => tasksApi.byEntity(entity, entityId!),
    enabled: Boolean(entityId),
    staleTime: 30_000,
  })
}

export function useCreateTask(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: TaskInput) => tasksApi.create(input),
    onSuccess: (created) => {
      void qc.invalidateQueries({ queryKey: ['tasks.list', tenantId] })
      if (created.relatedEntity && created.relatedEntityId) {
        void qc.invalidateQueries({
          queryKey: taskKeys.byEntity(created.relatedEntity, created.relatedEntityId),
        })
      }
      toast.success('Task created')
    },
    onError: (error: Error) => {
      toast.error('Could not create task', { description: error.message })
    },
  })
}

export function useUpdateTask(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<TaskInput> }) =>
      tasksApi.update(id, patch),
    onSuccess: (updated) => {
      void qc.invalidateQueries({ queryKey: ['tasks.list', tenantId] })
      if (updated.relatedEntity && updated.relatedEntityId) {
        void qc.invalidateQueries({
          queryKey: taskKeys.byEntity(updated.relatedEntity, updated.relatedEntityId),
        })
      }
    },
    onError: (error: Error) => {
      toast.error('Could not update task', { description: error.message })
    },
  })
}

export function useToggleTaskStatus(tenantId: string) {
  const update = useUpdateTask(tenantId)
  return (task: Task) =>
    update.mutate({
      id: task.id,
      patch: { status: task.status === 'done' ? 'open' : 'done' },
    })
}

export function useDeleteTask(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tasks.list', tenantId] })
      void qc.invalidateQueries({ queryKey: ['tasks.byEntity'] })
      toast.success('Task deleted')
    },
    onError: (error: Error) => {
      toast.error('Could not delete task', { description: error.message })
    },
  })
}

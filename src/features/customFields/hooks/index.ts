import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { useActiveBranchId } from '@/stores/activeBranch.store'
import type { CustomFieldEntity, CustomFieldOption, CustomFieldType } from '@/types/crm'
import { customFieldsApi, type CustomFieldInput } from '../api/customFields.api'

export const customFieldKeys = {
  list: (tenantId: string, branchId: string | null, entity: CustomFieldEntity) =>
    ['customFields', tenantId, branchId, entity] as const,
}

export function useCustomFields(tenantId: string, entity: CustomFieldEntity) {
  const branchId = useActiveBranchId()
  return useQuery({
    queryKey: customFieldKeys.list(tenantId, branchId, entity),
    queryFn: () => customFieldsApi.list(entity),
    staleTime: 5 * 60_000,
  })
}

export function useCreateCustomField(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CustomFieldInput) => customFieldsApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['customFields', tenantId] })
    },
    onError: (error: Error) => {
      toast.error('Could not create field', { description: error.message })
    },
  })
}

export function useUpdateCustomField(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string
      patch: Partial<{
        label: string
        type: CustomFieldType
        required: boolean
        isActive: boolean
        displayOrder: number
        options: CustomFieldOption[]
        helpText: string | null
      }>
    }) => customFieldsApi.update(id, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['customFields', tenantId] })
    },
    onError: (error: Error) => {
      toast.error('Could not update field', { description: error.message })
    },
  })
}

export function useDeleteCustomField(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => customFieldsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['customFields', tenantId] })
    },
    onError: (error: Error) => {
      toast.error('Could not remove field', { description: error.message })
    },
  })
}

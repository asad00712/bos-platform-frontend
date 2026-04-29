import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'
import { useActiveBranchStore } from '@/stores/activeBranch.store'
import type {
  CustomField,
  CustomFieldEntity,
  CustomFieldOption,
  CustomFieldType,
} from '@/types/crm'

import { customFieldMocks, type CustomFieldInput } from './customFields.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export const customFieldsApi = {
  async list(entity: CustomFieldEntity): Promise<CustomField[]> {
    if (env.useMocks) {
      await delay()
      const branchId = useActiveBranchStore.getState().branchId ?? undefined
      return customFieldMocks.list(entity, branchId)
    }
    const data = await apiRequest<{ data: CustomField[]; total: number }>(
      `/custom-fields?entity=${entity.toUpperCase()}`,
    )
    return data.data
  },

  async create(input: CustomFieldInput): Promise<CustomField> {
    if (env.useMocks) {
      await delay()
      return customFieldMocks.create(input)
    }
    return apiRequest<CustomField>('/custom-fields', {
      method: 'POST',
      body: JSON.stringify({
        ...input,
        type: input.type.toUpperCase(),
        entity: input.entity.toUpperCase(),
      }),
    })
  },

  async update(
    id: string,
    patch: Partial<{
      label: string
      type: CustomFieldType
      required: boolean
      isActive: boolean
      displayOrder: number
      options: CustomFieldOption[]
      helpText: string | null
    }>,
  ): Promise<CustomField> {
    if (env.useMocks) {
      await delay()
      const updated = customFieldMocks.update(id, patch)
      if (!updated) throw new Error('Field not found')
      return updated
    }
    return apiRequest<CustomField>(`/custom-fields/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...patch,
        type: patch.type ? patch.type.toUpperCase() : undefined,
      }),
    })
  },

  async remove(id: string): Promise<void> {
    if (env.useMocks) {
      await delay()
      const ok = customFieldMocks.remove(id)
      if (!ok) throw new Error('Field not found')
      return
    }
    await apiRequest<void>(`/custom-fields/${id}`, { method: 'DELETE' })
  },
}

export type { CustomFieldInput }

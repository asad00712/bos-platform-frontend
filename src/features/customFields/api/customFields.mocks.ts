import type {
  CustomField,
  CustomFieldEntity,
  CustomFieldOption,
  CustomFieldType,
} from '@/types/crm'

const TENANT_BRANCH = 'br-main'

let store: CustomField[] = [
  {
    id: 'cf-insurance',
    branchId: TENANT_BRANCH,
    entity: 'contact',
    key: 'insuranceProvider',
    label: 'Insurance provider',
    type: 'select',
    required: false,
    isActive: true,
    displayOrder: 1,
    options: [
      { value: 'aetna', label: 'Aetna' },
      { value: 'bcbs', label: 'Blue Cross Blue Shield' },
      { value: 'cigna', label: 'Cigna' },
      { value: 'self_pay', label: 'Self-pay' },
    ],
    helpText: null,
    createdAt: new Date(Date.now() - 30 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 86_400_000).toISOString(),
  },
  {
    id: 'cf-allergies',
    branchId: TENANT_BRANCH,
    entity: 'contact',
    key: 'allergies',
    label: 'Allergies',
    type: 'textarea',
    required: false,
    isActive: true,
    displayOrder: 2,
    options: [],
    helpText: 'Anything to flag at intake.',
    createdAt: new Date(Date.now() - 14 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 86_400_000).toISOString(),
  },
  {
    id: 'cf-deal-size',
    branchId: TENANT_BRANCH,
    entity: 'lead',
    key: 'dealSize',
    label: 'Deal size',
    type: 'select',
    required: false,
    isActive: true,
    displayOrder: 1,
    options: [
      { value: 'smb', label: 'SMB' },
      { value: 'mid', label: 'Mid-market' },
      { value: 'enterprise', label: 'Enterprise' },
    ],
    helpText: null,
    createdAt: new Date(Date.now() - 60 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 86_400_000).toISOString(),
  },
  {
    id: 'cf-decision-date',
    branchId: TENANT_BRANCH,
    entity: 'lead',
    key: 'expectedDecisionDate',
    label: 'Expected decision date',
    type: 'date',
    required: false,
    isActive: true,
    displayOrder: 2,
    options: [],
    helpText: null,
    createdAt: new Date(Date.now() - 60 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 86_400_000).toISOString(),
  },
]

export type CustomFieldInput = {
  branchId: string
  entity: CustomFieldEntity
  key: string
  label: string
  type: CustomFieldType
  required?: boolean
  options?: CustomFieldOption[]
  helpText?: string | null
  displayOrder?: number
}

export const customFieldMocks = {
  list(entity: CustomFieldEntity, branchId?: string): CustomField[] {
    return store
      .filter((f) => f.entity === entity && (branchId ? f.branchId === branchId : true))
      .sort((a, b) => a.displayOrder - b.displayOrder)
  },

  create(input: CustomFieldInput): CustomField {
    const now = new Date().toISOString()
    const next: CustomField = {
      id: `cf-${Date.now()}`,
      branchId: input.branchId,
      entity: input.entity,
      key: input.key,
      label: input.label,
      type: input.type,
      required: input.required ?? false,
      isActive: true,
      displayOrder:
        input.displayOrder ??
        store.filter((f) => f.entity === input.entity && f.branchId === input.branchId).length + 1,
      options: input.options ?? [],
      helpText: input.helpText ?? null,
      createdAt: now,
      updatedAt: now,
    }
    store = [...store, next]
    return next
  },

  update(
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
  ): CustomField | null {
    const idx = store.findIndex((f) => f.id === id)
    if (idx < 0) return null
    store[idx] = {
      ...store[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    return store[idx]
  },

  remove(id: string): boolean {
    const before = store.length
    store = store.filter((f) => f.id !== id)
    return store.length < before
  },
}

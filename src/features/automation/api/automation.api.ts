import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'

import {
  runsResponseSchema,
  templatesResponseSchema,
  workflowDetailSchema,
  workflowsResponseSchema,
  type RunsResponse,
  type TemplatesResponse,
  type Workflow,
  type WorkflowDetail,
  type WorkflowFilters,
  type WorkflowInput,
  type WorkflowsResponse,
} from './automation.contracts'
import { automationMocks } from './automation.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export const automationApi = {
  async list(filters: WorkflowFilters): Promise<WorkflowsResponse> {
    if (env.useMocks) {
      await delay()
      return workflowsResponseSchema.parse(automationMocks.list(filters))
    }
    const qs = new URLSearchParams()
    if (filters.search) qs.set('search', filters.search)
    if (filters.status) qs.set('status', filters.status)
    const data = await apiRequest<unknown>(`/automation/workflows?${qs.toString()}`)
    return workflowsResponseSchema.parse(data)
  },

  async get(id: string): Promise<WorkflowDetail> {
    if (env.useMocks) {
      await delay()
      const result = automationMocks.get(id)
      if (!result) throw new Error('Workflow not found')
      return workflowDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/automation/workflows/${id}`)
    return workflowDetailSchema.parse(data)
  },

  async create(input: WorkflowInput): Promise<WorkflowDetail> {
    if (env.useMocks) {
      await delay()
      return workflowDetailSchema.parse(automationMocks.create(input))
    }
    const data = await apiRequest<unknown>('/automation/workflows', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return workflowDetailSchema.parse(data)
  },

  async setStatus(id: string, status: Workflow['status']): Promise<WorkflowDetail> {
    if (env.useMocks) {
      await delay()
      const result = automationMocks.setStatus(id, status)
      if (!result) throw new Error('Workflow not found')
      return workflowDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/automation/workflows/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    })
    return workflowDetailSchema.parse(data)
  },

  async remove(id: string): Promise<void> {
    if (env.useMocks) {
      await delay()
      const ok = automationMocks.remove(id)
      if (!ok) throw new Error('Workflow not found')
      return
    }
    await apiRequest<void>(`/automation/workflows/${id}`, { method: 'DELETE' })
  },

  async runs(workflowId?: string): Promise<RunsResponse> {
    if (env.useMocks) {
      await delay()
      return runsResponseSchema.parse(automationMocks.runs(workflowId))
    }
    const qs = workflowId ? `?workflowId=${encodeURIComponent(workflowId)}` : ''
    const data = await apiRequest<unknown>(`/automation/runs${qs}`)
    return runsResponseSchema.parse(data)
  },

  async templates(): Promise<TemplatesResponse> {
    if (env.useMocks) {
      await delay()
      return templatesResponseSchema.parse(automationMocks.templates())
    }
    const data = await apiRequest<unknown>('/automation/templates')
    return templatesResponseSchema.parse(data)
  },
}

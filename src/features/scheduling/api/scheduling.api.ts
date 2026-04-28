import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'

import {
  appointmentDetailSchema,
  appointmentsResponseSchema,
  resourcesResponseSchema,
  type AppointmentDetail,
  type AppointmentInput,
  type AppointmentsResponse,
  type RangeQuery,
  type ResourcesResponse,
} from './scheduling.contracts'
import { schedulingMocks } from './scheduling.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export const schedulingApi = {
  async list(query: RangeQuery): Promise<AppointmentsResponse> {
    if (env.useMocks) {
      await delay()
      return appointmentsResponseSchema.parse(schedulingMocks.list(query))
    }
    const qs = new URLSearchParams({ from: query.from, to: query.to })
    if (query.resourceId) qs.set('resourceId', query.resourceId)
    if (query.status) qs.set('status', query.status)
    const data = await apiRequest<unknown>(`/scheduling/appointments?${qs.toString()}`)
    return appointmentsResponseSchema.parse(data)
  },

  async resources(): Promise<ResourcesResponse> {
    if (env.useMocks) {
      await delay()
      return resourcesResponseSchema.parse(schedulingMocks.resources())
    }
    const data = await apiRequest<unknown>('/scheduling/resources')
    return resourcesResponseSchema.parse(data)
  },

  async get(id: string): Promise<AppointmentDetail> {
    if (env.useMocks) {
      await delay()
      const result = schedulingMocks.get(id)
      if (!result) throw new Error('Appointment not found')
      return appointmentDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/scheduling/appointments/${id}`)
    return appointmentDetailSchema.parse(data)
  },

  async create(input: AppointmentInput): Promise<AppointmentDetail> {
    if (env.useMocks) {
      await delay()
      return appointmentDetailSchema.parse(schedulingMocks.create(input))
    }
    const data = await apiRequest<unknown>('/scheduling/appointments', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return appointmentDetailSchema.parse(data)
  },

  async update(id: string, patch: Partial<AppointmentInput>): Promise<AppointmentDetail> {
    if (env.useMocks) {
      await delay()
      const result = schedulingMocks.update(id, patch)
      if (!result) throw new Error('Appointment not found')
      return appointmentDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/scheduling/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    return appointmentDetailSchema.parse(data)
  },

  async cancel(id: string, reason: string | null): Promise<AppointmentDetail> {
    if (env.useMocks) {
      await delay()
      const result = schedulingMocks.cancel(id, reason)
      if (!result) throw new Error('Appointment not found')
      return appointmentDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/scheduling/appointments/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
    return appointmentDetailSchema.parse(data)
  },

  async remove(id: string): Promise<void> {
    if (env.useMocks) {
      await delay()
      const ok = schedulingMocks.remove(id)
      if (!ok) throw new Error('Appointment not found')
      return
    }
    await apiRequest<void>(`/scheduling/appointments/${id}`, { method: 'DELETE' })
  },
}

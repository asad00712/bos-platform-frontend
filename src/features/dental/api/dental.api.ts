import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'

import {
  claimsResponseSchema,
  patientDetailSchema,
  patientsResponseSchema,
  procedureCodesResponseSchema,
  providersResponseSchema,
  recallsResponseSchema,
  toothChartSchema,
  treatmentPlanDetailSchema,
  treatmentPlansResponseSchema,
  type ClaimsResponse,
  type PatientDetail,
  type PatientInput,
  type PatientListFilters,
  type PatientsResponse,
  type ProcedureCodesResponse,
  type ProvidersResponse,
  type RecallsResponse,
  type ToothChart,
  type ToothMarkInput,
  type ToothSurface,
  type TreatmentPlanDetail,
  type TreatmentPlansResponse,
} from './dental.contracts'
import { dentalMocks } from './dental.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export const dentalApi = {
  /* patients */
  async list(filters: PatientListFilters): Promise<PatientsResponse> {
    if (env.useMocks) {
      await delay()
      return patientsResponseSchema.parse(dentalMocks.list(filters))
    }
    const qs = new URLSearchParams()
    if (filters.search) qs.set('search', filters.search)
    if (filters.status) qs.set('status', filters.status)
    const data = await apiRequest<unknown>(`/dental/patients?${qs.toString()}`)
    return patientsResponseSchema.parse(data)
  },

  async get(id: string): Promise<PatientDetail> {
    if (env.useMocks) {
      await delay()
      const result = dentalMocks.get(id)
      if (!result) throw new Error('Patient not found')
      return patientDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/dental/patients/${id}`)
    return patientDetailSchema.parse(data)
  },

  async create(input: PatientInput): Promise<PatientDetail> {
    if (env.useMocks) {
      await delay()
      return patientDetailSchema.parse(dentalMocks.create(input))
    }
    const data = await apiRequest<unknown>('/dental/patients', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return patientDetailSchema.parse(data)
  },

  async update(id: string, patch: Partial<PatientInput>): Promise<PatientDetail> {
    if (env.useMocks) {
      await delay()
      const result = dentalMocks.update(id, patch)
      if (!result) throw new Error('Patient not found')
      return patientDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/dental/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    return patientDetailSchema.parse(data)
  },

  /* tooth chart */
  async chart(patientId: string): Promise<ToothChart> {
    if (env.useMocks) {
      await delay()
      const result = dentalMocks.chart(patientId)
      if (!result) throw new Error('Chart not found')
      return toothChartSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/dental/patients/${patientId}/chart`)
    return toothChartSchema.parse(data)
  },

  async addMark(patientId: string, input: ToothMarkInput): Promise<ToothChart> {
    if (env.useMocks) {
      await delay()
      return toothChartSchema.parse(dentalMocks.addMark(patientId, input))
    }
    const data = await apiRequest<unknown>(
      `/dental/patients/${patientId}/chart/marks`,
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    )
    return toothChartSchema.parse(data)
  },

  async removeMarks(
    patientId: string,
    toothNumber: number,
    surface: ToothSurface | null,
  ): Promise<ToothChart> {
    if (env.useMocks) {
      await delay()
      const result = dentalMocks.removeMarks(patientId, toothNumber, surface)
      if (!result) throw new Error('Chart not found')
      return toothChartSchema.parse(result)
    }
    const qs = new URLSearchParams({ toothNumber: String(toothNumber) })
    if (surface) qs.set('surface', surface)
    const data = await apiRequest<unknown>(
      `/dental/patients/${patientId}/chart/marks?${qs.toString()}`,
      { method: 'DELETE' },
    )
    return toothChartSchema.parse(data)
  },

  /* treatment plans */
  async plansForPatient(patientId: string): Promise<TreatmentPlansResponse> {
    if (env.useMocks) {
      await delay()
      return treatmentPlansResponseSchema.parse(
        dentalMocks.plansForPatient(patientId),
      )
    }
    const data = await apiRequest<unknown>(
      `/dental/patients/${patientId}/treatment-plans`,
    )
    return treatmentPlansResponseSchema.parse(data)
  },

  async plan(id: string): Promise<TreatmentPlanDetail> {
    if (env.useMocks) {
      await delay()
      const result = dentalMocks.plan(id)
      if (!result) throw new Error('Plan not found')
      return treatmentPlanDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/dental/treatment-plans/${id}`)
    return treatmentPlanDetailSchema.parse(data)
  },

  /* recalls */
  async recalls(): Promise<RecallsResponse> {
    if (env.useMocks) {
      await delay()
      return recallsResponseSchema.parse(dentalMocks.recalls())
    }
    const data = await apiRequest<unknown>('/dental/recalls')
    return recallsResponseSchema.parse(data)
  },

  /* insurance */
  async providers(): Promise<ProvidersResponse> {
    if (env.useMocks) {
      await delay()
      return providersResponseSchema.parse(dentalMocks.providers())
    }
    const data = await apiRequest<unknown>('/dental/insurance/providers')
    return providersResponseSchema.parse(data)
  },

  async claims(): Promise<ClaimsResponse> {
    if (env.useMocks) {
      await delay()
      return claimsResponseSchema.parse(dentalMocks.claims())
    }
    const data = await apiRequest<unknown>('/dental/insurance/claims')
    return claimsResponseSchema.parse(data)
  },

  async procedureCodes(): Promise<ProcedureCodesResponse> {
    if (env.useMocks) {
      await delay()
      return procedureCodesResponseSchema.parse(dentalMocks.procedureCodes())
    }
    const data = await apiRequest<unknown>('/dental/procedure-codes')
    return procedureCodesResponseSchema.parse(data)
  },
}

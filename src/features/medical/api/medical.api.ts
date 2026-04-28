import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'

import {
  allergiesResponseSchema,
  appointmentsResponseSchema,
  auditEventsResponseSchema,
  carePlansResponseSchema,
  claimsResponseSchema,
  conditionsResponseSchema,
  coveragesResponseSchema,
  diagnosticReportSchema,
  documentsResponseSchema,
  eligibilityResultSchema,
  encounterDetailSchema,
  encounterNoteSchema,
  encountersResponseSchema,
  historyResponseSchema,
  imagingStudiesResponseSchema,
  immunizationsResponseSchema,
  labInboxResponseSchema,
  labReportDetailSchema,
  locationSchema,
  medicalOverviewSchema,
  medicationsResponseSchema,
  patientDetailSchema,
  patientsResponseSchema,
  pharmacySchema,
  practitionerSchema,
  pregnancyDetailSchema,
  psychScalesResponseSchema,
  recallsResponseSchema,
  refillRequestsResponseSchema,
  socialHistorySchema,
  vitalsResponseSchema,
  type Allergy,
  type AllergyInput,
  type AllergiesResponse,
  type AppointmentsResponse,
  type AuditEventsResponse,
  type CarePlansResponse,
  type ClaimsResponse,
  type Condition,
  type ConditionInput,
  type ConditionsResponse,
  type CoveragesResponse,
  type DiagnosticReport,
  type DocumentsResponse,
  type EligibilityResult,
  type EncounterDetail,
  type EncounterNote,
  type EncountersResponse,
  type HistoryResponse,
  type ImagingStudiesResponse,
  type ImmunizationsResponse,
  type LabInboxResponse,
  type LabReportDetail,
  type Location,
  type MedicalOverview,
  type MedicationsResponse,
  type PatientDetail,
  type PatientListFilters,
  type PatientsResponse,
  type Pharmacy,
  type Practitioner,
  type PregnancyDetail,
  type PsychScalesResponse,
  type RecallsResponse,
  type RefillRequestsResponse,
  type SocialHistory,
  type VitalsEntryInput,
  type VitalsResponse,
} from './medical.contracts'
import { z } from 'zod'
import { medicalMocks } from './medical.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

const practitionersSchema = z.array(practitionerSchema)
const locationsSchema = z.array(locationSchema)
const pharmaciesSchema = z.array(pharmacySchema)

export const medicalApi = {
  /* practitioners / locations / pharmacies */
  async practitioners(): Promise<Practitioner[]> {
    if (env.useMocks) {
      await delay()
      return practitionersSchema.parse(medicalMocks.practitioners())
    }
    const data = await apiRequest<unknown>('/medical/practitioners')
    return practitionersSchema.parse(data)
  },
  async locations(): Promise<Location[]> {
    if (env.useMocks) {
      await delay()
      return locationsSchema.parse(medicalMocks.locations())
    }
    const data = await apiRequest<unknown>('/medical/locations')
    return locationsSchema.parse(data)
  },
  async pharmacies(): Promise<Pharmacy[]> {
    if (env.useMocks) {
      await delay()
      return pharmaciesSchema.parse(medicalMocks.pharmacies())
    }
    const data = await apiRequest<unknown>('/medical/pharmacies')
    return pharmaciesSchema.parse(data)
  },

  /* patients */
  async listPatients(filters: PatientListFilters): Promise<PatientsResponse> {
    if (env.useMocks) {
      await delay()
      return patientsResponseSchema.parse(medicalMocks.listPatients(filters))
    }
    const qs = new URLSearchParams()
    if (filters.search) qs.set('search', filters.search)
    if (filters.primaryProviderId) qs.set('primaryProviderId', filters.primaryProviderId)
    if (filters.flag) qs.set('flag', filters.flag)
    const data = await apiRequest<unknown>(`/medical/patients?${qs.toString()}`)
    return patientsResponseSchema.parse(data)
  },
  async getPatient(id: string): Promise<PatientDetail> {
    if (env.useMocks) {
      await delay()
      const result = medicalMocks.getPatient(id)
      if (!result) throw new Error('Patient not found')
      return patientDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/medical/patients/${id}`)
    return patientDetailSchema.parse(data)
  },

  /* allergies */
  async allergies(patientId: string): Promise<AllergiesResponse> {
    if (env.useMocks) {
      await delay()
      return allergiesResponseSchema.parse(medicalMocks.allergiesFor(patientId))
    }
    const data = await apiRequest<unknown>(`/medical/patients/${patientId}/allergies`)
    return allergiesResponseSchema.parse(data)
  },
  async addAllergy(patientId: string, input: AllergyInput): Promise<Allergy> {
    if (env.useMocks) {
      await delay()
      const created = medicalMocks.addAllergy(patientId, input as unknown as Allergy)
      return created
    }
    const data = await apiRequest<unknown>(`/medical/patients/${patientId}/allergies`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return data as Allergy
  },

  /* problems */
  async problems(patientId: string): Promise<ConditionsResponse> {
    if (env.useMocks) {
      await delay()
      return conditionsResponseSchema.parse(medicalMocks.problemsFor(patientId))
    }
    const data = await apiRequest<unknown>(`/medical/patients/${patientId}/problems`)
    return conditionsResponseSchema.parse(data)
  },
  async addProblem(patientId: string, input: ConditionInput): Promise<Condition> {
    if (env.useMocks) {
      await delay()
      return medicalMocks.addProblem(patientId, input as unknown as Condition) as Condition
    }
    const data = await apiRequest<unknown>(`/medical/patients/${patientId}/problems`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return data as Condition
  },

  /* meds + refills */
  async prescribe(input: {
    patientId: string
    encounterId: string | null
    medication: import('./medical.contracts').CodeableConcept
    strengthLabel: string
    dosage: import('./medical.contracts').MedicationRequest['dosage']
    quantity: number
    quantityUnit: string
    daysSupply: number | null
    refillsAuthorized: number
    substitutionAllowed: boolean
    pharmacyId: string | null
    controlled: boolean
    controlledSchedule: import('./medical.contracts').MedicationRequest['controlledSchedule']
    notes: string | null
  }): Promise<import('./medical.contracts').MedicationRequest> {
    if (env.useMocks) {
      await delay()
      return medicalMocks.prescribe(input)
    }
    const data = await apiRequest<unknown>(`/medical/patients/${input.patientId}/prescriptions`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return data as import('./medical.contracts').MedicationRequest
  },
  async discontinueRx(
    id: string,
    status: 'stopped' | 'on_hold' | 'completed' | 'cancelled',
  ): Promise<import('./medical.contracts').MedicationRequest> {
    if (env.useMocks) {
      await delay()
      const result = medicalMocks.discontinueRx(id, status)
      if (!result) throw new Error('Prescription not found')
      return result
    }
    const data = await apiRequest<unknown>(`/medical/rx/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    return data as import('./medical.contracts').MedicationRequest
  },
  async medications(patientId: string): Promise<MedicationsResponse> {
    if (env.useMocks) {
      await delay()
      return medicationsResponseSchema.parse(medicalMocks.medicationsFor(patientId))
    }
    const data = await apiRequest<unknown>(`/medical/patients/${patientId}/medications`)
    return medicationsResponseSchema.parse(data)
  },
  async refillRequests(): Promise<RefillRequestsResponse> {
    if (env.useMocks) {
      await delay()
      return refillRequestsResponseSchema.parse(medicalMocks.refillRequests())
    }
    const data = await apiRequest<unknown>('/medical/rx/refills')
    return refillRequestsResponseSchema.parse(data)
  },
  async approveRefill(id: string): Promise<RefillRequestsResponse> {
    if (env.useMocks) {
      await delay()
      return refillRequestsResponseSchema.parse(medicalMocks.approveRefill(id))
    }
    const data = await apiRequest<unknown>(`/medical/rx/refills/${id}/approve`, { method: 'POST' })
    return refillRequestsResponseSchema.parse(data)
  },
  async denyRefill(id: string): Promise<RefillRequestsResponse> {
    if (env.useMocks) {
      await delay()
      return refillRequestsResponseSchema.parse(medicalMocks.denyRefill(id))
    }
    const data = await apiRequest<unknown>(`/medical/rx/refills/${id}/deny`, { method: 'POST' })
    return refillRequestsResponseSchema.parse(data)
  },

  /* immunizations */
  async immunizations(patientId: string): Promise<ImmunizationsResponse> {
    if (env.useMocks) {
      await delay()
      return immunizationsResponseSchema.parse(medicalMocks.immunizationsFor(patientId))
    }
    const data = await apiRequest<unknown>(`/medical/patients/${patientId}/immunizations`)
    return immunizationsResponseSchema.parse(data)
  },

  /* vitals */
  async vitals(patientId: string): Promise<VitalsResponse> {
    if (env.useMocks) {
      await delay()
      return vitalsResponseSchema.parse(medicalMocks.vitalsFor(patientId))
    }
    const data = await apiRequest<unknown>(`/medical/patients/${patientId}/vitals`)
    return vitalsResponseSchema.parse(data)
  },
  async recordVitals(input: VitalsEntryInput): Promise<VitalsResponse> {
    if (env.useMocks) {
      await delay()
      return vitalsResponseSchema.parse(medicalMocks.recordVitals(input))
    }
    const data = await apiRequest<unknown>(`/medical/patients/${input.patientId}/vitals`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return vitalsResponseSchema.parse(data)
  },

  /* labs + imaging */
  async labInbox(): Promise<LabInboxResponse> {
    if (env.useMocks) {
      await delay()
      return labInboxResponseSchema.parse(medicalMocks.labInbox())
    }
    const data = await apiRequest<unknown>('/medical/labs/inbox')
    return labInboxResponseSchema.parse(data)
  },
  async labReport(reportId: string): Promise<LabReportDetail> {
    if (env.useMocks) {
      await delay()
      const r = medicalMocks.labReportDetail(reportId)
      if (!r) throw new Error('Report not found')
      return labReportDetailSchema.parse(r)
    }
    const data = await apiRequest<unknown>(`/medical/labs/reports/${reportId}`)
    return labReportDetailSchema.parse(data)
  },
  async signLabReport(reportId: string): Promise<DiagnosticReport> {
    if (env.useMocks) {
      await delay()
      const r = medicalMocks.signLabReport(reportId)
      if (!r) throw new Error('Report not found')
      return diagnosticReportSchema.parse(r)
    }
    const data = await apiRequest<unknown>(`/medical/labs/reports/${reportId}/sign`, {
      method: 'POST',
    })
    return diagnosticReportSchema.parse(data)
  },
  async notifyPatientForReport(reportId: string): Promise<DiagnosticReport> {
    if (env.useMocks) {
      await delay()
      const r = medicalMocks.notifyPatientForReport(reportId)
      if (!r) throw new Error('Report not found')
      return diagnosticReportSchema.parse(r)
    }
    const data = await apiRequest<unknown>(`/medical/labs/reports/${reportId}/notify`, {
      method: 'POST',
    })
    return diagnosticReportSchema.parse(data)
  },
  async imaging(patientId: string): Promise<ImagingStudiesResponse> {
    if (env.useMocks) {
      await delay()
      return imagingStudiesResponseSchema.parse(medicalMocks.imagingFor(patientId))
    }
    const data = await apiRequest<unknown>(`/medical/patients/${patientId}/imaging`)
    return imagingStudiesResponseSchema.parse(data)
  },

  /* encounters */
  async encounters(patientId: string): Promise<EncountersResponse> {
    if (env.useMocks) {
      await delay()
      return encountersResponseSchema.parse(medicalMocks.encountersFor(patientId))
    }
    const data = await apiRequest<unknown>(`/medical/patients/${patientId}/encounters`)
    return encountersResponseSchema.parse(data)
  },
  async encounterDetail(id: string): Promise<EncounterDetail> {
    if (env.useMocks) {
      await delay()
      const r = medicalMocks.encounterDetail(id)
      if (!r) throw new Error('Encounter not found')
      return encounterDetailSchema.parse(r)
    }
    const data = await apiRequest<unknown>(`/medical/encounters/${id}`)
    return encounterDetailSchema.parse(data)
  },
  async saveNoteDraft(encounterId: string, soap: EncounterNote['soap']): Promise<EncounterNote> {
    if (env.useMocks) {
      await delay()
      return encounterNoteSchema.parse(medicalMocks.saveNoteDraft(encounterId, soap))
    }
    const data = await apiRequest<unknown>(`/medical/encounters/${encounterId}/note/draft`, {
      method: 'PUT',
      body: JSON.stringify({ soap }),
    })
    return encounterNoteSchema.parse(data)
  },
  async signNote(encounterId: string, signerId: string): Promise<EncounterNote> {
    if (env.useMocks) {
      await delay()
      return encounterNoteSchema.parse(medicalMocks.signNote(encounterId, signerId))
    }
    const data = await apiRequest<unknown>(`/medical/encounters/${encounterId}/note/sign`, {
      method: 'POST',
      body: JSON.stringify({ signerId }),
    })
    return encounterNoteSchema.parse(data)
  },
  async addAddendum(encounterId: string, authorId: string, text: string): Promise<EncounterNote> {
    if (env.useMocks) {
      await delay()
      return encounterNoteSchema.parse(medicalMocks.addAddendum(encounterId, authorId, text))
    }
    const data = await apiRequest<unknown>(`/medical/encounters/${encounterId}/note/addendum`, {
      method: 'POST',
      body: JSON.stringify({ authorId, text }),
    })
    return encounterNoteSchema.parse(data)
  },

  /* OB */
  async pregnancy(patientId: string): Promise<PregnancyDetail | null> {
    if (env.useMocks) {
      await delay()
      const r = medicalMocks.pregnancyFor(patientId)
      return r ? pregnancyDetailSchema.parse(r) : null
    }
    const data = await apiRequest<unknown>(`/medical/patients/${patientId}/pregnancy`)
    return data ? pregnancyDetailSchema.parse(data) : null
  },

  /* psych */
  async psychScales(patientId: string): Promise<PsychScalesResponse> {
    if (env.useMocks) {
      await delay()
      return psychScalesResponseSchema.parse(medicalMocks.psychScalesFor(patientId))
    }
    const data = await apiRequest<unknown>(`/medical/patients/${patientId}/psych-scales`)
    return psychScalesResponseSchema.parse(data)
  },

  /* care plans */
  async carePlans(patientId: string): Promise<CarePlansResponse> {
    if (env.useMocks) {
      await delay()
      return carePlansResponseSchema.parse(medicalMocks.carePlansFor(patientId))
    }
    const data = await apiRequest<unknown>(`/medical/patients/${patientId}/care-plans`)
    return carePlansResponseSchema.parse(data)
  },

  /* scheduling */
  async appointments(): Promise<AppointmentsResponse> {
    if (env.useMocks) {
      await delay()
      return appointmentsResponseSchema.parse(medicalMocks.appointments())
    }
    const data = await apiRequest<unknown>('/medical/appointments')
    return appointmentsResponseSchema.parse(data)
  },
  async recalls(): Promise<RecallsResponse> {
    if (env.useMocks) {
      await delay()
      return recallsResponseSchema.parse(medicalMocks.recalls())
    }
    const data = await apiRequest<unknown>('/medical/recalls')
    return recallsResponseSchema.parse(data)
  },
  async setAppointmentStage(
    id: string,
    stage:
      | 'scheduled'
      | 'arrived'
      | 'roomed'
      | 'with_provider'
      | 'checkout'
      | 'departed'
      | 'noshow',
  ): Promise<AppointmentsResponse> {
    if (env.useMocks) {
      await delay()
      medicalMocks.setAppointmentStage(id, stage)
      return appointmentsResponseSchema.parse(medicalMocks.appointments())
    }
    const data = await apiRequest<unknown>(`/medical/appointments/${id}/stage`, {
      method: 'POST',
      body: JSON.stringify({ stage }),
    })
    return appointmentsResponseSchema.parse(data)
  },

  /* eligibility + claims */
  async coverages(patientId: string): Promise<CoveragesResponse> {
    if (env.useMocks) {
      await delay()
      return coveragesResponseSchema.parse(medicalMocks.coveragesFor(patientId))
    }
    const data = await apiRequest<unknown>(`/medical/patients/${patientId}/coverages`)
    return coveragesResponseSchema.parse(data)
  },
  async runEligibility(coverageId: string): Promise<EligibilityResult> {
    if (env.useMocks) {
      await delay()
      return eligibilityResultSchema.parse(medicalMocks.runEligibility(coverageId))
    }
    const data = await apiRequest<unknown>(`/medical/coverages/${coverageId}/eligibility`, {
      method: 'POST',
    })
    return eligibilityResultSchema.parse(data)
  },
  async claims(): Promise<ClaimsResponse> {
    if (env.useMocks) {
      await delay()
      return claimsResponseSchema.parse(medicalMocks.claims())
    }
    const data = await apiRequest<unknown>('/medical/claims')
    return claimsResponseSchema.parse(data)
  },

  /* documents + history + audit */
  async documents(patientId: string): Promise<DocumentsResponse> {
    if (env.useMocks) {
      await delay()
      return documentsResponseSchema.parse(medicalMocks.documentsFor(patientId))
    }
    const data = await apiRequest<unknown>(`/medical/patients/${patientId}/documents`)
    return documentsResponseSchema.parse(data)
  },
  async history(patientId: string): Promise<HistoryResponse> {
    if (env.useMocks) {
      await delay()
      return historyResponseSchema.parse(medicalMocks.historyFor(patientId))
    }
    const data = await apiRequest<unknown>(`/medical/patients/${patientId}/history`)
    return historyResponseSchema.parse(data)
  },
  async saveSocialHistory(input: SocialHistory): Promise<SocialHistory> {
    if (env.useMocks) {
      await delay()
      return socialHistorySchema.parse(medicalMocks.saveSocialHistory(input))
    }
    const data = await apiRequest<unknown>(`/medical/patients/${input.patientId}/history/social`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
    return socialHistorySchema.parse(data)
  },
  async auditEvents(filterPatientId?: string): Promise<AuditEventsResponse> {
    if (env.useMocks) {
      await delay()
      return auditEventsResponseSchema.parse(medicalMocks.auditEvents(filterPatientId))
    }
    const qs = filterPatientId ? `?patientId=${filterPatientId}` : ''
    const data = await apiRequest<unknown>(`/medical/audit${qs}`)
    return auditEventsResponseSchema.parse(data)
  },

  /* overview */
  async overview(): Promise<MedicalOverview> {
    if (env.useMocks) {
      await delay()
      return medicalOverviewSchema.parse(medicalMocks.overview())
    }
    const data = await apiRequest<unknown>('/medical/overview')
    return medicalOverviewSchema.parse(data)
  },
}

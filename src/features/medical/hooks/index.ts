import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { medicalApi } from '../api/medical.api'
import type {
  AllergyInput,
  CodeableConcept,
  ConditionInput,
  EncounterNote,
  MedicationRequest,
  PatientListFilters,
  SocialHistory,
  VitalsEntryInput,
} from '../api/medical.contracts'

type Stage =
  | 'scheduled'
  | 'arrived'
  | 'roomed'
  | 'with_provider'
  | 'checkout'
  | 'departed'
  | 'noshow'

export const medKeys = {
  practitioners: (tenantId: string) => ['medical.practitioners', tenantId] as const,
  locations: (tenantId: string) => ['medical.locations', tenantId] as const,
  pharmacies: (tenantId: string) => ['medical.pharmacies', tenantId] as const,

  patients: (tenantId: string, filters: PatientListFilters) =>
    ['medical.patients', tenantId, filters] as const,
  patient: (tenantId: string, id: string) => ['medical.patient', tenantId, id] as const,

  allergies: (tenantId: string, patientId: string) =>
    ['medical.allergies', tenantId, patientId] as const,
  problems: (tenantId: string, patientId: string) =>
    ['medical.problems', tenantId, patientId] as const,
  medications: (tenantId: string, patientId: string) =>
    ['medical.medications', tenantId, patientId] as const,
  refillRequests: (tenantId: string) => ['medical.refills', tenantId] as const,
  immunizations: (tenantId: string, patientId: string) =>
    ['medical.immunizations', tenantId, patientId] as const,
  vitals: (tenantId: string, patientId: string) =>
    ['medical.vitals', tenantId, patientId] as const,

  labInbox: (tenantId: string) => ['medical.labs.inbox', tenantId] as const,
  labReport: (tenantId: string, id: string) => ['medical.labs.report', tenantId, id] as const,
  imaging: (tenantId: string, patientId: string) =>
    ['medical.imaging', tenantId, patientId] as const,

  encounters: (tenantId: string, patientId: string) =>
    ['medical.encounters', tenantId, patientId] as const,
  encounterDetail: (tenantId: string, id: string) =>
    ['medical.encounter', tenantId, id] as const,

  pregnancy: (tenantId: string, patientId: string) =>
    ['medical.pregnancy', tenantId, patientId] as const,
  psychScales: (tenantId: string, patientId: string) =>
    ['medical.psychScales', tenantId, patientId] as const,
  carePlans: (tenantId: string, patientId: string) =>
    ['medical.carePlans', tenantId, patientId] as const,

  appointments: (tenantId: string) => ['medical.appointments', tenantId] as const,
  recalls: (tenantId: string) => ['medical.recalls', tenantId] as const,

  coverages: (tenantId: string, patientId: string) =>
    ['medical.coverages', tenantId, patientId] as const,
  claims: (tenantId: string) => ['medical.claims', tenantId] as const,

  documents: (tenantId: string, patientId: string) =>
    ['medical.documents', tenantId, patientId] as const,
  history: (tenantId: string, patientId: string) =>
    ['medical.history', tenantId, patientId] as const,
  audit: (tenantId: string, patientId?: string) =>
    ['medical.audit', tenantId, patientId ?? 'all'] as const,

  overview: (tenantId: string) => ['medical.overview', tenantId] as const,
}

const STALE = {
  short: 30_000,
  medium: 60_000,
  long: 5 * 60_000,
}

/* practitioners / locations / pharmacies */
export function usePractitioners(tenantId: string) {
  return useQuery({
    queryKey: medKeys.practitioners(tenantId),
    queryFn: medicalApi.practitioners,
    staleTime: STALE.long,
  })
}
export function useLocations(tenantId: string) {
  return useQuery({
    queryKey: medKeys.locations(tenantId),
    queryFn: medicalApi.locations,
    staleTime: STALE.long,
  })
}
export function usePharmacies(tenantId: string) {
  return useQuery({
    queryKey: medKeys.pharmacies(tenantId),
    queryFn: medicalApi.pharmacies,
    staleTime: STALE.long,
  })
}

/* patients */
export function usePatientList(tenantId: string, filters: PatientListFilters) {
  return useQuery({
    queryKey: medKeys.patients(tenantId, filters),
    queryFn: () => medicalApi.listPatients(filters),
    staleTime: STALE.short,
  })
}
export function usePatient(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: medKeys.patient(tenantId, id ?? ''),
    queryFn: () => medicalApi.getPatient(id!),
    enabled: Boolean(id),
    staleTime: STALE.short,
  })
}

/* allergies */
export function useAllergies(tenantId: string, patientId: string | undefined) {
  return useQuery({
    queryKey: medKeys.allergies(tenantId, patientId ?? ''),
    queryFn: () => medicalApi.allergies(patientId!),
    enabled: Boolean(patientId),
    staleTime: STALE.short,
  })
}
export function useAddAllergy(tenantId: string, patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AllergyInput) => medicalApi.addAllergy(patientId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: medKeys.allergies(tenantId, patientId) })
      void qc.invalidateQueries({ queryKey: medKeys.patient(tenantId, patientId) })
      toast.success('Allergy recorded')
    },
    onError: (e: Error) => toast.error('Could not save', { description: e.message }),
  })
}

/* problems */
export function useProblems(tenantId: string, patientId: string | undefined) {
  return useQuery({
    queryKey: medKeys.problems(tenantId, patientId ?? ''),
    queryFn: () => medicalApi.problems(patientId!),
    enabled: Boolean(patientId),
    staleTime: STALE.short,
  })
}
export function useAddProblem(tenantId: string, patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ConditionInput) => medicalApi.addProblem(patientId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: medKeys.problems(tenantId, patientId) })
      void qc.invalidateQueries({ queryKey: medKeys.patient(tenantId, patientId) })
      toast.success('Problem added')
    },
    onError: (e: Error) => toast.error('Could not save', { description: e.message }),
  })
}

/* meds + refills */
export function useMedications(tenantId: string, patientId: string | undefined) {
  return useQuery({
    queryKey: medKeys.medications(tenantId, patientId ?? ''),
    queryFn: () => medicalApi.medications(patientId!),
    enabled: Boolean(patientId),
    staleTime: STALE.short,
  })
}
export function usePrescribe(tenantId: string, patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      encounterId: string | null
      medication: CodeableConcept
      strengthLabel: string
      dosage: MedicationRequest['dosage']
      quantity: number
      quantityUnit: string
      daysSupply: number | null
      refillsAuthorized: number
      substitutionAllowed: boolean
      pharmacyId: string | null
      controlled: boolean
      controlledSchedule: MedicationRequest['controlledSchedule']
      notes: string | null
    }) =>
      medicalApi.prescribe({ ...input, patientId }),
    onSuccess: (rx) => {
      void qc.invalidateQueries({ queryKey: medKeys.medications(tenantId, patientId) })
      void qc.invalidateQueries({ queryKey: medKeys.patient(tenantId, patientId) })
      toast.success('Prescription sent', {
        description: `${rx.medication.display} ${rx.strengthLabel}`,
      })
    },
    onError: (e: Error) => toast.error('Could not send prescription', { description: e.message }),
  })
}

export function useDiscontinueRx(tenantId: string, patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'stopped' | 'on_hold' | 'completed' | 'cancelled' }) =>
      medicalApi.discontinueRx(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: medKeys.medications(tenantId, patientId) })
      void qc.invalidateQueries({ queryKey: medKeys.patient(tenantId, patientId) })
      toast.success('Prescription updated')
    },
    onError: (e: Error) => toast.error('Could not update', { description: e.message }),
  })
}

export function useRefillRequests(tenantId: string) {
  return useQuery({
    queryKey: medKeys.refillRequests(tenantId),
    queryFn: medicalApi.refillRequests,
    staleTime: STALE.short,
  })
}
export function useApproveRefill(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => medicalApi.approveRefill(id),
    onSuccess: (data) => {
      qc.setQueryData(medKeys.refillRequests(tenantId), data)
      toast.success('Refill approved')
    },
    onError: (e: Error) => toast.error('Could not approve', { description: e.message }),
  })
}
export function useDenyRefill(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => medicalApi.denyRefill(id),
    onSuccess: (data) => {
      qc.setQueryData(medKeys.refillRequests(tenantId), data)
      toast.success('Refill denied')
    },
    onError: (e: Error) => toast.error('Could not deny', { description: e.message }),
  })
}

/* immunizations */
export function useImmunizations(tenantId: string, patientId: string | undefined) {
  return useQuery({
    queryKey: medKeys.immunizations(tenantId, patientId ?? ''),
    queryFn: () => medicalApi.immunizations(patientId!),
    enabled: Boolean(patientId),
    staleTime: STALE.medium,
  })
}

/* vitals */
export function useVitals(tenantId: string, patientId: string | undefined) {
  return useQuery({
    queryKey: medKeys.vitals(tenantId, patientId ?? ''),
    queryFn: () => medicalApi.vitals(patientId!),
    enabled: Boolean(patientId),
    staleTime: STALE.short,
  })
}
export function useRecordVitals(tenantId: string, patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: VitalsEntryInput) => medicalApi.recordVitals(input),
    onSuccess: (data) => {
      qc.setQueryData(medKeys.vitals(tenantId, patientId), data)
      void qc.invalidateQueries({ queryKey: medKeys.patient(tenantId, patientId) })
      toast.success('Vitals recorded')
    },
    onError: (e: Error) => toast.error('Could not record', { description: e.message }),
  })
}

/* labs + imaging */
export function useLabInbox(tenantId: string) {
  return useQuery({
    queryKey: medKeys.labInbox(tenantId),
    queryFn: medicalApi.labInbox,
    staleTime: STALE.short,
  })
}
export function useLabReport(tenantId: string, reportId: string | undefined) {
  return useQuery({
    queryKey: medKeys.labReport(tenantId, reportId ?? ''),
    queryFn: () => medicalApi.labReport(reportId!),
    enabled: Boolean(reportId),
    staleTime: STALE.short,
  })
}
export function useSignLabReport(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reportId: string) => medicalApi.signLabReport(reportId),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: medKeys.labInbox(tenantId) })
      void qc.invalidateQueries({ queryKey: medKeys.labReport(tenantId, data.id) })
      toast.success('Result signed')
    },
    onError: (e: Error) => toast.error('Could not sign', { description: e.message }),
  })
}
export function useNotifyPatientForReport(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reportId: string) => medicalApi.notifyPatientForReport(reportId),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: medKeys.labInbox(tenantId) })
      void qc.invalidateQueries({ queryKey: medKeys.labReport(tenantId, data.id) })
      toast.success('Patient notified')
    },
    onError: (e: Error) => toast.error('Could not record notification', { description: e.message }),
  })
}
export function useImaging(tenantId: string, patientId: string | undefined) {
  return useQuery({
    queryKey: medKeys.imaging(tenantId, patientId ?? ''),
    queryFn: () => medicalApi.imaging(patientId!),
    enabled: Boolean(patientId),
    staleTime: STALE.medium,
  })
}

/* encounters */
export function useEncounters(tenantId: string, patientId: string | undefined) {
  return useQuery({
    queryKey: medKeys.encounters(tenantId, patientId ?? ''),
    queryFn: () => medicalApi.encounters(patientId!),
    enabled: Boolean(patientId),
    staleTime: STALE.short,
  })
}
export function useEncounter(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: medKeys.encounterDetail(tenantId, id ?? ''),
    queryFn: () => medicalApi.encounterDetail(id!),
    enabled: Boolean(id),
    staleTime: STALE.short,
  })
}
export function useSaveNoteDraft(tenantId: string, encounterId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (soap: EncounterNote['soap']) => medicalApi.saveNoteDraft(encounterId, soap),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: medKeys.encounterDetail(tenantId, encounterId) })
    },
    onError: (e: Error) => toast.error('Draft save failed', { description: e.message }),
  })
}
export function useSignNote(tenantId: string, encounterId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (signerId: string) => medicalApi.signNote(encounterId, signerId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: medKeys.encounterDetail(tenantId, encounterId) })
      toast.success('Note signed')
    },
    onError: (e: Error) => toast.error('Could not sign', { description: e.message }),
  })
}
export function useAddAddendum(tenantId: string, encounterId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ authorId, text }: { authorId: string; text: string }) =>
      medicalApi.addAddendum(encounterId, authorId, text),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: medKeys.encounterDetail(tenantId, encounterId) })
      toast.success('Addendum added')
    },
    onError: (e: Error) => toast.error('Could not add addendum', { description: e.message }),
  })
}

/* OB / psych / care plans */
export function usePregnancy(tenantId: string, patientId: string | undefined) {
  return useQuery({
    queryKey: medKeys.pregnancy(tenantId, patientId ?? ''),
    queryFn: () => medicalApi.pregnancy(patientId!),
    enabled: Boolean(patientId),
    staleTime: STALE.short,
  })
}
export function usePsychScales(tenantId: string, patientId: string | undefined) {
  return useQuery({
    queryKey: medKeys.psychScales(tenantId, patientId ?? ''),
    queryFn: () => medicalApi.psychScales(patientId!),
    enabled: Boolean(patientId),
    staleTime: STALE.medium,
  })
}
export function useCarePlans(tenantId: string, patientId: string | undefined) {
  return useQuery({
    queryKey: medKeys.carePlans(tenantId, patientId ?? ''),
    queryFn: () => medicalApi.carePlans(patientId!),
    enabled: Boolean(patientId),
    staleTime: STALE.medium,
  })
}

/* scheduling */
export function useAppointments(tenantId: string) {
  return useQuery({
    queryKey: medKeys.appointments(tenantId),
    queryFn: medicalApi.appointments,
    staleTime: STALE.short,
  })
}
export function useRecalls(tenantId: string) {
  return useQuery({
    queryKey: medKeys.recalls(tenantId),
    queryFn: medicalApi.recalls,
    staleTime: STALE.medium,
  })
}
export function useSetAppointmentStage(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: Stage }) =>
      medicalApi.setAppointmentStage(id, stage),
    onSuccess: (data) => {
      qc.setQueryData(medKeys.appointments(tenantId), data)
    },
    onError: (e: Error) => toast.error('Could not update', { description: e.message }),
  })
}

/* eligibility + claims */
export function useCoverages(tenantId: string, patientId: string | undefined) {
  return useQuery({
    queryKey: medKeys.coverages(tenantId, patientId ?? ''),
    queryFn: () => medicalApi.coverages(patientId!),
    enabled: Boolean(patientId),
    staleTime: STALE.medium,
  })
}
export function useRunEligibility() {
  return useMutation({
    mutationFn: (coverageId: string) => medicalApi.runEligibility(coverageId),
    onError: (e: Error) => toast.error('Eligibility check failed', { description: e.message }),
  })
}
export function useClaims(tenantId: string) {
  return useQuery({
    queryKey: medKeys.claims(tenantId),
    queryFn: medicalApi.claims,
    staleTime: STALE.medium,
  })
}

/* documents + history + audit */
export function useDocuments(tenantId: string, patientId: string | undefined) {
  return useQuery({
    queryKey: medKeys.documents(tenantId, patientId ?? ''),
    queryFn: () => medicalApi.documents(patientId!),
    enabled: Boolean(patientId),
    staleTime: STALE.medium,
  })
}
export function useHistory(tenantId: string, patientId: string | undefined) {
  return useQuery({
    queryKey: medKeys.history(tenantId, patientId ?? ''),
    queryFn: () => medicalApi.history(patientId!),
    enabled: Boolean(patientId),
    staleTime: STALE.medium,
  })
}
export function useSaveSocialHistory(tenantId: string, patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SocialHistory) => medicalApi.saveSocialHistory(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: medKeys.history(tenantId, patientId) })
      toast.success('Social history saved')
    },
    onError: (e: Error) => toast.error('Could not save', { description: e.message }),
  })
}
export function useAuditEvents(tenantId: string, patientId?: string) {
  return useQuery({
    queryKey: medKeys.audit(tenantId, patientId),
    queryFn: () => medicalApi.auditEvents(patientId),
    staleTime: STALE.medium,
  })
}

/* overview */
export function useMedicalOverview(tenantId: string) {
  return useQuery({
    queryKey: medKeys.overview(tenantId),
    queryFn: medicalApi.overview,
    staleTime: STALE.short,
  })
}

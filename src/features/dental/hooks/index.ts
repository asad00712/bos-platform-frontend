import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { dentalApi } from '../api/dental.api'
import type {
  PatientInput,
  PatientListFilters,
  ToothMarkInput,
  ToothSurface,
} from '../api/dental.contracts'

export const dentalKeys = {
  patients: (tenantId: string, filters: PatientListFilters) =>
    ['dental.patients', tenantId, filters] as const,
  patient: (tenantId: string, id: string) =>
    ['dental.patient', tenantId, id] as const,
  chart: (tenantId: string, id: string) =>
    ['dental.chart', tenantId, id] as const,
  plansForPatient: (tenantId: string, id: string) =>
    ['dental.plans', tenantId, id] as const,
  plan: (tenantId: string, id: string) =>
    ['dental.plan', tenantId, id] as const,
  recalls: (tenantId: string) => ['dental.recalls', tenantId] as const,
  providers: (tenantId: string) => ['dental.providers', tenantId] as const,
  claims: (tenantId: string) => ['dental.claims', tenantId] as const,
  procedureCodes: (tenantId: string) => ['dental.procedureCodes', tenantId] as const,
}

export function usePatientList(tenantId: string, filters: PatientListFilters) {
  return useQuery({
    queryKey: dentalKeys.patients(tenantId, filters),
    queryFn: () => dentalApi.list(filters),
    staleTime: 30_000,
  })
}

export function usePatient(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: dentalKeys.patient(tenantId, id ?? ''),
    queryFn: () => dentalApi.get(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

export function useToothChart(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: dentalKeys.chart(tenantId, id ?? ''),
    queryFn: () => dentalApi.chart(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

export function usePatientPlans(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: dentalKeys.plansForPatient(tenantId, id ?? ''),
    queryFn: () => dentalApi.plansForPatient(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

export function useTreatmentPlan(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: dentalKeys.plan(tenantId, id ?? ''),
    queryFn: () => dentalApi.plan(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

export function useRecallsList(tenantId: string) {
  return useQuery({
    queryKey: dentalKeys.recalls(tenantId),
    queryFn: dentalApi.recalls,
    staleTime: 60_000,
  })
}

export function useInsuranceProviders(tenantId: string) {
  return useQuery({
    queryKey: dentalKeys.providers(tenantId),
    queryFn: dentalApi.providers,
    staleTime: 5 * 60_000,
  })
}

export function useClaimsList(tenantId: string) {
  return useQuery({
    queryKey: dentalKeys.claims(tenantId),
    queryFn: dentalApi.claims,
    staleTime: 60_000,
  })
}

export function useProcedureCodes(tenantId: string) {
  return useQuery({
    queryKey: dentalKeys.procedureCodes(tenantId),
    queryFn: dentalApi.procedureCodes,
    staleTime: 24 * 60 * 60_000,
  })
}

export function useCreatePatient(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: PatientInput) => dentalApi.create(input),
    onSuccess: (created) => {
      void qc.invalidateQueries({ queryKey: ['dental.patients', tenantId] })
      toast.success('Patient added', {
        description: `${created.firstName} ${created.lastName}`,
      })
    },
    onError: (error: Error) => {
      toast.error('Could not add patient', { description: error.message })
    },
  })
}

export function useUpdatePatient(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<PatientInput> }) =>
      dentalApi.update(id, patch),
    onSuccess: (updated) => {
      void qc.invalidateQueries({ queryKey: ['dental.patients', tenantId] })
      void qc.invalidateQueries({
        queryKey: dentalKeys.patient(tenantId, updated.id),
      })
    },
    onError: (error: Error) => {
      toast.error('Could not update', { description: error.message })
    },
  })
}

export function useAddToothMark(tenantId: string, patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ToothMarkInput) =>
      dentalApi.addMark(patientId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: dentalKeys.chart(tenantId, patientId) })
    },
    onError: (error: Error) => {
      toast.error('Could not mark tooth', { description: error.message })
    },
  })
}

export function useRemoveToothMarks(tenantId: string, patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      toothNumber,
      surface,
    }: {
      toothNumber: number
      surface: ToothSurface | null
    }) => dentalApi.removeMarks(patientId, toothNumber, surface),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: dentalKeys.chart(tenantId, patientId) })
    },
  })
}

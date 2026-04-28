import { z } from 'zod'

/* -------------------- enums -------------------- */

export const patientStatusSchema = z.enum([
  'active',
  'recall_due',
  'inactive',
  'archived',
])
export type PatientStatus = z.infer<typeof patientStatusSchema>

export const toothSurfaceSchema = z.enum([
  'mesial',
  'distal',
  'occlusal',
  'buccal',
  'lingual',
])
export type ToothSurface = z.infer<typeof toothSurfaceSchema>

export const toothConditionKindSchema = z.enum([
  'healthy',
  'caries',
  'restoration',
  'crown',
  'root_canal',
  'extraction',
  'implant',
  'watch',
])
export type ToothConditionKind = z.infer<typeof toothConditionKindSchema>

export const procedureStatusSchema = z.enum([
  'planned',
  'in_progress',
  'completed',
  'cancelled',
])
export type ProcedureStatus = z.infer<typeof procedureStatusSchema>

export const treatmentPlanStatusSchema = z.enum([
  'draft',
  'proposed',
  'accepted',
  'in_progress',
  'completed',
  'declined',
])
export type TreatmentPlanStatus = z.infer<typeof treatmentPlanStatusSchema>

export const claimStatusSchema = z.enum([
  'draft',
  'submitted',
  'approved',
  'partial',
  'denied',
  'paid',
])
export type ClaimStatus = z.infer<typeof claimStatusSchema>

export const recallReasonSchema = z.enum([
  'cleaning',
  'checkup',
  'treatment_followup',
  'imaging',
])
export type RecallReason = z.infer<typeof recallReasonSchema>

/* -------------------- patient -------------------- */

export const patientSchema = z.object({
  id: z.string(),
  /** Patient chart number (e.g. P-1024). */
  chartNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  status: patientStatusSchema,
  insurer: z.string().nullable(),
  primaryDentistName: z.string().nullable(),
  lastVisitAt: z.string().nullable(),
  nextVisitAt: z.string().nullable(),
  recallDueAt: z.string().nullable(),
  outstandingBalance: z.number(),
  currency: z.string(),
})
export type Patient = z.infer<typeof patientSchema>

export const patientDetailSchema = patientSchema.extend({
  allergies: z.array(z.string()),
  conditions: z.array(z.string()),
  medications: z.array(z.string()),
  notes: z.string().nullable(),
})
export type PatientDetail = z.infer<typeof patientDetailSchema>

export const patientListFiltersSchema = z.object({
  search: z.string().optional(),
  status: patientStatusSchema.optional(),
})
export type PatientListFilters = z.infer<typeof patientListFiltersSchema>

export const patientsResponseSchema = z.object({
  items: z.array(patientSchema),
  total: z.number(),
})
export type PatientsResponse = z.infer<typeof patientsResponseSchema>

export const patientInputSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  insurer: z.string().optional(),
  primaryDentistName: z.string().optional(),
  notes: z.string().optional(),
})
export type PatientInput = z.infer<typeof patientInputSchema>

/* -------------------- tooth chart -------------------- */

export const toothMarkSchema = z.object({
  /** FDI tooth number (e.g. 11..48 for permanent). */
  toothNumber: z.number(),
  surface: toothSurfaceSchema.nullable(),
  kind: toothConditionKindSchema,
  notes: z.string().nullable(),
  recordedAt: z.string(),
})
export type ToothMark = z.infer<typeof toothMarkSchema>

export const toothChartSchema = z.object({
  patientId: z.string(),
  marks: z.array(toothMarkSchema),
  updatedAt: z.string(),
})
export type ToothChart = z.infer<typeof toothChartSchema>

export const toothMarkInputSchema = z.object({
  toothNumber: z.number(),
  surface: toothSurfaceSchema.nullable(),
  kind: toothConditionKindSchema,
  notes: z.string().optional(),
})
export type ToothMarkInput = z.infer<typeof toothMarkInputSchema>

/* -------------------- treatment plan -------------------- */

export const procedureSchema = z.object({
  id: z.string(),
  /** Procedure code (e.g. CDT D2740). */
  code: z.string(),
  name: z.string(),
  toothNumber: z.number().nullable(),
  surface: toothSurfaceSchema.nullable(),
  status: procedureStatusSchema,
  fee: z.number(),
  insuranceCovered: z.number(),
  patientResponsibility: z.number(),
  scheduledFor: z.string().nullable(),
  completedAt: z.string().nullable(),
})
export type Procedure = z.infer<typeof procedureSchema>

export const treatmentPlanSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  title: z.string(),
  status: treatmentPlanStatusSchema,
  totalFee: z.number(),
  totalInsurance: z.number(),
  totalPatient: z.number(),
  currency: z.string(),
  presentedAt: z.string().nullable(),
  acceptedAt: z.string().nullable(),
  /** Number of procedures in this plan (denormalized for list view). */
  procedureCount: z.number(),
})
export type TreatmentPlan = z.infer<typeof treatmentPlanSchema>

export const treatmentPlanDetailSchema = treatmentPlanSchema.extend({
  notes: z.string().nullable(),
  procedures: z.array(procedureSchema),
})
export type TreatmentPlanDetail = z.infer<typeof treatmentPlanDetailSchema>

export const treatmentPlansResponseSchema = z.object({
  items: z.array(treatmentPlanSchema),
})
export type TreatmentPlansResponse = z.infer<typeof treatmentPlansResponseSchema>

/* -------------------- recall -------------------- */

export const recallSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  reason: recallReasonSchema,
  dueAt: z.string(),
  /** Days overdue (negative = future). */
  daysOverdue: z.number(),
  lastVisitAt: z.string().nullable(),
  primaryDentistName: z.string().nullable(),
  contacted: z.boolean(),
})
export type Recall = z.infer<typeof recallSchema>

export const recallsResponseSchema = z.object({
  items: z.array(recallSchema),
})
export type RecallsResponse = z.infer<typeof recallsResponseSchema>

/* -------------------- insurance -------------------- */

export const insuranceProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  network: z.string(),
  phone: z.string().nullable(),
  payerId: z.string(),
  /** Active members covered by this provider in this tenant. */
  memberCount: z.number(),
})
export type InsuranceProvider = z.infer<typeof insuranceProviderSchema>

export const claimSchema = z.object({
  id: z.string(),
  number: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  insurerName: z.string(),
  status: claimStatusSchema,
  billedAmount: z.number(),
  approvedAmount: z.number(),
  patientPortion: z.number(),
  currency: z.string(),
  submittedAt: z.string().nullable(),
  decidedAt: z.string().nullable(),
})
export type Claim = z.infer<typeof claimSchema>

export const claimsResponseSchema = z.object({
  items: z.array(claimSchema),
})
export type ClaimsResponse = z.infer<typeof claimsResponseSchema>

export const providersResponseSchema = z.object({
  items: z.array(insuranceProviderSchema),
})
export type ProvidersResponse = z.infer<typeof providersResponseSchema>

/* -------------------- procedure codes -------------------- */

export const procedureCodeSchema = z.object({
  code: z.string(),
  name: z.string(),
  category: z.string(),
  defaultFee: z.number(),
})
export type ProcedureCode = z.infer<typeof procedureCodeSchema>

export const procedureCodesResponseSchema = z.object({
  items: z.array(procedureCodeSchema),
})
export type ProcedureCodesResponse = z.infer<typeof procedureCodesResponseSchema>

import { z } from 'zod'

/**
 * Medical / EMR contracts — FHIR R4-aligned where reasonable, simplified
 * where the demo doesn't benefit from the full ceremony. See research
 * §2 for resource-by-resource mapping notes.
 *
 * Conventions:
 *   - Every CodeableConcept is `{ system, code, display }`. Never bare strings.
 *   - Period is `{ start, end }` ISO-8601 strings.
 *   - Quantity is `{ value, unit, system?, code? }` per UCUM.
 *   - Reference fields are flat string ids (not the FHIR `Reference` shape).
 *   - All timestamps are stored as ISO-8601 UTC.
 */

/* ==================== shared ==================== */

export const codeableConceptSchema = z.object({
  /** URI for the code system (e.g. http://snomed.info/sct, http://loinc.org). */
  system: z.string(),
  code: z.string(),
  display: z.string(),
})
export type CodeableConcept = z.infer<typeof codeableConceptSchema>

export const quantitySchema = z.object({
  value: z.number(),
  unit: z.string(),
  /** UCUM URI when present. */
  system: z.string().optional(),
  /** UCUM code (e.g. mg/dL). */
  code: z.string().optional(),
})
export type Quantity = z.infer<typeof quantitySchema>

export const periodSchema = z.object({
  start: z.string(),
  end: z.string().nullable(),
})
export type Period = z.infer<typeof periodSchema>

/* ==================== Practitioner / Location / Pharmacy ==================== */

export const practitionerSchema = z.object({
  id: z.string(),
  /** US NPI / national identifier — string for portability. */
  nationalId: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string(),
  credentials: z.string().nullable(),
  specialty: z.array(z.enum(['fm', 'peds', 'ob', 'psych', 'cardio', 'derm', 'im'])),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  locations: z.array(z.string()),
  isAttending: z.boolean(),
  signaturePin: z.string().nullable(),
})
export type Practitioner = z.infer<typeof practitionerSchema>

export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['clinic', 'satellite', 'lab_draw', 'telehealth_virtual']),
  addressLine: z.string().nullable(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  postalCode: z.string().nullable(),
  timezone: z.string(),
})
export type Location = z.infer<typeof locationSchema>

export const pharmacySchema = z.object({
  id: z.string(),
  /** NCPDP id when known. */
  ncpdpId: z.string().nullable(),
  name: z.string(),
  phone: z.string(),
  fax: z.string().nullable(),
  address: z.string(),
  hours: z.string().nullable(),
  preferred: z.boolean(),
})
export type Pharmacy = z.infer<typeof pharmacySchema>

/* ==================== Patient ==================== */

export const sexAtBirthSchema = z.enum(['male', 'female', 'unknown'])
export const genderIdentitySchema = z.enum([
  'male',
  'female',
  'nonbinary',
  'transgender_male',
  'transgender_female',
  'other',
  'declined',
])

export const patientNameSchema = z.object({
  given: z.string(),
  family: z.string(),
  preferred: z.string().nullable(),
})

export const telecomSchema = z.object({
  system: z.enum(['phone', 'email', 'sms', 'fax']),
  value: z.string(),
  use: z.enum(['home', 'work', 'mobile', 'other']),
  preferred: z.boolean(),
})

export const addressSchema = z.object({
  line: z.string(),
  city: z.string(),
  region: z.string(),
  postalCode: z.string(),
  country: z.string(),
})

export const emergencyContactSchema = z.object({
  name: z.string(),
  relationship: z.string(),
  phone: z.string(),
})

export const patientFlagSchema = z.enum([
  'vip',
  'allergy_high',
  'dnr',
  'fall_risk',
  'interpreter_needed',
  'sensitive_record',
])

export const patientSchema = z.object({
  id: z.string(),
  mrn: z.string(),
  /** National ID (SSN US, NHS UK, Iqama KSA, CNIC PK, etc.) — display only. */
  nationalId: z.string().nullable(),
  name: patientNameSchema,
  pronouns: z.string().nullable(),
  sexAtBirth: sexAtBirthSchema,
  genderIdentity: genderIdentitySchema,
  /** ISO Gregorian date — never write Hijri here. */
  dateOfBirth: z.string(),
  deceased: z.boolean(),
  deceasedDate: z.string().nullable(),
  telecom: z.array(telecomSchema),
  address: addressSchema.nullable(),
  preferredLanguage: z.string(),
  interpreterNeeded: z.boolean(),
  race: z.string().nullable(),
  ethnicity: z.string().nullable(),
  emergencyContact: emergencyContactSchema.nullable(),
  primaryProviderId: z.string().nullable(),
  /** Optional avatar — initials are used otherwise. */
  photoUrl: z.string().nullable(),
  flags: z.array(patientFlagSchema),
  enrolledAt: z.string(),
})
export type Patient = z.infer<typeof patientSchema>

export const patientListFiltersSchema = z.object({
  search: z.string().optional(),
  primaryProviderId: z.string().optional(),
  flag: patientFlagSchema.optional(),
})
export type PatientListFilters = z.infer<typeof patientListFiltersSchema>

export const patientsResponseSchema = z.object({
  items: z.array(patientSchema),
  total: z.number(),
})
export type PatientsResponse = z.infer<typeof patientsResponseSchema>

/* ==================== Allergy ==================== */

export const allergyCriticalitySchema = z.enum(['low', 'high', 'unable_to_assess'])
export const allergyTypeSchema = z.enum(['allergy', 'intolerance'])
export const allergyCategorySchema = z.enum(['food', 'medication', 'environment', 'biologic'])
export const allergyReactionSeveritySchema = z.enum(['mild', 'moderate', 'severe'])

export const allergySchema = z.object({
  id: z.string(),
  patientId: z.string(),
  type: allergyTypeSchema,
  category: allergyCategorySchema,
  criticality: allergyCriticalitySchema,
  /** RxNorm or SNOMED for the substance. */
  substance: codeableConceptSchema,
  /** Free-text manifestation list (e.g. "rash, urticaria"). */
  reactionText: z.string().nullable(),
  reactionSeverity: allergyReactionSeveritySchema.nullable(),
  onsetDate: z.string().nullable(),
  recordedBy: z.string(),
  recordedAt: z.string(),
  /** When verificationStatus is 'unconfirmed', UI shows a softer banner. */
  verificationStatus: z.enum(['unconfirmed', 'confirmed', 'refuted', 'entered_in_error']),
  notes: z.string().nullable(),
})
export type Allergy = z.infer<typeof allergySchema>

export const allergyInputSchema = allergySchema.omit({
  id: true,
  patientId: true,
  recordedBy: true,
  recordedAt: true,
})
export type AllergyInput = z.infer<typeof allergyInputSchema>

export const allergiesResponseSchema = z.object({
  items: z.array(allergySchema),
  /** True when the patient explicitly has no known allergies. UX must
   *  distinguish this from "no record on file". */
  noKnownAllergies: z.boolean(),
})
export type AllergiesResponse = z.infer<typeof allergiesResponseSchema>

/* ==================== Condition / Problem list ==================== */

export const conditionClinicalStatusSchema = z.enum([
  'active',
  'recurrence',
  'relapse',
  'inactive',
  'remission',
  'resolved',
])
export const conditionVerificationStatusSchema = z.enum([
  'unconfirmed',
  'provisional',
  'differential',
  'confirmed',
  'refuted',
  'entered_in_error',
])

export const conditionCategorySchema = z.enum(['problem_list_item', 'encounter_diagnosis'])

export const conditionSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  encounterId: z.string().nullable(),
  category: conditionCategorySchema,
  clinicalStatus: conditionClinicalStatusSchema,
  verificationStatus: conditionVerificationStatusSchema,
  /** Primary code: ICD-10. */
  icd10: codeableConceptSchema,
  /** Optional dual-coding to SNOMED. */
  snomed: codeableConceptSchema.nullable(),
  severity: z.enum(['mild', 'moderate', 'severe']).nullable(),
  onsetDate: z.string().nullable(),
  resolvedDate: z.string().nullable(),
  recordedBy: z.string(),
  recordedAt: z.string(),
  notes: z.string().nullable(),
})
export type Condition = z.infer<typeof conditionSchema>

export const conditionInputSchema = conditionSchema.omit({
  id: true,
  patientId: true,
  recordedBy: true,
  recordedAt: true,
})
export type ConditionInput = z.infer<typeof conditionInputSchema>

export const conditionsResponseSchema = z.object({
  items: z.array(conditionSchema),
})
export type ConditionsResponse = z.infer<typeof conditionsResponseSchema>

/* ==================== Medications ==================== */

export const dosageSchema = z.object({
  /** Natural-language SIG echo, e.g. "1 tablet PO BID x 10 days". */
  text: z.string(),
  doseValue: z.number(),
  doseUnit: z.string(),
  route: z.enum(['PO', 'IV', 'IM', 'SQ', 'INH', 'TOP', 'SL', 'PR', 'OPHTH']),
  frequency: z.string(),
  durationDays: z.number().nullable(),
  asNeeded: z.boolean(),
  asNeededReason: z.string().nullable(),
})

export const medicationRequestStatusSchema = z.enum([
  'draft',
  'active',
  'on_hold',
  'completed',
  'stopped',
  'cancelled',
])

export const medicationRequestSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  encounterId: z.string().nullable(),
  status: medicationRequestStatusSchema,
  intent: z.enum(['proposal', 'plan', 'order']),
  /** RxNorm code. */
  medication: codeableConceptSchema,
  strengthLabel: z.string(),
  dosage: dosageSchema,
  /** Number of refills authorized. */
  refillsAuthorized: z.number(),
  refillsRemaining: z.number(),
  quantity: z.number(),
  quantityUnit: z.string(),
  daysSupply: z.number().nullable(),
  /** Substitution allowed? false = DAW (dispense as written). */
  substitutionAllowed: z.boolean(),
  /** RxNorm of the linked indication problem (optional). */
  indicationConditionId: z.string().nullable(),
  pharmacyId: z.string().nullable(),
  prescribedBy: z.string(),
  authoredOn: z.string(),
  /** Demo flag — true if the system would flag the script for EPCS. */
  controlled: z.boolean(),
  controlledSchedule: z.enum(['CII', 'CIII', 'CIV', 'CV']).nullable(),
  notes: z.string().nullable(),
})
export type MedicationRequest = z.infer<typeof medicationRequestSchema>

export const medicationStatementSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  status: z.enum(['active', 'completed', 'intended', 'stopped']),
  medication: codeableConceptSchema,
  strengthLabel: z.string(),
  dosage: dosageSchema.nullable(),
  effectivePeriod: periodSchema,
  /** Who told us about this med — patient, pharmacy, family, prior chart. */
  source: z.enum(['patient', 'family', 'pharmacy', 'prior_chart']),
  recordedAt: z.string(),
  notes: z.string().nullable(),
})
export type MedicationStatement = z.infer<typeof medicationStatementSchema>

export const medicationsResponseSchema = z.object({
  active: z.array(medicationRequestSchema),
  prior: z.array(medicationRequestSchema),
  homeMeds: z.array(medicationStatementSchema),
})
export type MedicationsResponse = z.infer<typeof medicationsResponseSchema>

export const refillRequestSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  medication: codeableConceptSchema,
  strengthLabel: z.string(),
  pharmacyId: z.string(),
  pharmacyName: z.string(),
  receivedAt: z.string(),
  status: z.enum(['pending', 'approved', 'denied', 'changed']),
  controlled: z.boolean(),
  prescribedBy: z.string(),
})
export type RefillRequest = z.infer<typeof refillRequestSchema>

export const refillRequestsResponseSchema = z.object({
  items: z.array(refillRequestSchema),
})
export type RefillRequestsResponse = z.infer<typeof refillRequestsResponseSchema>

/* ==================== Immunizations ==================== */

export const immunizationSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  status: z.enum(['completed', 'entered_in_error', 'not_done']),
  /** CVX vaccine code. */
  vaccine: codeableConceptSchema,
  occurrenceDate: z.string(),
  lotNumber: z.string().nullable(),
  manufacturer: z.string().nullable(),
  site: z.enum(['left_deltoid', 'right_deltoid', 'left_thigh', 'right_thigh', 'oral', 'nasal']).nullable(),
  route: z.enum(['IM', 'SQ', 'PO', 'IN', 'INH']),
  doseLabel: z.string(),
  performer: z.string(),
  notes: z.string().nullable(),
})
export type Immunization = z.infer<typeof immunizationSchema>

export const immunizationDueSchema = z.object({
  vaccineCode: z.string(),
  vaccineDisplay: z.string(),
  doseLabel: z.string(),
  /** Months from birth at which the dose is recommended; null = adult. */
  recommendedAtMonths: z.number().nullable(),
  /** Computed flag: 'due', 'overdue', 'upcoming'. */
  status: z.enum(['due', 'overdue', 'upcoming']),
  /** ISO date when this dose becomes/became due. */
  dueDate: z.string(),
})
export type ImmunizationDue = z.infer<typeof immunizationDueSchema>

export const immunizationsResponseSchema = z.object({
  given: z.array(immunizationSchema),
  due: z.array(immunizationDueSchema),
})
export type ImmunizationsResponse = z.infer<typeof immunizationsResponseSchema>

/* ==================== Vitals + observations ==================== */

export const interpretationFlagSchema = z.enum(['N', 'H', 'L', 'HH', 'LL', 'A', 'Critical'])

/**
 * Generic Observation — covers vitals and labs. Lab results add a
 * referenceRange block.
 */
export const observationSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  encounterId: z.string().nullable(),
  category: z.enum(['vital_signs', 'laboratory', 'survey', 'exam', 'social_history']),
  /** LOINC code. */
  code: codeableConceptSchema,
  effectiveDateTime: z.string(),
  value: quantitySchema.nullable(),
  /** Free-text alternative when value is qualitative ("positive", "negative"). */
  valueText: z.string().nullable(),
  /** For BP: systolic + diastolic as components. */
  components: z
    .array(
      z.object({
        code: codeableConceptSchema,
        value: quantitySchema,
      }),
    )
    .nullable(),
  interpretation: interpretationFlagSchema,
  referenceRange: z
    .object({
      low: z.number().nullable(),
      high: z.number().nullable(),
      text: z.string().nullable(),
      unit: z.string(),
    })
    .nullable(),
  performer: z.string(),
  notes: z.string().nullable(),
})
export type Observation = z.infer<typeof observationSchema>

export const vitalsEntryInputSchema = z.object({
  patientId: z.string(),
  encounterId: z.string().nullable(),
  effectiveDateTime: z.string(),
  systolic: z.number().nullable(),
  diastolic: z.number().nullable(),
  heartRate: z.number().nullable(),
  respiratoryRate: z.number().nullable(),
  spo2: z.number().nullable(),
  temperatureC: z.number().nullable(),
  weightKg: z.number().nullable(),
  heightCm: z.number().nullable(),
  painScore: z.number().nullable(),
  headCircumferenceCm: z.number().nullable(),
})
export type VitalsEntryInput = z.infer<typeof vitalsEntryInputSchema>

export const vitalsResponseSchema = z.object({
  /** Latest vitals snapshot for the storyboard. */
  latest: z
    .object({
      systolic: z.number().nullable(),
      diastolic: z.number().nullable(),
      heartRate: z.number().nullable(),
      temperatureC: z.number().nullable(),
      weightKg: z.number().nullable(),
      heightCm: z.number().nullable(),
      bmi: z.number().nullable(),
      spo2: z.number().nullable(),
      effectiveDateTime: z.string(),
    })
    .nullable(),
  /** Historical observations as a flowsheet — sorted desc by datetime. */
  flowsheet: z.array(observationSchema),
})
export type VitalsResponse = z.infer<typeof vitalsResponseSchema>

/* ==================== Lab orders + results ==================== */

export const serviceRequestSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  encounterId: z.string().nullable(),
  category: z.enum(['lab', 'imaging', 'referral', 'procedure']),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']),
  /** LOINC for labs, CPT for imaging/procedures. */
  code: codeableConceptSchema,
  priority: z.enum(['routine', 'urgent', 'asap', 'stat']),
  authoredOn: z.string(),
  authoredBy: z.string(),
  occurrenceDateTime: z.string().nullable(),
  /** ICD-10 indication codes — free for billing medical necessity. */
  reasonCodes: z.array(codeableConceptSchema),
  notes: z.string().nullable(),
})
export type ServiceRequest = z.infer<typeof serviceRequestSchema>

export const diagnosticReportSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  encounterId: z.string().nullable(),
  status: z.enum(['registered', 'partial', 'preliminary', 'final', 'amended', 'corrected']),
  category: z.enum(['LAB', 'RAD', 'CARDIO', 'PATH']),
  /** LOINC panel code. */
  code: codeableConceptSchema,
  effectiveDateTime: z.string(),
  issued: z.string(),
  performer: z.string(),
  resultIds: z.array(z.string()),
  conclusion: z.string().nullable(),
  /** Filename of the attached report (mock URL only). */
  presentedFormUrl: z.string().nullable(),
  /** Has the responsible provider signed off the report? */
  signedBy: z.string().nullable(),
  signedAt: z.string().nullable(),
  /** Was the patient notified about a critical result yet? */
  patientNotifiedAt: z.string().nullable(),
})
export type DiagnosticReport = z.infer<typeof diagnosticReportSchema>

export const labInboxItemSchema = z.object({
  reportId: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  panelDisplay: z.string(),
  status: diagnosticReportSchema.shape.status,
  /** Highest severity flag in the panel. */
  worstFlag: interpretationFlagSchema,
  effectiveDateTime: z.string(),
  signedAt: z.string().nullable(),
  hasCritical: z.boolean(),
})
export type LabInboxItem = z.infer<typeof labInboxItemSchema>

export const labInboxResponseSchema = z.object({
  items: z.array(labInboxItemSchema),
  totals: z.object({
    unread: z.number(),
    critical: z.number(),
    abnormal: z.number(),
  }),
})
export type LabInboxResponse = z.infer<typeof labInboxResponseSchema>

export const labReportDetailSchema = z.object({
  report: diagnosticReportSchema,
  patientName: z.string(),
  results: z.array(observationSchema),
  trend: z.array(
    z.object({
      analyteLoinc: z.string(),
      analyteDisplay: z.string(),
      points: z.array(
        z.object({
          effectiveDateTime: z.string(),
          value: z.number(),
          unit: z.string(),
          interpretation: interpretationFlagSchema,
        }),
      ),
    }),
  ),
})
export type LabReportDetail = z.infer<typeof labReportDetailSchema>

/* ==================== Imaging ==================== */

export const imagingStudySchema = z.object({
  id: z.string(),
  patientId: z.string(),
  encounterId: z.string().nullable(),
  modality: z.enum(['CR', 'CT', 'DX', 'MG', 'MR', 'NM', 'OT', 'PT', 'RF', 'US', 'XA']),
  bodyPart: z.string(),
  laterality: z.enum(['left', 'right', 'bilateral', 'na']),
  contrast: z.boolean(),
  studyDescription: z.string(),
  accessionNumber: z.string(),
  studyUid: z.string(),
  performedAt: z.string(),
  performingFacility: z.string(),
  status: z.enum(['ordered', 'scheduled', 'performed', 'dictated', 'final_read']),
  radiologist: z.string().nullable(),
  findings: z.string().nullable(),
  impression: z.string().nullable(),
  /** External viewer deep-link URL placeholder. */
  pacsUrl: z.string().nullable(),
  presentedFormUrl: z.string().nullable(),
})
export type ImagingStudy = z.infer<typeof imagingStudySchema>

export const imagingStudiesResponseSchema = z.object({
  items: z.array(imagingStudySchema),
})
export type ImagingStudiesResponse = z.infer<typeof imagingStudiesResponseSchema>

/* ==================== Encounter + note ==================== */

export const encounterClassSchema = z.enum(['AMB', 'VR', 'EMER', 'IMP', 'HH'])
export const encounterStatusSchema = z.enum([
  'planned',
  'arrived',
  'in_progress',
  'finished',
  'cancelled',
])

export const encounterSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  class: encounterClassSchema,
  status: encounterStatusSchema,
  visitType: z.string(),
  providerId: z.string(),
  providerName: z.string(),
  locationId: z.string(),
  locationName: z.string(),
  startAt: z.string(),
  endAt: z.string().nullable(),
  reasonText: z.string(),
  /** Pointer into condition list when set. */
  primaryDxCode: z.string().nullable(),
  primaryDxDisplay: z.string().nullable(),
})
export type Encounter = z.infer<typeof encounterSchema>

export const encountersResponseSchema = z.object({
  items: z.array(encounterSchema),
})
export type EncountersResponse = z.infer<typeof encountersResponseSchema>

export const soapNoteSchema = z.object({
  subjective: z.object({
    chiefComplaint: z.string(),
    hpi: z.string(),
    ros: z.record(z.string(), z.string()),
    pmh: z.string(),
    psh: z.string(),
    fh: z.string(),
    sh: z.string(),
  }),
  objective: z.object({
    examFreeText: z.string(),
    examBySystem: z.record(z.string(), z.string()),
  }),
  assessment: z.array(
    z.object({
      conditionId: z.string().nullable(),
      icd10: codeableConceptSchema,
      note: z.string(),
    }),
  ),
  plan: z.string(),
})
export type SoapNote = z.infer<typeof soapNoteSchema>

export const encounterNoteStateSchema = z.enum(['draft', 'pending_cosign', 'signed'])

export const encounterNoteSchema = z.object({
  id: z.string(),
  encounterId: z.string(),
  patientId: z.string(),
  state: encounterNoteStateSchema,
  noteType: z.enum(['soap', 'apso', 'focused', 'h_and_p']),
  soap: soapNoteSchema,
  authorId: z.string(),
  /** Co-sign attending when authored by a resident. */
  cosignerId: z.string().nullable(),
  signedBy: z.string().nullable(),
  signedAt: z.string().nullable(),
  /** Auto-saved draft timestamp. */
  draftSavedAt: z.string(),
  /** Append-only addenda after sign. */
  addenda: z.array(
    z.object({
      id: z.string(),
      authorId: z.string(),
      authorName: z.string(),
      addedAt: z.string(),
      text: z.string(),
    }),
  ),
})
export type EncounterNote = z.infer<typeof encounterNoteSchema>

export const encounterDetailSchema = z.object({
  encounter: encounterSchema,
  note: encounterNoteSchema.nullable(),
  vitals: vitalsResponseSchema,
  orders: z.array(serviceRequestSchema),
  rxThisVisit: z.array(medicationRequestSchema),
})
export type EncounterDetail = z.infer<typeof encounterDetailSchema>

/* ==================== Family + Social history ==================== */

export const familyHistorySchema = z.object({
  id: z.string(),
  patientId: z.string(),
  relationship: z.enum([
    'mother',
    'father',
    'sibling',
    'maternal_grandparent',
    'paternal_grandparent',
    'child',
    'aunt_uncle',
    'cousin',
  ]),
  sex: sexAtBirthSchema,
  bornDate: z.string().nullable(),
  deceasedAge: z.number().nullable(),
  conditions: z.array(
    z.object({
      snomed: codeableConceptSchema,
      onsetAge: z.number().nullable(),
    }),
  ),
  notes: z.string().nullable(),
})
export type FamilyHistory = z.infer<typeof familyHistorySchema>

export const socialHistorySchema = z.object({
  patientId: z.string(),
  smoking: z.enum(['never', 'former', 'current_some_days', 'current_every_day', 'unknown']),
  alcohol: z.enum(['none', 'occasional', 'moderate', 'heavy', 'unknown']),
  recreationalDrugs: z.string().nullable(),
  occupation: z.string().nullable(),
  livingSituation: z.string().nullable(),
  exercise: z.string().nullable(),
  diet: z.string().nullable(),
  sexualActivity: z.string().nullable(),
  notes: z.string().nullable(),
  recordedAt: z.string(),
})
export type SocialHistory = z.infer<typeof socialHistorySchema>

export const historyResponseSchema = z.object({
  family: z.array(familyHistorySchema),
  social: socialHistorySchema.nullable(),
})
export type HistoryResponse = z.infer<typeof historyResponseSchema>

/* ==================== Documents inbox ==================== */

export const documentSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  /** Free-text source — fax, scan, external EHR, registry, etc. */
  source: z.string(),
  type: z.enum(['fax', 'scan', 'external_record', 'consent', 'release', 'imaging_report']),
  receivedAt: z.string(),
  pageCount: z.number(),
  url: z.string(),
  status: z.enum(['unfiled', 'filed', 'archived']),
  filedBy: z.string().nullable(),
  notes: z.string().nullable(),
})
export type Document = z.infer<typeof documentSchema>

export const documentsResponseSchema = z.object({ items: z.array(documentSchema) })
export type DocumentsResponse = z.infer<typeof documentsResponseSchema>

/* ==================== Specialty: OB ==================== */

export const pregnancySchema = z.object({
  id: z.string(),
  patientId: z.string(),
  status: z.enum(['active', 'completed', 'lost']),
  /** Last menstrual period — Gregorian. */
  lmpDate: z.string(),
  eddDate: z.string(),
  /** Current GA in completed weeks + days at the time of fetch. */
  gaWeeks: z.number(),
  gaDays: z.number(),
  gravida: z.number(),
  para: z.number(),
  tpalT: z.number(),
  tpalP: z.number(),
  tpalA: z.number(),
  tpalL: z.number(),
  bloodType: z.string().nullable(),
  rhFactor: z.enum(['+', '-', 'unknown']),
  notes: z.string().nullable(),
})
export type Pregnancy = z.infer<typeof pregnancySchema>

export const prenatalVisitSchema = z.object({
  id: z.string(),
  pregnancyId: z.string(),
  visitDate: z.string(),
  gaWeeks: z.number(),
  gaDays: z.number(),
  systolic: z.number().nullable(),
  diastolic: z.number().nullable(),
  weightKg: z.number().nullable(),
  fundalHeightCm: z.number().nullable(),
  fhrBpm: z.number().nullable(),
  fetalMovement: z.enum(['present', 'reduced', 'absent', 'na']),
  urineProtein: z.enum(['neg', 'trace', '1+', '2+', '3+', '4+']).nullable(),
  urineGlucose: z.enum(['neg', 'trace', '1+', '2+', '3+', '4+']).nullable(),
  notes: z.string().nullable(),
})
export type PrenatalVisit = z.infer<typeof prenatalVisitSchema>

export const ultrasoundEntrySchema = z.object({
  id: z.string(),
  pregnancyId: z.string(),
  studyDate: z.string(),
  gaWeeksAtScan: z.number(),
  gaDaysAtScan: z.number(),
  bpdMm: z.number().nullable(),
  hcMm: z.number().nullable(),
  acMm: z.number().nullable(),
  flMm: z.number().nullable(),
  efwG: z.number().nullable(),
  afi: z.number().nullable(),
  notes: z.string().nullable(),
})
export type UltrasoundEntry = z.infer<typeof ultrasoundEntrySchema>

export const pregnancyDetailSchema = z.object({
  pregnancy: pregnancySchema,
  visits: z.array(prenatalVisitSchema),
  ultrasounds: z.array(ultrasoundEntrySchema),
})
export type PregnancyDetail = z.infer<typeof pregnancyDetailSchema>

/* ==================== Specialty: psych ==================== */

export const psychScaleSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  /** LOINC for the instrument (e.g. 44249-1 PHQ-9). */
  loinc: codeableConceptSchema,
  administeredAt: z.string(),
  totalScore: z.number(),
  severity: z.enum(['none', 'mild', 'moderate', 'moderately_severe', 'severe']),
  /** Per-item scores in original order. */
  items: z.array(
    z.object({
      label: z.string(),
      score: z.number(),
    }),
  ),
  notes: z.string().nullable(),
})
export type PsychScale = z.infer<typeof psychScaleSchema>

export const psychScalesResponseSchema = z.object({
  items: z.array(psychScaleSchema),
})
export type PsychScalesResponse = z.infer<typeof psychScalesResponseSchema>

/* ==================== Care plan + goals ==================== */

export const goalSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  carePlanId: z.string(),
  description: z.string(),
  measureLoinc: codeableConceptSchema.nullable(),
  targetLow: z.number().nullable(),
  targetHigh: z.number().nullable(),
  targetUnit: z.string().nullable(),
  dueDate: z.string().nullable(),
  achievementStatus: z.enum(['in_progress', 'improving', 'achieved', 'declining', 'not_achieved']),
})
export type Goal = z.infer<typeof goalSchema>

export const carePlanSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  status: z.enum(['draft', 'active', 'completed']),
  intent: z.enum(['proposal', 'plan', 'order']),
  category: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  conditionIds: z.array(z.string()),
  goals: z.array(goalSchema),
  activities: z.array(
    z.object({
      kind: z.enum(['medication', 'observation', 'exercise', 'diet', 'follow_up', 'education']),
      description: z.string(),
      status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
      dueDate: z.string().nullable(),
    }),
  ),
})
export type CarePlan = z.infer<typeof carePlanSchema>

export const carePlansResponseSchema = z.object({ items: z.array(carePlanSchema) })
export type CarePlansResponse = z.infer<typeof carePlansResponseSchema>

/* ==================== Scheduling ==================== */

export const appointmentStatusSchema = z.enum([
  'proposed',
  'booked',
  'arrived',
  'fulfilled',
  'cancelled',
  'noshow',
])

export const appointmentSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  providerId: z.string(),
  providerName: z.string(),
  locationId: z.string(),
  locationName: z.string(),
  status: appointmentStatusSchema,
  appointmentClass: encounterClassSchema,
  visitType: z.string(),
  startAt: z.string(),
  endAt: z.string(),
  reasonText: z.string().nullable(),
  /** Set when the room is assigned at arrival. */
  roomedAt: z.string().nullable(),
  /** Realtime stage in the front-desk pipeline. */
  pipelineStage: z.enum(['scheduled', 'arrived', 'roomed', 'with_provider', 'checkout', 'departed', 'noshow']),
})
export type Appointment = z.infer<typeof appointmentSchema>

export const appointmentsResponseSchema = z.object({
  items: z.array(appointmentSchema),
})
export type AppointmentsResponse = z.infer<typeof appointmentsResponseSchema>

export const recallEntrySchema = z.object({
  id: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  reason: z.string(),
  dueDate: z.string(),
  status: z.enum(['upcoming', 'due', 'overdue', 'fulfilled']),
})
export type RecallEntry = z.infer<typeof recallEntrySchema>

export const recallsResponseSchema = z.object({ items: z.array(recallEntrySchema) })
export type RecallsResponse = z.infer<typeof recallsResponseSchema>

/* ==================== Eligibility + claims ==================== */

export const coverageSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  status: z.enum(['active', 'cancelled']),
  type: z.enum(['medical', 'dental', 'vision']),
  payor: z.string(),
  planName: z.string(),
  memberId: z.string(),
  groupNumber: z.string().nullable(),
  order: z.enum(['primary', 'secondary', 'tertiary']),
  network: z.enum(['in_network', 'out_of_network']),
  copay: z.number().nullable(),
  deductibleTotal: z.number().nullable(),
  deductibleMet: z.number().nullable(),
  oopMaxTotal: z.number().nullable(),
  oopMaxMet: z.number().nullable(),
  effectivePeriod: periodSchema,
})
export type Coverage = z.infer<typeof coverageSchema>

export const coveragesResponseSchema = z.object({ items: z.array(coverageSchema) })
export type CoveragesResponse = z.infer<typeof coveragesResponseSchema>

export const eligibilityResultSchema = z.object({
  patientId: z.string(),
  coverageId: z.string(),
  checkedAt: z.string(),
  active: z.boolean(),
  copay: z.number().nullable(),
  deductibleMet: z.number().nullable(),
  oopMaxMet: z.number().nullable(),
  inNetwork: z.boolean(),
  rawText: z.string(),
})
export type EligibilityResult = z.infer<typeof eligibilityResultSchema>

export const claimLineSchema = z.object({
  id: z.string(),
  cpt: codeableConceptSchema,
  modifiers: z.array(z.string()),
  units: z.number(),
  unitPrice: z.number(),
  diagnosisPointers: z.array(z.string()),
})

export const claimSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  encounterId: z.string().nullable(),
  status: z.enum(['draft', 'submitted', 'paid', 'partial', 'denied', 'rejected']),
  type: z.enum(['professional', 'institutional']),
  posCode: z.string(),
  serviceDate: z.string(),
  diagnoses: z.array(codeableConceptSchema),
  lines: z.array(claimLineSchema),
  totalCharge: z.number(),
  totalPaid: z.number(),
  totalAdjustment: z.number(),
  patientResponsibility: z.number(),
  payor: z.string().nullable(),
  /** CARC denial reason when status === 'denied'. */
  denialReason: z.string().nullable(),
})
export type Claim = z.infer<typeof claimSchema>

export const claimsResponseSchema = z.object({
  items: z.array(claimSchema),
  totals: z.object({
    arDays: z.number(),
    outstanding: z.number(),
    paid30d: z.number(),
    denialRate: z.number(),
  }),
})
export type ClaimsResponse = z.infer<typeof claimsResponseSchema>

/* ==================== Audit ==================== */

export const auditEventSchema = z.object({
  id: z.string(),
  actorId: z.string(),
  actorName: z.string(),
  action: z.enum([
    'chart_open',
    'note_save_draft',
    'note_sign',
    'rx_sign',
    'order_sign',
    'result_sign',
    'allergy_add',
    'patient_view',
    'patient_export',
    'break_glass_open',
    'break_glass_close',
  ]),
  resourceType: z.string(),
  resourceId: z.string(),
  patientId: z.string().nullable(),
  patientName: z.string().nullable(),
  occurredAt: z.string(),
  ip: z.string(),
  device: z.string().nullable(),
  breakGlass: z.boolean(),
  reason: z.string().nullable(),
})
export type AuditEvent = z.infer<typeof auditEventSchema>

export const auditEventsResponseSchema = z.object({
  items: z.array(auditEventSchema),
})
export type AuditEventsResponse = z.infer<typeof auditEventsResponseSchema>

/* ==================== Patient portal ==================== */

export const portalThreadSchema = z.object({
  id: z.string(),
  subject: z.string(),
  participants: z.array(z.string()),
  lastMessageAt: z.string(),
  unread: z.boolean(),
  category: z.enum(['general', 'rx', 'results', 'billing', 'appointment']),
})
export type PortalThread = z.infer<typeof portalThreadSchema>

export const portalMessageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  authorId: z.string(),
  authorRole: z.enum(['patient', 'provider', 'staff']),
  authorName: z.string(),
  body: z.string(),
  sentAt: z.string(),
})
export type PortalMessage = z.infer<typeof portalMessageSchema>

export const portalThreadsResponseSchema = z.object({ items: z.array(portalThreadSchema) })
export type PortalThreadsResponse = z.infer<typeof portalThreadsResponseSchema>

export const portalThreadDetailSchema = z.object({
  thread: portalThreadSchema,
  messages: z.array(portalMessageSchema),
})
export type PortalThreadDetail = z.infer<typeof portalThreadDetailSchema>

/* ==================== Patient detail bundle (storyboard) ==================== */

export const patientDetailSchema = z.object({
  patient: patientSchema,
  primaryProviderName: z.string().nullable(),
  age: z.number(),
  ageBand: z.enum(['neonate', 'infant', 'toddler', 'child', 'adolescent', 'adult', 'geriatric']),
  /** Convenience snapshot for the Storyboard banner. */
  snapshot: z.object({
    activeProblems: z.array(codeableConceptSchema),
    activeAllergies: z.array(
      z.object({
        substance: codeableConceptSchema,
        criticality: allergyCriticalitySchema,
        reactionText: z.string().nullable(),
      }),
    ),
    activeMedications: z.array(
      z.object({
        medication: codeableConceptSchema,
        strengthLabel: z.string(),
        dosageText: z.string(),
      }),
    ),
    latestVitals: vitalsResponseSchema.shape.latest,
    activePregnancy: pregnancySchema.nullable(),
    /** Pediatric weight staleness in days; null when not peds or never recorded. */
    pedsWeightStaleDays: z.number().nullable(),
  }),
})
export type PatientDetail = z.infer<typeof patientDetailSchema>

/* ==================== Overview (dashboard) ==================== */

export const medicalOverviewSchema = z.object({
  asOf: z.string(),
  patientsTotal: z.number(),
  patientsTodayScheduled: z.number(),
  patientsArrived: z.number(),
  labsToSign: z.number(),
  refillsPending: z.number(),
  messagesUnread: z.number(),
  recallsDue: z.number(),
  arDays: z.number(),
  arOutstanding: z.number(),
  currency: z.string(),
})
export type MedicalOverview = z.infer<typeof medicalOverviewSchema>

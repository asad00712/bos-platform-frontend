/**
 * Medical mocks. Rich, deterministic, persistence-via-module-state seed
 * data so the demo behaves like a real ambulatory clinic. No randomness
 * at runtime — values computed from a pinned `NOW` so screens look the
 * same on every refresh until a mutation runs.
 *
 * Patient archetypes (research §19) all represented. Each archetype is
 * built via a small factory so the file stays scannable.
 */

import type {
  Allergy,
  Appointment,
  AuditEvent,
  CarePlan,
  Claim,
  Coverage,
  DiagnosticReport,
  Document,
  Encounter,
  EncounterDetail,
  EncounterNote,
  EncountersResponse,
  FamilyHistory,
  HistoryResponse,
  ImagingStudy,
  Immunization,
  ImmunizationDue,
  ImmunizationsResponse,
  LabInboxResponse,
  LabReportDetail,
  Location,
  MedicalOverview,
  MedicationRequest,
  MedicationStatement,
  Observation,
  Patient,
  PatientDetail,
  PatientListFilters,
  PatientsResponse,
  Pharmacy,
  Practitioner,
  Pregnancy,
  PregnancyDetail,
  PrenatalVisit,
  PsychScale,
  RecallEntry,
  RefillRequest,
  ServiceRequest,
  SocialHistory,
  UltrasoundEntry,
  VitalsResponse,
} from './medical.contracts'

import { ICD10 } from '../codes/icd10.curated'
import { LOINC } from '../codes/loinc.curated'
import { SNOMED } from '../codes/snomed.curated'
import { CVX } from '../codes/cvx.curated'
import { RXNORM } from '../codes/rxnorm.curated'

const NOW = new Date('2026-04-28T10:00:00.000Z')
const CURRENCY = 'USD'

function isoDaysAgo(days: number): string {
  const d = new Date(NOW)
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString()
}
function isoDaysAhead(days: number): string {
  return isoDaysAgo(-days)
}
function dateOnlyDaysAgo(days: number): string {
  return isoDaysAgo(days).slice(0, 10)
}
function dateOnlyYearsAgo(years: number, monthOffset = 0, dayOffset = 0): string {
  const d = new Date(NOW)
  d.setUTCFullYear(d.getUTCFullYear() - years)
  d.setUTCMonth(d.getUTCMonth() + monthOffset)
  d.setUTCDate(d.getUTCDate() + dayOffset)
  return d.toISOString().slice(0, 10)
}

function ageFromDob(dob: string): number {
  const d = new Date(dob)
  const ms = NOW.getTime() - d.getTime()
  return Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000))
}

function ageBand(age: number): PatientDetail['ageBand'] {
  if (age < 1 / 12) return 'neonate'
  if (age < 1) return 'infant'
  if (age < 3) return 'toddler'
  if (age < 12) return 'child'
  if (age < 18) return 'adolescent'
  if (age < 65) return 'adult'
  return 'geriatric'
}

function findIcd10(code: string) {
  const e = ICD10.find((x) => x.code === code)
  if (!e) throw new Error(`ICD-10 mock missing ${code}`)
  return {
    system: 'http://hl7.org/fhir/sid/icd-10-cm',
    code: e.code,
    display: e.display,
  }
}
function findSnomed(code: string) {
  const e = SNOMED.find((x) => x.code === code)
  if (!e) throw new Error(`SNOMED mock missing ${code}`)
  return { system: 'http://snomed.info/sct', code: e.code, display: e.display }
}
function findLoinc(code: string) {
  const e = LOINC.find((x) => x.code === code)
  if (!e) throw new Error(`LOINC mock missing ${code}`)
  return { system: 'http://loinc.org', code: e.code, display: e.display }
}
function findRxNorm(rxcui: string) {
  const e = RXNORM.find((x) => x.rxcui === rxcui)
  if (!e) throw new Error(`RxNorm mock missing ${rxcui}`)
  return {
    system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
    code: e.rxcui,
    display: e.inn,
  }
}
function findCvx(code: string) {
  const e = CVX.find((x) => x.code === code)
  if (!e) throw new Error(`CVX mock missing ${code}`)
  return {
    system: 'http://hl7.org/fhir/sid/cvx',
    code: e.code,
    display: e.display,
  }
}

/* ==================== practitioners + locations + pharmacies ==================== */

const practitioners: Practitioner[] = [
  {
    id: 'prac-fm-hassan',
    nationalId: '1234567890',
    firstName: 'Adeel',
    lastName: 'Hassan',
    credentials: 'MD',
    specialty: ['fm'],
    email: 'a.hassan@acmemed.example',
    phone: '+1 415 555 0101',
    locations: ['loc-main', 'loc-satellite'],
    isAttending: true,
    signaturePin: '0001',
  },
  {
    id: 'prac-peds-park',
    nationalId: '1234567891',
    firstName: 'Hana',
    lastName: 'Park',
    credentials: 'MD, FAAP',
    specialty: ['peds'],
    email: 'h.park@acmemed.example',
    phone: '+1 415 555 0102',
    locations: ['loc-main'],
    isAttending: true,
    signaturePin: '0002',
  },
  {
    id: 'prac-ob-adeyemi',
    nationalId: '1234567892',
    firstName: 'Folake',
    lastName: 'Adeyemi',
    credentials: 'MD, FACOG',
    specialty: ['ob'],
    email: 'f.adeyemi@acmemed.example',
    phone: '+1 415 555 0103',
    locations: ['loc-main'],
    isAttending: true,
    signaturePin: '0003',
  },
  {
    id: 'prac-psych-vargas',
    nationalId: '1234567893',
    firstName: 'Lucia',
    lastName: 'Vargas',
    credentials: 'MD',
    specialty: ['psych'],
    email: 'l.vargas@acmemed.example',
    phone: '+1 415 555 0104',
    locations: ['loc-main', 'loc-virtual'],
    isAttending: true,
    signaturePin: '0004',
  },
  {
    id: 'prac-cardio-iqbal',
    nationalId: '1234567894',
    firstName: 'Asad',
    lastName: 'Iqbal',
    credentials: 'MD, FACC',
    specialty: ['cardio'],
    email: 'a.iqbal@acmemed.example',
    phone: '+1 415 555 0105',
    locations: ['loc-main'],
    isAttending: true,
    signaturePin: '0005',
  },
]

const locations: Location[] = [
  {
    id: 'loc-main',
    name: 'Acme Medical — Main',
    type: 'clinic',
    addressLine: '420 Mission St',
    city: 'San Francisco',
    region: 'CA',
    postalCode: '94105',
    timezone: 'America/Los_Angeles',
  },
  {
    id: 'loc-satellite',
    name: 'Acme Medical — Mission Branch',
    type: 'satellite',
    addressLine: '2155 24th St',
    city: 'San Francisco',
    region: 'CA',
    postalCode: '94110',
    timezone: 'America/Los_Angeles',
  },
  {
    id: 'loc-virtual',
    name: 'Acme Telehealth',
    type: 'telehealth_virtual',
    addressLine: null,
    city: null,
    region: null,
    postalCode: null,
    timezone: 'America/Los_Angeles',
  },
]

const pharmacies: Pharmacy[] = [
  { id: 'rx-walgreens-mission', ncpdpId: '0501234', name: 'Walgreens — Mission', phone: '+1 415 555 0201', fax: '+1 415 555 0202', address: '2690 Mission St, SF, CA 94110', hours: '8a–10p', preferred: true },
  { id: 'rx-cvs-soma', ncpdpId: '0501235', name: 'CVS Pharmacy — SoMa', phone: '+1 415 555 0203', fax: null, address: '731 Market St, SF, CA 94103', hours: '24h', preferred: false },
  { id: 'rx-safeway-castro', ncpdpId: '0501236', name: 'Safeway Pharmacy — Castro', phone: '+1 415 555 0204', fax: '+1 415 555 0205', address: '2020 Market St, SF, CA 94114', hours: '9a–9p', preferred: false },
  { id: 'rx-mailorder-express', ncpdpId: '0501237', name: 'Express Scripts (mail order)', phone: '+1 800 555 0206', fax: null, address: 'Online', hours: 'mail order', preferred: false },
]

/* ==================== patients ==================== */

function mkPhone(n: number): string {
  return `+1 415 555 0${(300 + n).toString().padStart(3, '0')}`
}
function mkPatient(opts: {
  id: string
  mrn: string
  given: string
  family: string
  preferred?: string | null
  pronouns?: string | null
  sexAtBirth: 'male' | 'female' | 'unknown'
  genderIdentity?: Patient['genderIdentity']
  dob: string
  language?: string
  interpreterNeeded?: boolean
  primaryProviderId: string
  flags?: Patient['flags']
  emergencyContact?: Patient['emergencyContact']
  enrolledDaysAgo: number
  phoneIdx: number
  city?: string
}): Patient {
  return {
    id: opts.id,
    mrn: opts.mrn,
    nationalId: null,
    name: {
      given: opts.given,
      family: opts.family,
      preferred: opts.preferred ?? null,
    },
    pronouns: opts.pronouns ?? null,
    sexAtBirth: opts.sexAtBirth,
    genderIdentity: opts.genderIdentity ?? (opts.sexAtBirth as Patient['genderIdentity']),
    dateOfBirth: opts.dob,
    deceased: false,
    deceasedDate: null,
    telecom: [
      { system: 'phone', value: mkPhone(opts.phoneIdx), use: 'mobile', preferred: true },
      { system: 'email', value: `${opts.given.toLowerCase()}.${opts.family.toLowerCase()}@example.com`, use: 'home', preferred: false },
    ],
    address: {
      line: `${100 + opts.phoneIdx} Valencia St`,
      city: opts.city ?? 'San Francisco',
      region: 'CA',
      postalCode: '94110',
      country: 'US',
    },
    preferredLanguage: opts.language ?? 'en',
    interpreterNeeded: opts.interpreterNeeded ?? false,
    race: null,
    ethnicity: null,
    emergencyContact: opts.emergencyContact ?? {
      name: 'Family Member',
      relationship: 'spouse',
      phone: mkPhone(opts.phoneIdx + 100),
    },
    primaryProviderId: opts.primaryProviderId,
    photoUrl: null,
    flags: opts.flags ?? [],
    enrolledAt: isoDaysAgo(opts.enrolledDaysAgo),
  }
}

const patients: Patient[] = [
  mkPatient({
    id: 'pat-layla-h',
    mrn: 'MRN-100001',
    given: 'Layla',
    family: 'Hassan',
    pronouns: 'she/her',
    sexAtBirth: 'female',
    dob: dateOnlyYearsAgo(0, -18, 0),
    language: 'ar',
    interpreterNeeded: true,
    primaryProviderId: 'prac-peds-park',
    flags: [],
    emergencyContact: { name: 'Sara Hassan', relationship: 'mother', phone: mkPhone(1) },
    enrolledDaysAgo: 540,
    phoneIdx: 1,
  }),
  mkPatient({
    id: 'pat-marcus-j',
    mrn: 'MRN-100002',
    given: 'Marcus',
    family: 'Johnson',
    pronouns: 'he/him',
    sexAtBirth: 'male',
    dob: dateOnlyYearsAgo(9, 0, 0),
    primaryProviderId: 'prac-peds-park',
    enrolledDaysAgo: 1700,
    phoneIdx: 2,
  }),
  mkPatient({
    id: 'pat-priya-s',
    mrn: 'MRN-100003',
    given: 'Priya',
    family: 'Sharma',
    pronouns: 'she/her',
    sexAtBirth: 'female',
    dob: dateOnlyYearsAgo(31, -2, 5),
    language: 'hi',
    primaryProviderId: 'prac-ob-adeyemi',
    enrolledDaysAgo: 800,
    phoneIdx: 3,
  }),
  mkPatient({
    id: 'pat-khalid-a',
    mrn: 'MRN-100004',
    given: 'Khalid',
    family: 'Al-Saud',
    preferred: 'Khalid',
    pronouns: 'he/him',
    sexAtBirth: 'male',
    dob: dateOnlyYearsAgo(78, 1, 12),
    language: 'ar',
    interpreterNeeded: true,
    primaryProviderId: 'prac-fm-hassan',
    flags: ['fall_risk', 'allergy_high'],
    emergencyContact: { name: 'Noor Al-Saud', relationship: 'daughter', phone: mkPhone(4) },
    enrolledDaysAgo: 2200,
    phoneIdx: 4,
  }),
  mkPatient({
    id: 'pat-sandra-l',
    mrn: 'MRN-100005',
    given: 'Sandra',
    family: 'Lopez',
    pronouns: 'she/her',
    sexAtBirth: 'female',
    dob: dateOnlyYearsAgo(56, -3, 2),
    language: 'es',
    primaryProviderId: 'prac-fm-hassan',
    enrolledDaysAgo: 1900,
    phoneIdx: 5,
  }),
  mkPatient({
    id: 'pat-diego-m',
    mrn: 'MRN-100006',
    given: 'Diego',
    family: 'Martinez',
    pronouns: 'he/him',
    sexAtBirth: 'male',
    dob: dateOnlyYearsAgo(34, 4, 11),
    language: 'es',
    primaryProviderId: 'prac-fm-hassan',
    flags: ['allergy_high'],
    enrolledDaysAgo: 410,
    phoneIdx: 6,
  }),
  mkPatient({
    id: 'pat-yusra-k',
    mrn: 'MRN-100007',
    given: 'Yusra',
    family: 'Khan',
    pronouns: 'she/her',
    sexAtBirth: 'female',
    dob: dateOnlyYearsAgo(47, -1, 0),
    primaryProviderId: 'prac-fm-hassan',
    enrolledDaysAgo: 980,
    phoneIdx: 7,
  }),
  mkPatient({
    id: 'pat-tom-o',
    mrn: 'MRN-100008',
    given: 'Tom',
    family: "O'Brien",
    pronouns: 'he/him',
    sexAtBirth: 'male',
    dob: dateOnlyYearsAgo(64, -5, 9),
    primaryProviderId: 'prac-fm-hassan',
    enrolledDaysAgo: 4100,
    phoneIdx: 8,
  }),
  mkPatient({
    id: 'pat-aisha-r',
    mrn: 'MRN-100009',
    given: 'Aisha',
    family: 'Rahman',
    pronouns: 'she/her',
    sexAtBirth: 'female',
    dob: dateOnlyYearsAgo(28, 2, 18),
    primaryProviderId: 'prac-psych-vargas',
    enrolledDaysAgo: 270,
    phoneIdx: 9,
  }),
  mkPatient({
    id: 'pat-daniel-c',
    mrn: 'MRN-100010',
    given: 'Daniel',
    family: 'Chen',
    pronouns: 'he/him',
    sexAtBirth: 'male',
    dob: dateOnlyYearsAgo(22, -6, 3),
    primaryProviderId: 'prac-psych-vargas',
    flags: ['sensitive_record'],
    enrolledDaysAgo: 380,
    phoneIdx: 10,
  }),
  mkPatient({
    id: 'pat-fernando-g',
    mrn: 'MRN-100011',
    given: 'Fernando',
    family: 'Garcia',
    pronouns: 'he/him',
    sexAtBirth: 'male',
    dob: dateOnlyYearsAgo(67, 0, 21),
    language: 'es',
    primaryProviderId: 'prac-cardio-iqbal',
    enrolledDaysAgo: 2900,
    phoneIdx: 11,
  }),
  mkPatient({
    id: 'pat-nora-m',
    mrn: 'MRN-100012',
    given: 'Nora',
    family: 'Mensah',
    pronouns: 'she/her',
    sexAtBirth: 'female',
    dob: dateOnlyYearsAgo(42, -7, 14),
    primaryProviderId: 'prac-fm-hassan',
    enrolledDaysAgo: 1300,
    phoneIdx: 12,
  }),
]

// Round out the panel with 18 routine adults so the schedule + lab inbox feel busy
for (let i = 0; i < 18; i++) {
  const givenList = ['Olivia', 'James', 'Sophia', 'Liam', 'Ava', 'Noah', 'Mia', 'Ethan', 'Isabella', 'Lucas', 'Charlotte', 'Mason', 'Amelia', 'Logan', 'Harper', 'Elijah', 'Evelyn', 'Aiden']
  const familyList = ['Kim', 'Patel', 'Nguyen', 'Singh', 'Cohen', 'Brown', 'Reyes', 'Tanaka', 'Park', 'Yusuf', 'Khalil', 'Diallo', 'Ito', 'Choi', 'Wagner', 'Morales', 'Davis', 'Bauer']
  const sex: 'male' | 'female' = i % 2 === 0 ? 'female' : 'male'
  patients.push(
    mkPatient({
      id: `pat-routine-${i + 1}`,
      mrn: `MRN-${(200000 + i).toString()}`,
      given: givenList[i] ?? 'Routine',
      family: familyList[i] ?? `Adult${i}`,
      sexAtBirth: sex,
      dob: dateOnlyYearsAgo(28 + (i % 40), i % 12, (i * 3) % 28),
      primaryProviderId:
        i % 4 === 0
          ? 'prac-fm-hassan'
          : i % 4 === 1
            ? 'prac-peds-park'
            : i % 4 === 2
              ? 'prac-cardio-iqbal'
              : 'prac-psych-vargas',
      enrolledDaysAgo: 100 + i * 23,
      phoneIdx: 13 + i,
    }),
  )
}

const patientById = new Map(patients.map((p) => [p.id, p]))
const practitionerById = new Map(practitioners.map((p) => [p.id, p]))

function fullName(p: Patient): string {
  return `${p.name.preferred ?? p.name.given} ${p.name.family}`
}
function practitionerName(id: string): string {
  const p = practitionerById.get(id)
  return p ? `Dr. ${p.firstName} ${p.lastName}` : 'Dr. Unknown'
}

/* ==================== allergies ==================== */

let allergies: Allergy[] = [
  // Diego — penicillin anaphylaxis (high) — drives the hard-stop ceremony
  {
    id: 'alg-diego-pcn',
    patientId: 'pat-diego-m',
    type: 'allergy',
    category: 'medication',
    criticality: 'high',
    substance: findSnomed('7980'),
    reactionText: 'Anaphylaxis with throat swelling, requires epinephrine',
    reactionSeverity: 'severe',
    onsetDate: dateOnlyYearsAgo(5),
    recordedBy: 'prac-fm-hassan',
    recordedAt: isoDaysAgo(380),
    verificationStatus: 'confirmed',
    notes: 'Verified via prior ER record.',
  },
  // Diego — sulfa moderate (drives override ceremony)
  {
    id: 'alg-diego-sulfa',
    patientId: 'pat-diego-m',
    type: 'allergy',
    category: 'medication',
    criticality: 'low',
    substance: findSnomed('387406002'),
    reactionText: 'Diffuse rash without airway involvement',
    reactionSeverity: 'moderate',
    onsetDate: dateOnlyYearsAgo(8),
    recordedBy: 'prac-fm-hassan',
    recordedAt: isoDaysAgo(200),
    verificationStatus: 'confirmed',
    notes: null,
  },
  // Khalid — latex (high) + iodinated contrast
  {
    id: 'alg-khalid-latex',
    patientId: 'pat-khalid-a',
    type: 'allergy',
    category: 'biologic',
    criticality: 'high',
    substance: findSnomed('111088007'),
    reactionText: 'Contact urticaria, prior anaphylactoid event',
    reactionSeverity: 'severe',
    onsetDate: null,
    recordedBy: 'prac-fm-hassan',
    recordedAt: isoDaysAgo(1100),
    verificationStatus: 'confirmed',
    notes: 'Use latex-free supplies in OR.',
  },
  {
    id: 'alg-khalid-iodine',
    patientId: 'pat-khalid-a',
    type: 'allergy',
    category: 'medication',
    criticality: 'high',
    substance: { system: 'http://snomed.info/sct', code: '293637006', display: 'Iodine-containing contrast' },
    reactionText: 'Severe urticaria post-CT contrast',
    reactionSeverity: 'severe',
    onsetDate: dateOnlyYearsAgo(3),
    recordedBy: 'prac-cardio-iqbal',
    recordedAt: isoDaysAgo(900),
    verificationStatus: 'confirmed',
    notes: null,
  },
  // Layla — eczema, no known drug allergy
  {
    id: 'alg-layla-eggs',
    patientId: 'pat-layla-h',
    type: 'allergy',
    category: 'food',
    criticality: 'low',
    substance: findSnomed('102263004'),
    reactionText: 'Mild perioral rash with whole egg ingestion',
    reactionSeverity: 'mild',
    onsetDate: dateOnlyYearsAgo(0, -6),
    recordedBy: 'prac-peds-park',
    recordedAt: isoDaysAgo(120),
    verificationStatus: 'confirmed',
    notes: 'Tolerates baked egg.',
  },
  // Marcus — peanut + tree nut
  {
    id: 'alg-marcus-peanut',
    patientId: 'pat-marcus-j',
    type: 'allergy',
    category: 'food',
    criticality: 'high',
    substance: findSnomed('256349002'),
    reactionText: 'Hives, throat tightening',
    reactionSeverity: 'severe',
    onsetDate: dateOnlyYearsAgo(8),
    recordedBy: 'prac-peds-park',
    recordedAt: isoDaysAgo(700),
    verificationStatus: 'confirmed',
    notes: 'EpiPen Jr. carried.',
  },
  // Priya — none documented but aware of latex sensitivity
  {
    id: 'alg-priya-latex',
    patientId: 'pat-priya-s',
    type: 'intolerance',
    category: 'biologic',
    criticality: 'low',
    substance: findSnomed('111088007'),
    reactionText: 'Mild contact dermatitis',
    reactionSeverity: 'mild',
    onsetDate: null,
    recordedBy: 'prac-ob-adeyemi',
    recordedAt: isoDaysAgo(40),
    verificationStatus: 'unconfirmed',
    notes: null,
  },
  // Sandra — NKA (no known allergies)
  // Aisha — none
  // Daniel — none
  // Fernando — NSAID intolerance (GI bleed history)
  {
    id: 'alg-fernando-nsaid',
    patientId: 'pat-fernando-g',
    type: 'intolerance',
    category: 'medication',
    criticality: 'high',
    substance: { system: 'http://snomed.info/sct', code: '372722000', display: 'NSAIDs' },
    reactionText: 'Upper GI bleed in 2022 on naproxen',
    reactionSeverity: 'severe',
    onsetDate: dateOnlyYearsAgo(4),
    recordedBy: 'prac-cardio-iqbal',
    recordedAt: isoDaysAgo(1300),
    verificationStatus: 'confirmed',
    notes: 'Avoid; warn at every Rx with NSAID class.',
  },
]

const noKnownAllergyPatients = new Set<string>([
  'pat-sandra-l',
  'pat-aisha-r',
  'pat-daniel-c',
  'pat-tom-o',
  'pat-yusra-k',
  'pat-nora-m',
])

/* ==================== conditions / problem list ==================== */

let conditions: Array<{
  id: string
  patientId: string
  encounterId: string | null
  category: 'problem_list_item' | 'encounter_diagnosis'
  clinicalStatus: 'active' | 'recurrence' | 'relapse' | 'inactive' | 'remission' | 'resolved'
  verificationStatus:
    | 'unconfirmed'
    | 'provisional'
    | 'differential'
    | 'confirmed'
    | 'refuted'
    | 'entered_in_error'
  icd10: ReturnType<typeof findIcd10>
  snomed: ReturnType<typeof findSnomed> | null
  severity: 'mild' | 'moderate' | 'severe' | null
  onsetDate: string | null
  resolvedDate: string | null
  recordedBy: string
  recordedAt: string
  notes: string | null
}> = [
  // Khalid — polypharmacy CKD diabetic AFib HTN
  cond('pat-khalid-a', 'I48.91', '49436004', 'Atrial fibrillation', { severity: 'moderate' }),
  cond('pat-khalid-a', 'I10', '38341003', 'Essential hypertension'),
  cond('pat-khalid-a', 'E11.9', '44054006', 'Type 2 DM'),
  cond('pat-khalid-a', 'E78.5', null, 'Hyperlipidemia'),
  cond('pat-khalid-a', 'N18.3', null, 'Stage 3b CKD'),
  cond('pat-khalid-a', 'F32.9', '370143000', 'MDD'),

  // Sandra — DM/HTN/lipids/microalbumin
  cond('pat-sandra-l', 'E11.65', '44054006', 'T2DM hyperglycemia'),
  cond('pat-sandra-l', 'I10', '38341003', 'HTN'),
  cond('pat-sandra-l', 'E78.5', null, 'Hyperlipidemia'),

  // Yusra — subclinical -> overt hypothyroid
  cond('pat-yusra-k', 'E03.9', '40930008', 'Hypothyroidism', { onsetDaysAgo: 14 }),

  // Daniel — MDD recurrent moderate, anxiety
  cond('pat-daniel-c', 'F33.1', '370143000', 'MDD recurrent'),
  cond('pat-daniel-c', 'F41.1', '21897009', 'GAD'),

  // Aisha — anxiety
  cond('pat-aisha-r', 'F41.1', '21897009', 'GAD'),

  // Fernando — AFib + CAD
  cond('pat-fernando-g', 'I48.91', '49436004', 'Atrial fibrillation'),
  cond('pat-fernando-g', 'I25.10', '53741008', 'Coronary atherosclerosis'),
  cond('pat-fernando-g', 'I10', '38341003', 'HTN'),
  cond('pat-fernando-g', 'E78.5', null, 'Hyperlipidemia'),

  // Marcus — asthma
  cond('pat-marcus-j', 'J45.909', '195967001', 'Asthma'),

  // Priya — pregnancy + GDM hx (resolved)
  cond('pat-priya-s', 'Z34.90', '48194001', 'Pregnancy supervision'),

  // Layla — atopic dermatitis
  cond('pat-layla-h', 'L20.9', null, 'Atopic dermatitis', { severity: 'mild' }),

  // Tom — none chronic flagged but routine
]

function cond(
  patientId: string,
  icd: string,
  snomed: string | null,
  _label: string,
  opts?: {
    severity?: 'mild' | 'moderate' | 'severe'
    onsetDaysAgo?: number
  },
): (typeof conditions)[number] {
  const id = `cond-${patientId}-${icd}`
  return {
    id,
    patientId,
    encounterId: null,
    category: 'problem_list_item',
    clinicalStatus: 'active',
    verificationStatus: 'confirmed',
    icd10: findIcd10(icd),
    snomed: snomed ? findSnomed(snomed) : null,
    severity: opts?.severity ?? null,
    onsetDate: dateOnlyDaysAgo(opts?.onsetDaysAgo ?? 730),
    resolvedDate: null,
    recordedBy: 'prac-fm-hassan',
    recordedAt: isoDaysAgo(opts?.onsetDaysAgo ?? 730),
    notes: null,
  }
}

/* ==================== medications ==================== */

let medications: MedicationRequest[] = [
  // Khalid — polypharmacy
  rx('pat-khalid-a', '11289', '5 mg', '1 tab PO QHS', 30, 5, false),
  rx('pat-khalid-a', '6918', '50 mg (succinate ER)', '1 tab PO daily', 30, 5),
  rx('pat-khalid-a', '29046', '20 mg', '1 tab PO daily', 30, 5),
  rx('pat-khalid-a', '83367', '40 mg', '1 tab PO QHS', 30, 5),
  rx('pat-khalid-a', '6809', '1000 mg', '1 tab PO BID with meals', 60, 5),
  rx('pat-khalid-a', '7646', '20 mg', '1 cap PO daily before breakfast', 30, 5),
  rx('pat-khalid-a', '36437', '50 mg', '1 tab PO daily', 30, 5),

  // Sandra — DM/HTN/lipid
  rx('pat-sandra-l', '6809', '1000 mg', '1 tab PO BID with meals', 60, 11),
  rx('pat-sandra-l', '1545653', '10 mg', '1 tab PO daily', 30, 11),
  rx('pat-sandra-l', '29046', '10 mg', '1 tab PO daily', 30, 11),
  rx('pat-sandra-l', '83367', '40 mg', '1 tab PO QHS', 30, 11),

  // Yusra — about to start levo (will be drafted later)
  // Daniel — sertraline 100 mg
  rx('pat-daniel-c', '36437', '100 mg', '1 tab PO daily', 30, 5),

  // Aisha — escitalopram 10 mg
  rx('pat-aisha-r', '321988', '10 mg', '1 tab PO daily', 30, 5),

  // Fernando — apixaban + metoprolol + atorvastatin
  rx('pat-fernando-g', '1364430', '5 mg', '1 tab PO BID', 60, 5),
  rx('pat-fernando-g', '6918', '50 mg (succinate ER)', '1 tab PO daily', 30, 5),
  rx('pat-fernando-g', '83367', '40 mg', '1 tab PO QHS', 30, 5),

  // Marcus — asthma
  rx('pat-marcus-j', '435', '90 mcg/spray inhaler', '2 puffs INH q4h PRN wheeze', 1, 5),
  rx('pat-marcus-j', '745679', '100/50 mcg DPI', '1 puff INH BID', 1, 5),

  // Priya — prenatal vitamin (no rxnorm here, free-text instead — use cetirizine as a placeholder script for hayfever)
  rx('pat-priya-s', '1424', '10 mg', '1 tab PO daily PRN allergies', 30, 3),
]

function rx(
  patientId: string,
  rxcui: string,
  strengthLabel: string,
  sigText: string,
  quantity: number,
  refills: number,
  active = true,
): MedicationRequest {
  const drug = RXNORM.find((d) => d.rxcui === rxcui)
  if (!drug) throw new Error(`rxnorm missing ${rxcui}`)
  const id = `rx-${patientId}-${rxcui}`
  const route = drug.defaultRoute
  return {
    id,
    patientId,
    encounterId: null,
    status: active ? 'active' : 'completed',
    intent: 'order',
    medication: findRxNorm(rxcui),
    strengthLabel,
    dosage: {
      text: sigText,
      doseValue: drug.strengths[0]?.magnitude ?? 0,
      doseUnit: drug.strengths[0]?.unit ?? 'mg',
      route,
      frequency: sigText.split(' ').slice(2).join(' '),
      durationDays: null,
      asNeeded: sigText.includes('PRN'),
      asNeededReason: sigText.includes('PRN') ? sigText.split('PRN').pop()?.trim() ?? null : null,
    },
    refillsAuthorized: refills,
    refillsRemaining: Math.max(0, refills - 1),
    quantity,
    quantityUnit: drug.strengths[0]?.form === 'oral_susp' ? 'mL' : drug.strengths[0]?.form === 'inhaler' ? 'inhaler' : 'tab',
    daysSupply: 30,
    substitutionAllowed: true,
    indicationConditionId: null,
    pharmacyId: 'rx-walgreens-mission',
    prescribedBy: 'prac-fm-hassan',
    authoredOn: isoDaysAgo(45),
    controlled: !!drug.controlled,
    controlledSchedule: drug.controlled ?? null,
    notes: null,
  }
}

const homeMeds: MedicationStatement[] = [
  {
    id: 'medstmt-priya-prenatal',
    patientId: 'pat-priya-s',
    status: 'active',
    medication: {
      system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
      code: '798221',
      display: 'prenatal vitamins',
    },
    strengthLabel: 'standard',
    dosage: null,
    effectivePeriod: { start: isoDaysAgo(120), end: null },
    source: 'patient',
    recordedAt: isoDaysAgo(60),
    notes: 'Took since 6 weeks gestation.',
  },
  {
    id: 'medstmt-tom-otc-asa',
    patientId: 'pat-tom-o',
    status: 'active',
    medication: {
      system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
      code: '1191',
      display: 'aspirin',
    },
    strengthLabel: '81 mg',
    dosage: null,
    effectivePeriod: { start: isoDaysAgo(800), end: null },
    source: 'patient',
    recordedAt: isoDaysAgo(180),
    notes: 'Daily for cardiovascular prevention; recommended by prior PCP.',
  },
]

let refillRequests: RefillRequest[] = [
  rxr('pat-khalid-a', '6809', '1000 mg', 'pending'),
  rxr('pat-sandra-l', '6809', '1000 mg', 'pending'),
  rxr('pat-fernando-g', '1364430', '5 mg', 'pending'),
  rxr('pat-daniel-c', '36437', '100 mg', 'pending'),
  rxr('pat-marcus-j', '435', '90 mcg/spray inhaler', 'pending'),
]
function rxr(
  patientId: string,
  rxcui: string,
  strengthLabel: string,
  status: RefillRequest['status'],
): RefillRequest {
  const p = patientById.get(patientId)!
  const drug = RXNORM.find((d) => d.rxcui === rxcui)!
  return {
    id: `rxr-${patientId}-${rxcui}`,
    patientId,
    patientName: fullName(p),
    medication: findRxNorm(rxcui),
    strengthLabel,
    pharmacyId: 'rx-walgreens-mission',
    pharmacyName: 'Walgreens — Mission',
    receivedAt: isoDaysAgo(1),
    status,
    controlled: !!drug.controlled,
    prescribedBy: 'prac-fm-hassan',
  }
}

/* ==================== immunizations ==================== */

const immunizations: Immunization[] = [
  // Layla 18 mo — schedule complete except DTaP-IPV-Hep boosters at 18 mo are due
  imm('pat-layla-h', '08', 'Birth dose', 0),
  imm('pat-layla-h', '08', 'Dose 2', -2 + 18),
  imm('pat-layla-h', '08', 'Dose 3', -6 + 18),
  imm('pat-layla-h', '20', 'Dose 1', -2 + 18),
  imm('pat-layla-h', '20', 'Dose 2', -4 + 18),
  imm('pat-layla-h', '20', 'Dose 3', -6 + 18),
  imm('pat-layla-h', '17', 'Dose 1', -2 + 18),
  imm('pat-layla-h', '17', 'Dose 2', -4 + 18),
  imm('pat-layla-h', '17', 'Dose 3', -6 + 18),
  imm('pat-layla-h', '133', 'Dose 1', -2 + 18),
  imm('pat-layla-h', '133', 'Dose 2', -4 + 18),
  imm('pat-layla-h', '133', 'Dose 3', -6 + 18),
  imm('pat-layla-h', '10', 'Dose 1', -2 + 18),
  imm('pat-layla-h', '10', 'Dose 2', -4 + 18),
  imm('pat-layla-h', '10', 'Dose 3', -6 + 18),
  imm('pat-layla-h', '116', 'Dose 1', -2 + 18),
  imm('pat-layla-h', '116', 'Dose 2', -4 + 18),
  imm('pat-layla-h', '03', 'Dose 1', -12 + 18),
  imm('pat-layla-h', '21', 'Dose 1', -12 + 18),
  imm('pat-layla-h', '83', 'Dose 1', -12 + 18),

  // Marcus — completed peds, has flu this year
  imm('pat-marcus-j', '150', 'Annual', -90),

  // Tom — overdue Tdap, Shingrix series outstanding
  // (no records produces "due" entries)

  // Priya — flu in pregnancy
  imm('pat-priya-s', '150', 'Annual', -60),
  imm('pat-priya-s', '115', 'Single dose (Tdap in pregnancy)', -30),

  // Khalid — last flu and PCV
  imm('pat-khalid-a', '150', 'Annual', -180),
  imm('pat-khalid-a', '215', 'PCV15 once', -200),
]
function imm(
  patientId: string,
  cvxCode: string,
  doseLabel: string,
  daysAgo: number,
): Immunization {
  const v = CVX.find((x) => x.code === cvxCode)
  if (!v) throw new Error(`CVX missing ${cvxCode}`)
  return {
    id: `imm-${patientId}-${cvxCode}-${doseLabel.replace(/\s+/g, '_')}`,
    patientId,
    status: 'completed',
    vaccine: findCvx(cvxCode),
    occurrenceDate: dateOnlyDaysAgo(Math.max(0, daysAgo * 30)),
    lotNumber: `L${cvxCode}-${(100 + (daysAgo % 50)).toString()}`,
    manufacturer: 'Pfizer / GSK / Sanofi (mock)',
    site: v.defaultSite ?? null,
    route: v.defaultRoute,
    doseLabel,
    performer: 'prac-peds-park',
    notes: null,
  }
}

/* ==================== observations / vitals / labs ==================== */

let observations: Observation[] = []

function vitalsBP(
  patientId: string,
  systolic: number,
  diastolic: number,
  hr: number,
  daysAgo: number,
  encounterId: string | null = null,
  flag: Observation['interpretation'] = 'N',
): Observation[] {
  const baseDt = isoDaysAgo(daysAgo)
  const bp: Observation = {
    id: `obs-${patientId}-bp-${daysAgo}`,
    patientId,
    encounterId,
    category: 'vital_signs',
    code: findLoinc('85354-9'),
    effectiveDateTime: baseDt,
    value: null,
    valueText: `${systolic}/${diastolic} mmHg`,
    components: [
      { code: findLoinc('8480-6'), value: { value: systolic, unit: 'mmHg', code: 'mm[Hg]' } },
      { code: findLoinc('8462-4'), value: { value: diastolic, unit: 'mmHg', code: 'mm[Hg]' } },
    ],
    interpretation: flag,
    referenceRange: null,
    performer: 'ma-1',
    notes: null,
  }
  const heart: Observation = {
    id: `obs-${patientId}-hr-${daysAgo}`,
    patientId,
    encounterId,
    category: 'vital_signs',
    code: findLoinc('8867-4'),
    effectiveDateTime: baseDt,
    value: { value: hr, unit: '/min' },
    valueText: null,
    components: null,
    interpretation: hr > 100 ? 'H' : hr < 50 ? 'L' : 'N',
    referenceRange: { low: 60, high: 100, text: null, unit: '/min' },
    performer: 'ma-1',
    notes: null,
  }
  return [bp, heart]
}

function vitalsAdult(
  patientId: string,
  systolic: number,
  diastolic: number,
  hr: number,
  weightKg: number,
  heightCm: number,
  tempC: number,
  daysAgo: number,
): Observation[] {
  const dt = isoDaysAgo(daysAgo)
  const out = vitalsBP(patientId, systolic, diastolic, hr, daysAgo)
  out.push({
    id: `obs-${patientId}-temp-${daysAgo}`,
    patientId,
    encounterId: null,
    category: 'vital_signs',
    code: findLoinc('8310-5'),
    effectiveDateTime: dt,
    value: { value: tempC, unit: '°C', code: 'Cel' },
    valueText: null,
    components: null,
    interpretation: tempC >= 38 ? 'H' : 'N',
    referenceRange: { low: 36.1, high: 37.5, text: null, unit: '°C' },
    performer: 'ma-1',
    notes: null,
  })
  out.push({
    id: `obs-${patientId}-wt-${daysAgo}`,
    patientId,
    encounterId: null,
    category: 'vital_signs',
    code: findLoinc('29463-7'),
    effectiveDateTime: dt,
    value: { value: weightKg, unit: 'kg', code: 'kg' },
    valueText: null,
    components: null,
    interpretation: 'N',
    referenceRange: null,
    performer: 'ma-1',
    notes: null,
  })
  out.push({
    id: `obs-${patientId}-ht-${daysAgo}`,
    patientId,
    encounterId: null,
    category: 'vital_signs',
    code: findLoinc('8302-2'),
    effectiveDateTime: dt,
    value: { value: heightCm, unit: 'cm', code: 'cm' },
    valueText: null,
    components: null,
    interpretation: 'N',
    referenceRange: null,
    performer: 'ma-1',
    notes: null,
  })
  return out
}

// Khalid vitals series
observations.push(...vitalsAdult('pat-khalid-a', 148, 86, 78, 76.4, 174, 36.6, 14))
observations.push(...vitalsAdult('pat-khalid-a', 152, 88, 82, 76.8, 174, 36.7, 90))
observations.push(...vitalsAdult('pat-khalid-a', 158, 92, 80, 77.1, 174, 36.5, 200))
// Sandra vitals series
observations.push(...vitalsAdult('pat-sandra-l', 132, 84, 72, 84.2, 162, 36.7, 7))
observations.push(...vitalsAdult('pat-sandra-l', 136, 86, 76, 85.0, 162, 36.7, 95))
// Priya
observations.push(...vitalsAdult('pat-priya-s', 118, 74, 84, 64.5, 165, 36.6, 5))
// Marcus peds — small dataset
observations.push(...vitalsAdult('pat-marcus-j', 110, 70, 92, 35.2, 138, 36.8, 30))
// Layla — peds
observations.push(...vitalsAdult('pat-layla-h', 0, 0, 110, 11.2, 81, 37.0, 30))
observations.push({
  id: `obs-pat-layla-h-hc-30`,
  patientId: 'pat-layla-h',
  encounterId: null,
  category: 'vital_signs',
  code: findLoinc('9843-4'),
  effectiveDateTime: isoDaysAgo(30),
  value: { value: 47.5, unit: 'cm', code: 'cm' },
  valueText: null,
  components: null,
  interpretation: 'N',
  referenceRange: null,
  performer: 'ma-1',
  notes: null,
})

/* ==================== diagnostic reports + lab observations ==================== */

const labReports: DiagnosticReport[] = []

function makeLab(
  patientId: string,
  panelLoinc: string,
  daysAgo: number,
  status: DiagnosticReport['status'],
  results: Array<{ loinc: string; value: number; unit: string; ref: { low: number | null; high: number | null }; flag: Observation['interpretation'] }>,
  signedDaysAgo: number | null,
): { report: DiagnosticReport; observations: Observation[] } {
  const reportId = `report-${patientId}-${panelLoinc}-${daysAgo}`
  const obs: Observation[] = results.map((r, i) => ({
    id: `${reportId}-r${i}`,
    patientId,
    encounterId: null,
    category: 'laboratory',
    code: findLoinc(r.loinc),
    effectiveDateTime: isoDaysAgo(daysAgo),
    value: { value: r.value, unit: r.unit, code: r.unit },
    valueText: null,
    components: null,
    interpretation: r.flag,
    referenceRange: { low: r.ref.low, high: r.ref.high, text: null, unit: r.unit },
    performer: 'lab-quest',
    notes: null,
  }))
  observations.push(...obs)
  const worst = obs.reduce((acc: Observation['interpretation'], o) => {
    const order = ['N', 'A', 'L', 'H', 'LL', 'HH', 'Critical']
    return order.indexOf(o.interpretation) > order.indexOf(acc) ? o.interpretation : acc
  }, 'N')
  const report: DiagnosticReport = {
    id: reportId,
    patientId,
    encounterId: null,
    status,
    category: 'LAB',
    code: findLoinc(panelLoinc),
    effectiveDateTime: isoDaysAgo(daysAgo),
    issued: isoDaysAgo(daysAgo - 1),
    performer: 'Quest Diagnostics (mock)',
    resultIds: obs.map((o) => o.id),
    conclusion: worst === 'N' ? 'No critical findings.' : 'Abnormal results — see flagged values.',
    presentedFormUrl: null,
    signedBy: signedDaysAgo !== null ? 'prac-fm-hassan' : null,
    signedAt: signedDaysAgo !== null ? isoDaysAgo(signedDaysAgo) : null,
    patientNotifiedAt: null,
  }
  labReports.push(report)
  return { report, observations: obs }
}

// Khalid — recent CMP w/ creatinine high (eGFR 42), low Hgb
makeLab(
  'pat-khalid-a',
  '24323-8',
  3,
  'final',
  [
    { loinc: '2160-0', value: 1.6, unit: 'mg/dL', ref: { low: 0.7, high: 1.3 }, flag: 'H' },
    { loinc: '33914-3', value: 42, unit: 'mL/min/{1.73_m2}', ref: { low: 60, high: 120 }, flag: 'L' },
    { loinc: '2345-7', value: 152, unit: 'mg/dL', ref: { low: 70, high: 99 }, flag: 'H' },
    { loinc: '2951-2', value: 138, unit: 'mmol/L', ref: { low: 135, high: 145 }, flag: 'N' },
    { loinc: '2823-3', value: 4.2, unit: 'mmol/L', ref: { low: 3.5, high: 5.1 }, flag: 'N' },
  ],
  null,
)

makeLab(
  'pat-khalid-a',
  '58410-2',
  5,
  'final',
  [
    { loinc: '718-7', value: 11.2, unit: 'g/dL', ref: { low: 13.5, high: 17.5 }, flag: 'L' },
    { loinc: '4544-3', value: 34, unit: '%', ref: { low: 41, high: 53 }, flag: 'L' },
    { loinc: '6690-2', value: 7.4, unit: '10*3/uL', ref: { low: 4.5, high: 11 }, flag: 'N' },
    { loinc: '777-3', value: 188, unit: '10*3/uL', ref: { low: 150, high: 400 }, flag: 'N' },
  ],
  null,
)

// Sandra — A1c trending down + lipids OK
makeLab('pat-sandra-l', '4548-4', 6, 'final', [{ loinc: '4548-4', value: 7.4, unit: '%', ref: { low: 4, high: 5.7 }, flag: 'H' }], null)
makeLab('pat-sandra-l', '4548-4', 95, 'final', [{ loinc: '4548-4', value: 7.8, unit: '%', ref: { low: 4, high: 5.7 }, flag: 'H' }], 90)
makeLab('pat-sandra-l', '4548-4', 200, 'final', [{ loinc: '4548-4', value: 8.2, unit: '%', ref: { low: 4, high: 5.7 }, flag: 'H' }], 198)

makeLab(
  'pat-sandra-l',
  '57698-3',
  6,
  'final',
  [
    { loinc: '2093-3', value: 178, unit: 'mg/dL', ref: { low: 0, high: 200 }, flag: 'N' },
    { loinc: '13457-7', value: 102, unit: 'mg/dL', ref: { low: 0, high: 130 }, flag: 'N' },
    { loinc: '2085-9', value: 48, unit: 'mg/dL', ref: { low: 40, high: null }, flag: 'N' },
    { loinc: '2571-8', value: 142, unit: 'mg/dL', ref: { low: 0, high: 150 }, flag: 'N' },
  ],
  null,
)

// Yusra — TSH trending overt + free T4 low (CRITICAL)
makeLab('pat-yusra-k', '3016-3', 1, 'final', [{ loinc: '3016-3', value: 18.4, unit: 'mIU/L', ref: { low: 0.4, high: 4 }, flag: 'Critical' }], null)
makeLab('pat-yusra-k', '3016-3', 60, 'final', [{ loinc: '3016-3', value: 6.8, unit: 'mIU/L', ref: { low: 0.4, high: 4 }, flag: 'H' }], 58)
makeLab('pat-yusra-k', '3016-3', 150, 'final', [{ loinc: '3016-3', value: 4.6, unit: 'mIU/L', ref: { low: 0.4, high: 4 }, flag: 'H' }], 148)
makeLab(
  'pat-yusra-k',
  '3024-7',
  1,
  'final',
  [{ loinc: '3024-7', value: 0.6, unit: 'ng/dL', ref: { low: 0.8, high: 1.8 }, flag: 'L' }],
  null,
)

// Fernando — INR therapeutic 2.4
makeLab('pat-fernando-g', '6301-6', 4, 'final', [{ loinc: '6301-6', value: 2.4, unit: '{INR}', ref: { low: 2, high: 3 }, flag: 'N' }], 3)

// Priya — pregnancy GTT borderline
makeLab(
  'pat-priya-s',
  '14771-0',
  10,
  'final',
  [{ loinc: '14771-0', value: 142, unit: 'mg/dL', ref: { low: 0, high: 140 }, flag: 'H' }],
  9,
)

// Tom — lipid panel a-ok corrected
makeLab(
  'pat-tom-o',
  '57698-3',
  20,
  'corrected',
  [
    { loinc: '2093-3', value: 196, unit: 'mg/dL', ref: { low: 0, high: 200 }, flag: 'N' },
    { loinc: '13457-7', value: 118, unit: 'mg/dL', ref: { low: 0, high: 130 }, flag: 'N' },
  ],
  18,
)

// Sandra recent CMP normal
makeLab(
  'pat-sandra-l',
  '24323-8',
  6,
  'final',
  [
    { loinc: '2160-0', value: 0.9, unit: 'mg/dL', ref: { low: 0.7, high: 1.3 }, flag: 'N' },
    { loinc: '33914-3', value: 88, unit: 'mL/min/{1.73_m2}', ref: { low: 60, high: 120 }, flag: 'N' },
  ],
  null,
)

// Marcus CBC normal
makeLab('pat-marcus-j', '58410-2', 12, 'final', [{ loinc: '718-7', value: 13.2, unit: 'g/dL', ref: { low: 11.5, high: 15.5 }, flag: 'N' }], 10)

/* ==================== orders ==================== */

const orders: ServiceRequest[] = [
  // Khalid — repeat CMP next week
  {
    id: 'sr-khalid-cmp',
    patientId: 'pat-khalid-a',
    encounterId: null,
    category: 'lab',
    status: 'active',
    code: findLoinc('24323-8'),
    priority: 'routine',
    authoredOn: isoDaysAgo(2),
    authoredBy: 'prac-fm-hassan',
    occurrenceDateTime: isoDaysAhead(7),
    reasonCodes: [findIcd10('N18.3'), findIcd10('I10')],
    notes: 'Recheck in 1 week given eGFR 42.',
  },
  // Yusra — start levo + repeat TSH 6 weeks
  {
    id: 'sr-yusra-tsh',
    patientId: 'pat-yusra-k',
    encounterId: null,
    category: 'lab',
    status: 'active',
    code: findLoinc('3016-3'),
    priority: 'routine',
    authoredOn: isoDaysAgo(0.1 as unknown as number),
    authoredBy: 'prac-fm-hassan',
    occurrenceDateTime: isoDaysAhead(42),
    reasonCodes: [findIcd10('E03.9')],
    notes: 'Recheck after starting levothyroxine 25 mcg.',
  },
  // Sandra — annual UACR + DM foot exam follow-up next visit
  {
    id: 'sr-sandra-uacr',
    patientId: 'pat-sandra-l',
    encounterId: null,
    category: 'lab',
    status: 'active',
    code: findLoinc('14959-1'),
    priority: 'routine',
    authoredOn: isoDaysAgo(8),
    authoredBy: 'prac-fm-hassan',
    occurrenceDateTime: isoDaysAhead(0),
    reasonCodes: [findIcd10('E11.65')],
    notes: 'Microalbumin annual screen.',
  },
]

/* ==================== imaging ==================== */

const imagingStudies: ImagingStudy[] = [
  {
    id: 'img-fernando-echo',
    patientId: 'pat-fernando-g',
    encounterId: null,
    modality: 'US',
    bodyPart: 'Heart',
    laterality: 'na',
    contrast: false,
    studyDescription: 'Transthoracic echocardiogram (complete)',
    accessionNumber: 'ACC-100001',
    studyUid: '1.2.3.4.5.6.7.8.1',
    performedAt: isoDaysAgo(180),
    performingFacility: 'UCSF Mission Bay (mock)',
    status: 'final_read',
    radiologist: 'Dr. R. Chen, MD',
    findings: 'EF 48% (mildly reduced). Trace MR. No effusion.',
    impression: 'Mildly reduced LV systolic function. Stable from prior 2024.',
    pacsUrl: 'https://pacs.example/studies/1.2.3.4.5.6.7.8.1',
    presentedFormUrl: null,
  },
  {
    id: 'img-fernando-ekg',
    patientId: 'pat-fernando-g',
    encounterId: null,
    modality: 'OT',
    bodyPart: 'Heart',
    laterality: 'na',
    contrast: false,
    studyDescription: '12-lead ECG',
    accessionNumber: 'ACC-100002',
    studyUid: '1.2.3.4.5.6.7.8.2',
    performedAt: isoDaysAgo(25),
    performingFacility: 'In-office',
    status: 'final_read',
    radiologist: null,
    findings: 'AFib at rate 78. No acute ST/T changes.',
    impression: 'AFib with controlled ventricular response.',
    pacsUrl: null,
    presentedFormUrl: null,
  },
  {
    id: 'img-priya-anatomy',
    patientId: 'pat-priya-s',
    encounterId: null,
    modality: 'US',
    bodyPart: 'Obstetric',
    laterality: 'na',
    contrast: false,
    studyDescription: 'OB anatomy ultrasound 20w',
    accessionNumber: 'ACC-100003',
    studyUid: '1.2.3.4.5.6.7.8.3',
    performedAt: isoDaysAgo(15),
    performingFacility: 'Acme Imaging',
    status: 'final_read',
    radiologist: 'Dr. M. Park, MD',
    findings: 'Single live intrauterine pregnancy. EFW 350 g (50th %ile). All anatomy visualized normally. Anterior placenta clear of os.',
    impression: 'Normal anatomy survey at 22 weeks.',
    pacsUrl: 'https://pacs.example/studies/1.2.3.4.5.6.7.8.3',
    presentedFormUrl: null,
  },
  {
    id: 'img-nora-derm',
    patientId: 'pat-nora-m',
    encounterId: null,
    modality: 'OT',
    bodyPart: 'Skin (R upper back)',
    laterality: 'right',
    contrast: false,
    studyDescription: 'Punch biopsy of pigmented lesion',
    accessionNumber: 'ACC-100004',
    studyUid: '1.2.3.4.5.6.7.8.4',
    performedAt: isoDaysAgo(7),
    performingFacility: 'Acme Path Lab',
    status: 'dictated',
    radiologist: 'Dr. K. Asante, MD',
    findings: 'Pending dermpath review.',
    impression: null,
    pacsUrl: null,
    presentedFormUrl: null,
  },
]

/* ==================== encounters + notes ==================== */

const encounters: Encounter[] = []
const encounterNotes: Record<string, EncounterNote> = {}

function mkEnc(opts: {
  id: string
  patientId: string
  providerId: string
  classOf: Encounter['class']
  status: Encounter['status']
  visitType: string
  daysAgo: number
  reason: string
  primaryDx?: { code: string; display: string } | null
}): Encounter {
  const p = patientById.get(opts.patientId)!
  const start = isoDaysAgo(opts.daysAgo)
  const end = opts.status === 'finished' ? isoDaysAgo(opts.daysAgo - 0.02) : null
  const enc: Encounter = {
    id: opts.id,
    patientId: opts.patientId,
    patientName: fullName(p),
    class: opts.classOf,
    status: opts.status,
    visitType: opts.visitType,
    providerId: opts.providerId,
    providerName: practitionerName(opts.providerId),
    locationId: opts.classOf === 'VR' ? 'loc-virtual' : 'loc-main',
    locationName: opts.classOf === 'VR' ? 'Acme Telehealth' : 'Acme Medical — Main',
    startAt: start,
    endAt: end,
    reasonText: opts.reason,
    primaryDxCode: opts.primaryDx?.code ?? null,
    primaryDxDisplay: opts.primaryDx?.display ?? null,
  }
  encounters.push(enc)
  return enc
}

const encKhalidRecent = mkEnc({
  id: 'enc-khalid-1',
  patientId: 'pat-khalid-a',
  providerId: 'prac-fm-hassan',
  classOf: 'AMB',
  status: 'finished',
  visitType: '99214 — Established office visit',
  daysAgo: 14,
  reason: 'Recheck DM/HTN/AFib + INR review',
  primaryDx: { code: 'I48.91', display: 'Atrial fibrillation' },
})
const encSandraRecent = mkEnc({
  id: 'enc-sandra-1',
  patientId: 'pat-sandra-l',
  providerId: 'prac-fm-hassan',
  classOf: 'AMB',
  status: 'finished',
  visitType: '99214 — Established office visit',
  daysAgo: 7,
  reason: 'Diabetes follow-up, HbA1c review',
  primaryDx: { code: 'E11.65', display: 'T2DM hyperglycemia' },
})
const encPriya = mkEnc({
  id: 'enc-priya-1',
  patientId: 'pat-priya-s',
  providerId: 'prac-ob-adeyemi',
  classOf: 'AMB',
  status: 'finished',
  visitType: 'Prenatal visit',
  daysAgo: 5,
  reason: 'Routine OB visit at 22 weeks',
  primaryDx: { code: 'Z34.91', display: 'Normal pregnancy supervision T1' },
})
mkEnc({
  id: 'enc-aisha-tele',
  patientId: 'pat-aisha-r',
  providerId: 'prac-psych-vargas',
  classOf: 'VR',
  status: 'planned',
  visitType: 'Telehealth follow-up',
  daysAgo: -1,
  reason: 'Anxiety follow-up + medication review',
  primaryDx: { code: 'F41.1', display: 'GAD' },
})
mkEnc({
  id: 'enc-marcus-1',
  patientId: 'pat-marcus-j',
  providerId: 'prac-peds-park',
  classOf: 'AMB',
  status: 'planned',
  visitType: 'Well-child visit',
  daysAgo: -2,
  reason: 'Well-child 9 yr',
  primaryDx: { code: 'Z00.121', display: 'Routine child exam' },
})

function emptyRos(): Record<string, string> {
  return {
    constitutional: '',
    eyes: '',
    ent: '',
    cardiovascular: '',
    respiratory: '',
    gi: '',
    gu: '',
    musculoskeletal: '',
    skin: '',
    neurological: '',
    psychiatric: '',
    endocrine: '',
    heme_lymph: '',
    allergic_immuno: '',
  }
}

encounterNotes[encKhalidRecent.id] = {
  id: `note-${encKhalidRecent.id}`,
  encounterId: encKhalidRecent.id,
  patientId: 'pat-khalid-a',
  state: 'signed',
  noteType: 'soap',
  soap: {
    subjective: {
      chiefComplaint: 'Routine recheck of DM, HTN, AFib.',
      hpi: 'No new chest pain. Reports occasional dizziness on rising. INR home reading 2.3 last week. Glucose log shows fasting 130–150 mg/dL. Adherent with all meds.',
      ros: { ...emptyRos(), constitutional: 'Mild fatigue. No fevers, weight stable.' },
      pmh: 'AFib, T2DM, HTN, hyperlipidemia, CKD stage 3b, MDD.',
      psh: 'CABG 2018.',
      fh: 'Father: stroke at 70. Mother: T2DM.',
      sh: 'Retired. Lives with daughter. No tobacco. No alcohol.',
    },
    objective: {
      examFreeText:
        'Gen: Alert, comfortable. Heart: irregular, no murmur. Lungs: clear. Abd: soft. Neuro: no focal deficit. Ext: no edema.',
      examBySystem: {},
    },
    assessment: [
      {
        conditionId: 'cond-pat-khalid-a-I48.91',
        icd10: findIcd10('I48.91'),
        note: 'AFib — rate-controlled on metoprolol; INR therapeutic on warfarin.',
      },
      {
        conditionId: 'cond-pat-khalid-a-E11.9',
        icd10: findIcd10('E11.9'),
        note: 'T2DM — A1c 7.4 last; continue metformin.',
      },
      {
        conditionId: 'cond-pat-khalid-a-N18.3',
        icd10: findIcd10('N18.3'),
        note: 'CKD 3b — eGFR 42, monitor; avoid nephrotoxins.',
      },
    ],
    plan: 'Recheck CMP in 1 week. Continue current regimen. Fall precautions discussed (cane). Return in 4 weeks.',
  },
  authorId: 'prac-fm-hassan',
  cosignerId: null,
  signedBy: 'prac-fm-hassan',
  signedAt: isoDaysAgo(13.95),
  draftSavedAt: isoDaysAgo(14),
  addenda: [],
}

encounterNotes[encSandraRecent.id] = {
  id: `note-${encSandraRecent.id}`,
  encounterId: encSandraRecent.id,
  patientId: 'pat-sandra-l',
  state: 'signed',
  noteType: 'soap',
  soap: {
    subjective: {
      chiefComplaint: 'Diabetes follow-up.',
      hpi: 'A1c improved 8.2 → 7.8 → 7.4. No hypoglycemia. Walking 30 min 4×/wk.',
      ros: { ...emptyRos() },
      pmh: 'T2DM, HTN, hyperlipidemia.',
      psh: 'None.',
      fh: 'Mother T2DM, father MI at 55.',
      sh: 'Married. Two children. Office worker. No tobacco. Wine 1×/wk.',
    },
    objective: {
      examFreeText: 'Gen: well-appearing. Heart: RRR. Lungs: CTAB. Feet: monofilament intact, no ulcer.',
      examBySystem: {},
    },
    assessment: [
      { conditionId: 'cond-pat-sandra-l-E11.65', icd10: findIcd10('E11.65'), note: 'T2DM controlled, trending down.' },
    ],
    plan: 'Continue metformin, empagliflozin, lisinopril, atorvastatin. Annual UACR ordered. Eye exam due — referral placed.',
  },
  authorId: 'prac-fm-hassan',
  cosignerId: null,
  signedBy: 'prac-fm-hassan',
  signedAt: isoDaysAgo(6.95),
  draftSavedAt: isoDaysAgo(7),
  addenda: [],
}

encounterNotes[encPriya.id] = {
  id: `note-${encPriya.id}`,
  encounterId: encPriya.id,
  patientId: 'pat-priya-s',
  state: 'signed',
  noteType: 'soap',
  soap: {
    subjective: {
      chiefComplaint: 'Routine OB at 22 weeks.',
      hpi: 'Feeling fetal movement daily. No bleeding, no contractions. No headaches. PNV adherent.',
      ros: { ...emptyRos() },
      pmh: 'GDM in prior pregnancy (diet controlled).',
      psh: 'C-section 2022.',
      fh: 'Notable for T2DM father.',
      sh: 'Married. Software engineer. Strict vegetarian.',
    },
    objective: {
      examFreeText: 'BP 118/74. FHR 152 bpm. Fundal height 22 cm. Anatomy US today reassuring.',
      examBySystem: {},
    },
    assessment: [{ conditionId: null, icd10: findIcd10('Z34.91'), note: 'Normal IUP at 22 weeks.' }],
    plan: 'GTT borderline — repeat 75g 2hr planned. Continue PNV. Iron started. RTC 4 weeks.',
  },
  authorId: 'prac-ob-adeyemi',
  cosignerId: null,
  signedBy: 'prac-ob-adeyemi',
  signedAt: isoDaysAgo(4.95),
  draftSavedAt: isoDaysAgo(5),
  addenda: [],
}

/* ==================== pregnancies + prenatal ==================== */

const pregnancies: Pregnancy[] = [
  {
    id: 'preg-priya',
    patientId: 'pat-priya-s',
    status: 'active',
    lmpDate: dateOnlyDaysAgo(154),
    eddDate: dateOnlyDaysAgo(154 - 280),
    gaWeeks: 22,
    gaDays: 0,
    gravida: 2,
    para: 1,
    tpalT: 1,
    tpalP: 0,
    tpalA: 0,
    tpalL: 1,
    bloodType: 'A',
    rhFactor: '+',
    notes: 'Hx of GDM in prior pregnancy.',
  },
]

const prenatalVisits: PrenatalVisit[] = [
  pv('preg-priya', 8, 0, 110, 70, 60.5),
  pv('preg-priya', 12, 1, 112, 70, 61.2, 12, 142),
  pv('preg-priya', 16, 2, 116, 72, 62.5, 16, 148),
  pv('preg-priya', 20, 1, 118, 74, 63.4, 20, 152),
  pv('preg-priya', 22, 0, 118, 74, 64.5, 22, 152),
]
function pv(
  pregId: string,
  weeks: number,
  days: number,
  systolic: number,
  diastolic: number,
  weightKg: number,
  fundal?: number,
  fhr?: number,
): PrenatalVisit {
  return {
    id: `pv-${pregId}-${weeks}w${days}d`,
    pregnancyId: pregId,
    visitDate: dateOnlyDaysAgo((22 - weeks) * 7),
    gaWeeks: weeks,
    gaDays: days,
    systolic,
    diastolic,
    weightKg,
    fundalHeightCm: fundal ?? null,
    fhrBpm: fhr ?? null,
    fetalMovement: weeks >= 18 ? 'present' : 'na',
    urineProtein: 'neg',
    urineGlucose: 'neg',
    notes: null,
  }
}

const ultrasounds: UltrasoundEntry[] = [
  {
    id: 'us-priya-anatomy',
    pregnancyId: 'preg-priya',
    studyDate: dateOnlyDaysAgo(15),
    gaWeeksAtScan: 20,
    gaDaysAtScan: 0,
    bpdMm: 50,
    hcMm: 180,
    acMm: 156,
    flMm: 32,
    efwG: 350,
    afi: 14,
    notes: 'Anatomy normal.',
  },
]

/* ==================== psych scales ==================== */

const psychScales: PsychScale[] = [
  ps('pat-daniel-c', '44249-1', 220, 18, 'severe'),
  ps('pat-daniel-c', '44249-1', 120, 12, 'moderate'),
  ps('pat-daniel-c', '44249-1', 30, 8, 'mild'),
  ps('pat-aisha-r', '44249-1', 60, 10, 'mild'),
  ps('pat-aisha-r', '69737-5', 60, 13, 'moderate'),
  ps('pat-aisha-r', '69737-5', 0.5 as unknown as number, 9, 'mild'),
]
function ps(
  patientId: string,
  loinc: string,
  daysAgo: number,
  totalScore: number,
  severity: PsychScale['severity'],
): PsychScale {
  const itemCount = loinc === '44249-1' ? 9 : 7
  const items = Array.from({ length: itemCount }, (_, i) => ({
    label: `Item ${i + 1}`,
    score: Math.round(totalScore / itemCount),
  }))
  return {
    id: `ps-${patientId}-${loinc}-${daysAgo}`,
    patientId,
    loinc: findLoinc(loinc),
    administeredAt: isoDaysAgo(daysAgo),
    totalScore,
    severity,
    items,
    notes: null,
  }
}

/* ==================== care plans ==================== */

const carePlans: CarePlan[] = [
  {
    id: 'cp-sandra-dm',
    patientId: 'pat-sandra-l',
    status: 'active',
    intent: 'plan',
    category: 'Diabetes Mellitus type 2',
    startDate: dateOnlyDaysAgo(540),
    endDate: null,
    conditionIds: ['cond-pat-sandra-l-E11.65'],
    goals: [
      {
        id: 'goal-sandra-a1c',
        patientId: 'pat-sandra-l',
        carePlanId: 'cp-sandra-dm',
        description: 'HbA1c < 7%',
        measureLoinc: findLoinc('4548-4'),
        targetLow: null,
        targetHigh: 7,
        targetUnit: '%',
        dueDate: dateOnlyDaysAgo(-90),
        achievementStatus: 'improving',
      },
      {
        id: 'goal-sandra-bp',
        patientId: 'pat-sandra-l',
        carePlanId: 'cp-sandra-dm',
        description: 'BP < 130/80',
        measureLoinc: findLoinc('85354-9'),
        targetLow: null,
        targetHigh: 130,
        targetUnit: 'mmHg',
        dueDate: null,
        achievementStatus: 'achieved',
      },
    ],
    activities: [
      { kind: 'medication', description: 'Metformin 1000 mg BID', status: 'in_progress', dueDate: null },
      { kind: 'medication', description: 'Empagliflozin 10 mg daily', status: 'in_progress', dueDate: null },
      { kind: 'observation', description: 'A1c every 3 months', status: 'scheduled', dueDate: dateOnlyDaysAgo(-90) },
      { kind: 'follow_up', description: 'Annual eye exam (referral placed)', status: 'scheduled', dueDate: dateOnlyDaysAgo(-30) },
      { kind: 'education', description: 'Diabetes self-management class', status: 'completed', dueDate: null },
    ],
  },
]

/* ==================== appointments + recalls ==================== */

const appointments: Appointment[] = [
  appt('pat-marcus-j', 'prac-peds-park', 'AMB', -2, 'Well-child 9yr', 'arrived'),
  appt('pat-aisha-r', 'prac-psych-vargas', 'VR', -1, 'Anxiety follow-up', 'booked'),
  appt('pat-sandra-l', 'prac-fm-hassan', 'AMB', -3, 'Hypertension recheck', 'booked'),
  appt('pat-khalid-a', 'prac-fm-hassan', 'AMB', -8, 'INR + DM follow-up', 'booked'),
  appt('pat-yusra-k', 'prac-fm-hassan', 'AMB', -4, 'Thyroid follow-up', 'booked'),
  appt('pat-fernando-g', 'prac-cardio-iqbal', 'AMB', -10, 'AFib clinic', 'booked'),
  appt('pat-priya-s', 'prac-ob-adeyemi', 'AMB', -5, 'Prenatal 22w', 'fulfilled'),
  appt('pat-tom-o', 'prac-fm-hassan', 'AMB', -6, 'Annual physical', 'booked'),
  appt('pat-routine-1', 'prac-fm-hassan', 'AMB', -1, 'Cough', 'booked'),
  appt('pat-routine-2', 'prac-fm-hassan', 'AMB', -1, 'Med refill', 'booked'),
  appt('pat-routine-3', 'prac-peds-park', 'AMB', -2, 'Well child', 'booked'),
  appt('pat-routine-4', 'prac-cardio-iqbal', 'AMB', -3, 'Palpitations consult', 'booked'),
  appt('pat-routine-5', 'prac-psych-vargas', 'VR', -3, 'Therapy', 'booked'),
  appt('pat-routine-6', 'prac-fm-hassan', 'AMB', 0, 'Acute visit', 'noshow'),
]
function appt(
  patientId: string,
  providerId: string,
  classOf: Encounter['class'],
  daysOffset: number,
  visitType: string,
  status: Appointment['status'],
): Appointment {
  const start = new Date(NOW)
  start.setUTCDate(start.getUTCDate() + daysOffset)
  start.setUTCHours(14 + (Math.abs(daysOffset) % 6))
  const end = new Date(start)
  end.setUTCMinutes(end.getUTCMinutes() + 30)
  const p = patientById.get(patientId)!
  const stage: Appointment['pipelineStage'] =
    status === 'arrived' ? 'arrived' : status === 'fulfilled' ? 'departed' : status === 'noshow' ? 'noshow' : 'scheduled'
  return {
    id: `appt-${patientId}-${daysOffset}`,
    patientId,
    patientName: fullName(p),
    providerId,
    providerName: practitionerName(providerId),
    locationId: classOf === 'VR' ? 'loc-virtual' : 'loc-main',
    locationName: classOf === 'VR' ? 'Acme Telehealth' : 'Acme Medical — Main',
    status,
    appointmentClass: classOf,
    visitType,
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    reasonText: visitType,
    roomedAt: status === 'arrived' ? new Date(start.getTime() + 5 * 60_000).toISOString() : null,
    pipelineStage: stage,
  }
}

const recalls: RecallEntry[] = [
  recall('pat-tom-o', 'Tdap booster (>10 yr since last)', -120, 'overdue'),
  recall('pat-tom-o', 'Shingrix dose 1', -60, 'overdue'),
  recall('pat-tom-o', 'Pneumococcal at age 65', 90, 'upcoming'),
  recall('pat-sandra-l', 'Annual diabetic eye exam', -30, 'overdue'),
  recall('pat-sandra-l', 'A1c (next due)', 80, 'upcoming'),
  recall('pat-khalid-a', 'CMP recheck', 7, 'upcoming'),
  recall('pat-yusra-k', 'TSH 6 weeks post-levo', 42, 'upcoming'),
  recall('pat-marcus-j', 'Annual flu vaccine', -10, 'due'),
  recall('pat-priya-s', 'GBS screening at 36 weeks', 95, 'upcoming'),
  recall('pat-fernando-g', 'Echo annual', 180, 'upcoming'),
  recall('pat-nora-m', 'Skin check follow-up', 14, 'upcoming'),
  recall('pat-routine-3', 'Well-child 5yr', -7, 'due'),
]
function recall(
  patientId: string,
  reason: string,
  dayOffset: number,
  status: RecallEntry['status'],
): RecallEntry {
  const p = patientById.get(patientId)!
  return {
    id: `recall-${patientId}-${reason.replace(/\s+/g, '_')}`,
    patientId,
    patientName: fullName(p),
    reason,
    dueDate: dateOnlyDaysAgo(-dayOffset),
    status,
  }
}

/* ==================== eligibility + claims + coverages ==================== */

const coverages: Coverage[] = [
  cov('pat-khalid-a', 'Medicare', 'Original Medicare A+B', 'M-100001', 'primary', 'in_network', 0, 240, 240, null, null),
  cov('pat-sandra-l', 'BCBS', 'BCBS PPO', 'BCBS-100002', 'primary', 'in_network', 30, 1500, 800, 5000, 1200),
  cov('pat-fernando-g', 'Aetna', 'Aetna Choice POS', 'AET-100003', 'primary', 'in_network', 25, 2000, 2000, 6000, 4500),
  cov('pat-priya-s', 'Kaiser', 'Kaiser Standard', 'KP-100004', 'primary', 'in_network', 20, 1000, 100, 4500, 200),
  cov('pat-aisha-r', 'United', 'UHC Choice Plus', 'UHC-100005', 'primary', 'in_network', 35, 2000, 600, 6500, 1100),
  cov('pat-marcus-j', 'BCBS', 'BCBS PPO', 'BCBS-100002A', 'primary', 'in_network', 25, 1500, 200, 5000, 600),
]
function cov(
  patientId: string,
  payor: string,
  planName: string,
  memberId: string,
  order: Coverage['order'],
  network: Coverage['network'],
  copay: number | null,
  deductibleTotal: number | null,
  deductibleMet: number | null,
  oopMaxTotal: number | null,
  oopMaxMet: number | null,
): Coverage {
  return {
    id: `cov-${patientId}`,
    patientId,
    status: 'active',
    type: 'medical',
    payor,
    planName,
    memberId,
    groupNumber: 'GRP-001',
    order,
    network,
    copay,
    deductibleTotal,
    deductibleMet,
    oopMaxTotal,
    oopMaxMet,
    effectivePeriod: { start: dateOnlyYearsAgo(2), end: null },
  }
}

const claims: Claim[] = [
  claim('pat-khalid-a', encKhalidRecent.id, 'paid', 'Medicare', ['I48.91', 'E11.9', 'I10'], '99214', [], 1, 250, 180),
  claim('pat-sandra-l', encSandraRecent.id, 'paid', 'BCBS', ['E11.65', 'I10'], '99214', [], 1, 250, 220),
  claim('pat-priya-s', encPriya.id, 'submitted', 'Kaiser', ['Z34.91'], '99214', ['25'], 1, 280, 0),
  claim('pat-aisha-r', null, 'denied', 'United', ['F41.1'], '99213', ['95'], 1, 220, 0),
  claim('pat-routine-2', null, 'submitted', 'Cigna', ['Z00.00'], '99395', [], 1, 320, 0),
  claim('pat-routine-1', null, 'paid', 'Aetna', ['J06.9'], '99213', [], 1, 200, 165),
]
function claim(
  patientId: string,
  encounterId: string | null,
  status: Claim['status'],
  payor: string,
  dxCodes: string[],
  cptCode: string,
  modifiers: string[],
  units: number,
  charge: number,
  paid: number,
): Claim {
  const p = patientById.get(patientId)!
  return {
    id: `claim-${patientId}-${encounterId ?? 'noenc'}-${cptCode}`,
    patientId,
    patientName: fullName(p),
    encounterId,
    status,
    type: 'professional',
    posCode: '11',
    serviceDate: dateOnlyDaysAgo(7),
    diagnoses: dxCodes.map((c) => findIcd10(c)),
    lines: [
      {
        id: 'line-1',
        cpt: { system: 'http://www.ama-assn.org/go/cpt', code: cptCode, display: cptCode },
        modifiers,
        units,
        unitPrice: charge,
        diagnosisPointers: dxCodes.map((_, i) => String.fromCharCode(65 + i)),
      },
    ],
    totalCharge: charge,
    totalPaid: paid,
    totalAdjustment: charge - paid - (status === 'denied' ? 0 : Math.max(0, charge - paid - 30)),
    patientResponsibility: status === 'paid' ? 30 : status === 'denied' ? charge : 0,
    payor,
    denialReason: status === 'denied' ? 'CARC 197 — Authorization missing' : null,
  }
}

/* ==================== documents + family/social history + audit ==================== */

const documents: Document[] = [
  {
    id: 'doc-khalid-er',
    patientId: 'pat-khalid-a',
    source: 'SF General Hospital',
    type: 'external_record',
    receivedAt: isoDaysAgo(45),
    pageCount: 6,
    url: '/mock/khalid-er.pdf',
    status: 'filed',
    filedBy: 'staff-1',
    notes: 'Fall, no fracture.',
  },
  {
    id: 'doc-priya-anatomy',
    patientId: 'pat-priya-s',
    source: 'Acme Imaging',
    type: 'imaging_report',
    receivedAt: isoDaysAgo(15),
    pageCount: 3,
    url: '/mock/priya-anatomy-us.pdf',
    status: 'filed',
    filedBy: 'staff-2',
    notes: null,
  },
  {
    id: 'doc-tom-fax',
    patientId: 'pat-tom-o',
    source: 'Cardiology Associates (fax)',
    type: 'fax',
    receivedAt: isoDaysAgo(2),
    pageCount: 4,
    url: '/mock/tom-cardio-fax.pdf',
    status: 'unfiled',
    filedBy: null,
    notes: null,
  },
]

const familyHistory: FamilyHistory[] = [
  {
    id: 'fh-sandra-mother',
    patientId: 'pat-sandra-l',
    relationship: 'mother',
    sex: 'female',
    bornDate: dateOnlyYearsAgo(80),
    deceasedAge: null,
    conditions: [{ snomed: findSnomed('44054006'), onsetAge: 50 }],
    notes: 'Living, T2DM diet-controlled.',
  },
  {
    id: 'fh-fernando-father',
    patientId: 'pat-fernando-g',
    relationship: 'father',
    sex: 'male',
    bornDate: dateOnlyYearsAgo(94),
    deceasedAge: 72,
    conditions: [{ snomed: findSnomed('53741008'), onsetAge: 60 }],
    notes: 'CAD, MI age 72.',
  },
]

let socialHistoryByPatient: Record<string, SocialHistory> = {
  'pat-sandra-l': {
    patientId: 'pat-sandra-l',
    smoking: 'never',
    alcohol: 'occasional',
    recreationalDrugs: null,
    occupation: 'Office worker',
    livingSituation: 'Lives with spouse and two kids',
    exercise: 'Walks 30 min, 4×/wk',
    diet: 'Low-carb attempt',
    sexualActivity: null,
    notes: null,
    recordedAt: isoDaysAgo(180),
  },
  'pat-khalid-a': {
    patientId: 'pat-khalid-a',
    smoking: 'former',
    alcohol: 'none',
    recreationalDrugs: null,
    occupation: 'Retired engineer',
    livingSituation: 'Lives with daughter',
    exercise: 'Walks short distances with cane',
    diet: 'Low-sodium attempt',
    sexualActivity: null,
    notes: 'Quit smoking 20 years ago after 30 pack-years.',
    recordedAt: isoDaysAgo(120),
  },
}

let auditEvents: AuditEvent[] = []
;(function seedAudit() {
  const actors = practitioners.map((p) => ({ id: p.id, name: practitionerName(p.id) }))
  let n = 1
  for (let d = 0; d < 14; d++) {
    for (const pat of patients.slice(0, 12)) {
      const actor = actors[(n + d) % actors.length]!
      auditEvents.push({
        id: `audit-${n++}`,
        actorId: actor.id,
        actorName: actor.name,
        action: 'chart_open',
        resourceType: 'Patient',
        resourceId: pat.id,
        patientId: pat.id,
        patientName: fullName(pat),
        occurredAt: isoDaysAgo(d + ((n % 5) * 0.1)),
        ip: '10.0.0.5',
        device: 'Web · Chrome 134',
        breakGlass: false,
        reason: null,
      })
    }
  }
  // One break-glass entry to seed the review queue
  auditEvents.push({
    id: `audit-bg-1`,
    actorId: 'prac-fm-hassan',
    actorName: practitionerName('prac-fm-hassan'),
    action: 'break_glass_open',
    resourceType: 'Patient',
    resourceId: 'pat-routine-7',
    patientId: 'pat-routine-7',
    patientName: fullName(patientById.get('pat-routine-7')!),
    occurredAt: isoDaysAgo(2),
    ip: '10.0.0.5',
    device: 'Web · Chrome 134',
    breakGlass: true,
    reason: 'On-call coverage; ER consult requested.',
  })
})()

/* ==================== overview ==================== */

function overview(): MedicalOverview {
  const labsToSign = labReports.filter((r) => !r.signedAt && r.status === 'final').length
  const refillsPending = refillRequests.filter((r) => r.status === 'pending').length
  const messagesUnread = 4
  const recallsDue = recalls.filter((r) => r.status === 'due' || r.status === 'overdue').length
  const todayApt = appointments.filter((a) => {
    const d = new Date(a.startAt)
    return Math.abs(d.getTime() - NOW.getTime()) < 36 * 3600 * 1000
  }).length
  const arrived = appointments.filter((a) => a.pipelineStage !== 'scheduled' && a.pipelineStage !== 'noshow').length
  const arOutstanding = claims
    .filter((c) => c.status === 'submitted' || c.status === 'denied')
    .reduce((s, c) => s + c.totalCharge - c.totalPaid, 0)
  return {
    asOf: NOW.toISOString(),
    patientsTotal: patients.length,
    patientsTodayScheduled: todayApt,
    patientsArrived: arrived,
    labsToSign,
    refillsPending,
    messagesUnread,
    recallsDue,
    arDays: 28,
    arOutstanding,
    currency: CURRENCY,
  }
}

/* ==================== aggregators / responses ==================== */

function buildPatientDetail(id: string): PatientDetail | null {
  const p = patientById.get(id)
  if (!p) return null
  const provider = p.primaryProviderId ? practitionerById.get(p.primaryProviderId) : null
  const age = ageFromDob(p.dateOfBirth)
  const myConditions = conditions.filter((c) => c.patientId === id && c.clinicalStatus === 'active')
  const myAllergies = allergies.filter((a) => a.patientId === id)
  const myMeds = medications.filter((m) => m.patientId === id && m.status === 'active')
  const latest = latestVitals(id)
  const activePregnancy = pregnancies.find((pg) => pg.patientId === id && pg.status === 'active') ?? null
  let pedsWeightStaleDays: number | null = null
  if (age < 18) {
    const weights = observations
      .filter((o) => o.patientId === id && o.code.code === '29463-7')
      .sort((a, b) => b.effectiveDateTime.localeCompare(a.effectiveDateTime))
    if (weights[0]) {
      const ageDays = (NOW.getTime() - new Date(weights[0].effectiveDateTime).getTime()) / 86_400_000
      pedsWeightStaleDays = Math.floor(ageDays)
    } else {
      pedsWeightStaleDays = 9999
    }
  }
  return {
    patient: p,
    primaryProviderName: provider ? `Dr. ${provider.firstName} ${provider.lastName}` : null,
    age,
    ageBand: ageBand(age),
    snapshot: {
      activeProblems: myConditions.map((c) => c.icd10),
      activeAllergies: myAllergies.map((a) => ({
        substance: a.substance,
        criticality: a.criticality,
        reactionText: a.reactionText,
      })),
      activeMedications: myMeds.map((m) => ({
        medication: m.medication,
        strengthLabel: m.strengthLabel,
        dosageText: m.dosage.text,
      })),
      latestVitals: latest,
      activePregnancy,
      pedsWeightStaleDays,
    },
  }
}

function latestVitals(patientId: string): VitalsResponse['latest'] {
  const my = observations.filter((o) => o.patientId === patientId && o.category === 'vital_signs')
  if (my.length === 0) return null
  // Pick most recent date, then assemble snapshot
  const sorted = [...my].sort((a, b) => b.effectiveDateTime.localeCompare(a.effectiveDateTime))
  const dt = sorted[0]!.effectiveDateTime
  const sameDay = sorted.filter((o) => o.effectiveDateTime === dt)
  const bp = sameDay.find((o) => o.code.code === '85354-9')
  const hr = sameDay.find((o) => o.code.code === '8867-4')
  const temp = sameDay.find((o) => o.code.code === '8310-5')
  const wt = sameDay.find((o) => o.code.code === '29463-7')
  const ht = sameDay.find((o) => o.code.code === '8302-2')
  const systolic = bp?.components?.[0]?.value.value ?? null
  const diastolic = bp?.components?.[1]?.value.value ?? null
  const weightKg = wt?.value?.value ?? null
  const heightCm = ht?.value?.value ?? null
  const bmi = weightKg && heightCm ? weightKg / Math.pow(heightCm / 100, 2) : null
  return {
    systolic,
    diastolic,
    heartRate: hr?.value?.value ?? null,
    temperatureC: temp?.value?.value ?? null,
    weightKg,
    heightCm,
    bmi,
    spo2: null,
    effectiveDateTime: dt,
  }
}

function applyPatientFilters(items: Patient[], f: PatientListFilters): Patient[] {
  let out = [...items]
  if (f.search) {
    const needle = f.search.toLowerCase()
    out = out.filter(
      (p) =>
        `${p.name.given} ${p.name.family}`.toLowerCase().includes(needle) ||
        p.mrn.toLowerCase().includes(needle) ||
        p.telecom.some((t) => t.value.toLowerCase().includes(needle)),
    )
  }
  if (f.primaryProviderId) {
    out = out.filter((p) => p.primaryProviderId === f.primaryProviderId)
  }
  if (f.flag) {
    out = out.filter((p) => p.flags.includes(f.flag!))
  }
  return out
}

function dueImmunizations(patientId: string): ImmunizationDue[] {
  const p = patientById.get(patientId)
  if (!p) return []
  const age = ageFromDob(p.dateOfBirth)
  const ageMonths = Math.floor((NOW.getTime() - new Date(p.dateOfBirth).getTime()) / (30 * 86_400_000))
  const given = new Set(immunizations.filter((i) => i.patientId === patientId).map((i) => `${i.vaccine.code}-${i.doseLabel}`))
  const out: ImmunizationDue[] = []
  for (const v of CVX) {
    for (const dose of v.schedule ?? []) {
      const key = `${v.code}-${dose.doseLabel}`
      if (given.has(key)) continue
      const recommendedAt = dose.ageMonths
      const dueDate = new Date(p.dateOfBirth)
      dueDate.setUTCMonth(dueDate.getUTCMonth() + recommendedAt)
      const dateIso = dueDate.toISOString().slice(0, 10)
      const status: ImmunizationDue['status'] =
        ageMonths > recommendedAt + 1 ? 'overdue' : ageMonths >= recommendedAt - 1 ? 'due' : 'upcoming'
      // Don't surface peds doses for adults
      if (age >= 18 && recommendedAt < 12 * 18) continue
      out.push({
        vaccineCode: v.code,
        vaccineDisplay: v.display,
        doseLabel: dose.doseLabel,
        recommendedAtMonths: recommendedAt,
        status,
        dueDate: dateIso,
      })
    }
  }
  // Adult overdue Tdap for Tom
  if (patientId === 'pat-tom-o') {
    out.push({
      vaccineCode: '115',
      vaccineDisplay: 'Tdap',
      doseLabel: 'Decennial booster',
      recommendedAtMonths: null,
      status: 'overdue',
      dueDate: dateOnlyDaysAgo(120),
    })
    out.push({
      vaccineCode: '187',
      vaccineDisplay: 'Shingrix',
      doseLabel: 'Dose 1',
      recommendedAtMonths: null,
      status: 'overdue',
      dueDate: dateOnlyDaysAgo(60),
    })
  }
  return out
}

function buildLabInbox(): LabInboxResponse {
  const items = labReports
    .map((r) => {
      const p = patientById.get(r.patientId)
      const myObs = observations.filter((o) => r.resultIds.includes(o.id))
      const order = ['N', 'A', 'L', 'H', 'LL', 'HH', 'Critical']
      const worst = myObs.reduce((acc: Observation['interpretation'], o) => {
        return order.indexOf(o.interpretation) > order.indexOf(acc) ? o.interpretation : acc
      }, 'N' as Observation['interpretation'])
      return {
        reportId: r.id,
        patientId: r.patientId,
        patientName: p ? fullName(p) : 'Unknown',
        panelDisplay: r.code.display,
        status: r.status,
        worstFlag: worst,
        effectiveDateTime: r.effectiveDateTime,
        signedAt: r.signedAt,
        hasCritical: worst === 'Critical' || worst === 'HH' || worst === 'LL',
      }
    })
    .sort((a, b) => b.effectiveDateTime.localeCompare(a.effectiveDateTime))
  return {
    items,
    totals: {
      unread: items.filter((i) => !i.signedAt).length,
      critical: items.filter((i) => i.hasCritical).length,
      abnormal: items.filter((i) => i.worstFlag !== 'N').length,
    },
  }
}

function buildLabReportDetail(reportId: string): LabReportDetail | null {
  const r = labReports.find((x) => x.id === reportId)
  if (!r) return null
  const p = patientById.get(r.patientId)
  const results = observations.filter((o) => r.resultIds.includes(o.id))
  // Trend: same analytes across all reports for this patient
  const analytes = new Map<string, { display: string; points: { effectiveDateTime: string; value: number; unit: string; interpretation: Observation['interpretation'] }[] }>()
  for (const o of observations) {
    if (o.patientId !== r.patientId) continue
    if (!o.value) continue
    const cur = analytes.get(o.code.code) ?? { display: o.code.display, points: [] }
    cur.points.push({
      effectiveDateTime: o.effectiveDateTime,
      value: o.value.value,
      unit: o.value.unit,
      interpretation: o.interpretation,
    })
    analytes.set(o.code.code, cur)
  }
  return {
    report: r,
    patientName: p ? fullName(p) : 'Unknown',
    results,
    trend: Array.from(analytes.entries())
      .filter(([, v]) => v.points.length > 1)
      .map(([code, v]) => ({
        analyteLoinc: code,
        analyteDisplay: v.display,
        points: v.points.sort((a, b) => a.effectiveDateTime.localeCompare(b.effectiveDateTime)),
      })),
  }
}

/* ==================== exported mock surface ==================== */

export const medicalMocks = {
  /* people / org */
  practitioners(): Practitioner[] {
    return practitioners
  },
  locations(): Location[] {
    return locations
  },
  pharmacies(): Pharmacy[] {
    return pharmacies
  },

  /* patients */
  listPatients(filters: PatientListFilters): PatientsResponse {
    const items = applyPatientFilters(patients, filters).sort((a, b) =>
      `${a.name.family} ${a.name.given}`.localeCompare(`${b.name.family} ${b.name.given}`),
    )
    return { items, total: items.length }
  },

  getPatient(id: string): PatientDetail | null {
    return buildPatientDetail(id)
  },

  /* allergies */
  allergiesFor(id: string) {
    const items = allergies.filter((a) => a.patientId === id)
    return {
      items,
      noKnownAllergies: items.length === 0 && noKnownAllergyPatients.has(id),
    }
  },
  addAllergy(patientId: string, input: Parameters<typeof allergies.push>[0]) {
    const created: Allergy = {
      ...input,
      id: `alg-${Date.now()}`,
      patientId,
      recordedBy: 'prac-fm-hassan',
      recordedAt: NOW.toISOString(),
    }
    allergies = [created, ...allergies]
    if (input.criticality === 'high') {
      const p = patientById.get(patientId)
      if (p && !p.flags.includes('allergy_high')) {
        p.flags = [...p.flags, 'allergy_high']
      }
    }
    return created
  },

  /* problems */
  problemsFor(id: string) {
    return { items: conditions.filter((c) => c.patientId === id) }
  },
  addProblem(patientId: string, input: Parameters<typeof conditions.push>[0]) {
    const created = {
      ...input,
      id: `cond-${Date.now()}`,
      patientId,
      recordedBy: 'prac-fm-hassan',
      recordedAt: NOW.toISOString(),
    }
    conditions = [created, ...conditions]
    return created
  },

  /* meds + refills */
  medicationsFor(id: string) {
    return {
      active: medications.filter((m) => m.patientId === id && m.status === 'active'),
      prior: medications.filter((m) => m.patientId === id && m.status !== 'active'),
      homeMeds: homeMeds.filter((m) => m.patientId === id),
    }
  },
  refillRequests() {
    return { items: [...refillRequests].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)) }
  },
  prescribe(input: {
    patientId: string
    encounterId: string | null
    medication: MedicationRequest['medication']
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
  }): MedicationRequest {
    const created: MedicationRequest = {
      id: `rx-${input.patientId}-${input.medication.code}-${Date.now()}`,
      patientId: input.patientId,
      encounterId: input.encounterId,
      status: 'active',
      intent: 'order',
      medication: input.medication,
      strengthLabel: input.strengthLabel,
      dosage: input.dosage,
      refillsAuthorized: input.refillsAuthorized,
      refillsRemaining: input.refillsAuthorized,
      quantity: input.quantity,
      quantityUnit: input.quantityUnit,
      daysSupply: input.daysSupply,
      substitutionAllowed: input.substitutionAllowed,
      indicationConditionId: null,
      pharmacyId: input.pharmacyId,
      prescribedBy: 'prac-fm-hassan',
      authoredOn: NOW.toISOString(),
      controlled: input.controlled,
      controlledSchedule: input.controlledSchedule,
      notes: input.notes,
    }
    medications = [created, ...medications]
    return created
  },
  discontinueRx(rxId: string, status: 'stopped' | 'on_hold' | 'completed' | 'cancelled') {
    const idx = medications.findIndex((m) => m.id === rxId)
    if (idx === -1) return null
    medications[idx] = { ...medications[idx]!, status }
    return medications[idx]!
  },
  approveRefill(id: string) {
    refillRequests = refillRequests.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    return medicalMocks.refillRequests()
  },
  denyRefill(id: string) {
    refillRequests = refillRequests.map((r) => (r.id === id ? { ...r, status: 'denied' } : r))
    return medicalMocks.refillRequests()
  },

  /* immunizations */
  immunizationsFor(id: string): ImmunizationsResponse {
    return {
      given: immunizations.filter((i) => i.patientId === id),
      due: dueImmunizations(id),
    }
  },

  /* vitals */
  vitalsFor(id: string): VitalsResponse {
    return {
      latest: latestVitals(id),
      flowsheet: observations
        .filter((o) => o.patientId === id && o.category === 'vital_signs')
        .sort((a, b) => b.effectiveDateTime.localeCompare(a.effectiveDateTime)),
    }
  },
  recordVitals(input: {
    patientId: string
    encounterId: string | null
    effectiveDateTime: string
    systolic: number | null
    diastolic: number | null
    heartRate: number | null
    respiratoryRate: number | null
    spo2: number | null
    temperatureC: number | null
    weightKg: number | null
    heightCm: number | null
    painScore: number | null
    headCircumferenceCm: number | null
  }) {
    const v = input
    const dt = v.effectiveDateTime
    if (v.systolic && v.diastolic) {
      observations.push({
        id: `obs-${v.patientId}-bp-${dt}`,
        patientId: v.patientId,
        encounterId: v.encounterId,
        category: 'vital_signs',
        code: findLoinc('85354-9'),
        effectiveDateTime: dt,
        value: null,
        valueText: `${v.systolic}/${v.diastolic} mmHg`,
        components: [
          { code: findLoinc('8480-6'), value: { value: v.systolic, unit: 'mmHg', code: 'mm[Hg]' } },
          { code: findLoinc('8462-4'), value: { value: v.diastolic, unit: 'mmHg', code: 'mm[Hg]' } },
        ],
        interpretation: v.systolic >= 140 || v.diastolic >= 90 ? 'H' : 'N',
        referenceRange: null,
        performer: 'ma-1',
        notes: null,
      })
    }
    if (v.heartRate)
      observations.push({
        id: `obs-${v.patientId}-hr-${dt}`,
        patientId: v.patientId,
        encounterId: v.encounterId,
        category: 'vital_signs',
        code: findLoinc('8867-4'),
        effectiveDateTime: dt,
        value: { value: v.heartRate, unit: '/min' },
        valueText: null,
        components: null,
        interpretation: v.heartRate > 100 ? 'H' : v.heartRate < 50 ? 'L' : 'N',
        referenceRange: { low: 60, high: 100, text: null, unit: '/min' },
        performer: 'ma-1',
        notes: null,
      })
    if (v.weightKg)
      observations.push({
        id: `obs-${v.patientId}-wt-${dt}`,
        patientId: v.patientId,
        encounterId: v.encounterId,
        category: 'vital_signs',
        code: findLoinc('29463-7'),
        effectiveDateTime: dt,
        value: { value: v.weightKg, unit: 'kg', code: 'kg' },
        valueText: null,
        components: null,
        interpretation: 'N',
        referenceRange: null,
        performer: 'ma-1',
        notes: null,
      })
    if (v.heightCm)
      observations.push({
        id: `obs-${v.patientId}-ht-${dt}`,
        patientId: v.patientId,
        encounterId: v.encounterId,
        category: 'vital_signs',
        code: findLoinc('8302-2'),
        effectiveDateTime: dt,
        value: { value: v.heightCm, unit: 'cm', code: 'cm' },
        valueText: null,
        components: null,
        interpretation: 'N',
        referenceRange: null,
        performer: 'ma-1',
        notes: null,
      })
    if (v.temperatureC)
      observations.push({
        id: `obs-${v.patientId}-temp-${dt}`,
        patientId: v.patientId,
        encounterId: v.encounterId,
        category: 'vital_signs',
        code: findLoinc('8310-5'),
        effectiveDateTime: dt,
        value: { value: v.temperatureC, unit: '°C', code: 'Cel' },
        valueText: null,
        components: null,
        interpretation: v.temperatureC >= 38 ? 'H' : 'N',
        referenceRange: { low: 36.1, high: 37.5, text: null, unit: '°C' },
        performer: 'ma-1',
        notes: null,
      })
    if (v.headCircumferenceCm !== null && v.headCircumferenceCm !== undefined)
      observations.push({
        id: `obs-${v.patientId}-hc-${dt}`,
        patientId: v.patientId,
        encounterId: v.encounterId,
        category: 'vital_signs',
        code: findLoinc('9843-4'),
        effectiveDateTime: dt,
        value: { value: v.headCircumferenceCm, unit: 'cm', code: 'cm' },
        valueText: null,
        components: null,
        interpretation: 'N',
        referenceRange: null,
        performer: 'ma-1',
        notes: null,
      })
    return medicalMocks.vitalsFor(v.patientId)
  },

  /* labs */
  labInbox: buildLabInbox,
  labReportDetail: buildLabReportDetail,
  signLabReport(reportId: string) {
    const idx = labReports.findIndex((r) => r.id === reportId)
    if (idx === -1) return null
    labReports[idx] = {
      ...labReports[idx]!,
      signedAt: NOW.toISOString(),
      signedBy: 'prac-fm-hassan',
    }
    return labReports[idx]!
  },
  notifyPatientForReport(reportId: string) {
    const idx = labReports.findIndex((r) => r.id === reportId)
    if (idx === -1) return null
    labReports[idx] = { ...labReports[idx]!, patientNotifiedAt: NOW.toISOString() }
    return labReports[idx]!
  },

  /* imaging */
  imagingFor(id: string) {
    return { items: imagingStudies.filter((s) => s.patientId === id) }
  },

  /* encounters */
  encountersFor(id: string): EncountersResponse {
    return { items: encounters.filter((e) => e.patientId === id).sort((a, b) => b.startAt.localeCompare(a.startAt)) }
  },
  encounterDetail(id: string): EncounterDetail | null {
    const e = encounters.find((x) => x.id === id)
    if (!e) return null
    const note = encounterNotes[e.id] ?? null
    return {
      encounter: e,
      note,
      vitals: medicalMocks.vitalsFor(e.patientId),
      orders: orders.filter((o) => o.encounterId === e.id || o.patientId === e.patientId),
      rxThisVisit: medications.filter((m) => m.encounterId === e.id),
    }
  },
  saveNoteDraft(encounterId: string, soap: EncounterNote['soap']): EncounterNote {
    const existing = encounterNotes[encounterId]
    const enc = encounters.find((e) => e.id === encounterId)
    if (!enc) throw new Error('Encounter not found')
    const note: EncounterNote = existing
      ? { ...existing, soap, draftSavedAt: NOW.toISOString(), state: existing.state === 'signed' ? 'signed' : 'draft' }
      : {
          id: `note-${encounterId}`,
          encounterId,
          patientId: enc.patientId,
          state: 'draft',
          noteType: 'soap',
          soap,
          authorId: enc.providerId,
          cosignerId: null,
          signedBy: null,
          signedAt: null,
          draftSavedAt: NOW.toISOString(),
          addenda: [],
        }
    encounterNotes[encounterId] = note
    return note
  },
  signNote(encounterId: string, signerId: string): EncounterNote {
    const note = encounterNotes[encounterId]
    if (!note) throw new Error('Note not found')
    if (note.state === 'signed') return note
    encounterNotes[encounterId] = {
      ...note,
      state: 'signed',
      signedBy: signerId,
      signedAt: NOW.toISOString(),
    }
    return encounterNotes[encounterId]!
  },
  addAddendum(encounterId: string, authorId: string, text: string): EncounterNote {
    const note = encounterNotes[encounterId]
    if (!note) throw new Error('Note not found')
    const author = practitionerById.get(authorId)
    encounterNotes[encounterId] = {
      ...note,
      addenda: [
        ...note.addenda,
        {
          id: `add-${Date.now()}`,
          authorId,
          authorName: author ? `Dr. ${author.firstName} ${author.lastName}` : 'Unknown',
          addedAt: NOW.toISOString(),
          text,
        },
      ],
    }
    return encounterNotes[encounterId]!
  },

  /* orders + Rx */
  ordersFor(id: string) {
    return { items: orders.filter((o) => o.patientId === id) }
  },

  /* OB */
  pregnancyFor(patientId: string): PregnancyDetail | null {
    const preg = pregnancies.find((p) => p.patientId === patientId)
    if (!preg) return null
    return {
      pregnancy: preg,
      visits: prenatalVisits.filter((v) => v.pregnancyId === preg.id).sort((a, b) => a.visitDate.localeCompare(b.visitDate)),
      ultrasounds: ultrasounds.filter((u) => u.pregnancyId === preg.id).sort((a, b) => a.studyDate.localeCompare(b.studyDate)),
    }
  },

  /* psych */
  psychScalesFor(id: string) {
    return { items: psychScales.filter((s) => s.patientId === id).sort((a, b) => b.administeredAt.localeCompare(a.administeredAt)) }
  },

  /* care plans */
  carePlansFor(id: string) {
    return { items: carePlans.filter((c) => c.patientId === id) }
  },

  /* scheduling */
  appointments(): { items: Appointment[] } {
    return { items: [...appointments].sort((a, b) => a.startAt.localeCompare(b.startAt)) }
  },
  recalls() {
    return { items: [...recalls].sort((a, b) => a.dueDate.localeCompare(b.dueDate)) }
  },
  setAppointmentStage(id: string, stage: Appointment['pipelineStage']) {
    const idx = appointments.findIndex((a) => a.id === id)
    if (idx === -1) return null
    const status: Appointment['status'] =
      stage === 'arrived' || stage === 'roomed' || stage === 'with_provider' || stage === 'checkout'
        ? 'arrived'
        : stage === 'departed'
          ? 'fulfilled'
          : stage === 'noshow'
            ? 'noshow'
            : 'booked'
    appointments[idx] = { ...appointments[idx]!, pipelineStage: stage, status }
    return appointments[idx]!
  },

  /* eligibility + claims */
  coveragesFor(id: string) {
    return { items: coverages.filter((c) => c.patientId === id) }
  },
  runEligibility(coverageId: string) {
    const cov = coverages.find((c) => c.id === coverageId)
    if (!cov) throw new Error('Coverage not found')
    return {
      patientId: cov.patientId,
      coverageId,
      checkedAt: NOW.toISOString(),
      active: cov.status === 'active',
      copay: cov.copay,
      deductibleMet: cov.deductibleMet,
      oopMaxMet: cov.oopMaxMet,
      inNetwork: cov.network === 'in_network',
      rawText: '270/271 — Active. Member responsibility per benefit summary.',
    }
  },
  claims() {
    const totalCharge = claims.reduce((s, c) => s + c.totalCharge, 0)
    const paid = claims.reduce((s, c) => s + c.totalPaid, 0)
    const denied = claims.filter((c) => c.status === 'denied').length
    return {
      items: claims,
      totals: {
        arDays: 28,
        outstanding: totalCharge - paid,
        paid30d: paid,
        denialRate: claims.length === 0 ? 0 : denied / claims.length,
      },
    }
  },

  /* documents + history + audit */
  documentsFor(id: string) {
    return { items: documents.filter((d) => d.patientId === id) }
  },
  historyFor(id: string): HistoryResponse {
    return {
      family: familyHistory.filter((f) => f.patientId === id),
      social: socialHistoryByPatient[id] ?? null,
    }
  },
  saveSocialHistory(input: SocialHistory): SocialHistory {
    socialHistoryByPatient[input.patientId] = { ...input, recordedAt: NOW.toISOString() }
    return socialHistoryByPatient[input.patientId]!
  },
  auditEvents(filterPatientId?: string): { items: AuditEvent[] } {
    const items = filterPatientId
      ? auditEvents.filter((a) => a.patientId === filterPatientId)
      : auditEvents
    return { items: [...items].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)) }
  },

  /* overview */
  overview,
}

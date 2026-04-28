import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'
import { PatientStoryboard } from '../PatientStoryboard'
import type { PatientDetail } from '../../api/medical.contracts'

const meta = {
  title: 'Medical/PatientStoryboard',
  component: PatientStoryboard,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ width: 1080 }}>{Story()}</div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof PatientStoryboard>

export default meta
type Story = StoryObj<typeof meta>

const ELDERLY: PatientDetail = {
  patient: {
    id: 'p',
    mrn: 'MRN-100004',
    nationalId: null,
    name: { given: 'Khalid', family: 'Al-Saud', preferred: 'Khalid' },
    pronouns: 'he/him',
    sexAtBirth: 'male',
    genderIdentity: 'male',
    dateOfBirth: '1948-03-12',
    deceased: false,
    deceasedDate: null,
    telecom: [],
    address: null,
    preferredLanguage: 'ar',
    interpreterNeeded: true,
    race: null,
    ethnicity: null,
    emergencyContact: null,
    primaryProviderId: 'prac-fm-hassan',
    photoUrl: null,
    flags: ['fall_risk', 'allergy_high'],
    enrolledAt: '2020-06-01T00:00:00.000Z',
  },
  primaryProviderName: 'Dr. Adeel Hassan',
  age: 78,
  ageBand: 'geriatric',
  snapshot: {
    activeProblems: [
      { system: 'icd10', code: 'I48.91', display: 'Atrial fibrillation' },
      { system: 'icd10', code: 'E11.9', display: 'Type 2 DM' },
      { system: 'icd10', code: 'I10', display: 'Hypertension' },
      { system: 'icd10', code: 'N18.3', display: 'CKD stage 3b' },
    ],
    activeAllergies: [
      {
        substance: { system: 'snomed', code: '111088007', display: 'Latex' },
        criticality: 'high',
        reactionText: 'Contact urticaria, prior anaphylactoid event',
      },
      {
        substance: { system: 'snomed', code: '293637006', display: 'Iodine contrast' },
        criticality: 'high',
        reactionText: 'Severe urticaria post-CT contrast',
      },
    ],
    activeMedications: [
      { medication: { system: 'rxnorm', code: '11289', display: 'warfarin' }, strengthLabel: '5 mg', dosageText: '1 tab PO QHS' },
      { medication: { system: 'rxnorm', code: '6918', display: 'metoprolol' }, strengthLabel: '50 mg ER', dosageText: '1 tab PO daily' },
      { medication: { system: 'rxnorm', code: '29046', display: 'lisinopril' }, strengthLabel: '20 mg', dosageText: '1 tab PO daily' },
    ],
    latestVitals: {
      systolic: 148,
      diastolic: 86,
      heartRate: 78,
      temperatureC: 36.6,
      weightKg: 76.4,
      heightCm: 174,
      bmi: 25.2,
      spo2: null,
      effectiveDateTime: '2026-04-14T10:00:00Z',
    },
    activePregnancy: null,
    pedsWeightStaleDays: null,
  },
}

const PEDS_STALE: PatientDetail = {
  ...ELDERLY,
  patient: {
    ...ELDERLY.patient,
    id: 'p2',
    mrn: 'MRN-100001',
    name: { given: 'Layla', family: 'Hassan', preferred: null },
    sexAtBirth: 'female',
    genderIdentity: 'female',
    dateOfBirth: '2024-10-28',
    flags: [],
  },
  age: 1,
  ageBand: 'infant',
  snapshot: {
    ...ELDERLY.snapshot,
    activeProblems: [{ system: 'icd10', code: 'L20.9', display: 'Atopic dermatitis' }],
    activeAllergies: [],
    activeMedications: [],
    latestVitals: {
      systolic: null,
      diastolic: null,
      heartRate: 110,
      temperatureC: 37,
      weightKg: 11.2,
      heightCm: 81,
      bmi: 17.1,
      spo2: null,
      effectiveDateTime: '2026-03-29T10:00:00Z',
    },
    activePregnancy: null,
    pedsWeightStaleDays: 60,
  },
}

const OB: PatientDetail = {
  ...ELDERLY,
  patient: {
    ...ELDERLY.patient,
    id: 'p3',
    mrn: 'MRN-100003',
    name: { given: 'Priya', family: 'Sharma', preferred: null },
    sexAtBirth: 'female',
    genderIdentity: 'female',
    dateOfBirth: '1995-02-21',
    flags: [],
    interpreterNeeded: false,
    preferredLanguage: 'hi',
  },
  age: 31,
  ageBand: 'adult',
  snapshot: {
    activeProblems: [{ system: 'icd10', code: 'Z34.91', display: 'Normal pregnancy supervision' }],
    activeAllergies: [],
    activeMedications: [],
    latestVitals: {
      systolic: 118,
      diastolic: 74,
      heartRate: 84,
      temperatureC: 36.6,
      weightKg: 64.5,
      heightCm: 165,
      bmi: 23.7,
      spo2: null,
      effectiveDateTime: '2026-04-23T10:00:00Z',
    },
    activePregnancy: {
      id: 'preg',
      patientId: 'p3',
      status: 'active',
      lmpDate: '2025-11-25',
      eddDate: '2026-09-01',
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
      notes: null,
    },
    pedsWeightStaleDays: null,
  },
}

export const Geriatric: Story = { args: { detail: ELDERLY } }
export const PediatricStaleWeight: Story = { args: { detail: PEDS_STALE } }
export const Pregnant: Story = { args: { detail: OB } }

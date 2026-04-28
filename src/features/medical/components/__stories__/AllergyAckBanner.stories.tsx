import type { Meta, StoryObj } from '@storybook/react-vite'
import { AllergyAckBanner } from '../AllergyAckBanner'
import type { Allergy } from '../../api/medical.contracts'

const meta = {
  title: 'Medical/AllergyAckBanner',
  component: AllergyAckBanner,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 760 }}>{Story()}</div>],
} satisfies Meta<typeof AllergyAckBanner>

export default meta
type Story = StoryObj<typeof meta>

const PCN: Allergy = {
  id: 'a1',
  patientId: 'p',
  type: 'allergy',
  category: 'medication',
  criticality: 'high',
  substance: { system: 'http://snomed.info/sct', code: '7980', display: 'Penicillin' },
  reactionText: 'Anaphylaxis',
  reactionSeverity: 'severe',
  onsetDate: null,
  recordedBy: 'prac',
  recordedAt: new Date().toISOString(),
  verificationStatus: 'confirmed',
  notes: null,
}

const SULFA: Allergy = {
  ...PCN,
  id: 'a2',
  criticality: 'low',
  substance: { system: 'http://snomed.info/sct', code: '387406002', display: 'Sulfonamide' },
  reactionText: 'Diffuse rash',
  reactionSeverity: 'moderate',
}

export const NoKnownAllergies: Story = {
  args: { allergies: [], noKnownAllergies: true },
}

export const NoRecord: Story = { args: { allergies: [], noKnownAllergies: false } }

export const HighCriticality: Story = {
  args: { allergies: [PCN, SULFA], noKnownAllergies: false, required: true },
}

export const LowOnly: Story = {
  args: { allergies: [SULFA], noKnownAllergies: false },
}

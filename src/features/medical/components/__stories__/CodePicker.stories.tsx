import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodePicker } from '../CodePicker'
import type { CodeableConcept } from '../../api/medical.contracts'

const meta: Meta<typeof CodePicker> = {
  title: 'Medical/CodePicker',
  component: CodePicker,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 480 }}>{Story()}</div>],
}
export default meta
type Story = StoryObj<typeof meta>

function Live({ system, filterCategory, specialty }: { system: 'icd10' | 'snomed' | 'loinc' | 'cpt' | 'rxnorm' | 'allergen'; filterCategory?: string; specialty?: string }) {
  const [v, setV] = useState<CodeableConcept | null>(null)
  return (
    <CodePicker
      system={system}
      value={v}
      onChange={setV}
      filterCategory={filterCategory}
      specialty={specialty}
    />
  )
}

export const Icd10: Story = { render: () => <Live system="icd10" /> }
export const Icd10Cardio: Story = { render: () => <Live system="icd10" specialty="cardio" /> }
export const SnomedDisorders: Story = { render: () => <Live system="snomed" filterCategory="disorder" /> }
export const SnomedAllergens: Story = { render: () => <Live system="snomed" filterCategory="substance" /> }
export const LoincVitals: Story = { render: () => <Live system="loinc" filterCategory="vital-signs" /> }
export const LoincLabs: Story = { render: () => <Live system="loinc" filterCategory="lab" /> }
export const Cpt: Story = { render: () => <Live system="cpt" filterCategory="em_office" /> }
export const RxNorm: Story = { render: () => <Live system="rxnorm" /> }
export const AllergenFood: Story = { render: () => <Live system="allergen" filterCategory="food" /> }

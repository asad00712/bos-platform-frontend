import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  BmiCalculator,
  ChadsVasc,
  CrClCalculator,
  EddCalculator,
  HasBled,
} from '../Calculators'

const meta = {
  title: 'Medical/Calculators',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj

export const All: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2" style={{ width: 720 }}>
      <BmiCalculator weightKg={84} heightCm={172} />
      <CrClCalculator ageYears={78} weightKg={76} creatinineMgDl={1.6} female={false} />
      <EddCalculator lmpDate="2025-11-23" />
      <ChadsVasc />
      <HasBled />
    </div>
  ),
}

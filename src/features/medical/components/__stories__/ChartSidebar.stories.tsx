import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'
import { ChartSidebar } from '../ChartSidebar'

const meta = {
  title: 'Medical/ChartSidebar',
  component: ChartSidebar,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <MemoryRouter>{Story()}</MemoryRouter>],
} satisfies Meta<typeof ChartSidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Adult: Story = { args: { patientId: 'p', ageBand: 'adult' } }
export const Pediatric: Story = { args: { patientId: 'p', ageBand: 'child' } }
export const PregnantAdult: Story = {
  args: { patientId: 'p', ageBand: 'adult', hasActivePregnancy: true },
}
export const Geriatric: Story = { args: { patientId: 'p', ageBand: 'geriatric' } }

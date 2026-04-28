import type { Meta, StoryObj } from '@storybook/react-vite'
import { VitalsRecorder } from '../VitalsRecorder'

const meta = {
  title: 'Medical/VitalsRecorder',
  component: VitalsRecorder,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 760 }}>{Story()}</div>],
} satisfies Meta<typeof VitalsRecorder>

export default meta
type Story = StoryObj<typeof meta>

export const Adult: Story = {
  args: {
    patientId: 'p',
    isPeds: false,
    onSubmit: (input) => console.info('vitals', input),
  },
}

export const PedsWithStaleWeightHint: Story = {
  args: {
    patientId: 'p',
    isPeds: true,
    showWeightRequiredHint: true,
    onSubmit: (input) => console.info('vitals', input),
  },
}

import type { Meta, StoryObj } from '@storybook/react-vite'
import { AbnormalFlag } from '../AbnormalFlag'

const meta = {
  title: 'Medical/AbnormalFlag',
  component: AbnormalFlag,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AbnormalFlag>

export default meta
type Story = StoryObj<typeof meta>

export const Normal: Story = { args: { flag: 'N' } }
export const High: Story = { args: { flag: 'H' } }
export const Low: Story = { args: { flag: 'L' } }
export const CriticalHigh: Story = { args: { flag: 'HH' } }
export const CriticalLow: Story = { args: { flag: 'LL' } }
export const Abnormal: Story = { args: { flag: 'A' } }
export const Critical: Story = { args: { flag: 'Critical' } }

export const Compact: Story = {
  args: { flag: 'H', compact: true },
  render: () => (
    <div className="flex flex-wrap gap-1">
      {(['N', 'L', 'H', 'LL', 'HH', 'A', 'Critical'] as const).map((f) => (
        <AbnormalFlag key={f} flag={f} compact />
      ))}
    </div>
  ),
}

export const InlineWithValue: Story = {
  args: { flag: 'L', compact: true },
  render: () => (
    <p className="font-mono">
      Hgb 11.2 g/dL <AbnormalFlag flag="L" compact />{' '}
      <span className="text-muted-foreground">(13.5–17.5)</span>
    </p>
  ),
}

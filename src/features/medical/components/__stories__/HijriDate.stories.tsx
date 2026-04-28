import type { Meta, StoryObj } from '@storybook/react-vite'
import { HijriDate } from '../HijriDate'

const meta = {
  title: 'Medical/HijriDate',
  component: HijriDate,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof HijriDate>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { date: '1985-06-12' },
}

export const Inline: Story = {
  args: { date: '2026-04-28', inline: true },
}

export const DualCalendar: Story = {
  args: { date: '2026-04-28', forceSecondary: true },
}

export const DualCalendarInline: Story = {
  args: { date: '2026-04-28', forceSecondary: true, inline: true },
}

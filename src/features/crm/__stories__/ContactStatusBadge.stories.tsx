import type { Meta, StoryObj } from '@storybook/react-vite'
import { ContactStatusBadge } from '../components/ContactStatusBadge'

const meta = {
  title: 'CRM/ContactStatusBadge',
  component: ContactStatusBadge,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ContactStatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Lead: Story = { args: { status: 'lead' } }
export const Active: Story = { args: { status: 'active' } }
export const Inactive: Story = { args: { status: 'inactive' } }
export const Archived: Story = { args: { status: 'archived' } }

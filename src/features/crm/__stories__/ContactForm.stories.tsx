import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ContactForm } from '../components/ContactForm'

const meta = {
  title: 'CRM/ContactForm',
  component: ContactForm,
  parameters: { layout: 'padded' },
  args: {
    onSubmit: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof ContactForm>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const Edit: Story = {
  args: {
    submitLabel: 'Save changes',
    defaultValues: {
      firstName: 'Sarah',
      lastName: 'Mitchell',
      email: 'sarah.m@example.com',
      phone: '+1 415 555 0182',
      status: 'active',
      source: 'referral',
      tags: ['vip'],
      notes: 'Prefers afternoons.',
    },
  },
}

export const Submitting: Story = { args: { isSubmitting: true } }

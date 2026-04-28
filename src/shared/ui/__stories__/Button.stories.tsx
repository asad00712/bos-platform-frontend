import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'

const meta = {
  title: 'shadcn/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Sign In to BOS' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = { args: { variant: 'secondary' } }

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete tenant' },
}

export const Outline: Story = { args: { variant: 'outline' } }

export const Ghost: Story = { args: { variant: 'ghost' } }

export const Link: Story = { args: { variant: 'link' } }

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus />
        Quick Create
      </>
    ),
  },
}

export const Disabled: Story = { args: { disabled: true } }

import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus, Download } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'

const meta = {
  title: 'BOS/PageHeader',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => (
    <PageHeader
      title="Patients"
      description="234 active · 12 new this week"
    />
  ),
}

export const WithBreadcrumbsAndActions: Story = {
  render: () => (
    <PageHeader
      title="Treatment plans"
      description="Plan templates, ongoing plans, and unsigned consents."
      breadcrumbs={[
        { label: 'Dental', href: '#' },
        { label: 'Patients', href: '#' },
        { label: 'Sarah Mitchell' },
      ]}
      actions={
        <>
          <Button variant="outline">
            <Download /> Export
          </Button>
          <Button>
            <Plus /> New plan
          </Button>
        </>
      }
    />
  ),
}

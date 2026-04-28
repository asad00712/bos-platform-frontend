import type { Meta, StoryObj } from '@storybook/react-vite'
import { CalendarDays, DollarSign, Users, AlertTriangle } from 'lucide-react'
import { KpiCard } from '@/shared/ui/kpi-card'

const meta = {
  title: 'BOS/KpiCard',
  component: KpiCard,
  parameters: { layout: 'centered' },
  args: { label: 'Total revenue', value: 84320 },
} satisfies Meta<typeof KpiCard>

export default meta
type Story = StoryObj<typeof meta>

export const Currency: Story = {
  args: {
    value: 84_320,
    currency: 'USD',
    delta: 0.23,
    trend: 'up',
    caption: 'vs $68,600 last month',
    icon: <DollarSign className="size-4" />,
  },
}

export const NumberWithTrend: Story = {
  args: {
    label: 'Active patients',
    value: 248,
    delta: 0.12,
    trend: 'up',
    caption: '14 new this week',
    icon: <Users className="size-4" />,
  },
}

export const Negative: Story = {
  args: {
    label: 'Overdue invoices',
    value: 12_400,
    currency: 'USD',
    delta: 0.155,
    trend: 'down',
    invertTrendColor: true,
    caption: '4 invoices · avg 38 days late',
    icon: <AlertTriangle className="size-4" />,
  },
}

export const Loading: Story = { args: { isLoading: true } }

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Total revenue" value={84320} currency="USD" delta={0.23} trend="up" icon={<DollarSign className="size-4" />} />
      <KpiCard label="Active patients" value={248} delta={0.12} trend="up" icon={<Users className="size-4" />} />
      <KpiCard label="Appointments" value={193} delta={0.08} trend="up" icon={<CalendarDays className="size-4" />} />
      <KpiCard label="Overdue" value={12400} currency="USD" delta={0.155} trend="down" invertTrendColor icon={<AlertTriangle className="size-4" />} />
    </div>
  ),
}

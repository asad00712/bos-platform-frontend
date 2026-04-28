import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ColumnDef } from '@tanstack/react-table'

import { DataTable } from '@/shared/ui/data-table'
import { Badge } from '@/shared/ui/badge'

const meta = {
  title: 'BOS/DataTable',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

type Row = {
  id: string
  client: string
  vertical: string
  status: 'active' | 'pending' | 'paused'
  value: string
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'client', header: 'Client' },
  { accessorKey: 'vertical', header: 'Vertical' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const variant =
        row.original.status === 'active' ? 'default'
        : row.original.status === 'pending' ? 'secondary'
        : 'outline'
      return <Badge variant={variant}>{row.original.status}</Badge>
    },
  },
  {
    accessorKey: 'value',
    header: () => <div className="text-right">Value</div>,
    cell: ({ row }) => <div className="text-right font-medium">{row.original.value}</div>,
  },
]

const data: Row[] = [
  { id: '1', client: 'Sarah Mitchell', vertical: 'Dental', status: 'active', value: '$3,200' },
  { id: '2', client: 'Al-Rashid Law', vertical: 'Law', status: 'pending', value: '$18,000' },
  { id: '3', client: 'Greenfield Academy', vertical: 'School', status: 'active', value: '$9,400' },
  { id: '4', client: 'Bella Italia', vertical: 'Restaurant', status: 'active', value: '$4,750' },
  { id: '5', client: 'Dr. Ahmed Khan', vertical: 'Medical', status: 'paused', value: '$2,100' },
]

export const Basic: Story = {
  render: () => <DataTable columns={columns} data={data} />,
}

export const Loading: Story = {
  render: () => <DataTable columns={columns} data={undefined} isLoading pageSize={5} />,
}

export const Empty: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      emptyTitle="No clients yet"
      emptyDescription="When a contact becomes a client, they'll show up here."
    />
  ),
}

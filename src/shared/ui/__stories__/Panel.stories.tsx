import type { Meta, StoryObj } from '@storybook/react-vite'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'

const meta = {
  title: 'BOS/Panel',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const WithDescriptionAndAction: Story = {
  render: () => (
    <div className="max-w-2xl">
      <Panel
        title="Revenue by week"
        description="$84,320 this period · vs $68,600 prior"
        actions={<Button variant="ghost" size="sm">Export</Button>}
      >
        <div className="grid h-[180px] place-items-center text-sm text-muted-foreground">
          Chart goes here
        </div>
      </Panel>
    </div>
  ),
}

export const Flush: Story = {
  render: () => (
    <div className="max-w-2xl">
      <Panel title="Recent clients" flush>
        <ul className="divide-y">
          {['Sarah Mitchell', 'Al-Rashid Law', 'Greenfield Academy'].map((c) => (
            <li key={c} className="px-5 py-3 text-sm">
              {c}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  ),
}

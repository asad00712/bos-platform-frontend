import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

const meta = {
  title: 'shadcn/Card',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Active patients</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">248</div>
        <p className="text-sm text-muted-foreground">+12% vs prior period</p>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        14 new this week
      </CardFooter>
    </Card>
  ),
}

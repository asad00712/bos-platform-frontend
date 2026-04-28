import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inbox, RefreshCw } from 'lucide-react'

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { Spinner } from '@/shared/ui/spinner'
import { Skeleton } from '@/shared/ui/skeleton'
import { Button } from '@/shared/ui/button'

const meta = {
  title: 'shadcn/States',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const EmptyState: Story = {
  render: () => (
    <Empty className="rounded-lg border bg-card py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox />
        </EmptyMedia>
        <EmptyTitle>No appointments today</EmptyTitle>
        <EmptyDescription>
          When your calendar fills up, appointments will appear here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>+ New appointment</Button>
      </EmptyContent>
    </Empty>
  ),
}

export const Loading: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-12">
      <Spinner />
      <span className="text-sm text-muted-foreground">Loading patients…</span>
    </div>
  ),
}

export const SkeletonRow: Story = {
  render: () => (
    <div className="space-y-3 rounded-lg border bg-card p-6">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
}

export const ErrorRetry: Story = {
  render: () => (
    <Empty className="rounded-lg border bg-card py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RefreshCw />
        </EmptyMedia>
        <EmptyTitle>We couldn&apos;t load that</EmptyTitle>
        <EmptyDescription>Check your connection and try again.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline">
          <RefreshCw /> Retry
        </Button>
      </EmptyContent>
    </Empty>
  ),
}

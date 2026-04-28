import { LayoutGrid } from 'lucide-react'
import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { useTenant } from '@/shared/hooks/useTenant'
import { useResources } from '../hooks'

export function ResourcesPage() {
  const { tenant } = useTenant()
  const resources = useResources(tenant.id)

  return (
    <PageContainer>
      <PageHeader
        title="Resources"
        description="Rooms, chairs, equipment, and other bookable assets."
      />

      {resources.isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : !resources.data || resources.data.items.length === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LayoutGrid />
            </EmptyMedia>
            <EmptyTitle>No resources yet</EmptyTitle>
            <EmptyDescription>
              Add operatories, treatment rooms, classrooms, or any other bookable space.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.data.items.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-1 p-5">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: r.color ?? 'oklch(0.65 0.05 260)' }}
                  />
                  <p className="font-medium">{r.name}</p>
                </div>
                <p className="text-xs text-muted-foreground">{r.kind}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}

import { Layers } from 'lucide-react'
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
import { useSegments } from '../hooks'

export function SegmentsPage() {
  const { tenant } = useTenant()
  const segments = useSegments(tenant.id)

  return (
    <PageContainer>
      <PageHeader
        title="Segments"
        description="Saved filters and audience definitions across your CRM."
      />

      {segments.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : !segments.data || segments.data.items.length === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Layers />
            </EmptyMedia>
            <EmptyTitle>No segments yet</EmptyTitle>
            <EmptyDescription>
              Save filters from the contacts list to make them easy to reuse.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {segments.data.items.map((s) => (
            <Card key={s.id}>
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: s.color ?? 'oklch(0.7 0.05 260)' }}
                  />
                  <p className="font-medium">{s.name}</p>
                </div>
                <p className="text-2xl font-semibold tracking-tight">
                  {s.count}
                </p>
                <p className="text-xs text-muted-foreground">
                  {s.count === 1 ? 'contact' : 'contacts'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}

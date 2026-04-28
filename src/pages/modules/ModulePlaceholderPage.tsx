import { Hammer } from 'lucide-react'
import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { Card, CardContent } from '@/shared/ui/card'

type Props = {
  title: string
  description: string
}

export function ModulePlaceholderPage({ title, description }: Props) {
  return (
    <PageContainer>
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="p-0">
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Hammer />
              </EmptyMedia>
              <EmptyTitle>Coming soon</EmptyTitle>
              <EmptyDescription>
                This module is on the rebuild plan. Filters, list/detail
                workflows, empty/error states, and RBAC-aware actions will land
                in upcoming phases.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

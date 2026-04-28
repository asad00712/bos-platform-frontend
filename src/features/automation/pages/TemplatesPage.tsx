import { ArrowRight, Sparkles } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { Badge } from '@/shared/ui/badge'

import { useTenant } from '@/shared/hooks/useTenant'

import { useAutomationTemplates } from '../hooks'
import { TriggerKindBadge } from '../components/Badges'

export function AutomationTemplatesPage() {
  const { tenant } = useTenant()
  const query = useAutomationTemplates(tenant.id)

  return (
    <PageContainer>
      <PageHeader
        title="Template gallery"
        description="Curated workflows you can clone in one click."
        breadcrumbs={[
          { label: 'Automations', href: '/app/automation' },
          { label: 'Templates' },
        ]}
      />

      {query.isLoading || !query.data ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      ) : query.data.items.length === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Sparkles />
            </EmptyMedia>
            <EmptyTitle>No templates yet</EmptyTitle>
            <EmptyDescription>
              Curated templates land here as more verticals come online.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {query.data.items.map((tpl) => (
            <Card key={tpl.id}>
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium leading-tight">{tpl.name}</p>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {tpl.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{tpl.description}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <TriggerKindBadge kind={tpl.triggerKind} />
                    <span className="text-muted-foreground">{tpl.triggerLabel}</span>
                  </div>
                  <ol className="space-y-1 pt-1 text-xs text-muted-foreground">
                    {tpl.steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="grid size-4 shrink-0 place-items-center rounded-full bg-muted text-[9px] font-medium">
                          {i + 1}
                        </span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="mt-auto pt-2">
                  <Button variant="outline" size="sm" disabled>
                    Use template <ArrowRight />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}

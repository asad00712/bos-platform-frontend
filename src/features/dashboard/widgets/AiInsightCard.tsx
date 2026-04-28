import { Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { useDashboardOverview } from '../hooks'
import type { Widget } from './types'

function AiInsightCardComponent() {
  const { tenant } = useTenant()
  const query = useDashboardOverview(tenant.id)

  if (query.isLoading || !query.data) {
    return (
      <Card>
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    )
  }

  const insight = query.data.aiInsight
  if (!insight) return null

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="size-5" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {insight.title}
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              {insight.body}
            </p>
          </div>
          {insight.ctas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {insight.ctas.map((cta) => (
                <Button
                  key={cta.id}
                  variant={cta.id === 'cta.dismiss' ? 'ghost' : 'outline'}
                  size="sm"
                >
                  {cta.label}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export const AiInsightWidget: Widget = {
  id: 'dashboard.ai-insight',
  Component: AiInsightCardComponent,
  permission: 'dashboard:view',
  feature: 'ai_insights',
  span: { col: 12 },
}

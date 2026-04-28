import { FileCode } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
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
import { useTemplates } from '../hooks'

export function TemplatesPage() {
  const { tenant } = useTenant()
  const query = useTemplates(tenant.id)

  return (
    <PageContainer>
      <PageHeader
        title="Templates"
        description="Reusable message templates with variable placeholders."
      />

      {query.isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : !query.data || query.data.items.length === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileCode />
            </EmptyMedia>
            <EmptyTitle>No templates yet</EmptyTitle>
            <EmptyDescription>
              Author appointment reminders, follow-ups, and invoice nudges to reuse later.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {query.data.items.map((t) => (
            <Card key={t.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{t.name}</p>
                  <Badge variant="outline" className="capitalize">
                    {t.kind}
                  </Badge>
                </div>
                {t.subject ? (
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.subject}
                  </p>
                ) : null}
                <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs leading-relaxed">
                  {t.body}
                </pre>
                {t.variables.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {t.variables.map((v) => (
                      <Badge
                        key={v}
                        variant="outline"
                        className="font-mono text-[10px]"
                      >
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}

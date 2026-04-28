import { Globe, MonitorSmartphone } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

import { useTenant } from '@/shared/hooks/useTenant'
import { formatDateTime, formatRelative } from '@/shared/lib/format'

import { useSessionsList } from '../hooks'

export function SessionsPage() {
  const { tenant } = useTenant()
  const query = useSessionsList(tenant.id)

  return (
    <PageContainer>
      <PageHeader
        title="Active sessions"
        description="Devices currently signed in to your tenant."
      />

      {query.isLoading || !query.data ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {query.data.items.map((s) => (
            <Card key={s.id}>
              <CardContent className="space-y-2 p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 place-items-center rounded-md bg-muted text-muted-foreground">
                    <MonitorSmartphone className="size-5" />
                  </span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{s.memberName}</p>
                      {s.current ? (
                        <Badge>This session</Badge>
                      ) : (
                        <Badge variant="outline">Active</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{s.memberEmail}</p>
                    <p className="text-xs text-muted-foreground">{s.userAgent}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Globe className="size-3" />
                      <span>
                        {s.location ?? '—'} · {s.ipAddress}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
                  <span>Started {formatDateTime(s.createdAt)}</span>
                  <span>Active {formatRelative(s.lastActiveAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}

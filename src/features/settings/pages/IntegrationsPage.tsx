import { Plug } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

import { useTenant } from '@/shared/hooks/useTenant'

import { useIntegrations } from '../hooks'
import { SectionPanel } from '../components/SectionPanel'

export function IntegrationsPage() {
  const { tenant } = useTenant()
  const query = useIntegrations(tenant.id)

  return (
    <SectionPanel
      title="Integrations"
      description="Connect external services. OAuth flows ship in a follow-up."
    >
      {query.isLoading || !query.data ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {query.data.items.map((it) => (
            <Card key={it.id}>
              <CardContent className="flex items-start gap-3 p-5">
                <span className="grid size-10 place-items-center rounded-md bg-muted text-muted-foreground">
                  <Plug className="size-5" />
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{it.name}</p>
                    {it.connected ? (
                      <Badge>Connected</Badge>
                    ) : (
                      <Badge variant="outline">Not connected</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{it.description}</p>
                  <div className="pt-1">
                    <Button
                      variant={it.connected ? 'outline' : 'default'}
                      size="sm"
                      disabled
                    >
                      {it.connected ? 'Manage' : 'Connect'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </SectionPanel>
  )
}

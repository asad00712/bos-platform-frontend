import { Building2, Phone } from 'lucide-react'

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

import { useInsuranceProviders } from '../hooks'

export function InsuranceProvidersPage() {
  const { tenant } = useTenant()
  const query = useInsuranceProviders(tenant.id)

  return (
    <PageContainer>
      <PageHeader
        title="Insurance providers"
        description="Insurers your patients are enrolled with."
      />

      {query.isLoading || !query.data ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : query.data.items.length === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 />
            </EmptyMedia>
            <EmptyTitle>No insurers yet</EmptyTitle>
            <EmptyDescription>
              Add your first insurer to start submitting claims.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {query.data.items.map((p) => (
            <Card key={p.id}>
              <CardContent className="space-y-2 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="font-medium leading-tight">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.network} · payer {p.payerId}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {p.memberCount} {p.memberCount === 1 ? 'member' : 'members'}
                  </span>
                </div>
                {p.phone ? (
                  <a
                    href={`tel:${p.phone}`}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Phone className="size-3" />
                    {p.phone}
                  </a>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}

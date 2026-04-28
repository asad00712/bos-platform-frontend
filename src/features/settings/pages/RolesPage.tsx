import { Lock, ShieldCheck } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

import { useTenant } from '@/shared/hooks/useTenant'

import { useRoles } from '../hooks'
import { SectionPanel } from '../components/SectionPanel'

export function RolesPage() {
  const { tenant } = useTenant()
  const query = useRoles(tenant.id)

  return (
    <SectionPanel
      title="Roles & permissions"
      description="Built-in roles ship with curated permission sets. Custom roles land in a follow-up."
    >
      {query.isLoading || !query.data ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {query.data.items.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-md bg-muted text-muted-foreground">
                      <ShieldCheck className="size-4" />
                    </span>
                    <div>
                      <p className="font-medium leading-tight">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.memberCount} {r.memberCount === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                  </div>
                  {r.builtIn ? (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="size-3" /> Built-in
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{r.description}</p>
                <div className="flex flex-wrap gap-1">
                  {r.permissions.map((p) => (
                    <Badge key={p} variant="outline" className="font-mono text-[10px]">
                      {p}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </SectionPanel>
  )
}

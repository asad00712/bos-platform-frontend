import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, Repeat, ShieldCheck } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Switch } from '@/shared/ui/switch'
import { Checkbox } from '@/shared/ui/checkbox'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

import { useActiveBranch } from '@/stores/activeBranch.store'
import { useHasPermission } from '@/shared/auth/useHasPermission'
import { useRoles } from '@/features/roles'
import { useStaff } from '@/features/staff'
import { useTenant } from '@/shared/hooks/useTenant'
import { routes } from '@/routes/routeMap'

import {
  useLeadAssignmentConfig,
  useSetLeadAssignmentConfig,
} from '../hooks'

export function LeadAssignmentConfigPage() {
  const { tenant } = useTenant()
  const branch = useActiveBranch()
  const canConfigure = useHasPermission('tenant:leads:configure')

  const configQ = useLeadAssignmentConfig(branch?.id ?? null)
  const setConfig = useSetLeadAssignmentConfig()
  const rolesQ = useRoles()
  const staffQ = useStaff(tenant.id)

  const [isActive, setActive] = useState(false)
  const [eligibleRoleIds, setEligible] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (configQ.data) {
      setActive(configQ.data.isActive)
      setEligible(new Set(configQ.data.eligibleRoleIds))
    }
  }, [configQ.data])

  const roles = rolesQ.data ?? []
  const staff = staffQ.data ?? []

  const eligibleStaff = staff.filter(
    (s) =>
      s.status === 'active' &&
      s.roundRobinAvailable &&
      s.roleIds.some((rid) => eligibleRoleIds.has(rid)),
  )

  if (!branch) {
    return (
      <PageContainer>
        <PageHeader
          title="Lead assignment"
          description="Pick a branch from the topbar to configure round-robin."
        />
      </PageContainer>
    )
  }

  const save = () =>
    setConfig.mutate({
      branchId: branch.id,
      isActive,
      eligibleRoleIds: Array.from(eligibleRoleIds),
    })

  return (
    <PageContainer>
      <PageHeader
        title="Lead assignment"
        description={`Round-robin auto-assigns new leads in ${branch.name} to staff with matching roles.`}
        breadcrumbs={[
          { label: 'CRM', href: routes.app.crm.root() },
          { label: 'Leads', href: routes.app.crm.leads() },
          { label: 'Assignment' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to={routes.app.crm.leads()}>
                <ChevronLeft /> Back to leads
              </Link>
            </Button>
          </div>
        }
      />

      {configQ.isLoading ? (
        <Card>
          <CardContent className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-7">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Round-robin enabled</p>
                  <p className="text-[11px] text-muted-foreground">
                    When on, every new lead in this branch gets assigned to
                    the next eligible staff member via Redis INCR.
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setActive}
                  disabled={!canConfigure}
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Eligible roles
                </p>
                <p className="mb-3 text-[11px] text-muted-foreground">
                  Staff with at least one of these roles join the rotation —
                  but only if their personal “round-robin available” toggle
                  is on (manage in <Link to={routes.app.settings.staff()} className="text-primary hover:underline">Staff</Link>).
                </p>
                {roles.length === 0 ? (
                  <Empty className="py-6">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <ShieldCheck />
                      </EmptyMedia>
                      <EmptyTitle>No roles defined</EmptyTitle>
                      <EmptyDescription>
                        Define a role first.{' '}
                        <Link
                          to={routes.app.settings.roles()}
                          className="text-primary hover:underline"
                        >
                          Open roles
                        </Link>
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <ul className="space-y-2">
                    {roles.map((r) => {
                      const checked = eligibleRoleIds.has(r.id)
                      return (
                        <li
                          key={r.id}
                          className="flex items-start gap-3 rounded-md border bg-background px-3 py-2"
                        >
                          <Checkbox
                            checked={checked}
                            disabled={!canConfigure}
                            onCheckedChange={() => {
                              setEligible((curr) => {
                                const next = new Set(curr)
                                if (next.has(r.id)) next.delete(r.id)
                                else next.add(r.id)
                                return next
                              })
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{r.name}</p>
                            {r.description ? (
                              <p className="text-[11px] text-muted-foreground">
                                {r.description}
                              </p>
                            ) : null}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={save} disabled={!canConfigure || setConfig.isPending}>
                  {setConfig.isPending ? 'Saving…' : 'Save assignment config'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-5">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <Repeat className="size-4 text-primary" />
                <p className="text-sm font-medium">Current rotation</p>
              </div>
              {eligibleStaff.length === 0 ? (
                <Empty className="py-6">
                  <EmptyHeader>
                    <EmptyTitle>Nobody in the rotation</EmptyTitle>
                    <EmptyDescription>
                      Pick at least one role and toggle round-robin on for the
                      relevant staff members.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <ul className="space-y-1.5">
                  {eligibleStaff.map((s) => {
                    const fullName =
                      [s.firstName, s.lastName].filter(Boolean).join(' ') ||
                      s.email
                    return (
                      <li
                        key={s.userId}
                        className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm"
                      >
                        <span className="truncate">{fullName}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {s.email}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
              <p className="text-[11px] text-muted-foreground">
                Order is determined by Redis INCR at assignment time, not by
                this list.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  )
}

import { Check, Crown, X } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

import {
  FEATURES,
  PLAN_TIERS,
  resolveFeatureFlag,
  tierForPlan,
  type PlanTierSpec,
} from '@/config/features'
import { useTenant } from '@/shared/hooks/useTenant'
import { useSessionStore } from '@/stores/session.store'
import { cn } from '@/shared/lib/utils'
import { formatCompact, formatCurrency } from '@/shared/lib/format'
import type { FeatureKey, TenantPlan } from '@/types/tenant'

import { SectionPanel } from '../components/SectionPanel'

const FEATURE_ROWS: FeatureKey[] = [
  'multi_location',
  'audit_log',
  'data_export',
  'recurring_invoices',
  'automation_builder',
  'campaigns',
  'custom_roles',
  'custom_reports',
  'scheduled_reports',
  'ai_insights',
  'api_tokens',
  'webhooks',
  'priority_support',
  'sso',
  'access_reviews',
  'feature_flags',
  'whitelabel_full',
]

export function PlanBillingPage() {
  const { tenant } = useTenant()
  const setTenant = useSessionStore((s) => s.setTenant)
  const current = tierForPlan(tenant.plan)

  // Demo-only plan switcher — flips the tenant plan in the session store
  // so users can preview how each tier surfaces in the UI without paying.
  // In production this opens Stripe Customer Portal.
  const switchTo = (plan: TenantPlan) => {
    setTenant({ ...tenant, plan })
  }

  return (
    <div className="space-y-4">
      <SectionPanel
        title="Current plan"
        description="Your billing tier, seat usage, and storage limits."
      >
        <CurrentPlanSummary current={current} />
      </SectionPanel>

      <SectionPanel
        title="Plans"
        description="Compare tiers and switch any time. Demo flow flips the tenant plan locally; production wires Stripe Customer Portal."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {PLAN_TIERS.map((t) => (
            <PlanCard
              key={t.plan}
              tier={t}
              current={tenant.plan === t.plan}
              onSwitch={() => switchTo(t.plan)}
            />
          ))}
        </div>
      </SectionPanel>

      <SectionPanel
        title="Feature comparison"
        description="What's available at each tier. Tenant overrides aren't shown here."
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 ps-1 text-start font-medium">Feature</th>
                {PLAN_TIERS.map((t) => (
                  <th
                    key={t.plan}
                    className={cn(
                      'px-3 py-3 text-center font-medium',
                      tenant.plan === t.plan && 'text-primary',
                    )}
                  >
                    {t.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map((key) => {
                const spec = FEATURES[key]
                return (
                  <tr key={key} className="border-b last:border-0">
                    <td className="py-2.5 ps-1">
                      <div className="font-medium">{spec.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {spec.description}
                      </div>
                    </td>
                    {PLAN_TIERS.map((t) => {
                      const enabled = resolveFeatureFlag(key, {
                        plan: t.plan,
                        caliber: tenant.caliber,
                        size: tenant.size,
                      })
                      return (
                        <td key={t.plan} className="px-3 py-2.5 text-center">
                          {enabled ? (
                            <Check className="mx-auto size-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <X className="mx-auto size-4 text-muted-foreground/40" />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SectionPanel>
    </div>
  )
}

function CurrentPlanSummary({ current }: { current: PlanTierSpec }) {
  const { tenant } = useTenant()
  const usage = tenant.usage

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardContent className="space-y-2 p-5">
          <div className="flex items-center gap-2">
            <Crown className="size-4 text-amber-500" />
            <Badge>{current.name}</Badge>
          </div>
          <p className="text-2xl font-semibold tabular-nums">
            {current.pricePerMonth === null
              ? 'Custom'
              : current.pricePerMonth === 0
                ? 'Free'
                : `${formatCurrency(current.pricePerMonth, tenant.currency ?? 'USD', { maximumFractionDigits: 0 })}/mo`}
          </p>
          <p className="text-sm text-muted-foreground">{current.tagline}</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          <UsageStat
            label="Members"
            value={usage?.members ?? 0}
            limit={usage?.memberLimit ?? current.memberLimit}
          />
          <UsageStat
            label="Locations"
            value={usage?.locations ?? (tenant.locations?.length ?? 1)}
            limit={usage?.locationLimit ?? current.locationLimit}
          />
          <UsageStat
            label="Storage"
            value={usage?.storageGb ?? 0}
            limit={usage?.storageGbLimit ?? current.storageGb}
            unit="GB"
            allowFractional
          />
        </CardContent>
      </Card>
    </div>
  )
}

function UsageStat({
  label,
  value,
  limit,
  unit,
  allowFractional,
}: {
  label: string
  value: number
  limit: number | null
  unit?: string
  allowFractional?: boolean
}) {
  const display = allowFractional ? value.toFixed(1) : formatCompact(value)
  const limitDisplay =
    limit === null
      ? 'Unlimited'
      : `${allowFractional ? limit.toFixed(0) : formatCompact(limit)}${unit ? ` ${unit}` : ''}`

  const pct = limit === null ? 0 : Math.min(1, value / Math.max(1, limit))
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-lg font-semibold tabular-nums">
        {display}
        {unit ? ` ${unit}` : ''}{' '}
        <span className="text-xs text-muted-foreground">/ {limitDisplay}</span>
      </p>
      {limit !== null ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full',
              pct > 0.85 ? 'bg-destructive' : pct > 0.7 ? 'bg-amber-500' : 'bg-primary',
            )}
            style={{ width: `${pct * 100}%` }}
          />
        </div>
      ) : null}
    </div>
  )
}

function PlanCard({
  tier,
  current,
  onSwitch,
}: {
  tier: PlanTierSpec
  current: boolean
  onSwitch: () => void
}) {
  return (
    <Card
      className={cn(
        'relative flex flex-col',
        current && 'border-primary ring-1 ring-primary',
      )}
    >
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold">{tier.name}</p>
          {current ? <Badge>Current</Badge> : null}
        </div>
        <p className="text-sm text-muted-foreground">{tier.tagline}</p>

        <p className="text-3xl font-semibold tabular-nums">
          {tier.pricePerMonth === null
            ? 'Custom'
            : tier.pricePerMonth === 0
              ? 'Free'
              : `$${tier.pricePerMonth}`}
          {tier.pricePerMonth !== null && tier.pricePerMonth !== 0 ? (
            <span className="text-sm font-normal text-muted-foreground">/mo</span>
          ) : null}
        </p>

        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li>
            {tier.memberLimit === null ? 'Unlimited' : `${tier.memberLimit}`} members
          </li>
          <li>
            {tier.locationLimit === null ? 'Unlimited' : `${tier.locationLimit}`} locations
          </li>
          <li>{tier.storageGb} GB storage</li>
          {tier.highlightFeatures.slice(0, 4).map((k) => (
            <li key={k} className="flex items-start gap-1.5">
              <Check className="mt-0.5 size-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{FEATURES[k].label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-2">
          {current ? (
            <Button variant="outline" disabled className="w-full">
              Current plan
            </Button>
          ) : (
            <Button
              variant={tier.plan === 'enterprise' ? 'outline' : 'default'}
              onClick={onSwitch}
              className="w-full"
            >
              {tier.plan === 'enterprise' ? 'Contact sales' : 'Switch to ' + tier.name}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

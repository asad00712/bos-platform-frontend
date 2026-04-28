import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Share2 } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import { useTenant } from '@/shared/hooks/useTenant'

import { DashboardGrid } from '../components/DashboardGrid'
import { DashboardHero } from '../components/DashboardHero'
import { OnboardingCard } from '../components/OnboardingCard'
import { getDashboardLayout } from '../layouts/layout.registry'

const DATE_RANGES = [
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
  { id: '90d', label: '90d' },
  { id: 'ytd', label: 'YTD' },
  { id: 'all', label: 'All' },
] as const

type DateRangeId = (typeof DATE_RANGES)[number]['id']

/**
 * Dashboard page composition (top → bottom):
 *   1. Header — eyebrow + title + copy on the left, segmented date-range
 *      control + Share / Export buttons on the right. The right cluster
 *      is a single non-wrapping flex row to avoid stacking ugliness.
 *   2. North-Star hero band — default layout only.
 *   3. Vertical-aware widget grid.
 *
 * The PageContainer wraps the whole page in `space-y-6` so each section
 * carries 24px of breathing room — no manual margin-bottom plumbing.
 *
 * Date pills use a Linear-style segmented control: 0.5-unit internal gap
 * keeps inactive labels visually distinct without needing dividers.
 */
export function DashboardPage() {
  const { t } = useTranslation(['common'])
  const { tenant, vertical } = useTenant()
  const layout = getDashboardLayout(tenant.vertical)
  const [range, setRange] = useState<DateRangeId>('30d')

  const verticalLabel = t(vertical.i18nKey, { defaultValue: vertical.defaultName })
  const isDefaultLayout =
    tenant.vertical !== 'dental' &&
    tenant.vertical !== 'school' &&
    tenant.vertical !== 'medical'

  return (
    <PageContainer>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1.5">
          <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <span>{tenant.name}</span>
            <span className="size-1 rounded-full bg-muted-foreground/40" />
            <span>{verticalLabel}</span>
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t('common:navigation.dashboard')}
          </h1>
          <p className="text-sm text-muted-foreground">
            At-a-glance signal for the period. Updated{' '}
            <time className="font-medium text-foreground/80">a moment ago</time>.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label="Date range"
            className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-border/70 bg-background/60 p-1 backdrop-blur"
          >
            {DATE_RANGES.map((r) => {
              const active = range === r.id
              return (
                <button
                  key={r.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setRange(r.id)}
                  className={cn(
                    'shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium tabular-nums transition-colors',
                    active
                      ? 'bg-foreground text-background shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Share2 className="size-3.5" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </header>

      <OnboardingCard />

      {isDefaultLayout ? <DashboardHero /> : null}

      <DashboardGrid layout={layout} />
    </PageContainer>
  )
}

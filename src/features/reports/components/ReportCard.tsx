import { Link } from 'react-router'
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Heart,
  ShieldCheck,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

import type {
  ReportCategory,
  ReportSummary,
} from '../api/reports.contracts'

const CATEGORY_META: Record<
  ReportCategory,
  { Icon: LucideIcon; tone: string; label: string }
> = {
  sales: { Icon: BarChart3, tone: 'text-emerald-600 dark:text-emerald-400', label: 'Sales' },
  operations: { Icon: Briefcase, tone: 'text-blue-600 dark:text-blue-400', label: 'Operations' },
  staff: { Icon: Users, tone: 'text-violet-600 dark:text-violet-400', label: 'Staff' },
  patients: { Icon: Heart, tone: 'text-rose-600 dark:text-rose-400', label: 'Patients' },
  governance: { Icon: ShieldCheck, tone: 'text-amber-600 dark:text-amber-400', label: 'Governance' },
}

type Props = {
  report: ReportSummary
  /** Path under /app/reports — only present if a real page is wired. */
  href?: string | null
}

export function ReportCard({ report, href }: Props) {
  const meta = CATEGORY_META[report.category]
  const isReady = Boolean(href)

  const inner = (
    <Card className={cn('h-full', !isReady && 'opacity-70')}>
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className={cn('grid size-9 place-items-center rounded-md bg-muted', meta.tone)}>
            <meta.Icon className="size-4" />
          </span>
          <Badge variant="outline" className="text-[10px] uppercase">
            {meta.label}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="font-medium leading-tight">{report.name}</p>
          <p className="text-xs text-muted-foreground">{report.description}</p>
        </div>
        <div className="mt-auto pt-2">
          {isReady ? (
            <Button variant="ghost" size="sm" className="-ms-2">
              Open <ArrowRight />
            </Button>
          ) : (
            <Badge variant="secondary" className="text-[10px] uppercase">
              Coming soon
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (!isReady) return inner
  return (
    <Link to={href!} className="block focus-visible:outline-none">
      {inner}
    </Link>
  )
}

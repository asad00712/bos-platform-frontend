import {
  AlertOctagon,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import type { Observation } from '../api/medical.contracts'

type Flag = Observation['interpretation']

const ICON: Record<Flag, LucideIcon> = {
  N: CheckCircle2,
  H: ArrowUp,
  L: ArrowDown,
  HH: AlertTriangle,
  LL: AlertTriangle,
  A: AlertTriangle,
  Critical: AlertOctagon,
}

const TONE: Record<Flag, string> = {
  N: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/30 dark:text-emerald-300',
  A: 'text-amber-800 bg-amber-500/10 border-amber-500/40 dark:text-amber-300',
  H: 'text-amber-800 bg-amber-500/10 border-amber-500/40 dark:text-amber-300',
  L: 'text-amber-800 bg-amber-500/10 border-amber-500/40 dark:text-amber-300',
  HH: 'text-rose-700 bg-rose-500/15 border-rose-500/40 dark:text-rose-300',
  LL: 'text-rose-700 bg-rose-500/15 border-rose-500/40 dark:text-rose-300',
  Critical: 'text-white bg-rose-600 border-rose-700',
}

const LABEL: Record<Flag, string> = {
  N: 'Normal',
  H: 'High',
  L: 'Low',
  HH: 'Critical high',
  LL: 'Critical low',
  A: 'Abnormal',
  Critical: 'Critical',
}

const SHORT: Record<Flag, string> = {
  N: 'N',
  H: 'H',
  L: 'L',
  HH: 'HH',
  LL: 'LL',
  A: 'A',
  Critical: '!',
}

type Props = {
  flag: Flag
  /** Show short letter only (e.g. inline next to a value). */
  compact?: boolean
  className?: string
}

/**
 * Lab/vitals abnormal flag with three independent signals (icon + label
 * text + color) so colorblind users still get the cue. The full label is
 * provided via `aria-label` for screen readers when only the short form
 * is rendered.
 */
export function AbnormalFlag({ flag, compact, className }: Props) {
  const Icon = ICON[flag]
  return (
    <span
      role="status"
      aria-label={LABEL[flag]}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] font-semibold leading-none',
        TONE[flag],
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      <span>{compact ? SHORT[flag] : LABEL[flag]}</span>
    </span>
  )
}

export function flagLabel(flag: Flag): string {
  return LABEL[flag]
}

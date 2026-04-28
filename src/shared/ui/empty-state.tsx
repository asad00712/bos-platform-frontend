import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { Button } from '@/shared/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { cn } from '@/shared/lib/utils'

/**
 * High-level empty state. Wraps the lower-level `<Empty>` primitives with
 * the BOS "personality" composition:
 *
 *   • Soft halo backdrop behind the icon (radial fade, brand tint).
 *   • Brief, human title — never "No items found".
 *   • Two-sentence description: what this surface is + what to do next.
 *   • Primary CTA (Link or Button) + optional secondary link ("Learn more").
 *
 * Use this when the empty state is the ENTIRE page or the entire dataset.
 * For inline empty rows (e.g. "no matches against this filter"),
 * `DataTable`'s built-in empty hook is enough.
 */
type Props = {
  icon: ReactNode
  title: string
  description: string
  /** Primary call-to-action. Either a route + label, or a custom button. */
  cta?:
    | { kind: 'link'; to: string; label: string }
    | { kind: 'button'; label: string; onClick: () => void }
    | { kind: 'custom'; node: ReactNode }
  /** Secondary "Learn more" type link. Optional. */
  secondary?: { to: string; label: string; external?: boolean }
  /** Tone of the icon halo — tints the radial gradient + icon chip. */
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'muted'
  className?: string
}

const TONE_HALO: Record<NonNullable<Props['tone']>, string> = {
  brand:
    'radial-gradient(50% 50% at 50% 50%, oklch(var(--primary) / 0.18), transparent 70%)',
  success:
    'radial-gradient(50% 50% at 50% 50%, oklch(0.7 0.18 150 / 0.18), transparent 70%)',
  warning:
    'radial-gradient(50% 50% at 50% 50%, oklch(0.78 0.16 80 / 0.18), transparent 70%)',
  danger:
    'radial-gradient(50% 50% at 50% 50%, oklch(0.7 0.19 22 / 0.18), transparent 70%)',
  muted:
    'radial-gradient(50% 50% at 50% 50%, oklch(0.5 0 0 / 0.10), transparent 70%)',
}

const TONE_ICON: Record<NonNullable<Props['tone']>, string> = {
  brand: 'text-primary',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-rose-600 dark:text-rose-400',
  muted: 'text-muted-foreground',
}

export function EmptyState({
  icon,
  title,
  description,
  cta,
  secondary,
  tone = 'brand',
  className,
}: Props) {
  return (
    <Empty className={cn('relative overflow-hidden py-16', className)}>
      {/* halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -z-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2"
        style={{ background: TONE_HALO[tone] }}
      />

      <EmptyHeader className="relative">
        <EmptyMedia
          variant="icon"
          className={cn(
            'border border-border/60 bg-background/80 ring-1 ring-inset ring-border/40 backdrop-blur',
            TONE_ICON[tone],
          )}
        >
          {icon}
        </EmptyMedia>
        <EmptyTitle className="text-xl font-semibold tracking-tight">
          {title}
        </EmptyTitle>
        <EmptyDescription className="max-w-md text-balance leading-relaxed">
          {description}
        </EmptyDescription>
      </EmptyHeader>

      {cta || secondary ? (
        <div className="relative flex flex-col items-center gap-2">
          {cta?.kind === 'link' ? (
            <Button asChild>
              <Link to={cta.to}>{cta.label}</Link>
            </Button>
          ) : cta?.kind === 'button' ? (
            <Button onClick={cta.onClick}>{cta.label}</Button>
          ) : cta?.kind === 'custom' ? (
            cta.node
          ) : null}
          {secondary ? (
            secondary.external ? (
              <a
                href={secondary.to}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
              >
                {secondary.label}
              </a>
            ) : (
              <Link
                to={secondary.to}
                className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
              >
                {secondary.label}
              </Link>
            )
          ) : null}
        </div>
      ) : null}
    </Empty>
  )
}

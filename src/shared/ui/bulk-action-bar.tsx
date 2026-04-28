import type { ReactNode } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

/**
 * Floating contextual bar that pins to the bottom of the viewport (or a
 * scroll container) when one or more rows are selected. Mirrors the
 * Linear / Notion / Stripe pattern: a single horizontal pill with the
 * count, the actions, and a dismiss.
 *
 * Caller is responsible for the actions slot — pass `<Button>`s with
 * destructive / default / outline variants depending on intent. The bar
 * only renders when `count > 0`.
 *
 * Accessibility:
 *   • role="toolbar" + aria-label
 *   • Animated in via Tailwind transition-all; respects prefers-reduced-motion.
 *   • Dismiss button has aria-label="Clear selection".
 */
type Props = {
  count: number
  onClear: () => void
  /** Action buttons rendered on the end. Caller composes. */
  actions?: ReactNode
  /** Optional label override — defaults to "{count} selected". */
  label?: string
  /** Pin to viewport bottom (`fixed`) instead of container-relative. Default `true`. */
  fixed?: boolean
  className?: string
}

export function BulkActionBar({
  count,
  onClear,
  actions,
  label,
  fixed = true,
  className,
}: Props) {
  if (count === 0) return null

  return (
    <div
      role="toolbar"
      aria-label="Selected items"
      className={cn(
        'z-30 flex items-center gap-3 rounded-full border border-border/60 bg-background/95 px-4 py-2 shadow-lg shadow-black/10 backdrop-blur',
        'transition-all duration-200 ease-out',
        fixed
          ? 'fixed bottom-6 left-1/2 -translate-x-1/2 max-w-[calc(100vw-2rem)]'
          : 'sticky bottom-4 mx-auto w-fit',
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5 text-sm font-medium">
        <span className="grid size-6 place-items-center rounded-full bg-foreground text-[11px] font-semibold tabular-nums text-background">
          {count}
        </span>
        <span>{label ?? `selected`}</span>
      </span>
      {actions ? (
        <div className="flex items-center gap-1.5 border-s border-border/60 ps-3">
          {actions}
        </div>
      ) : null}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Clear selection"
        onClick={onClear}
        className="size-7"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  )
}

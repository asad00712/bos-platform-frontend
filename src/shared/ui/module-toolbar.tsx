import type { ReactNode } from 'react'
import { ChevronDown, Filter, Settings2, X } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'

/**
 * Page-level toolbar that lives directly under `<PageHeader>` on every
 * module landing page. Owns:
 *   • Saved-views chip strip on the start (e.g. All / Mine / Due this week / + New view).
 *   • View-mode switch (table / kanban / calendar / timeline) when the page supports it.
 *   • Date-range pill (7d / 30d / 90d / YTD / All) when relevant.
 *   • A "Filters" trigger that opens a popover/sheet — count badge if any are active.
 *   • Page-scoped actions on the end ("+ New …", Share, Export, Print, kebab → Settings).
 *
 * Kept generic on purpose. Every module composes its own filter content,
 * action items, and saved-view list — but the chrome stays consistent.
 *
 * Visual contract:
 *   • Sticky at top:0 inside scroll containers when `sticky` is true.
 *   • Hairline divider below; muted backdrop blur for the "in-app" feel.
 *   • Mobile: views collapse into a dropdown, actions condense to the
 *     primary CTA + a kebab.
 */

export type SavedView = {
  id: string
  label: string
  /** Optional small count badge after the label. */
  count?: number
}

export type ToolbarViewMode = {
  id: string
  label: string
  icon: ReactNode
}

type Props = {
  /** Saved-view chip strip. */
  views?: SavedView[]
  activeViewId?: string
  onViewChange?: (id: string) => void
  /** Optional "Save as new view" action triggered from the strip. */
  onSaveView?: () => void

  /** View-mode switcher (table / kanban / calendar / etc). */
  modes?: ToolbarViewMode[]
  activeModeId?: string
  onModeChange?: (id: string) => void

  /** Number of currently-active filters; shown as a count chip on the Filters button. */
  activeFilterCount?: number
  /** Click handler for the Filters trigger; consumer renders the popover/sheet. */
  onOpenFilters?: () => void
  /** Click handler for the "Clear filters" affordance, shown inline when count > 0. */
  onClearFilters?: () => void

  /** End-cluster actions — primary CTA + secondary buttons. Renders as-is. */
  actions?: ReactNode

  /** Settings menu items (kebab on the end). When present, a kebab is shown after `actions`. */
  settingsItems?: { id: string; label: string; onSelect?: () => void; danger?: boolean }[]

  /** Make the toolbar sticky to the top of its scroll container. */
  sticky?: boolean
  className?: string
}

export function ModuleToolbar({
  views,
  activeViewId,
  onViewChange,
  onSaveView,
  modes,
  activeModeId,
  onModeChange,
  activeFilterCount = 0,
  onOpenFilters,
  onClearFilters,
  actions,
  settingsItems,
  sticky = false,
  className,
}: Props) {
  const hasViews = views && views.length > 0
  const hasModes = modes && modes.length > 0

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 border-b border-border/60 bg-background/80 py-3 backdrop-blur',
        sticky && 'sticky top-0 z-20',
        className,
      )}
    >
      {/* ---------- start: saved views ---------- */}
      {hasViews ? (
        <div
          role="tablist"
          aria-label="Saved views"
          className="flex shrink-0 items-center gap-1 overflow-x-auto"
        >
          {views!.map((v) => {
            const active = v.id === activeViewId
            return (
              <button
                key={v.id}
                role="tab"
                aria-selected={active}
                onClick={() => onViewChange?.(v.id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'bg-foreground text-background shadow-sm'
                    : 'border border-transparent text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {v.label}
                {typeof v.count === 'number' ? (
                  <span
                    className={cn(
                      'rounded-full px-1.5 text-[10px] font-semibold tabular-nums',
                      active
                        ? 'bg-background/15 text-background/80'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {v.count}
                  </span>
                ) : null}
              </button>
            )
          })}
          {onSaveView ? (
            <button
              onClick={onSaveView}
              className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              + View
            </button>
          ) : null}
        </div>
      ) : null}

      {/* ---------- middle: filters / clear ---------- */}
      <div className="flex shrink-0 items-center gap-2">
        {onOpenFilters ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFilters}
            className="gap-1.5"
          >
            <Filter className="size-3.5" />
            Filters
            {activeFilterCount > 0 ? (
              <span className="ms-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>
        ) : null}
        {activeFilterCount > 0 && onClearFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-1 text-xs text-muted-foreground"
          >
            <X className="size-3" />
            Clear
          </Button>
        ) : null}
      </div>

      {/* ---------- end: mode switch + actions + kebab ---------- */}
      <div className="ms-auto flex items-center gap-2">
        {hasModes ? (
          <div
            role="tablist"
            aria-label="View mode"
            className="hidden items-center gap-0.5 rounded-md border border-border/70 bg-background p-0.5 sm:inline-flex"
          >
            {modes!.map((m) => {
              const active = m.id === activeModeId
              return (
                <button
                  key={m.id}
                  role="tab"
                  aria-selected={active}
                  aria-label={m.label}
                  onClick={() => onModeChange?.(m.id)}
                  className={cn(
                    'inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors',
                    active
                      ? 'bg-accent text-foreground shadow-sm'
                      : 'hover:bg-accent/60 hover:text-foreground',
                  )}
                >
                  {m.icon}
                </button>
              )
            })}
          </div>
        ) : null}

        {actions}

        {settingsItems && settingsItems.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Module settings">
                <Settings2 className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                Module settings
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {settingsItems.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  onSelect={s.onSelect}
                  className={cn(
                    s.danger && 'text-destructive focus:text-destructive',
                  )}
                >
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  )
}

/**
 * Compact "more" trigger when actions overflow on small screens. Wrap
 * extra buttons inside this and they'll collapse into a kebab menu.
 */
export function ToolbarOverflow({
  items,
}: {
  items: { id: string; label: string; icon?: ReactNode; onSelect?: () => void }[]
}) {
  if (items.length === 0) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          More
          <ChevronDown className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {items.map((it) => (
          <DropdownMenuItem key={it.id} onSelect={it.onSelect} className="gap-2">
            {it.icon}
            {it.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

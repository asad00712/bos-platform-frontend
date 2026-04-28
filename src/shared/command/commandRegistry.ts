import type { ComponentType, ReactNode } from 'react'

/**
 * Action registry behind ⌘K. Each module appends its actions on app boot
 * (see `bootstrapCommands.ts`). The palette consumer (GlobalSearch /
 * CommandPalette page) reads from this registry, filters by RBAC + active
 * vertical, and groups by section.
 *
 * Actions are pure data — no React. The `run` function is invoked with
 * a context object so it can navigate, open dialogs, or mutate stores.
 */

export type CommandRunContext = {
  navigate: (to: string) => void
  toast: (msg: string) => void
  /** Free-form bag for module-specific helpers (e.g. open dialogs). */
  ctx?: Record<string, unknown>
}

export type CommandAction = {
  id: string
  /** Section header. Examples: "Create", "Navigate", "View", "Toggle". */
  section: string
  label: string
  /** Optional shortcut hint, e.g. "⌘N", "G then S". Display-only. */
  shortcut?: string
  /** Lucide icon component (avoid icons here — tree-shake). */
  icon?: ComponentType<{ className?: string }>
  /** Permission key required to surface this action. */
  permission?: string
  /** Active vertical filter — when provided, action only surfaces for these verticals. */
  verticals?: string[]
  /** Optional rich preview (rare). */
  preview?: ReactNode
  /** Keywords appended to the search index for this action. */
  keywords?: string[]
  run: (ctx: CommandRunContext) => void | Promise<void>
}

const registry: CommandAction[] = []

export function registerCommand(action: CommandAction): void {
  // Replace if same id already registered (HMR friendly).
  const idx = registry.findIndex((a) => a.id === action.id)
  if (idx === -1) registry.push(action)
  else registry[idx] = action
}

export function registerCommands(actions: CommandAction[]): void {
  for (const a of actions) registerCommand(a)
}

export function listCommands(): CommandAction[] {
  return registry
}

/** Resolve actions for a given user context. Cheap to call repeatedly. */
export function resolveCommands(ctx: {
  permissions: string[]
  vertical: string
}): CommandAction[] {
  return registry.filter((a) => {
    if (a.permission && !ctx.permissions.includes(a.permission)) return false
    if (a.verticals && !a.verticals.includes(ctx.vertical)) return false
    return true
  })
}

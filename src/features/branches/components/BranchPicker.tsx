import { useQueryClient } from '@tanstack/react-query'
import { Building2, Check, Plus, Star } from 'lucide-react'

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
import { Link } from 'react-router'
import { routes } from '@/routes/routeMap'

import { useActiveBranch, useActiveBranchStore } from '@/stores/activeBranch.store'

import { useBranchesBootstrap } from '../hooks'

/**
 * Topbar branch switcher. Hydrates the active-branch store on first
 * mount, lets the user switch branches, and invalidates cached queries
 * so every screen refetches scoped to the new branch.
 */
export function BranchPicker() {
  const query = useBranchesBootstrap()
  const branches = query.data ?? []
  const active = useActiveBranch()
  const setBranchId = useActiveBranchStore((s) => s.setBranchId)
  const qc = useQueryClient()

  if (query.isLoading || !active) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 px-2 text-xs font-medium"
        disabled
      >
        <Building2 className="size-3.5" />
        <span className="text-muted-foreground">Loading branches…</span>
      </Button>
    )
  }

  const switchTo = (id: string) => {
    if (id === active.id) return
    setBranchId(id)
    /* Invalidate every branch-scoped query — anything that depends on
     * the active branch will refetch. The active branchId is part of
     * each query key, so post-invalidation refetches will pick up the
     * new value automatically. */
    void qc.invalidateQueries()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 px-2 text-xs font-medium"
          aria-label="Switch branch"
        >
          <Building2 className="size-3.5 text-muted-foreground" />
          <span className="max-w-[160px] truncate">{active.name}</span>
          {active.isHeadquarters ? (
            <Star className="size-3 fill-amber-400 text-amber-400" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Branches
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {branches.map((b) => {
          const isActive = b.id === active.id
          return (
            <DropdownMenuItem
              key={b.id}
              onClick={() => switchTo(b.id)}
              className={cn(
                'flex items-start gap-2 py-2',
                !b.isActive && 'opacity-60',
              )}
            >
              <span className="grid size-4 shrink-0 place-items-center">
                {isActive ? (
                  <Check className="size-4 text-primary" />
                ) : null}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium">{b.name}</span>
                  {b.isHeadquarters ? (
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                  ) : null}
                  {!b.isActive ? (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      inactive
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-muted-foreground">/{b.slug}</p>
              </div>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={routes.app.settings.branches()} className="text-sm">
            <Plus className="size-3.5" /> Manage branches
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

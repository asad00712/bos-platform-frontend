import { useCallback, useMemo, useState } from 'react'

/**
 * Generic row-selection hook for any list/table. Caller passes the full
 * row id list for "select all" + indeterminate behaviour. Returns:
 *   - selectedIds: Set<string>
 *   - isSelected(id), toggle(id), selectAll(), clear(), isAllSelected,
 *     isIndeterminate
 *   - count
 *
 * Pair with `<BulkActionBar>` from `@/shared/ui/bulk-action-bar`.
 */
export function useRowSelection<TId extends string = string>(allIds: TId[]) {
  const [selected, setSelected] = useState<Set<TId>>(() => new Set())

  const toggle = useCallback((id: TId) => {
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const set = useCallback((id: TId, on: boolean) => {
    setSelected((cur) => {
      const next = new Set(cur)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelected(new Set(allIds))
  }, [allIds])

  const clear = useCallback(() => {
    setSelected(new Set())
  }, [])

  const isSelected = useCallback((id: TId) => selected.has(id), [selected])

  const isAllSelected = useMemo(
    () => allIds.length > 0 && selected.size === allIds.length,
    [allIds, selected],
  )
  const isIndeterminate = useMemo(
    () => selected.size > 0 && selected.size < allIds.length,
    [allIds, selected],
  )

  return {
    selectedIds: selected,
    selectedCount: selected.size,
    isSelected,
    toggle,
    set,
    selectAll,
    clear,
    isAllSelected,
    isIndeterminate,
  }
}

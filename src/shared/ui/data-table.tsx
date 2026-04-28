import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type Table as TableInstance,
} from '@tanstack/react-table'
import { useMemo, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { cn } from '@/shared/lib/utils'

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[] | undefined
  isLoading?: boolean
  /** Render slot above the table (filter bar, search, etc). */
  toolbar?: ReactNode
  /** Empty-state customization. */
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: ReactNode
  /** Disable pagination (for short fixed lists). */
  noPagination?: boolean
  pageSize?: number
  /** Sticky header — turn off when nested in a constrained panel. */
  stickyHeader?: boolean
  className?: string
}

/**
 * Generic data table on top of TanStack Table + shadcn `table`. Use for
 * every list/table in the app — filter, sort, pagination, empty/loading
 * states are all standardized here.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  toolbar,
  emptyTitle = 'No results',
  emptyDescription,
  emptyIcon,
  noPagination = false,
  pageSize = 10,
  stickyHeader = true,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const rows = useMemo(() => data ?? [], [data])

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: noPagination ? undefined : getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {toolbar}
      <div className="rounded-md border">
        <Table>
          <TableHeader className={cn(stickyHeader && 'sticky top-0 z-10 bg-card')}>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {columns.map((_c, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <Empty className="py-10">
                    <EmptyHeader>
                      {emptyIcon ? (
                        <EmptyMedia variant="icon">{emptyIcon}</EmptyMedia>
                      ) : null}
                      <EmptyTitle>{emptyTitle}</EmptyTitle>
                      {emptyDescription ? (
                        <EmptyDescription>{emptyDescription}</EmptyDescription>
                      ) : null}
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {!noPagination && !isLoading && table.getRowModel().rows.length > 0 ? (
        <DataTablePagination table={table} />
      ) : null}
    </div>
  )
}

function DataTablePagination<TData>({ table }: { table: TableInstance<TData> }) {
  const total = table.getFilteredRowModel().rows.length
  const pageIdx = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const start = total === 0 ? 0 : pageIdx * pageSize + 1
  const end = Math.min(total, (pageIdx + 1) * pageSize)

  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>
        Showing {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Next page"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { BookOpen, BookMarked, Library } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/tabs'

import { formatCurrency, formatRelative } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import type {
  LibraryBook,
  LibraryIssuance,
} from '../api/school.contracts'
import { useLibraryBooks, useLibraryIssuances } from '../hooks'

const ISSUE_VARIANT: Record<
  LibraryIssuance['status'],
  'default' | 'outline' | 'destructive' | 'secondary'
> = {
  issued: 'secondary',
  returned: 'outline',
  overdue: 'destructive',
}

export function LibraryPage() {
  const { tenant } = useTenant()
  const booksQ = useLibraryBooks(tenant.id)
  const issuesQ = useLibraryIssuances(tenant.id)
  const [tab, setTab] = useState('catalog')

  const bookColumns: ColumnDef<LibraryBook>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.author}</p>
        </div>
      ),
    },
    {
      accessorKey: 'isbn',
      header: 'ISBN',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.isbn ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
    },
    {
      accessorKey: 'copiesAvailable',
      header: 'Available',
      cell: ({ row }) => {
        const tone =
          row.original.copiesAvailable === 0
            ? 'text-rose-600 dark:text-rose-400'
            : row.original.copiesAvailable < row.original.copiesTotal / 2
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-emerald-600 dark:text-emerald-400'
        return (
          <span className={`text-sm font-medium tabular-nums ${tone}`}>
            {row.original.copiesAvailable} / {row.original.copiesTotal}
          </span>
        )
      },
    },
  ]

  const issueColumns: ColumnDef<LibraryIssuance>[] = [
    {
      accessorKey: 'bookTitle',
      header: 'Book',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.bookTitle}</span>
      ),
    },
    {
      accessorKey: 'studentName',
      header: 'Student',
    },
    {
      accessorKey: 'issuedAt',
      header: 'Issued',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatRelative(row.original.issuedAt)}
        </span>
      ),
    },
    {
      accessorKey: 'dueAt',
      header: 'Due',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatRelative(row.original.dueAt)}
        </span>
      ),
    },
    {
      accessorKey: 'fineAmount',
      header: () => <div className="text-right">Fine</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums">
          {row.original.fineAmount > 0
            ? formatCurrency(row.original.fineAmount, 'USD', {
                maximumFractionDigits: 0,
              })
            : '—'}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={ISSUE_VARIANT[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
  ]

  const overdueCount =
    issuesQ.data?.items.filter((i) => i.status === 'overdue').length ?? 0
  const issuedCount =
    issuesQ.data?.items.filter((i) => i.status === 'issued').length ?? 0

  return (
    <PageContainer>
      <PageHeader
        title="Library"
        description={
          booksQ.data
            ? `${booksQ.data.items.length} titles · ${issuedCount} on loan${overdueCount > 0 ? ` · ${overdueCount} overdue` : ''}`
            : 'Loading…'
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="catalog">
            <BookOpen /> Catalog
          </TabsTrigger>
          <TabsTrigger value="issuances">
            <BookMarked /> Issuances
          </TabsTrigger>
        </TabsList>
        <TabsContent value="catalog" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <DataTable
                columns={bookColumns}
                data={booksQ.data?.items}
                isLoading={booksQ.isLoading}
                stickyHeader={false}
                emptyTitle="No books yet"
                emptyDescription="Build out the catalog by adding titles."
                emptyIcon={<Library />}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="issuances" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <DataTable
                columns={issueColumns}
                data={issuesQ.data?.items}
                isLoading={issuesQ.isLoading}
                stickyHeader={false}
                emptyTitle="No issuances"
                emptyDescription="Books on loan will appear here."
                emptyIcon={<BookMarked />}
                noPagination
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

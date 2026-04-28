import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import {
  ChevronRight,
  CloudUpload,
  FileText,
  Files,
  Search,
  X,
} from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { formatRelative } from '@/shared/lib/format'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useTenant } from '@/shared/hooks/useTenant'
import { routes } from '@/routes/routeMap'

import { useDocumentList } from '../hooks'
import type {
  Document,
  DocumentListFilters,
} from '../api/documents.contracts'
import { DocumentKindBadge, DocumentStatusBadge } from '../components/Badges'
import { UploadDialog } from '../components/UploadDialog'
import { formatFileSize } from '../lib/format'

type Props = {
  /** Default to a kind filter (used by Templates page). */
  defaultKind?: DocumentListFilters['kind']
  title?: string
  description?: string
}

const KIND_OPTIONS: { label: string; value: DocumentListFilters['kind'] | 'all' }[] = [
  { label: 'All kinds', value: 'all' },
  { label: 'Contracts', value: 'contract' },
  { label: 'Consents', value: 'consent' },
  { label: 'Templates', value: 'template' },
  { label: 'Invoices', value: 'invoice' },
  { label: 'Medical', value: 'medical' },
  { label: 'General', value: 'general' },
]

const STATUS_OPTIONS: { label: string; value: DocumentListFilters['status'] | 'all' }[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Pending review', value: 'pending_review' },
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
]

export function DocumentsListPage({ defaultKind, title, description }: Props) {
  const { tenant } = useTenant()
  const { has } = usePermissions()
  const navigate = useNavigate()

  const [filters, setFilters] = useState<DocumentListFilters>({
    kind: defaultKind,
  })
  const debouncedSearch = useDebouncedValue(filters.search ?? '', 250)
  const queryFilters = useMemo<DocumentListFilters>(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch],
  )
  const list = useDocumentList(tenant.id, queryFilters)
  const canWrite = has('documents:write')

  const columns: ColumnDef<Document>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Document',
        cell: ({ row }) => {
          const d = row.original
          return (
            <button
              type="button"
              onClick={() => navigate(`${routes.app.documents()}/${d.id}`)}
              className="flex items-center gap-3 text-start"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                <FileText className="size-4" />
              </span>
              <div className="space-y-0.5">
                <div className="font-medium leading-tight">{d.name}</div>
                <div className="text-xs text-muted-foreground">
                  {d.contactName ? `${d.contactName} · ` : ''}
                  {formatFileSize(d.size)} · v{d.versionCount}
                </div>
              </div>
            </button>
          )
        },
      },
      {
        accessorKey: 'kind',
        header: 'Kind',
        cell: ({ row }) => <DocumentKindBadge kind={row.original.kind} />,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <DocumentStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'tags',
        header: 'Tags',
        cell: ({ row }) =>
          row.original.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.tags.map((t) => (
                <Badge key={t} variant="outline" className="text-[10px]">
                  {t}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: 'pendingSignatures',
        header: 'Signatures',
        cell: ({ row }) => {
          const d = row.original
          if (d.signatureCount === 0) {
            return <span className="text-xs text-muted-foreground">—</span>
          }
          return (
            <span className="text-sm">
              {d.signatureCount - d.pendingSignatures}/{d.signatureCount} signed
            </span>
          )
        },
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatRelative(row.original.updatedAt)}
          </span>
        ),
      },
      {
        id: 'open',
        header: () => <span className="sr-only">Open</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open"
              onClick={() => navigate(`${routes.app.documents()}/${row.original.id}`)}
            >
              <ChevronRight />
            </Button>
          </div>
        ),
      },
    ],
    [navigate],
  )

  const total = list.data?.total ?? 0
  const isFiltered =
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    (defaultKind ? false : Boolean(filters.kind))

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="w-full sm:max-w-xs">
        <InputGroupAddon align="inline-start">
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search documents…"
          value={filters.search ?? ''}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </InputGroup>
      {!defaultKind ? (
        <Select
          value={filters.kind ?? 'all'}
          onValueChange={(v) =>
            setFilters({
              ...filters,
              kind: v === 'all' ? undefined : (v as DocumentListFilters['kind']),
            })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Kind" />
          </SelectTrigger>
          <SelectContent>
            {KIND_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={String(o.value)}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      <Select
        value={filters.status ?? 'all'}
        onValueChange={(v) =>
          setFilters({
            ...filters,
            status: v === 'all' ? undefined : (v as DocumentListFilters['status']),
          })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={String(o.value)}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isFiltered ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilters({ kind: defaultKind })}
        >
          <X /> Clear
        </Button>
      ) : null}
    </div>
  )

  return (
    <PageContainer>
      <PageHeader
        title={title ?? 'Documents'}
        description={
          description ??
          (list.isLoading
            ? 'Loading…'
            : `${total} ${total === 1 ? 'document' : 'documents'}`)
        }
        actions={
          canWrite ? (
            <UploadDialog
              trigger={
                <Button>
                  <CloudUpload /> Upload
                </Button>
              }
            />
          ) : undefined
        }
      />
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={list.data?.items}
            isLoading={list.isLoading}
            toolbar={toolbar}
            stickyHeader={false}
            pageSize={10}
            emptyTitle="No documents match"
            emptyDescription="Upload a contract, consent, template, or general file."
            emptyIcon={<Files />}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

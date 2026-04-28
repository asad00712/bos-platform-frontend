import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  ChevronLeft,
  Download,
  FileText,
  History,
  MoreHorizontal,
  PenLine,
  Plus,
  Send,
  Trash2,
  UserSquare,
} from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/tabs'

import { formatDateTime, formatRelative } from '@/shared/lib/format'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useTenant } from '@/shared/hooks/useTenant'
import { routes } from '@/routes/routeMap'

import {
  useAddVersion,
  useDeleteDocument,
  useDocument,
} from '../hooks'
import {
  DocumentKindBadge,
  DocumentStatusBadge,
  SignatureStatusBadge,
} from '../components/Badges'
import { RequestSignatureDialog } from '../components/RequestSignatureDialog'
import { formatFileSize } from '../lib/format'

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const { has } = usePermissions()

  const query = useDocument(tenant.id, id)
  const addVersion = useAddVersion(tenant.id)
  const remove = useDeleteDocument(tenant.id)

  const [signatureOpen, setSignatureOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const canWrite = has('documents:write')

  if (query.isLoading || !query.data) {
    return (
      <PageContainer>
        <PageHeader title="Loading…" />
        <Card>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <PageHeader title="Document" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>Document not found</EmptyTitle>
            <EmptyDescription>
              {(query.error as Error)?.message ?? 'It may have been removed.'}
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to={routes.app.documents()}>
              <ChevronLeft /> Back to documents
            </Link>
          </Button>
        </Empty>
      </PageContainer>
    )
  }

  const d = query.data
  const handleDeleteConfirm = async () => {
    await remove.mutateAsync(d.id)
    setDeleteOpen(false)
    navigate(routes.app.documents())
  }

  return (
    <PageContainer>
      <PageHeader
        title={d.name}
        description={`${d.mimeType} · ${formatFileSize(d.size)} · v${d.versionCount}`}
        breadcrumbs={[
          { label: 'Documents', href: routes.app.documents() },
          { label: d.name },
        ]}
        actions={
          <>
            {canWrite ? (
              <Button onClick={() => setSignatureOpen(true)}>
                <PenLine /> Request signature
              </Button>
            ) : null}
            <Button variant="outline" disabled>
              <Download /> Download
            </Button>
            {canWrite ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="More">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      addVersion.mutate({ id: d.id, notes: null })
                    }
                  >
                    <Plus /> Add version
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <ViewerPlaceholder />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="space-y-2">
              <DocumentKindBadge kind={d.kind} />
              <DocumentStatusBadge status={d.status} />
            </div>

            <dl className="space-y-3 text-sm">
              <DetailRow label="Owner" value={d.ownerName ?? '—'} />
              <DetailRow
                label="Created"
                value={formatDateTime(d.createdAt)}
              />
              <DetailRow
                label="Updated"
                value={formatRelative(d.updatedAt)}
              />
              <DetailRow label="Versions" value={d.versionCount} />
              {d.contactId ? (
                <div className="space-y-0.5">
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Contact
                  </dt>
                  <dd>
                    <Button variant="ghost" size="sm" asChild className="-ms-2">
                      <Link to={routes.app.crm.contact(d.contactId)}>
                        <UserSquare />
                        {d.contactName ?? 'Open contact'}
                      </Link>
                    </Button>
                  </dd>
                </div>
              ) : null}
            </dl>

            {d.tags.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1">
                  {d.tags.map((t) => (
                    <Badge key={t} variant="outline">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {d.notes ? (
              <div className="space-y-1 border-t pt-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Notes
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{d.notes}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="versions">
        <TabsList>
          <TabsTrigger value="versions">
            <History /> Versions
          </TabsTrigger>
          <TabsTrigger value="signatures">
            <PenLine /> Signatures
          </TabsTrigger>
        </TabsList>

        <TabsContent value="versions" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {d.versions.map((v) => (
                  <li key={v.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="grid size-9 place-items-center rounded-md bg-muted text-muted-foreground">
                      <FileText className="size-4" />
                    </span>
                    <div className="flex-1 space-y-0.5">
                      <p className="font-medium">
                        Version {v.versionNumber}{' '}
                        {v.versionNumber === d.versionCount ? (
                          <Badge variant="secondary" className="ms-1 text-[10px]">
                            Current
                          </Badge>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(v.createdAt)}
                        {v.createdByName ? ` · by ${v.createdByName}` : ''} ·{' '}
                        {formatFileSize(v.size)}
                      </p>
                      {v.notes ? (
                        <p className="text-xs text-muted-foreground">{v.notes}</p>
                      ) : null}
                    </div>
                    <Button variant="ghost" size="sm" disabled>
                      <Download /> Download
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signatures" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Signature requests
                </p>
                {canWrite ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSignatureOpen(true)}
                  >
                    <Send /> Request another
                  </Button>
                ) : null}
              </div>
              {d.signatures.length === 0 ? (
                <Empty className="py-10">
                  <EmptyHeader>
                    <EmptyTitle>No signature requests</EmptyTitle>
                    <EmptyDescription>
                      Send a secure signing link from the Request signature button.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <ul className="space-y-3">
                  {d.signatures.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-3 rounded-md border bg-card/50 p-3"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{s.signerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.signerEmail}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {s.signedAt ? (
                          <span className="text-xs text-muted-foreground">
                            Signed {formatRelative(s.signedAt)}
                          </span>
                        ) : s.sentAt ? (
                          <span className="text-xs text-muted-foreground">
                            Sent {formatRelative(s.sentAt)}
                          </span>
                        ) : null}
                        <SignatureStatusBadge status={s.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request signature */}
      <RequestSignatureDialog
        documentId={d.id}
        open={signatureOpen}
        onOpenChange={setSignatureOpen}
      />

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete document?</DialogTitle>
            <DialogDescription>
              Permanently removes this document and all of its versions. This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Keep
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={remove.isPending}
            >
              {remove.isPending ? 'Deleting…' : 'Delete document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

function ViewerPlaceholder() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 bg-muted/40 p-12 text-center">
      <span className="grid size-12 place-items-center rounded-md bg-card text-muted-foreground shadow-sm">
        <FileText className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="font-medium">Document preview</p>
        <p className="text-xs text-muted-foreground">
          Inline preview lands when the file service is wired up. Versions and
          signatures are fully functional today.
        </p>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-end text-sm">{value}</dd>
    </div>
  )
}

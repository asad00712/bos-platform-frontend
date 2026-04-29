import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  Check,
  ChevronLeft,
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Webhook as WebhookIcon,
} from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { Badge } from '@/shared/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatRelative } from '@/shared/lib/format'

import { useActiveBranchStore } from '@/stores/activeBranch.store'
import { useHasPermission } from '@/shared/auth/useHasPermission'
import { routes } from '@/routes/routeMap'
import type { LeadWebhook } from '@/types/crm'

import {
  useCreateLeadWebhook,
  useDeleteLeadWebhook,
  useLeadWebhooks,
  useRegenerateWebhookToken,
  useUpdateLeadWebhook,
} from '../hooks'

export function LeadWebhooksPage() {
  const branchId = useActiveBranchStore((s) => s.branchId) ?? 'br-main'
  const canConfigure = useHasPermission('tenant:leads:configure')

  const query = useLeadWebhooks()
  const createM = useCreateLeadWebhook()
  const updateM = useUpdateLeadWebhook()
  const removeM = useDeleteLeadWebhook()
  const regenM = useRegenerateWebhookToken()

  const [dialog, setDialog] = useState<
    | { mode: 'closed' }
    | { mode: 'create' }
    | { mode: 'edit'; webhook: LeadWebhook }
    | { mode: 'delete'; webhook: LeadWebhook }
    | { mode: 'regen'; webhook: LeadWebhook }
  >({ mode: 'closed' })

  const webhooks = query.data ?? []

  return (
    <PageContainer>
      <PageHeader
        title="Lead webhooks"
        description="Public ingestion URLs that turn JSON POSTs into leads. Tokens are stored in Redis for O(1) lookup."
        breadcrumbs={[
          { label: 'CRM', href: routes.app.crm.root() },
          { label: 'Leads', href: routes.app.crm.leads() },
          { label: 'Webhooks' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to={routes.app.crm.leads()}>
                <ChevronLeft /> Back to leads
              </Link>
            </Button>
            {canConfigure ? (
              <Button onClick={() => setDialog({ mode: 'create' })}>
                <Plus /> New webhook
              </Button>
            ) : null}
          </div>
        }
      />

      {query.isLoading ? (
        <Card>
          <CardContent className="space-y-3 p-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </CardContent>
        </Card>
      ) : webhooks.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <WebhookIcon />
                </EmptyMedia>
                <EmptyTitle>No webhooks yet</EmptyTitle>
                <EmptyDescription>
                  Create one to capture leads from a website form, ad platform,
                  or any external integration that can POST JSON.
                </EmptyDescription>
              </EmptyHeader>
              {canConfigure ? (
                <Button onClick={() => setDialog({ mode: 'create' })}>
                  <Plus /> New webhook
                </Button>
              ) : null}
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {webhooks.map((w) => (
            <WebhookCard
              key={w.id}
              webhook={w}
              canConfigure={canConfigure}
              onToggleActive={(v) =>
                updateM.mutate({ id: w.id, patch: { isActive: v } })
              }
              onEdit={() => setDialog({ mode: 'edit', webhook: w })}
              onRegen={() => setDialog({ mode: 'regen', webhook: w })}
              onDelete={() => setDialog({ mode: 'delete', webhook: w })}
            />
          ))}
        </div>
      )}

      <WebhookFormDialog
        state={dialog}
        branchId={branchId}
        onClose={() => setDialog({ mode: 'closed' })}
        onCreate={(input) =>
          createM.mutateAsync(input).then(() => setDialog({ mode: 'closed' }))
        }
        onUpdate={(id, patch) =>
          updateM
            .mutateAsync({ id, patch })
            .then(() => setDialog({ mode: 'closed' }))
        }
        onRegen={(id) =>
          regenM.mutateAsync(id).then(() => setDialog({ mode: 'closed' }))
        }
        onDelete={(id) =>
          removeM.mutateAsync(id).then(() => setDialog({ mode: 'closed' }))
        }
        isWriting={
          createM.isPending ||
          updateM.isPending ||
          removeM.isPending ||
          regenM.isPending
        }
      />
    </PageContainer>
  )
}

function WebhookCard({
  webhook: w,
  canConfigure,
  onToggleActive,
  onEdit,
  onRegen,
  onDelete,
}: {
  webhook: LeadWebhook
  canConfigure: boolean
  onToggleActive: (v: boolean) => void
  onEdit: () => void
  onRegen: () => void
  onDelete: () => void
}) {
  const [reveal, setReveal] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(w.publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold">{w.name}</p>
              <Badge variant={w.isActive ? 'default' : 'outline'}>
                {w.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Created {formatRelative(w.createdAt)}
              {w.lastDeliveryAt
                ? ` · last delivery ${formatRelative(w.lastDeliveryAt)}`
                : ' · no deliveries yet'}
            </p>
          </div>
          {canConfigure ? (
            <div className="flex items-center gap-1.5">
              <Switch
                checked={w.isActive}
                onCheckedChange={onToggleActive}
                aria-label="Active"
              />
              <Button variant="ghost" size="icon" aria-label="Edit" onClick={onEdit}>
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Regenerate token"
                onClick={onRegen}
              >
                <RefreshCw />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete"
                onClick={onDelete}
              >
                <Trash2 className="text-destructive" />
              </Button>
            </div>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Public ingestion URL
          </Label>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-md border bg-muted px-2.5 py-1.5 font-mono text-xs">
              {reveal
                ? w.publicUrl
                : w.publicUrl.replace(w.token, '••••••••••••')}
            </code>
            <Button
              variant="outline"
              size="icon"
              aria-label={reveal ? 'Hide' : 'Reveal'}
              onClick={() => setReveal((v) => !v)}
            >
              {reveal ? <EyeOff /> : <Eye />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Copy URL"
              onClick={copy}
            >
              {copied ? <Check /> : <Copy />}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            POST a JSON body with at minimum <code>firstName</code>,{' '}
            <code>email</code>, and <code>phone</code>. The token is in the URL,
            so rotate it via Regenerate if it leaks.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

type DialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; webhook: LeadWebhook }
  | { mode: 'delete'; webhook: LeadWebhook }
  | { mode: 'regen'; webhook: LeadWebhook }

function WebhookFormDialog({
  state,
  branchId,
  onClose,
  onCreate,
  onUpdate,
  onRegen,
  onDelete,
  isWriting,
}: {
  state: DialogState
  branchId: string
  onClose: () => void
  onCreate: (input: { branchId: string; name: string }) => Promise<void>
  onUpdate: (
    id: string,
    patch: Partial<{ name: string; isActive: boolean }>,
  ) => Promise<void>
  onRegen: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isWriting: boolean
}) {
  const open = state.mode !== 'closed'
  const editing = state.mode === 'edit' ? state.webhook : null
  const deleting = state.mode === 'delete' ? state.webhook : null
  const regen = state.mode === 'regen' ? state.webhook : null

  const [name, setName] = useState('')

  const editingId = editing?.id ?? null
  useEffect(() => {
    if (state.mode === 'edit') setName(state.webhook.name)
    if (state.mode === 'create') setName('')
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [state.mode, editingId])

  if (deleting) {
    return (
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {deleting.name}?</DialogTitle>
            <DialogDescription>
              The public URL stops accepting POSTs immediately. Existing
              leads it created stay safe.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(deleting.id)}
              disabled={isWriting}
            >
              {isWriting ? 'Deleting…' : 'Delete webhook'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  if (regen) {
    return (
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Regenerate token?</DialogTitle>
            <DialogDescription>
              The current URL stops working immediately. Update every
              integration that calls it before regenerating.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => onRegen(regen.id)}
              disabled={isWriting}
            >
              {isWriting ? 'Regenerating…' : 'Regenerate token'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit webhook' : 'New webhook'}</DialogTitle>
          <DialogDescription>
            Each webhook gets a unique token. Share the URL with your
            integration; we&apos;ll generate leads from incoming POSTs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Name</Label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website contact form"
            />
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              For your own reference. Doesn&apos;t affect the URL.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={isWriting || !name.trim()}
            onClick={() => {
              if (editing) {
                void onUpdate(editing.id, { name })
              } else {
                void onCreate({ branchId, name })
              }
            }}
          >
            {isWriting ? 'Saving…' : editing ? 'Save changes' : 'Create webhook'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

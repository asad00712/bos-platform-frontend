import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  ChevronLeft,
  CircleDollarSign,
  MoreHorizontal,
  Plus,
  Receipt,
  Trash2,
  UserSquare,
} from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

import { formatCurrency, formatDate } from '@/shared/lib/format'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useTenant } from '@/shared/hooks/useTenant'
import { routes } from '@/routes/routeMap'

import {
  useDeleteInvoice,
  useInvoice,
  useUpdateInvoice,
  useVoidInvoice,
} from '../hooks'
import type { InvoiceInput } from '../api/billing.contracts'
import { InvoiceForm } from '../components/InvoiceForm'
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge'
import { RecordPaymentDialog } from '../components/RecordPaymentDialog'

const METHOD_LABEL = {
  card: 'Card',
  cash: 'Cash',
  bank_transfer: 'Bank transfer',
  check: 'Check',
  other: 'Other',
} as const

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const { has } = usePermissions()

  const query = useInvoice(tenant.id, id)
  const update = useUpdateInvoice(tenant.id)
  const voidInv = useVoidInvoice(tenant.id)
  const remove = useDeleteInvoice(tenant.id)

  const [editOpen, setEditOpen] = useState(false)
  const [voidOpen, setVoidOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)

  const canWrite = has('billing:write')

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
        <PageHeader title="Invoice" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Receipt />
            </EmptyMedia>
            <EmptyTitle>Invoice not found</EmptyTitle>
            <EmptyDescription>
              {(query.error as Error)?.message ?? 'It may have been removed.'}
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to={routes.app.billing.invoices()}>
              <ChevronLeft /> Back to invoices
            </Link>
          </Button>
        </Empty>
      </PageContainer>
    )
  }

  const inv = query.data
  const canRecordPayment = canWrite && inv.amountDue > 0 && inv.status !== 'void'

  const handleEditSubmit = async (values: InvoiceInput) => {
    await update.mutateAsync({ id: inv.id, patch: values })
    setEditOpen(false)
  }

  const handleVoidConfirm = async () => {
    await voidInv.mutateAsync(inv.id)
    setVoidOpen(false)
  }

  const handleDeleteConfirm = async () => {
    await remove.mutateAsync(inv.id)
    setDeleteOpen(false)
    navigate(routes.app.billing.invoices())
  }

  return (
    <PageContainer>
      <PageHeader
        title={inv.number}
        description={inv.contactName ?? undefined}
        breadcrumbs={[
          { label: 'Billing', href: routes.app.billing.root() },
          { label: 'Invoices', href: routes.app.billing.invoices() },
          { label: inv.number },
        ]}
        actions={
          <>
            {canRecordPayment ? (
              <Button onClick={() => setPaymentOpen(true)}>
                <CircleDollarSign /> Record payment
              </Button>
            ) : null}
            {canWrite ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="More">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    Edit invoice
                  </DropdownMenuItem>
                  {inv.status !== 'void' ? (
                    <DropdownMenuItem onClick={() => setVoidOpen(true)}>
                      Void invoice
                    </DropdownMenuItem>
                  ) : null}
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
          <CardContent className="space-y-5 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <InvoiceStatusBadge status={inv.status} />
              <span className="text-xs text-muted-foreground">
                Issued {formatDate(inv.issuedAt, { dateStyle: 'medium' })} · Due{' '}
                {formatDate(inv.dueAt, { dateStyle: 'medium' })}
              </span>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit price</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Line total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inv.lineItems.map((li) => {
                  const lineSubtotal = li.quantity * li.unitPrice
                  const lineTotal = lineSubtotal * (1 + li.taxRate / 100)
                  return (
                    <TableRow key={li.id}>
                      <TableCell>{li.description}</TableCell>
                      <TableCell className="text-right tabular-nums">{li.quantity}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(li.unitPrice, inv.currency, { maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {li.taxRate}%
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrency(lineTotal, inv.currency, { maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {inv.notes ? (
              <div className="space-y-1 border-t pt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Notes
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{inv.notes}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Summary
              </p>
              <SummaryRow
                label="Subtotal"
                value={formatCurrency(inv.subtotal, inv.currency, { maximumFractionDigits: 2 })}
              />
              <SummaryRow
                label="Tax"
                value={formatCurrency(inv.taxTotal, inv.currency, { maximumFractionDigits: 2 })}
              />
              {inv.discountRate > 0 ? (
                <SummaryRow
                  label={`Discount (${inv.discountRate}%)`}
                  value={`−${formatCurrency(
                    inv.subtotal + inv.taxTotal - inv.total,
                    inv.currency,
                    { maximumFractionDigits: 2 },
                  )}`}
                />
              ) : null}
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-base font-semibold">Total</span>
                <span className="text-base font-semibold tabular-nums">
                  {formatCurrency(inv.total, inv.currency, { maximumFractionDigits: 2 })}
                </span>
              </div>
              <SummaryRow
                label="Paid"
                value={formatCurrency(inv.amountPaid, inv.currency, { maximumFractionDigits: 2 })}
              />
              <SummaryRow
                label="Outstanding"
                emphasize
                value={formatCurrency(inv.amountDue, inv.currency, { maximumFractionDigits: 2 })}
              />
            </CardContent>
          </Card>

          {inv.contactId ? (
            <Card>
              <CardContent className="space-y-2 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Bill to
                </p>
                <Button variant="ghost" size="sm" asChild className="-ms-2">
                  <Link to={routes.app.crm.contact(inv.contactId)}>
                    <UserSquare /> {inv.contactName ?? 'Open contact'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Payments
            </p>
            {canRecordPayment ? (
              <Button variant="outline" size="sm" onClick={() => setPaymentOpen(true)}>
                <Plus /> Record payment
              </Button>
            ) : null}
          </div>
          {inv.payments.length === 0 ? (
            <Empty className="py-10">
              <EmptyHeader>
                <EmptyTitle>No payments yet</EmptyTitle>
                <EmptyDescription>
                  Record a payment when you receive money for this invoice.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inv.payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.receivedAt, { dateStyle: 'medium' })}</TableCell>
                    <TableCell>{METHOD_LABEL[p.method]}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.reference ?? '—'}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(p.amount, p.currency, { maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Record payment dialog */}
      <RecordPaymentDialog
        invoiceId={inv.id}
        invoiceNumber={inv.number}
        amountDue={inv.amountDue}
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
      />

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit invoice</DialogTitle>
            <DialogDescription>Update line items, dates, status, or notes.</DialogDescription>
          </DialogHeader>
          <InvoiceForm
            currency={inv.currency}
            defaultValues={{
              contactId: inv.contactId,
              issuedAt: inv.issuedAt,
              dueAt: inv.dueAt,
              status: inv.status,
              discountRate: inv.discountRate,
              notes: inv.notes ?? '',
              lineItems: inv.lineItems.map((li) => ({
                description: li.description,
                quantity: li.quantity,
                unitPrice: li.unitPrice,
                taxRate: li.taxRate,
              })),
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditOpen(false)}
            submitLabel="Save changes"
            isSubmitting={update.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Void confirm */}
      <Dialog open={voidOpen} onOpenChange={setVoidOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Void invoice?</DialogTitle>
            <DialogDescription>
              Voiding marks the invoice as not collectable. It stays visible for audit.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setVoidOpen(false)}>
              Keep invoice
            </Button>
            <Button
              variant="destructive"
              onClick={handleVoidConfirm}
              disabled={voidInv.isPending}
            >
              {voidInv.isPending ? 'Voiding…' : 'Void invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete invoice?</DialogTitle>
            <DialogDescription>
              Permanently removes the invoice and any linked payments. This cannot be undone.
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
              {remove.isPending ? 'Deleting…' : 'Delete invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

function SummaryRow({
  label,
  value,
  emphasize,
}: {
  label: string
  value: string
  emphasize?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={emphasize ? 'font-semibold' : 'text-muted-foreground'}>
        {label}
      </span>
      <span className={`tabular-nums ${emphasize ? 'font-semibold' : ''}`}>
        {value}
      </span>
    </div>
  )
}

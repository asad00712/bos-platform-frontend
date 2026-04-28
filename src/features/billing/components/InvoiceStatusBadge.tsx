import { Badge } from '@/shared/ui/badge'
import type { InvoiceStatus } from '../api/billing.contracts'

const VARIANT: Record<
  InvoiceStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  draft: 'outline',
  sent: 'secondary',
  partial: 'default',
  paid: 'default',
  overdue: 'destructive',
  void: 'outline',
}

const LABEL: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  partial: 'Partial',
  paid: 'Paid',
  overdue: 'Overdue',
  void: 'Void',
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>
}

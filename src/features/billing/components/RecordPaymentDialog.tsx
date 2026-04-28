import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { useTenant } from '@/shared/hooks/useTenant'

import { useRecordPayment } from '../hooks'
import type { PaymentInput } from '../api/billing.contracts'
import { PaymentForm } from './PaymentForm'

type Props = {
  invoiceId: string
  invoiceNumber: string
  amountDue: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RecordPaymentDialog({
  invoiceId,
  invoiceNumber,
  amountDue,
  open,
  onOpenChange,
}: Props) {
  const { tenant } = useTenant()
  const record = useRecordPayment(tenant.id)

  const handleSubmit = async (values: PaymentInput) => {
    await record.mutateAsync(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            For invoice {invoiceNumber}. Outstanding {amountDue.toFixed(2)}.
          </DialogDescription>
        </DialogHeader>
        <PaymentForm
          invoiceId={invoiceId}
          defaultAmount={amountDue}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={record.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

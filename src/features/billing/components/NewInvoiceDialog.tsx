import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { useTenant } from '@/shared/hooks/useTenant'
import { routes } from '@/routes/routeMap'

import { useCreateInvoice } from '../hooks'
import type { InvoiceInput } from '../api/billing.contracts'
import { InvoiceForm } from './InvoiceForm'

type Props = {
  trigger: ReactNode
}

export function NewInvoiceDialog({ trigger }: Props) {
  const { tenant } = useTenant()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const create = useCreateInvoice(tenant.id)

  const handleSubmit = async (values: InvoiceInput) => {
    const created = await create.mutateAsync(values)
    setOpen(false)
    navigate(routes.app.billing.invoice(created.id))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>New invoice</DialogTitle>
          <DialogDescription>
            Bill a contact for products, services, or treatments.
          </DialogDescription>
        </DialogHeader>
        <InvoiceForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          submitLabel="Create invoice"
          isSubmitting={create.isPending}
          currency={tenant.currency ?? 'USD'}
        />
      </DialogContent>
    </Dialog>
  )
}

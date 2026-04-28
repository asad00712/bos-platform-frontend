import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'

import { useTenant } from '@/shared/hooks/useTenant'
import { useActiveBranchStore } from '@/stores/activeBranch.store'
import { useCreateContact } from '../hooks'
import type { ContactInput } from '../api/crm.contracts'
import { ContactForm } from './ContactForm'

type Props = {
  trigger: React.ReactNode
  onCreated?: (id: string) => void
}

export function NewContactDialog({ trigger, onCreated }: Props) {
  const { tenant } = useTenant()
  const branchId = useActiveBranchStore((s) => s.branchId) ?? 'br-main'
  const [open, setOpen] = useState(false)
  const create = useCreateContact(tenant.id)

  const handleSubmit = async (values: ContactInput) => {
    const created = await create.mutateAsync(values)
    setOpen(false)
    onCreated?.(created.id)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New contact</DialogTitle>
          <DialogDescription>
            Add a person or organization to your CRM.
          </DialogDescription>
        </DialogHeader>

        <ContactForm
          defaultValues={{ branchId }}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          submitLabel="Create contact"
          isSubmitting={create.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

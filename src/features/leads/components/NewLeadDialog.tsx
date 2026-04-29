import { useState } from 'react'
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
import { useActiveBranchStore } from '@/stores/activeBranch.store'
import { routes } from '@/routes/routeMap'

import type { LeadInput } from '../api/leads.api'
import { useCreateLead } from '../hooks'
import { LeadForm } from './LeadForm'

type Props = {
  trigger: React.ReactNode
  /** When true, open detail page after create. Defaults to true. */
  navigateOnCreate?: boolean
}

export function NewLeadDialog({ trigger, navigateOnCreate = true }: Props) {
  const { tenant } = useTenant()
  const branchId = useActiveBranchStore((s) => s.branchId) ?? 'br-main'
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const create = useCreateLead(tenant.id)

  const handleSubmit = async (values: LeadInput) => {
    const created = await create.mutateAsync(values)
    setOpen(false)
    if (navigateOnCreate) {
      navigate(routes.app.crm.lead(created.id))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New lead</DialogTitle>
          <DialogDescription>
            Capture an enquiry. The contact gets created on conversion.
          </DialogDescription>
        </DialogHeader>

        <LeadForm
          defaultValues={{ branchId }}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          submitLabel="Create lead"
          isSubmitting={create.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

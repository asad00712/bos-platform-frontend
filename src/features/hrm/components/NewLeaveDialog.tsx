import { useState, type ReactNode } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { useTenant } from '@/shared/hooks/useTenant'

import { useCreateLeave } from '../hooks'
import type { LeaveInput } from '../api/hrm.contracts'
import { LeaveRequestForm } from './LeaveRequestForm'

type Props = { trigger: ReactNode }

export function NewLeaveDialog({ trigger }: Props) {
  const { tenant } = useTenant()
  const [open, setOpen] = useState(false)
  const create = useCreateLeave(tenant.id)

  const handleSubmit = async (values: LeaveInput) => {
    await create.mutateAsync(values)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request leave</DialogTitle>
          <DialogDescription>
            Submit a leave request for an employee. Approvers will be notified.
          </DialogDescription>
        </DialogHeader>
        <LeaveRequestForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isSubmitting={create.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

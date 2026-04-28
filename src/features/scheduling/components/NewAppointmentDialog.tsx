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

import { useCreateAppointment } from '../hooks'
import type { AppointmentInput } from '../api/scheduling.contracts'
import { AppointmentForm } from './AppointmentForm'

type Props = {
  /** Trigger element (uncontrolled). Omit when using `open`/`onOpenChange`. */
  trigger?: ReactNode
  /** Controlled open state — pass with `onOpenChange` to drive externally. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Pre-fill the form with these values (used by calendar slot clicks). */
  initialValues?: Partial<AppointmentInput>
  /** Override default post-create behavior (default navigates to detail). */
  onCreated?: (id: string) => void
}

export function NewAppointmentDialog({
  trigger,
  open,
  onOpenChange,
  initialValues,
  onCreated,
}: Props) {
  const { tenant } = useTenant()
  const [internalOpen, setInternalOpen] = useState(false)
  const navigate = useNavigate()
  const create = useCreateAppointment(tenant.id)

  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  const handleSubmit = async (values: AppointmentInput) => {
    const created = await create.mutateAsync(values)
    setOpen(false)
    if (onCreated) onCreated(created.id)
    else navigate(routes.app.scheduling.appointment(created.id))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New appointment</DialogTitle>
          <DialogDescription>
            Schedule a slot, assign a contact, room, and staff member.
          </DialogDescription>
        </DialogHeader>
        <AppointmentForm
          defaultValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          submitLabel="Create appointment"
          isSubmitting={create.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

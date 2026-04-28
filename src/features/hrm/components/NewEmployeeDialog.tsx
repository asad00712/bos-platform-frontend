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

import { useCreateEmployee } from '../hooks'
import type { EmployeeInput } from '../api/hrm.contracts'
import { EmployeeForm } from './EmployeeForm'

type Props = {
  trigger: ReactNode
}

export function NewEmployeeDialog({ trigger }: Props) {
  const { tenant } = useTenant()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const create = useCreateEmployee(tenant.id)

  const handleSubmit = async (values: EmployeeInput) => {
    const created = await create.mutateAsync(values)
    setOpen(false)
    navigate(routes.app.hrm.employee(created.id))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add employee</DialogTitle>
          <DialogDescription>
            Add a team member with their role, department, and start date.
          </DialogDescription>
        </DialogHeader>
        <EmployeeForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          submitLabel="Add employee"
          isSubmitting={create.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

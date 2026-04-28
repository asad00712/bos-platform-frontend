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

import { useCreatePatient } from '../hooks'
import type { PatientInput } from '../api/dental.contracts'
import { PatientForm } from './PatientForm'

type Props = { trigger: ReactNode }

export function NewPatientDialog({ trigger }: Props) {
  const { tenant } = useTenant()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const create = useCreatePatient(tenant.id)

  const handleSubmit = async (values: PatientInput) => {
    const created = await create.mutateAsync(values)
    setOpen(false)
    navigate(`/app/dental/patients/${created.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New patient</DialogTitle>
          <DialogDescription>
            Add a patient with intake details. Tooth chart starts blank.
          </DialogDescription>
        </DialogHeader>
        <PatientForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          submitLabel="Add patient"
          isSubmitting={create.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

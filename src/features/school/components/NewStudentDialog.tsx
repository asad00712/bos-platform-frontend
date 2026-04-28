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
import { Spinner } from '@/shared/ui/spinner'
import { useTenant } from '@/shared/hooks/useTenant'

import type { StudentInput } from '../api/school.contracts'
import { useClassesList, useCreateStudent } from '../hooks'
import { StudentForm } from './StudentForm'

type Props = { trigger: ReactNode }

export function NewStudentDialog({ trigger }: Props) {
  const { tenant } = useTenant()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const create = useCreateStudent(tenant.id)
  const classesQ = useClassesList(tenant.id)

  const handleSubmit = async (values: StudentInput) => {
    const created = await create.mutateAsync(values)
    setOpen(false)
    navigate(`/app/school/students/${created.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Admit new student</DialogTitle>
          <DialogDescription>
            Capture admission details. You can add academic history, transport
            and hostel placement after enrolment.
          </DialogDescription>
        </DialogHeader>
        {classesQ.data ? (
          <StudentForm
            classes={classesQ.data}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            submitLabel="Admit student"
            isSubmitting={create.isPending}
          />
        ) : (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <Spinner />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

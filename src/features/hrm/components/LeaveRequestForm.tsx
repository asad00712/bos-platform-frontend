import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/shared/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { leaveKindSchema, type LeaveInput } from '../api/hrm.contracts'
import { EmployeeCombobox } from './EmployeeCombobox'

const formSchema = z
  .object({
    employeeId: z.string().min(1, 'Select an employee'),
    kind: leaveKindSchema,
    startDate: z.string().min(1, 'Required'),
    endDate: z.string().min(1, 'Required'),
    reason: z.string(),
  })
  .refine(
    (v) => new Date(v.endDate).getTime() >= new Date(v.startDate).getTime(),
    { message: 'End date must be on or after start.', path: ['endDate'] },
  )

type FormValues = z.infer<typeof formSchema>

type Props = {
  onSubmit: (values: LeaveInput) => void | Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

function isoToDate(iso?: string): string {
  if (!iso) return ''
  return new Date(iso).toISOString().slice(0, 10)
}
function dateToIso(date: string): string {
  if (!date) return new Date().toISOString()
  return new Date(date).toISOString()
}

/** Inclusive working-day count between two ISO dates (Mon–Fri). */
function workingDays(startIso: string, endIso: string): number {
  const start = new Date(startIso)
  const end = new Date(endIso)
  if (end < start) return 0
  let count = 0
  const cur = new Date(start)
  while (cur <= end) {
    const day = cur.getDay()
    if (day !== 0 && day !== 6) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

export function LeaveRequestForm({ onSubmit, onCancel, isSubmitting }: Props) {
  const today = isoToDate(new Date().toISOString())
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: '',
      kind: 'vacation',
      startDate: today,
      endDate: today,
      reason: '',
    },
  })

  const start = form.watch('startDate')
  const end = form.watch('endDate')
  const days = workingDays(start, end)

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmit({
            employeeId: values.employeeId,
            kind: values.kind,
            startDate: dateToIso(values.startDate),
            endDate: dateToIso(values.endDate),
            days: workingDays(values.startDate, values.endDate),
            reason: values.reason || undefined,
          }),
        )}
        className="space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee</FormLabel>
              <FormControl>
                <EmployeeCombobox
                  value={field.value}
                  onChange={(id) => field.onChange(id ?? '')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="kind"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="bereavement">Bereavement</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          {days} working day{days === 1 ? '' : 's'} requested.
        </p>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Optional context for the approver" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit request'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
import { Button } from '@/shared/ui/button'

import { useTenant } from '@/shared/hooks/useTenant'
import { useActiveBranchStore } from '@/stores/activeBranch.store'
import {
  useOwnerLookup,
  useSourceLookup,
} from '@/features/crm/hooks'

import type { LeadInput } from '../api/leads.api'
import { useLeadStatuses } from '../hooks'

const SENTINEL = '__none__'

const formSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string(),
  email: z
    .string()
    .email('Enter a valid email.')
    .or(z.literal(''))
    .optional(),
  phone: z.string(),
  company: z.string(),
  sourceId: z.string().optional(),
  statusId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  estimatedValue: z.string(),
  ownerUserId: z.string().optional(),
  notes: z.string(),
})

type FormValues = z.infer<typeof formSchema>

type Props = {
  defaultValues?: Partial<LeadInput>
  onSubmit: (values: LeadInput) => void
  onCancel?: () => void
  submitLabel?: string
  isSubmitting?: boolean
}

export function LeadForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save lead',
  isSubmitting,
}: Props) {
  const { tenant } = useTenant()
  const branchId =
    useActiveBranchStore((s) => s.branchId) ?? defaultValues?.branchId ?? 'br-main'

  const sourcesQ = useSourceLookup(tenant.id)
  const ownersQ = useOwnerLookup(tenant.id)
  const statusesQ = useLeadStatuses(tenant.id)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? '',
      lastName: defaultValues?.lastName ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      company: defaultValues?.company ?? '',
      sourceId: defaultValues?.sourceId,
      statusId: defaultValues?.statusId,
      priority: defaultValues?.priority ?? 'medium',
      estimatedValue:
        defaultValues?.estimatedValue !== undefined &&
        defaultValues.estimatedValue !== null
          ? String(defaultValues.estimatedValue)
          : '',
      ownerUserId: defaultValues?.ownerUserId,
      notes: defaultValues?.notes ?? '',
    },
  })

  const handleSubmit = (values: FormValues) => {
    const numeric = values.estimatedValue.trim()
      ? Number.parseFloat(values.estimatedValue)
      : undefined
    onSubmit({
      branchId,
      firstName: values.firstName,
      lastName: values.lastName || undefined,
      email: values.email && values.email.length > 0 ? values.email : undefined,
      phone: values.phone || undefined,
      company: values.company || undefined,
      sourceId: values.sourceId || undefined,
      statusId: values.statusId || undefined,
      priority: values.priority,
      estimatedValue:
        numeric !== undefined && Number.isFinite(numeric) ? numeric : undefined,
      ownerUserId: values.ownerUserId || undefined,
      notes: values.notes || undefined,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
        noValidate
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input autoComplete="given-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input autoComplete="family-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input autoComplete="organization" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="statusId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  value={field.value ?? SENTINEL}
                  onValueChange={(v) =>
                    field.onChange(v === SENTINEL ? undefined : v)
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="No status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={SENTINEL}>No status</SelectItem>
                    {(statusesQ.data ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="estimatedValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="sourceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select
                  value={field.value ?? SENTINEL}
                  onValueChange={(v) =>
                    field.onChange(v === SENTINEL ? undefined : v)
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="No source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={SENTINEL}>No source</SelectItem>
                    {(sourcesQ.data ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ownerUserId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Owner</FormLabel>
                <Select
                  value={field.value ?? SENTINEL}
                  onValueChange={(v) =>
                    field.onChange(v === SENTINEL ? undefined : v)
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={SENTINEL}>Unassigned</SelectItem>
                    {(ownersQ.data ?? []).map((o) => (
                      <SelectItem key={o.userId} value={o.userId}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Initial qualification notes…" {...field} />
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
            {isSubmitting ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}

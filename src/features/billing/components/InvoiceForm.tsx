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

import { ContactCombobox } from '@/features/scheduling/components/ContactCombobox'
import {
  invoiceStatusSchema,
  type InvoiceInput,
} from '../api/billing.contracts'
import { LineItemsEditor } from './LineItemsEditor'

const lineItemSchema = z.object({
  description: z.string().min(1, 'Required'),
  quantity: z.number().positive('Must be > 0'),
  unitPrice: z.number().nonnegative(),
  taxRate: z.number().min(0).max(100),
})

const formSchema = z.object({
  contactId: z.string().nullable(),
  issuedAt: z.string().min(1),
  dueAt: z.string().min(1),
  status: invoiceStatusSchema,
  discountRate: z.number().min(0).max(100),
  notes: z.string(),
  lineItems: z.array(lineItemSchema).min(1, 'Add at least one line item'),
})

type FormValues = z.infer<typeof formSchema>

type Props = {
  defaultValues?: Partial<InvoiceInput>
  onSubmit: (values: InvoiceInput) => void | Promise<void>
  onCancel?: () => void
  submitLabel?: string
  isSubmitting?: boolean
  currency: string
}

function isoToDate(iso?: string): string {
  if (!iso) return ''
  return new Date(iso).toISOString().slice(0, 10)
}
function dateToIso(date: string): string {
  if (!date) return new Date().toISOString()
  return new Date(date).toISOString()
}

export function InvoiceForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save invoice',
  isSubmitting,
  currency,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactId: defaultValues?.contactId ?? null,
      issuedAt: isoToDate(defaultValues?.issuedAt) || isoToDate(new Date().toISOString()),
      dueAt:
        isoToDate(defaultValues?.dueAt) ||
        isoToDate(new Date(Date.now() + 14 * 86_400_000).toISOString()),
      status: defaultValues?.status ?? 'draft',
      discountRate: defaultValues?.discountRate ?? 0,
      notes: defaultValues?.notes ?? '',
      lineItems:
        defaultValues?.lineItems && defaultValues.lineItems.length > 0
          ? defaultValues.lineItems
          : [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0 }],
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmit({
            contactId: values.contactId,
            issuedAt: dateToIso(values.issuedAt),
            dueAt: dateToIso(values.dueAt),
            status: values.status,
            discountRate: values.discountRate,
            notes: values.notes || undefined,
            lineItems: values.lineItems,
          }),
        )}
        className="space-y-5"
        noValidate
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="contactId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bill to</FormLabel>
                <FormControl>
                  <ContactCombobox
                    value={field.value}
                    onChange={(id) => field.onChange(id)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="void">Void</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="issuedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issued</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="discountRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount %</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...form.register('discountRate', { valueAsNumber: true })}
                    value={field.value ?? 0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Line items</FormLabel>
          <LineItemsEditor currency={currency} />
          {form.formState.errors.lineItems?.message ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.lineItems.message as string}
            </p>
          ) : null}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Payment terms, references…" {...field} />
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

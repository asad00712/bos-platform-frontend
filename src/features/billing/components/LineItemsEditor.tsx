import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

import { computeTotals } from '../lib/totals'
import { formatCurrency } from '@/shared/lib/format'

type Props = {
  currency: string
}

/**
 * Line items editor. Reads form context — must be rendered inside a
 * react-hook-form `<FormProvider>` (shadcn `<Form>` provides one)
 * with fields `lineItems` (array) and `discountRate` (number).
 */
export function LineItemsEditor({ currency }: Props) {
  const form = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  })

  const watchedLines = (useWatch({ control: form.control, name: 'lineItems' }) ??
    []) as Array<{
    description: string
    quantity: number
    unitPrice: number
    taxRate: number
  }>
  const watchedDiscount =
    ((useWatch({ control: form.control, name: 'discountRate' }) as number | undefined) ??
      0)

  const totals = computeTotals(watchedLines, watchedDiscount)

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead className="w-[14%] text-right">Qty</TableHead>
              <TableHead className="w-[18%] text-right">Unit price</TableHead>
              <TableHead className="w-[14%] text-right">Tax %</TableHead>
              <TableHead className="w-[14%] text-right">Line total</TableHead>
              <TableHead className="w-12" aria-label="Actions" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, idx) => {
              const li =
                watchedLines[idx] ?? { quantity: 0, unitPrice: 0, taxRate: 0 }
              const lineTotal = (li.quantity ?? 0) * (li.unitPrice ?? 0)
              const lineWithTax = lineTotal * (1 + (li.taxRate ?? 0) / 100)
              return (
                <TableRow key={field.id}>
                  <TableCell>
                    <Input
                      aria-label="Description"
                      {...form.register(`lineItems.${idx}.description`)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      className="text-right"
                      aria-label="Quantity"
                      {...form.register(`lineItems.${idx}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="text-right"
                      aria-label="Unit price"
                      {...form.register(`lineItems.${idx}.unitPrice`, {
                        valueAsNumber: true,
                      })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      className="text-right"
                      aria-label="Tax rate"
                      {...form.register(`lineItems.${idx}.taxRate`, {
                        valueAsNumber: true,
                      })}
                    />
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {formatCurrency(lineWithTax, currency, {
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove line"
                      onClick={() => remove(idx)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ description: '', quantity: 1, unitPrice: 0, taxRate: 0 })
          }
        >
          <Plus /> Add line
        </Button>

        <dl className="grid grid-cols-[auto_auto] items-center gap-x-6 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="text-end font-medium tabular-nums">
            {formatCurrency(totals.subtotal, currency, { maximumFractionDigits: 2 })}
          </dd>
          <dt className="text-muted-foreground">Tax</dt>
          <dd className="text-end font-medium tabular-nums">
            {formatCurrency(totals.taxTotal, currency, { maximumFractionDigits: 2 })}
          </dd>
          {totals.discountAmount > 0 ? (
            <>
              <dt className="text-muted-foreground">Discount</dt>
              <dd className="text-end font-medium tabular-nums">
                −
                {formatCurrency(totals.discountAmount, currency, {
                  maximumFractionDigits: 2,
                })}
              </dd>
            </>
          ) : null}
          <dt className="text-base font-semibold">Total</dt>
          <dd className="text-end text-base font-semibold tabular-nums">
            {formatCurrency(totals.total, currency, { maximumFractionDigits: 2 })}
          </dd>
        </dl>
      </div>
    </div>
  )
}

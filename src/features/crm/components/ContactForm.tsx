import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { X } from 'lucide-react'

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
import { Badge } from '@/shared/ui/badge'

import { useState } from 'react'

import { useTenant } from '@/shared/hooks/useTenant'
import { useActiveBranchStore } from '@/stores/activeBranch.store'
import {
  CustomFieldsRenderer,
  type CustomFieldValueMap,
} from '@/features/customFields'
import { useOwnerLookup, useSourceLookup, useTagLookup } from '../hooks'

import { contactStatusSchema, type ContactInput } from '../api/crm.contracts'

const SENTINEL_NONE = '__none__'

const formSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string(),
  email: z
    .string()
    .email('Enter a valid email address.')
    .or(z.literal(''))
    .optional(),
  phone: z.string(),
  company: z.string(),
  jobTitle: z.string(),
  addressLine1: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postalCode: z.string(),
  status: contactStatusSchema,
  sourceId: z.string().optional(),
  ownerUserId: z.string().optional(),
  vertical: z.string(),
  birthday: z.string(),
  tagIds: z.array(z.string()),
  notes: z.string(),
})

type FormValues = z.infer<typeof formSchema>

type Props = {
  defaultValues?: Partial<ContactInput>
  onSubmit: (values: ContactInput) => void
  onCancel?: () => void
  submitLabel?: string
  isSubmitting?: boolean
}

export function ContactForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save contact',
  isSubmitting,
}: Props) {
  const { tenant } = useTenant()
  const branchId = useActiveBranchStore((s) => s.branchId) ?? defaultValues?.branchId ?? 'br-main'

  const tagsQ = useTagLookup(tenant.id)
  const sourcesQ = useSourceLookup(tenant.id)
  const ownersQ = useOwnerLookup(tenant.id)

  const tags = tagsQ.data ?? []
  const sources = sourcesQ.data ?? []
  const owners = ownersQ.data ?? []

  const [customValues, setCustomValues] = useState<CustomFieldValueMap>(
    (defaultValues?.customFieldValues as CustomFieldValueMap | undefined) ?? {},
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? '',
      lastName: defaultValues?.lastName ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      company: defaultValues?.company ?? '',
      jobTitle: defaultValues?.jobTitle ?? '',
      addressLine1: defaultValues?.address?.line1 ?? '',
      city: defaultValues?.address?.city ?? '',
      state: defaultValues?.address?.state ?? '',
      country: defaultValues?.address?.country ?? '',
      postalCode: defaultValues?.address?.postalCode ?? '',
      status: defaultValues?.status ?? 'active',
      sourceId: defaultValues?.sourceId ?? undefined,
      ownerUserId: defaultValues?.ownerUserId ?? undefined,
      vertical: defaultValues?.vertical ?? '',
      birthday: defaultValues?.birthday ?? '',
      tagIds: defaultValues?.tagIds ?? [],
      notes: defaultValues?.notes ?? '',
    },
  })

  const selectedTagIds = form.watch('tagIds')
  const setTagIds = (next: string[]) =>
    form.setValue('tagIds', next, { shouldDirty: true })

  const toggleTag = (id: string) => {
    if (selectedTagIds.includes(id)) {
      setTagIds(selectedTagIds.filter((t) => t !== id))
    } else {
      setTagIds([...selectedTagIds, id])
    }
  }

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      branchId,
      firstName: values.firstName,
      lastName: values.lastName || undefined,
      email: values.email && values.email.length > 0 ? values.email : undefined,
      phone: values.phone || undefined,
      company: values.company || undefined,
      jobTitle: values.jobTitle || undefined,
      address:
        values.addressLine1 ||
        values.city ||
        values.state ||
        values.country ||
        values.postalCode
          ? {
              line1: values.addressLine1 || null,
              city: values.city || null,
              state: values.state || null,
              country: values.country || null,
              postalCode: values.postalCode || null,
            }
          : undefined,
      sourceId: values.sourceId || undefined,
      ownerUserId: values.ownerUserId || undefined,
      vertical: values.vertical || undefined,
      birthday: values.birthday || undefined,
      status: values.status,
      tagIds: values.tagIds,
      notes: values.notes || undefined,
      customFieldValues: customValues,
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
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    {...field}
                  />
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
                  <Input
                    type="tel"
                    autoComplete="tel"
                    placeholder="+1 415 555 0182"
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
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job title</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="organization-title"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="addressLine1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input
                  autoComplete="address-line1"
                  placeholder="Street address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input autoComplete="address-level2" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input autoComplete="address-level1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal code</FormLabel>
                <FormControl>
                  <Input autoComplete="postal-code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input autoComplete="country-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sourceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select
                  value={field.value ?? SENTINEL_NONE}
                  onValueChange={(v) =>
                    field.onChange(v === SENTINEL_NONE ? undefined : v)
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="No source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={SENTINEL_NONE}>No source</SelectItem>
                    {sources.map((s) => (
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
                  value={field.value ?? SENTINEL_NONE}
                  onValueChange={(v) =>
                    field.onChange(v === SENTINEL_NONE ? undefined : v)
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={SENTINEL_NONE}>Unassigned</SelectItem>
                    {owners.map((o) => (
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="vertical"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vertical classifier</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Patient / Student / Client …"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthday"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birthday</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Tags</FormLabel>
          <div className="flex flex-wrap gap-1.5">
            {tags.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No tags yet — add some in Settings → Tags (Phase F).
              </p>
            ) : (
              tags.map((t) => {
                const active = selectedTagIds.includes(t.id)
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => toggleTag(t.id)}
                    className="inline-flex"
                  >
                    <Badge
                      variant={active ? 'default' : 'outline'}
                      className="gap-1"
                    >
                      {t.name}
                      {active ? <X className="size-3" /> : null}
                    </Badge>
                  </button>
                )
              })
            )}
          </div>
        </div>

        <CustomFieldsRenderer
          entity="contact"
          value={customValues}
          onChange={setCustomValues}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Add internal notes…" {...field} />
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

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'

import { Button } from '@/shared/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Card, CardContent } from '@/shared/ui/card'

import { CALIBERS, SIZES } from '@/config/features'
import { useTenant } from '@/shared/hooks/useTenant'
import { useSessionStore } from '@/stores/session.store'
import type { TenantCaliber, TenantSize, VerticalType } from '@/types/tenant'

const VERTICAL_OPTIONS: { value: VerticalType; label: string }[] = [
  { value: 'dental', label: 'Dental' },
  { value: 'school', label: 'School' },
  { value: 'medical', label: 'Medical' },
  { value: 'law', label: 'Law' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'gym', label: 'Gym' },
  { value: 'salon', label: 'Salon' },
  { value: 'retail', label: 'Retail' },
]

import { useOrganization, useSaveOrganization } from '../hooks'
import {
  organizationProfileInputSchema,
  type OrganizationProfileInput,
} from '../api/settings.contracts'
import { SectionPanel } from '../components/SectionPanel'

export function OrganizationSettingsPage() {
  const { tenant } = useTenant()
  const setTenant = useSessionStore((s) => s.setTenant)
  const query = useOrganization(tenant.id)
  const save = useSaveOrganization(tenant.id)

  const form = useForm<OrganizationProfileInput>({
    resolver: zodResolver(organizationProfileInputSchema),
    defaultValues: {
      name: '',
      slug: '',
      locale: '',
      timezone: '',
      currency: '',
    },
  })

  useEffect(() => {
    if (!query.data) return
    form.reset({
      name: query.data.name,
      slug: query.data.slug,
      locale: query.data.locale,
      timezone: query.data.timezone,
      currency: query.data.currency,
    })
  }, [query.data, form])

  if (query.isLoading || !query.data) {
    return (
      <SectionPanel title="Organization">
        <Skeleton className="h-32 w-full" />
      </SectionPanel>
    )
  }

  return (
    <SectionPanel
      title="Organization"
      description="Public-facing name, slug, and tenant defaults."
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => save.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Dental" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="acme-dental" {...field} />
                  </FormControl>
                  <FormDescription>
                    Used in URLs. Lowercase, numbers, dashes only.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="locale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Locale</FormLabel>
                  <FormControl>
                    <Input placeholder="en-US" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <FormControl>
                    <Input placeholder="America/Los_Angeles" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input placeholder="USD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Plan: <span className="font-medium capitalize">{query.data.plan}</span> ·
              Vertical: <span className="font-medium capitalize">{query.data.vertical}</span>
            </p>
            <Button type="submit" disabled={save.isPending || !form.formState.isDirty}>
              {save.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Form>

      <Card className="mt-4 border-dashed bg-muted/30">
        <CardContent className="space-y-3 p-5">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Operational profile</p>
            <p className="text-xs text-muted-foreground">
              These two switches reshape navigation, dashboard widgets, and default
              density across every screen. Caliber drives surface complexity; size
              drives empty-state copy and onboarding nudges. They flip the demo
              tenant locally — production reads this from your provisioning data.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Vertical
              </p>
              <Select
                value={tenant.vertical}
                onValueChange={(v) =>
                  setTenant({ ...tenant, vertical: v as VerticalType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VERTICAL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Reshapes sidebar workspace + dashboard layout instantly.
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Caliber
              </p>
              <Select
                value={tenant.caliber}
                onValueChange={(v) =>
                  setTenant({ ...tenant, caliber: v as TenantCaliber })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.values(CALIBERS) ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {CALIBERS[tenant.caliber].description}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Size
              </p>
              <Select
                value={tenant.size}
                onValueChange={(v) =>
                  setTenant({ ...tenant, size: v as TenantSize })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.values(SIZES) ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} · {s.approxHeadcount}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Approx headcount: {SIZES[tenant.size].approxHeadcount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </SectionPanel>
  )
}

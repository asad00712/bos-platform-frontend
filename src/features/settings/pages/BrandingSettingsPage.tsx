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
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'

import { useTenant } from '@/shared/hooks/useTenant'

import { useBranding, useSaveBranding } from '../hooks'
import {
  brandingInputSchema,
  type BrandingInput,
} from '../api/settings.contracts'
import { SectionPanel } from '../components/SectionPanel'

const PRESETS: { label: string; value: string }[] = [
  { label: 'BOS indigo', value: '0.585 0.233 277' },
  { label: 'Dental cyan', value: '0.65 0.13 220' },
  { label: 'Medical teal', value: '0.6 0.13 180' },
  { label: 'School violet', value: '0.55 0.18 295' },
  { label: 'Legal slate', value: '0.45 0.06 250' },
  { label: 'Restaurant amber', value: '0.7 0.18 50' },
  { label: 'Gym crimson', value: '0.62 0.22 25' },
  { label: 'Salon magenta', value: '0.7 0.2 0' },
  { label: 'Retail emerald', value: '0.62 0.14 155' },
]

export function BrandingSettingsPage() {
  const { tenant } = useTenant()
  const query = useBranding(tenant.id)
  const save = useSaveBranding(tenant.id)

  const form = useForm<BrandingInput>({
    resolver: zodResolver(brandingInputSchema),
    defaultValues: {
      appName: '',
      primaryColor: '',
      logoUrl: '',
      faviconUrl: '',
      fontFamily: '',
    },
  })

  useEffect(() => {
    if (!query.data) return
    form.reset({
      appName: query.data.appName ?? '',
      primaryColor: query.data.primaryColor ?? '',
      logoUrl: query.data.logoUrl ?? '',
      faviconUrl: query.data.faviconUrl ?? '',
      fontFamily: query.data.fontFamily ?? '',
    })
  }, [query.data, form])

  // Live preview: when the user types/picks a primary color, push it
  // straight into useTenantTheme by saving optimistically — but only on
  // the user's tenant, not server. A small mutate here is fine since the
  // mock layer is in-memory; once a real backend exists, switch to a
  // local preview state and only persist on submit.
  const handlePresetClick = (value: string) => {
    form.setValue('primaryColor', value, { shouldDirty: true })
    save.mutate({ ...form.getValues(), primaryColor: value })
  }

  if (query.isLoading || !query.data) {
    return (
      <SectionPanel title="Branding">
        <Skeleton className="h-32 w-full" />
      </SectionPanel>
    )
  }

  return (
    <div className="space-y-4">
      <SectionPanel
        title="Brand identity"
        description="Replace the BOS name, accent color, logo, and font for this tenant. Changes apply to every screen."
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => save.mutate(values))}
            className="space-y-5"
            noValidate
          >
            <FormField
              control={form.control}
              name="appName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App name</FormLabel>
                  <FormControl>
                    <Input placeholder="BOS" {...field} />
                  </FormControl>
                  <FormDescription>
                    Shown in the topbar, login screen, and email templates.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary color (oklch)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0.585 0.233 277"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Three-value oklch tuple (lightness chroma hue). Pick a preset
                    below or paste your brand value.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Presets
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePresetClick(p.value)}
                    className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs hover:bg-accent"
                  >
                    <span
                      className="size-3 rounded-full"
                      style={{ background: `oklch(${p.value})` }}
                    />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://…/logo.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="faviconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favicon URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://…/favicon.ico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fontFamily"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Font family (CSS value)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="'Inter', system-ui, sans-serif"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Loaded by the tenant; the value goes straight into
                    --font-sans.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={save.isPending || !form.formState.isDirty}
              >
                {save.isPending ? 'Saving…' : 'Save branding'}
              </Button>
            </div>
          </form>
        </Form>
      </SectionPanel>

      <SectionPanel
        title="Preview"
        description="Live preview using the saved branding."
      >
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground font-semibold">
                {form.getValues('appName')?.[0] ?? 'B'}
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {form.getValues('appName') || 'BOS'}
                </p>
                <p className="text-xs text-muted-foreground">
                  This card uses --primary live.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button>Primary action</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Badge>New</Badge>
              <Badge variant="secondary">Secondary</Badge>
            </div>
          </CardContent>
        </Card>
      </SectionPanel>
    </div>
  )
}

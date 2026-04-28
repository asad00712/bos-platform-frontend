import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import {
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  ChevronLeft,
  Dumbbell,
  GraduationCap,
  Lock,
  Mail,
  Scale,
  Sparkles,
  Stethoscope,
  Smile,
  ShoppingBag,
  User,
  Utensils,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { authApi } from '@/api/auth.api'
import { routes } from '@/routes/routeMap'
import type { VerticalType } from '@/types/tenant'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'

import { AuthLayout, AuthFeatureItem } from '../components/AuthLayout'
import { GoogleIcon, MicrosoftIcon } from '../components/SsoIcons'

/* ==================== schema ==================== */

const signupSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.').max(60),
  lastName: z.string().trim().max(60).optional(),
  email: z.string().email('Enter a valid work email.').max(255),
  password: z
    .string()
    .min(10, 'Use at least 10 characters.')
    .max(128)
    .regex(/[a-z]/, 'Add at least one lowercase letter.')
    .regex(/[A-Z]/, 'Add at least one uppercase letter.')
    .regex(/[0-9]/, 'Add at least one number.'),
  orgName: z.string().trim().min(2, 'Organization name is required.').max(120),
  orgSlug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/,
      'Use lowercase letters, numbers, and hyphens.',
    ),
  vertical: z.enum([
    'medical',
    'dental',
    'law',
    'restaurant',
    'school',
    'gym',
    'salon',
    'retail',
  ]),
})

type SignupForm = z.infer<typeof signupSchema>
type SignupStep = 1 | 2 | 3

const VERTICALS: { value: VerticalType; label: string; icon: LucideIcon }[] = [
  { value: 'dental', label: 'Dental', icon: Smile },
  { value: 'school', label: 'School', icon: GraduationCap },
  { value: 'medical', label: 'Medical', icon: Stethoscope },
  { value: 'law', label: 'Law', icon: Scale },
  { value: 'restaurant', label: 'Restaurant', icon: Utensils },
  { value: 'gym', label: 'Gym', icon: Dumbbell },
  { value: 'salon', label: 'Salon', icon: Sparkles },
  { value: 'retail', label: 'Retail', icon: ShoppingBag },
]

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

/* ==================== page ==================== */

export function SignupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<SignupStep>(1)
  const [stepMessage, setStepMessage] = useState<string | null>(null)

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      orgName: '',
      orgSlug: '',
      vertical: 'medical',
    },
  })

  const selectedVertical = useWatch({ control: form.control, name: 'vertical' })
  const review = useWatch({ control: form.control })

  const signup = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (result, values) => {
      if (result.devVerificationUrl) {
        const url = new URL(result.devVerificationUrl)
        navigate(
          `${url.pathname}${url.search}&email=${encodeURIComponent(values.email)}`,
        )
        return
      }
      navigate(`/verify-email?email=${encodeURIComponent(values.email)}`)
    },
  })

  const continueToOrg = async () => {
    setStepMessage(null)
    const ok = await form.trigger(['firstName', 'email', 'password'], {
      shouldFocus: true,
    })
    if (ok) setStep(2)
  }

  const continueToVertical = async () => {
    setStepMessage(null)
    const ok = await form.trigger(['orgName', 'orgSlug'], { shouldFocus: true })
    if (ok) setStep(3)
    else setStepMessage('Please complete the organization details.')
  }

  const submit = async () => {
    setStepMessage(null)
    const ok = await form.trigger(undefined, { shouldFocus: true })
    if (!ok) {
      setStepMessage('Please complete the highlighted fields.')
      const errors = form.formState.errors
      if (errors.firstName || errors.email || errors.password) setStep(1)
      else if (errors.orgName || errors.orgSlug) setStep(2)
      return
    }
    const values = form.getValues()
    signup.mutate({
      email: values.email.trim().toLowerCase(),
      password: values.password,
      firstName: values.firstName.trim(),
      lastName: values.lastName?.trim() || undefined,
      orgName: values.orgName.trim(),
      orgSlug: values.orgSlug.trim().toLowerCase(),
      vertical: values.vertical,
      locale: 'en-US',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  }

  const goBack = () => {
    setStepMessage(null)
    if (step === 1) {
      navigate(routes.login())
      return
    }
    setStep((step - 1) as SignupStep)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) void continueToOrg()
    else if (step === 2) void continueToVertical()
    else void submit()
  }

  return (
    <AuthLayout
      eyebrow={`Step ${step} of 3`}
      headline={
        step === 1 ? (
          <>
            Set up your
            <br />
            org in{' '}
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              minutes
            </span>
          </>
        ) : step === 2 ? (
          <>
            Tell us about
            <br />
            your{' '}
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              business
            </span>
          </>
        ) : (
          <>
            Choose your
            <br />
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              vertical
            </span>
          </>
        )
      }
      description={
        step === 1
          ? 'Create the owner account — the fields the BOS auth service needs.'
          : step === 2
            ? 'Set the tenant name and URL-safe slug before picking your industry.'
            : 'Your vertical drives terminology, modules, and provisioning defaults.'
      }
      features={
        <>
          <AuthFeatureItem icon={<Check className="size-3.5" />}>
            <strong>Free 14-day trial</strong> — no card required
          </AuthFeatureItem>
          <AuthFeatureItem icon={<ArrowRight className="size-3.5" />}>
            <strong>Backend aligned</strong> — exact auth-service payload
          </AuthFeatureItem>
          <AuthFeatureItem icon={<Building2 className="size-3.5" />}>
            <strong>Email verification</strong> — owner activates before login
          </AuthFeatureItem>
        </>
      }
      stats={
        step === 1
          ? [
              { value: '3', label: 'Steps' },
              { value: '14d', label: 'Free trial' },
              { value: '0', label: 'Card needed' },
            ]
          : undefined
      }
    >
      <Card className="border-border/60 shadow-xl shadow-black/5">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="-ms-2 gap-1 text-muted-foreground"
            >
              <ChevronLeft className="size-4" />
              {step === 1 ? 'Back to login' : 'Back'}
            </Button>
          </div>

          <Stepper step={step} />

          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {step === 1 ? (
                <>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      Create your account
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Already have one?{' '}
                      <Link
                        to={routes.login()}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" disabled className="h-10 gap-2">
                      <GoogleIcon className="size-4" />
                      Google
                    </Button>
                    <Button variant="outline" disabled className="h-10 gap-2">
                      <MicrosoftIcon className="size-4" />
                      Microsoft
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Separator className="flex-1" />
                    <span>or with email</span>
                    <Separator className="flex-1" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <InputGroup>
                              <InputGroupAddon align="inline-start">
                                <User className="size-4" />
                              </InputGroupAddon>
                              <InputGroupInput
                                autoComplete="given-name"
                                placeholder="Ahmed"
                                {...field}
                              />
                            </InputGroup>
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
                            <InputGroup>
                              <InputGroupAddon align="inline-start">
                                <User className="size-4" />
                              </InputGroupAddon>
                              <InputGroupInput
                                autoComplete="family-name"
                                placeholder="Khan"
                                {...field}
                              />
                            </InputGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work email</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupAddon align="inline-start">
                              <Mail className="size-4" />
                            </InputGroupAddon>
                            <InputGroupInput
                              type="email"
                              autoComplete="email"
                              placeholder="ahmed@company.com"
                              {...field}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupAddon align="inline-start">
                              <Lock className="size-4" />
                            </InputGroupAddon>
                            <InputGroupInput
                              type="password"
                              autoComplete="new-password"
                              placeholder="S3curePass123"
                              {...field}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                        <p className="text-[11px] text-muted-foreground">
                          10+ characters · upper + lower case · at least one number.
                        </p>
                      </FormItem>
                    )}
                  />
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      Set up your organization
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      These map directly to backend tenant creation.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="orgName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization name</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupAddon align="inline-start">
                              <Building2 className="size-4" />
                            </InputGroupAddon>
                            <InputGroupInput
                              placeholder="Al-Noor Clinic"
                              value={field.value}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                              onChange={(e) => {
                                field.onChange(e.target.value)
                                if (!form.formState.dirtyFields.orgSlug) {
                                  form.setValue('orgSlug', slugify(e.target.value), {
                                    shouldDirty: false,
                                    shouldValidate: false,
                                  })
                                }
                              }}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="orgSlug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL slug</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupAddon align="inline-start">
                              <Briefcase className="size-4" />
                            </InputGroupAddon>
                            <InputGroupInput
                              placeholder="al-noor-clinic"
                              value={field.value}
                              onBlur={() => {
                                form.setValue('orgSlug', slugify(field.value ?? ''), {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                                field.onBlur()
                              }}
                              name={field.name}
                              ref={field.ref}
                              onChange={(e) => {
                                form.setValue('orgSlug', slugify(e.target.value), {
                                  shouldDirty: true,
                                  shouldValidate: false,
                                })
                              }}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                        <p className="text-[11px] text-muted-foreground">
                          Lowercase letters, numbers, and hyphens.{' '}
                          <span className="font-mono">{`yourtenant.bos.app`}</span>
                        </p>
                      </FormItem>
                    )}
                  />
                </>
              ) : null}

              {step === 3 ? (
                <>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      Choose your vertical
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Drives terminology and module defaults — change anytime.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="vertical"
                    render={() => (
                      <FormItem>
                        <FormLabel className="sr-only">Industry</FormLabel>
                        <div
                          role="radiogroup"
                          aria-label="Industry"
                          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                        >
                          {VERTICALS.map((v) => {
                            const Icon = v.icon
                            const active = selectedVertical === v.value
                            return (
                              <button
                                type="button"
                                role="radio"
                                aria-checked={active}
                                key={v.value}
                                onClick={() =>
                                  form.setValue('vertical', v.value, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  })
                                }
                                className={cn(
                                  'flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors',
                                  active
                                    ? 'border-primary/60 bg-primary/[0.04] ring-1 ring-inset ring-primary/30'
                                    : 'hover:border-border hover:bg-accent/40',
                                )}
                              >
                                <Icon className="size-5 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {v.label}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-md border bg-muted/40 p-4 text-sm">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Review
                    </p>
                    <dl className="grid grid-cols-3 gap-y-1.5">
                      <ReviewRow k="Owner" v={`${review.firstName ?? ''} ${review.lastName ?? ''}`.trim() || '—'} />
                      <ReviewRow k="Email" v={review.email || '—'} />
                      <ReviewRow k="Organization" v={review.orgName || '—'} />
                      <ReviewRow k="Slug" v={review.orgSlug || '—'} />
                      <ReviewRow
                        k="Vertical"
                        v={
                          VERTICALS.find((vv) => vv.value === review.vertical)
                            ?.label ?? '—'
                        }
                      />
                    </dl>
                  </div>
                </>
              ) : null}

              {stepMessage || signup.error ? (
                <Alert variant="destructive">
                  <AlertTitle>We couldn't continue</AlertTitle>
                  <AlertDescription>
                    {stepMessage ?? signup.error?.message}
                  </AlertDescription>
                </Alert>
              ) : null}

              <Button
                type="submit"
                className="h-11 w-full gap-1.5"
                disabled={signup.isPending}
              >
                {step === 1
                  ? 'Continue to organization'
                  : step === 2
                    ? 'Continue to vertical'
                    : signup.isPending
                      ? 'Creating organization…'
                      : 'Create my organization'}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        By continuing you agree to the{' '}
        <Link to="#" className="underline-offset-4 hover:underline">
          terms
        </Link>{' '}
        and{' '}
        <Link to="#" className="underline-offset-4 hover:underline">
          privacy notice
        </Link>
        .
      </p>
    </AuthLayout>
  )
}

/* ==================== sub-components ==================== */

function Stepper({ step }: { step: SignupStep }) {
  const items: { id: SignupStep; label: string }[] = [
    { id: 1, label: 'Account' },
    { id: 2, label: 'Organization' },
    { id: 3, label: 'Vertical' },
  ]
  return (
    <ol
      className="flex items-center gap-2 text-xs font-medium tabular-nums text-muted-foreground"
      aria-label="Signup progress"
    >
      {items.map((it, i) => {
        const active = it.id === step
        const done = it.id < step
        return (
          <li key={it.id} className="flex items-center gap-2">
            <span
              className={cn(
                'grid size-5 place-items-center rounded-full text-[10px]',
                done && 'bg-primary text-primary-foreground',
                active && 'border-2 border-primary text-primary',
                !done && !active && 'border border-border bg-background',
              )}
              aria-current={active ? 'step' : undefined}
            >
              {done ? <Check className="size-3" /> : it.id}
            </span>
            <span
              className={cn(
                active && 'text-foreground',
                done && 'text-muted-foreground',
              )}
            >
              {it.label}
            </span>
            {i < items.length - 1 ? (
              <span className="h-px w-6 bg-border" aria-hidden />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

function ReviewRow({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="col-span-1 text-xs text-muted-foreground">{k}</dt>
      <dd className="col-span-2 break-words font-medium">{v}</dd>
    </>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { ArrowRight, Lock, Mail } from 'lucide-react'

import { authApi } from '@/api/auth.api'
import { useSessionStore } from '@/stores/session.store'
import { routes } from '@/routes/routeMap'

import { Button } from '@/shared/ui/button'
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
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'

import { AuthLayout, AuthFeatureItem } from '../components/AuthLayout'
import { GoogleIcon, MicrosoftIcon } from '../components/SsoIcons'

const makeSchema = (t: (k: string) => string) =>
  z.object({
    email: z.email(t('validation.email')),
    password: z.string().min(1, t('validation.required')).max(128),
  })

type LoginForm = z.infer<ReturnType<typeof makeSchema>>

function sanitizeNext(value: string | null): string | null {
  if (!value) return null
  if (!value.startsWith('/') || value.startsWith('//')) return null
  return value
}

export function LoginPage() {
  const { t } = useTranslation(['auth', 'common', 'validation'])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nextPath = sanitizeNext(searchParams.get('next'))
  const setAuthenticatedSession = useSessionStore((s) => s.setAuthenticatedSession)

  const form = useForm<LoginForm>({
    resolver: zodResolver(makeSchema(t)),
    defaultValues: { email: '', password: '' },
  })

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (result) => {
      setAuthenticatedSession({
        accessToken: result.accessToken,
        accessTokenExpiresAt: result.accessTokenExpiresAt,
        user: result.user,
      })
      if (result.requires2FA) {
        const search = nextPath ? `?next=${encodeURIComponent(nextPath)}` : ''
        navigate(`${routes.verify2fa()}${search}`)
        return
      }
      navigate(nextPath ?? routes.app.dashboard())
    },
  })

  return (
    <AuthLayout
      eyebrow={t('auth:login.title')}
      headline={
        <>
          One platform.
          <br />
          Every business
          <br />
          <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            vertical.
          </span>
        </>
      }
      description="Run CRM, billing, HR, scheduling, and industry-specific operations from one unified business operating system."
      features={
        <>
          <AuthFeatureItem icon={<Mail className="size-3.5" />}>
            <strong>CRM + Scheduling</strong> — customers, bookings, workflows
          </AuthFeatureItem>
          <AuthFeatureItem icon={<Lock className="size-3.5" />}>
            <strong>Finance & Billing</strong> — invoices, payments, accounting
          </AuthFeatureItem>
          <AuthFeatureItem icon={<ArrowRight className="size-3.5" />}>
            <strong>100+ Verticals</strong> — dental, school, law, restaurant & more
          </AuthFeatureItem>
        </>
      }
      stats={[
        { value: '100+', label: 'Verticals' },
        { value: '500+', label: 'Orgs' },
        { value: '99.5%', label: 'Uptime' },
      ]}
    >
      <Card className="border-border/60 shadow-xl shadow-black/5">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t('auth:login.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                to={routes.signup()}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign up free
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
            <span>{t('auth:login.continueWith')}</span>
            <Separator className="flex-1" />
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => login.mutate(values))}
              className="space-y-4"
              noValidate
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth:login.email')}</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <Mail className="size-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                          type="email"
                          autoComplete="email"
                          placeholder="you@company.com"
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
                    <div className="flex items-center justify-between">
                      <FormLabel>{t('auth:login.password')}</FormLabel>
                      <Link
                        to={routes.forgotPassword()}
                        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {t('auth:login.forgotPassword')}
                      </Link>
                    </div>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <Lock className="size-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                          type="password"
                          autoComplete="current-password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {login.error ? (
                <Alert variant="destructive">
                  <AlertTitle>{t('common:states.error')}</AlertTitle>
                  <AlertDescription>{login.error.message}</AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" className="h-11 w-full" disabled={login.isPending}>
                {login.isPending ? t('auth:login.submitting') : t('auth:login.submit')}
                <ArrowRight />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Protected by enterprise-grade security.{' '}
        <Link to="#" className="underline-offset-4 hover:underline">
          Privacy
        </Link>
        {' · '}
        <Link to="#" className="underline-offset-4 hover:underline">
          Terms
        </Link>
      </p>
    </AuthLayout>
  )
}


import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react'

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
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/shared/ui/input-otp'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'

import { AuthLayout, AuthFeatureItem } from '../components/AuthLayout'

function sanitizeNext(value: string | null): string | null {
  if (!value) return null
  if (!value.startsWith('/') || value.startsWith('//')) return null
  return value
}

export function VerifyTwoFactorPage() {
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nextPath = sanitizeNext(searchParams.get('next'))
  const user = useSessionStore((state) => state.user)
  const accessToken = useSessionStore((state) => state.accessToken)
  const setAuthenticatedSession = useSessionStore((state) => state.setAuthenticatedSession)
  const clearSession = useSessionStore((state) => state.clearSession)

  const schema = z.object({
    code: z
      .string()
      .trim()
      .min(6, 'Enter your 6-digit authenticator code or backup code.')
      .max(8, 'Backup codes are 8 characters.'),
  })
  type TwoFactorForm = z.infer<typeof schema>

  const form = useForm<TwoFactorForm>({
    resolver: zodResolver(schema),
    defaultValues: { code: '' },
  })

  const verify = useMutation({
    mutationFn: authApi.verifyTwoFactorLogin,
    onSuccess: (result) => {
      setAuthenticatedSession({
        accessToken: result.accessToken,
        accessTokenExpiresAt: result.accessTokenExpiresAt,
        user: result.user,
      })
      navigate(nextPath ?? routes.app.dashboard())
    },
  })

  const handleBack = () => {
    clearSession()
    navigate(routes.login())
  }

  return (
    <AuthLayout
      eyebrow="Second factor"
      headline={
        <>
          Confirm your
          <br />
          <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            identity
          </span>
        </>
      }
      description="Enter the authenticator app code, or one of your single-use backup codes."
      features={
        <>
          <AuthFeatureItem icon={<Lock className="size-3.5" />}>
            <strong>Authenticator code</strong> — six digits from your app
          </AuthFeatureItem>
          <AuthFeatureItem icon={<ArrowRight className="size-3.5" />}>
            <strong>Backup code</strong> — eight characters if your device is unavailable
          </AuthFeatureItem>
        </>
      }
    >
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="-ms-2">
          <ArrowLeft />
          Back to login
        </Button>

        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t('auth:verify2fa.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {user?.email
              ? `Code required for ${user.email}`
              : t('auth:verify2fa.subtitle')}
          </p>
        </div>

        {!accessToken ? (
          <Alert variant="destructive">
            <AlertTitle>{t('common:states.error')}</AlertTitle>
            <AlertDescription>
              Your two-factor challenge expired. Please sign in again.
            </AlertDescription>
          </Alert>
        ) : null}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(({ code }) => verify.mutate({ code }))}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('auth:verify2fa.code')}</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      autoFocus
                      disabled={!accessToken}
                      {...field}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {verify.error ? (
              <Alert variant="destructive">
                <AlertTitle>{t('common:states.error')}</AlertTitle>
                <AlertDescription>{verify.error.message}</AlertDescription>
              </Alert>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              disabled={verify.isPending || !accessToken}
            >
              {verify.isPending ? t('auth:verify2fa.submitting') : t('auth:verify2fa.submit')}
              <ArrowRight />
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Wrong account?{' '}
              <Link
                to={routes.login()}
                onClick={clearSession}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in again
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </AuthLayout>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { ArrowLeft, Mail } from 'lucide-react'

import { authApi } from '@/api/auth.api'
import { routes } from '@/routes/routeMap'

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'

import { AuthLayout, AuthFeatureItem } from '../components/AuthLayout'

export function ForgotPasswordPage() {
  const { t } = useTranslation(['auth', 'common', 'validation'])
  const navigate = useNavigate()

  const schema = z.object({ email: z.email(t('validation.email')) })
  type ForgotForm = z.infer<typeof schema>

  const form = useForm<ForgotForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const forgot = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (_, values) =>
      navigate(`${routes.forgotPasswordSent()}?email=${encodeURIComponent(values.email)}`),
  })

  return (
    <AuthLayout
      eyebrow="Account Recovery"
      headline={
        <>
          Reset your
          <br />
          <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            password
          </span>
        </>
      }
      description="Enter your email and we'll send you a secure link to set a new password."
      features={
        <>
          <AuthFeatureItem icon={<Mail className="size-3.5" />}>
            <strong>Secure reset link</strong> — one-time token
          </AuthFeatureItem>
        </>
      }
    >
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ms-2">
          <Link to={routes.login()}>
            <ArrowLeft />
            {t('common:actions.back')}
          </Link>
        </Button>

        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t('auth:forgotPassword.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('auth:forgotPassword.subtitle')}
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => forgot.mutate(values))}
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
                  <FormDescription>
                    We&apos;ll send a secure link to this email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {forgot.error ? (
              <Alert variant="destructive">
                <AlertTitle>{t('common:states.error')}</AlertTitle>
                <AlertDescription>{forgot.error.message}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" className="w-full" disabled={forgot.isPending}>
              <Mail />
              {forgot.isPending ? t('auth:forgotPassword.submitting') : t('auth:forgotPassword.submit')}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Remember it?{' '}
              <Link
                to={routes.login()}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Back to sign in
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </AuthLayout>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react'

import { authApi } from '@/api/auth.api'
import { routes } from '@/routes/routeMap'

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
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'

import { AuthLayout, AuthFeatureItem } from '../components/AuthLayout'

export function VerifyEmailPage() {
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const email = params.get('email') ?? 'you@company.com'
  const token = params.get('token') ?? ''

  const schema = z.object({
    token: z
      .string()
      .trim()
      .length(64, 'Paste the 64-character verification token from your email.'),
  })
  type VerifyForm = z.infer<typeof schema>

  const form = useForm<VerifyForm>({
    resolver: zodResolver(schema),
    defaultValues: { token },
  })

  const verify = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => navigate(routes.login()),
  })

  const resend = useMutation({ mutationFn: authApi.resendVerifyEmail })

  return (
    <AuthLayout
      eyebrow="Almost there"
      headline={
        <>
          Verify your
          <br />
          <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            email
          </span>{' '}
          to continue
        </>
      }
      description="Open the verification link from your email, or paste the 64-character token to activate the owner account."
      features={
        <>
          <AuthFeatureItem icon={<Mail className="size-3.5" />}>
            <strong>Check your email</strong> — code sent to {email}
          </AuthFeatureItem>
          <AuthFeatureItem icon={<ArrowRight className="size-3.5" />}>
            <strong>Backend aligned</strong> — accepts the auth-service token
          </AuthFeatureItem>
        </>
      }
    >
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ms-2">
          <Link to={routes.signup()}>
            <ArrowLeft />
            {t('common:actions.back')}
          </Link>
        </Button>

        <Card>
          <CardContent className="space-y-4 p-6 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Mail className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Check your inbox</h2>
              <p className="text-sm text-muted-foreground">
                We sent a verification token to{' '}
                <span className="font-medium">{email}</span>.
              </p>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => verify.mutate(values))}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification token</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <Mail className="size-4" />
                      </InputGroupAddon>
                      <InputGroupInput placeholder="Paste token from email" {...field} />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(verify.error || resend.error) && (
              <Alert variant="destructive">
                <AlertTitle>{t('common:states.error')}</AlertTitle>
                <AlertDescription>
                  {verify.error?.message ?? resend.error?.message}
                </AlertDescription>
              </Alert>
            )}

            {resend.isSuccess ? (
              <Alert>
                <AlertDescription>Verification email requested.</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" className="w-full" disabled={verify.isPending}>
              {verify.isPending ? t('auth:verify2fa.submitting') : 'Verify & enter BOS'}
              <ArrowRight />
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive it?{' '}
              <Button
                variant="link"
                size="sm"
                className="px-0"
                disabled={!email || email === 'you@company.com'}
                onClick={() => resend.mutate({ email })}
                type="button"
              >
                Resend code
              </Button>{' '}
              ·{' '}
              <Link
                to={routes.login()}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Change email
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </AuthLayout>
  )
}

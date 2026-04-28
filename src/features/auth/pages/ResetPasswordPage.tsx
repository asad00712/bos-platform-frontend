import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Check, Lock } from 'lucide-react'

import { authApi } from '@/api/auth.api'
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

import { AuthLayout, AuthFeatureItem } from '../components/AuthLayout'

export function ResetPasswordPage() {
  const { t } = useTranslation(['auth', 'common', 'validation'])
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const schema = z
    .object({
      token: z.string().length(64, 'Paste the 64-character reset token from your email.'),
      newPassword: z.string().min(10, 'Use at least 10 characters.').max(128),
      confirmPassword: z.string().min(10, t('validation.required')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('validation.passwordsMismatch'),
      path: ['confirmPassword'],
    })

  type ResetForm = z.infer<typeof schema>

  const form = useForm<ResetForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      token: params.get('token') ?? '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const reset = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => navigate(routes.resetPasswordDone()),
  })

  return (
    <AuthLayout
      eyebrow="New password"
      headline={
        <>
          Set a strong
          <br />
          new{' '}
          <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            password
          </span>
        </>
      }
      description="Choose something unique with at least 10 characters. Mix uppercase, numbers, and symbols for best security."
      features={
        <>
          <AuthFeatureItem icon={<Lock className="size-3.5" />}>
            <strong>10+ characters</strong> — backend policy minimum
          </AuthFeatureItem>
          <AuthFeatureItem icon={<Check className="size-3.5" />}>
            <strong>Mix characters</strong> — upper, lower, numbers, symbols
          </AuthFeatureItem>
        </>
      }
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t('auth:resetPassword.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            Make it strong — you won&apos;t need to reset again for a while.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(({ token, newPassword }) =>
              reset.mutate({ token, newPassword }),
            )}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reset token</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <Lock className="size-4" />
                      </InputGroupAddon>
                      <InputGroupInput placeholder="64-character token" {...field} />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth:resetPassword.newPassword')}</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <Lock className="size-4" />
                      </InputGroupAddon>
                      <InputGroupInput
                        type="password"
                        autoComplete="new-password"
                        placeholder="New password"
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth:resetPassword.confirmPassword')}</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <Lock className="size-4" />
                      </InputGroupAddon>
                      <InputGroupInput
                        type="password"
                        autoComplete="new-password"
                        placeholder="Repeat password"
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {reset.error ? (
              <Alert variant="destructive">
                <AlertTitle>{t('common:states.error')}</AlertTitle>
                <AlertDescription>{reset.error.message}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" className="w-full" disabled={reset.isPending}>
              <Lock />
              {reset.isPending ? t('auth:resetPassword.submitting') : t('auth:resetPassword.submit')}
            </Button>
          </form>
        </Form>
      </div>
    </AuthLayout>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'
import { authApi } from '../../../api/auth.api'
import { AuthBrandPanel, AuthFeature } from '../components/AuthBrandPanel'
import { CheckIcon, LockIcon } from '../components/AuthIcons'
import { FormError, TextField } from '../components/AuthFields'

const resetSchema = z.object({
  token: z.string().length(64, 'Paste the 64-character reset token from your email.'),
  newPassword: z.string().min(10, 'Use at least 10 characters.').max(128),
  confirmPassword: z.string().min(10, 'Confirm your password.'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords must match.',
  path: ['confirmPassword'],
})

type ResetForm = z.infer<typeof resetSchema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const form = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      token: params.get('token') ?? '',
      newPassword: '',
      confirmPassword: '',
    },
  })
  const reset = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => navigate('/reset-password/done'),
  })

  return (
    <div className="screen active">
      <div className="split">
        <AuthBrandPanel
          eyebrow="New Password"
          headline={<>Set a strong<br />new <span>password</span></>}
          description="Choose something unique with at least 10 characters. Mix uppercase, numbers, and symbols for best security."
          features={
            <>
              <AuthFeature icon={<LockIcon />}><strong>10+ characters</strong> — backend policy minimum</AuthFeature>
              <AuthFeature icon={<CheckIcon />}><strong>Mix characters</strong> — upper, lower, numbers, symbols</AuthFeature>
            </>
          }
        />
        <div className="right-panel">
          <form className="form-card" style={{ maxWidth: 400 }} onSubmit={form.handleSubmit(({ token, newPassword }) => reset.mutate({ token, newPassword }))}>
            <div className="form-top">
              <div className="form-title">Create new password</div>
              <div className="form-sub">Make it strong — you won&apos;t need to reset again for a while</div>
            </div>
            <TextField label="Reset token" required icon={<LockIcon />} placeholder="64-character token" error={form.formState.errors.token?.message} {...form.register('token')} />
            <TextField label="New password" required icon={<LockIcon />} type="password" placeholder="New password" error={form.formState.errors.newPassword?.message} {...form.register('newPassword')} />
            <TextField label="Confirm new password" required icon={<LockIcon />} type="password" placeholder="Repeat password" error={form.formState.errors.confirmPassword?.message} {...form.register('confirmPassword')} />
            <FormError message={reset.error?.message} />
            <button className="submit-btn" disabled={reset.isPending} type="submit">
              <LockIcon />
              {reset.isPending ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { authApi } from '../../../api/auth.api'
import { AuthBrandPanel, AuthFeature } from '../components/AuthBrandPanel'
import { BackIcon, LockIcon, MailIcon } from '../components/AuthIcons'
import { FormError, TextField } from '../components/AuthFields'

const forgotSchema = z.object({
  email: z.email('Enter a valid email address.'),
})

type ForgotForm = z.infer<typeof forgotSchema>

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const form = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })
  const forgot = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (_, values) => navigate(`/forgot-password/sent?email=${encodeURIComponent(values.email)}`),
  })

  return (
    <div className="screen active">
      <div className="split">
        <AuthBrandPanel
          eyebrow="Account Recovery"
          headline={<>Reset your<br /><span>password</span></>}
          description="Enter your email and we'll send you a secure link to set a new password."
          features={
            <>
              <AuthFeature icon={<LockIcon />}><strong>Secure reset link</strong> — one-time token</AuthFeature>
              <AuthFeature icon={<MailIcon />}><strong>Check spam</strong> — if not in inbox within 2 minutes</AuthFeature>
            </>
          }
        />
        <div className="right-panel">
          <form className="form-card" style={{ maxWidth: 400 }} onSubmit={form.handleSubmit((values) => forgot.mutate(values))}>
            <Link className="back-link" to="/login"><BackIcon />Back to login</Link>
            <div className="form-top">
              <div className="form-title">Forgot password?</div>
              <div className="form-sub">No worries — enter your email and we&apos;ll send a reset link</div>
            </div>
            <TextField label="Email address" required icon={<MailIcon />} type="email" placeholder="you@company.com" error={form.formState.errors.email?.message} {...form.register('email')} />
            <div className="field-hint">We&apos;ll send a secure link to this email</div>
            <FormError message={forgot.error?.message} />
            <button className="submit-btn" disabled={forgot.isPending} type="submit">
              <MailIcon />
              {forgot.isPending ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="bottom-link">Remember it? <Link to="/login">Back to sign in</Link></div>
          </form>
        </div>
      </div>
    </div>
  )
}

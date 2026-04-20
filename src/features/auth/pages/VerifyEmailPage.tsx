import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'
import { authApi } from '../../../api/auth.api'
import { AuthBrandPanel, AuthFeature } from '../components/AuthBrandPanel'
import { ArrowIcon, BackIcon, MailIcon } from '../components/AuthIcons'
import { FormError, TextField } from '../components/AuthFields'

const verifySchema = z.object({
  token: z.string().trim().length(64, 'Paste the 64-character verification token from your email.'),
})

type VerifyForm = z.infer<typeof verifySchema>

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const email = params.get('email') ?? 'you@company.com'
  const token = params.get('token') ?? ''
  const form = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
    defaultValues: { token },
  })
  const verify = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => navigate('/login'),
  })
  const resend = useMutation({
    mutationFn: authApi.resendVerifyEmail,
  })

  return (
    <div className="screen active">
      <div className="split">
        <AuthBrandPanel
          eyebrow="Almost there"
          headline={<>Verify your<br /><span>email</span> to continue</>}
          description="Open the verification link from your email, or paste the 64-character token to activate the owner account."
          features={
            <>
              <AuthFeature icon={<MailIcon />}><strong>Check your email</strong> — code sent to {email}</AuthFeature>
              <AuthFeature icon={<ArrowIcon />}><strong>Backend aligned</strong> — accepts the verification token issued by auth-service</AuthFeature>
            </>
          }
        />
        <div className="right-panel">
          <form className="form-card" style={{ maxWidth: 400 }} onSubmit={form.handleSubmit((values) => verify.mutate(values))}>
            <Link className="back-link" to="/signup"><BackIcon />Back</Link>
            <div className="success-card">
              <div className="success-icon" style={{ background: 'var(--accent-light)' }}><MailIcon /></div>
              <div className="success-title">Check your inbox</div>
              <div className="success-text">We sent a verification token to<br /><span className="success-email">{email}</span></div>
            </div>
            <TextField label="Verification token" required icon={<MailIcon />} placeholder="Paste token from email" error={form.formState.errors.token?.message} {...form.register('token')} />
            <FormError message={verify.error?.message || resend.error?.message} />
            {resend.isSuccess && <div className="field-hint">Verification email requested.</div>}
            <button className="submit-btn" disabled={verify.isPending} type="submit">
              <ArrowIcon />
              {verify.isPending ? 'Verifying...' : 'Verify & Enter BOS'}
            </button>
            <div className="bottom-link" style={{ marginTop: 16 }}>
              Didn&apos;t receive it?{' '}
              <button className="forgot-link" type="button" disabled={!email || email === 'you@company.com'} onClick={() => resend.mutate({ email })}>
                Resend code
              </button>{' '}
              · <Link to="/login">Change email</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

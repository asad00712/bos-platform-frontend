import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { authApi } from '../../../api/auth.api'
import { useSessionStore } from '../../../stores/session.store'
import { AuthBrandPanel, AuthFeature } from '../components/AuthBrandPanel'
import { ArrowIcon, GoogleIcon, LockIcon, MailIcon } from '../components/AuthIcons'
import { FormError, TextField } from '../components/AuthFields'

const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.').max(128),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const setAuthenticatedSession = useSessionStore((state) => state.setAuthenticatedSession)
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
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
      navigate(result.requires2FA ? '/verify-2fa' : '/app/dashboard')
    },
  })

  return (
    <div className="screen active">
      <div className="split">
        <AuthBrandPanel
          eyebrow="Welcome to BOS"
          headline={<>One platform.<br />Every business<br /><span>vertical.</span></>}
          description="Run CRM, billing, HR, scheduling, and industry-specific operations from one unified business operating system."
          features={
            <>
              <AuthFeature icon={<MailIcon />}><strong>CRM + Scheduling</strong> — customers, bookings, workflows</AuthFeature>
              <AuthFeature icon={<LockIcon />}><strong>Finance & Billing</strong> — invoices, payments, accounting</AuthFeature>
              <AuthFeature icon={<ArrowIcon />}><strong>100+ Verticals</strong> — medical, law, restaurant, gym & more</AuthFeature>
            </>
          }
          stats={[
            { value: '100+', label: 'Verticals' },
            { value: '500+', label: 'Orgs' },
            { value: '99.5%', label: 'Uptime' },
          ]}
        />

        <div className="right-panel">
          <form className="form-card" onSubmit={form.handleSubmit((values) => login.mutate(values))}>
            <div className="form-top">
              <div className="form-title">Welcome back</div>
              <div className="form-sub">Don&apos;t have an account? <Link to="/signup">Sign up free</Link></div>
            </div>

            <div className="social-row">
              <button className="social-btn" type="button"><GoogleIcon />Google</button>
              <button className="social-btn" type="button">Microsoft</button>
            </div>

            <div className="divider"><div className="divider-line" /><div className="divider-text">or continue with email</div><div className="divider-line" /></div>

            <TextField label="Email address" required icon={<MailIcon />} type="email" placeholder="you@company.com" error={form.formState.errors.email?.message} {...form.register('email')} />

            <div className="forgot-row">
              <label style={{ marginBottom: 0 }}>Password <span>*</span></label>
              <Link className="forgot-link" to="/forgot-password">Forgot password?</Link>
            </div>
            <div style={{ marginTop: 6 }}>
              <TextField label="" icon={<LockIcon />} type="password" placeholder="Enter your password" error={form.formState.errors.password?.message} {...form.register('password')} />
            </div>

            <FormError message={login.error?.message} />

            <button className="submit-btn" disabled={login.isPending} type="submit">
              <ArrowIcon />
              {login.isPending ? 'Signing in...' : 'Sign In to BOS'}
            </button>

            <div className="bottom-link">
              New to BOS? <Link to="/signup">Create your account →</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

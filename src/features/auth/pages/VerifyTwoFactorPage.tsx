import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { authApi } from '../../../api/auth.api'
import { useSessionStore } from '../../../stores/session.store'
import { AuthBrandPanel, AuthFeature } from '../components/AuthBrandPanel'
import { ArrowIcon, BackIcon, LockIcon } from '../components/AuthIcons'
import { FormError, TextField } from '../components/AuthFields'

const twoFactorSchema = z.object({
  code: z.string()
    .trim()
    .min(6, 'Enter your 6-digit authenticator code or backup code.')
    .max(8, 'Backup codes are 8 characters.'),
})

type TwoFactorForm = z.infer<typeof twoFactorSchema>

export function VerifyTwoFactorPage() {
  const navigate = useNavigate()
  const user = useSessionStore((state) => state.user)
  const accessToken = useSessionStore((state) => state.accessToken)
  const setAuthenticatedSession = useSessionStore((state) => state.setAuthenticatedSession)
  const clearSession = useSessionStore((state) => state.clearSession)

  const form = useForm<TwoFactorForm>({
    resolver: zodResolver(twoFactorSchema),
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
      navigate('/app/dashboard')
    },
  })

  return (
    <div className="screen active">
      <div className="split">
        <AuthBrandPanel
          eyebrow="Second factor"
          headline={<>Confirm your<br /><span>identity</span></>}
          description="Enter the authenticator app code, or one of your single-use backup codes."
          features={
            <>
              <AuthFeature icon={<LockIcon />}><strong>Authenticator code</strong> — six digits from your app</AuthFeature>
              <AuthFeature icon={<ArrowIcon />}><strong>Backup code</strong> — eight characters if your device is unavailable</AuthFeature>
            </>
          }
        />

        <div className="right-panel">
          <form
            className="form-card"
            style={{ maxWidth: 400 }}
            onSubmit={form.handleSubmit(({ code }) => verify.mutate({ code }))}
          >
            <button
              className="back-link"
              type="button"
              onClick={() => {
                clearSession()
                navigate('/login')
              }}
            >
              <BackIcon />
              Back to login
            </button>

            <div className="form-top">
              <div className="form-title">Two-factor verification</div>
              <div className="form-sub">
                {user?.email ? `Code required for ${user.email}` : 'Complete the second step to continue.'}
              </div>
            </div>

            {!accessToken && (
              <FormError message="Your two-factor challenge expired. Please sign in again." />
            )}

            <TextField
              label="Authenticator or backup code"
              required
              icon={<LockIcon />}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              error={form.formState.errors.code?.message}
              {...form.register('code')}
            />

            <FormError message={verify.error?.message} />

            <button className="submit-btn" disabled={verify.isPending || !accessToken} type="submit">
              <ArrowIcon />
              {verify.isPending ? 'Verifying...' : 'Verify & Enter BOS'}
            </button>

            <div className="bottom-link">
              Wrong account? <Link to="/login" onClick={clearSession}>Sign in again</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

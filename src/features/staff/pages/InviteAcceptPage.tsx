import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ArrowRight, ShieldCheck, UserPlus } from 'lucide-react'

import { AuthLayout, AuthFeatureItem } from '@/features/auth/components/AuthLayout'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { routes } from '@/routes/routeMap'

import { useAcceptInvite, useInviteDescribe } from '../hooks'

export function InviteAcceptPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? params.get('t') ?? null
  const navigate = useNavigate()

  const describe = useInviteDescribe(token)
  const accept = useAcceptInvite()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!token) {
      setError('Missing invite token in the URL.')
      return
    }
    if (password.length < 10) {
      setError('Password must be at least 10 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    try {
      await accept.mutateAsync({
        token,
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        password,
      })
      navigate(routes.login())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <AuthLayout
      eyebrow="Team invite"
      headline={
        <>
          Join your team on <span className="text-primary">BOS</span>.
        </>
      }
      description="Set up your account in one step."
      features={
        <>
          <AuthFeatureItem icon={<UserPlus className="size-4" />}>
            <span className="block font-medium text-white">Invite from your manager</span>
            <span className="text-white/70">They picked your role and branch ahead of time.</span>
          </AuthFeatureItem>
          <AuthFeatureItem icon={<ShieldCheck className="size-4" />}>
            <span className="block font-medium text-white">Secure by default</span>
            <span className="text-white/70">Your password never reaches the BE in plaintext.</span>
          </AuthFeatureItem>
        </>
      }
    >
      <Card data-surface="hero">
        <CardContent className="space-y-5 p-6">
          {!token ? (
            <Alert variant="destructive">
              <AlertTitle>No invite token</AlertTitle>
              <AlertDescription>
                Open the invite link from your email, or ask your manager
                to resend it.
              </AlertDescription>
            </Alert>
          ) : describe.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : !describe.data ? (
            <Alert variant="destructive">
              <AlertTitle>Invite not found</AlertTitle>
              <AlertDescription>
                This invite has expired or been revoked. Ask your manager
                to send a new one.
              </AlertDescription>
            </Alert>
          ) : describe.data.acceptedAt ? (
            <Alert>
              <AlertTitle>Already accepted</AlertTitle>
              <AlertDescription>
                You can sign in directly.{' '}
                <Link to={routes.login()} className="text-primary underline">
                  Go to sign-in
                </Link>
                .
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Inviting</p>
                <p className="text-base font-semibold">
                  {describe.data.email}
                </p>
              </div>

              <form onSubmit={submit} className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">First name</Label>
                    <Input
                      autoComplete="given-name"
                      autoFocus
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Last name</Label>
                    <Input
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Password</Label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={10}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    At least 10 characters.
                  </p>
                </div>
                <div>
                  <Label className="text-xs">Confirm password</Label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={10}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {error ? (
                  <Alert variant="destructive">
                    <AlertTitle>Could not accept</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={accept.isPending}
                >
                  {accept.isPending ? 'Setting up…' : (
                    <>
                      Accept invite <ArrowRight />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link to={routes.login()} className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

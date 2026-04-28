import { Link, useSearchParams } from 'react-router'
import { ArrowRight, Mail } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { routes } from '@/routes/routeMap'

import { AuthLayout } from '../components/AuthLayout'

export function ForgotPasswordSentPage() {
  const [params] = useSearchParams()
  const email = params.get('email') ?? 'you@company.com'

  return (
    <AuthLayout
      eyebrow="Email sent"
      headline={
        <>
          Check your
          <br />
          <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            inbox
          </span>
        </>
      }
      description="A reset link has been sent. Click it to set a new password securely."
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4 p-6 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Mail className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Reset link sent</h2>
              <p className="text-sm text-muted-foreground">
                We sent a link to <span className="font-medium">{email}</span>.
                Click it to reset your password.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button asChild className="w-full">
          <Link to={routes.resetPassword()}>
            I got the email — set new password
            <ArrowRight />
          </Link>
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t get it?{' '}
          <Link
            to={routes.forgotPassword()}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Try again
          </Link>{' '}
          ·{' '}
          <Link
            to={routes.login()}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to login
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

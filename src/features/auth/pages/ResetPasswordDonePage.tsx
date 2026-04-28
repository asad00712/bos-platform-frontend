import { Link } from 'react-router'
import { ArrowRight, Check } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { routes } from '@/routes/routeMap'

import { AuthLayout } from '../components/AuthLayout'

export function ResetPasswordDonePage() {
  return (
    <AuthLayout
      eyebrow="All done"
      headline={
        <>
          You&apos;re back
          <br />
          in{' '}
          <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            business
          </span>
        </>
      }
      description="Your password has been updated. You can now sign in with your new credentials."
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4 p-6 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Check className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Password updated</h2>
              <p className="text-sm text-muted-foreground">
                Your new password is set. Sign in to get back to your BOS dashboard.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button asChild className="w-full">
          <Link to={routes.login()}>
            Go to sign in
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </AuthLayout>
  )
}

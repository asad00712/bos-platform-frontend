import { Link } from 'react-router'
import { ArrowRight, Check, Sparkles, X } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import { cn } from '@/shared/lib/utils'

import { useOnboarding } from '@/stores/onboarding.store'

/**
 * Progressive-disclosure onboarding card. Shown on the dashboard until
 * the user dismisses it OR completes every step. Uses a left-rail
 * progress indicator + tickable rows.
 *
 * UX rules:
 *   • Never auto-dismiss when the last step completes — celebrate it.
 *   • Always offer "Hide for now" so power users can skip.
 *   • Steps deep-link to the actual flow that completes them; clicking
 *     marks the step complete (optimistic; refine when each flow can
 *     emit its own completion event).
 */
export function OnboardingCard() {
  const steps = useOnboarding((s) => s.steps)
  const completed = useOnboarding((s) => s.completed)
  const dismissed = useOnboarding((s) => s.dismissed)
  const complete = useOnboarding((s) => s.complete)
  const dismissAll = useOnboarding((s) => s.dismissAll)
  const progress = useOnboarding((s) => s.progress())

  if (dismissed) return null
  const allDone = completed.length === steps.length

  return (
    <Card
      data-surface="hero"
      className="relative overflow-hidden border-primary/30"
    >
      <CardContent className="relative space-y-4 p-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-primary">
              <Sparkles className="size-3" />
              Get set up
            </p>
            <h2 className="text-lg font-semibold tracking-tight">
              {allDone
                ? 'Your tenant is ready to ship'
                : `Welcome — ${completed.length} of ${steps.length} done`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {allDone
                ? 'Every onboarding step is complete. You can hide this card now.'
                : 'A short list to graduate your workspace from demo mode.'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissAll}
              className="gap-1 text-xs text-muted-foreground"
            >
              <X className="size-3" />
              Hide
            </Button>
          </div>
        </header>

        <div className="space-y-1.5">
          <Progress value={progress * 100} className="h-1.5" />
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {Math.round(progress * 100)}% complete
          </p>
        </div>

        <ul className="grid gap-2 md:grid-cols-2">
          {steps.map((step) => {
            const done = completed.includes(step.id)
            return (
              <li key={step.id}>
                <Link
                  to={step.to}
                  onClick={() => complete(step.id)}
                  className={cn(
                    'group flex items-start gap-3 rounded-lg border p-3 transition-colors',
                    done
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'hover:border-border hover:bg-accent/40',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ring-1 ring-inset',
                      done
                        ? 'border-emerald-500/40 bg-emerald-500 text-white ring-transparent'
                        : 'border-border bg-background ring-border/40',
                    )}
                  >
                    {done ? <Check className="size-3" /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm font-medium leading-tight',
                        done && 'text-muted-foreground line-through',
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {step.description}{' '}
                      <span className="text-muted-foreground/60">
                        · ~{step.estimateMinutes} min
                      </span>
                    </p>
                  </div>
                  {!done ? (
                    <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

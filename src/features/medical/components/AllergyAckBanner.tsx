import { useState, type ReactNode } from 'react'
import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'

import type { Allergy } from '../api/medical.contracts'

type Props = {
  allergies: Allergy[]
  /** Tenant has explicitly affirmed NKA — distinct from "no record". */
  noKnownAllergies: boolean
  /** When true, the parent flow (e.g. Rx pad) is gated until ack. */
  required?: boolean
  /** Called when the clinician acknowledges the banner. */
  onAck?: () => void
  className?: string
  /** Render an optional right-side action (e.g. "Add allergy"). */
  rightAction?: ReactNode
}

/**
 * Allergy alerts banner. Three modes:
 *   - High criticality recorded → red banner, ack required when `required`.
 *   - Low/intolerance only → amber banner.
 *   - No known allergies (NKA) → muted confirmation; no ack needed.
 *   - No record at all → amber prompt to confirm with patient.
 *
 * Per medical-rule #11: allergies must be impossible to "miss" — they
 * always appear above the fold on the chart and are required-ack at any
 * order entry / Rx surface (`required` prop).
 */
export function AllergyAckBanner({
  allergies,
  noKnownAllergies,
  required,
  onAck,
  className,
  rightAction,
}: Props) {
  const [acked, setAcked] = useState(!required)

  const high = allergies.filter((a) => a.criticality === 'high')
  const lowOrIntol = allergies.filter((a) => a.criticality !== 'high')

  if (allergies.length === 0 && noKnownAllergies) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-4 py-3 text-sm',
          className,
        )}
      >
        <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span className="font-medium">No known allergies</span>
        <span className="text-xs text-muted-foreground">Confirm with patient on every visit.</span>
        <span className="ms-auto">{rightAction}</span>
      </div>
    )
  }

  if (allergies.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border border-amber-500/50 bg-amber-500/5 px-4 py-3 text-sm',
          className,
        )}
        role="status"
      >
        <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span className="font-medium">Allergy record incomplete</span>
        <span className="text-xs text-muted-foreground">
          No allergies on file. Ask the patient and update the chart.
        </span>
        <span className="ms-auto">{rightAction}</span>
      </div>
    )
  }

  const variant = high.length > 0 ? 'high' : 'medium'

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'space-y-2 rounded-lg border-2 px-4 py-3',
        variant === 'high'
          ? 'border-rose-500/70 bg-rose-500/10'
          : 'border-amber-500/60 bg-amber-500/10',
        className,
      )}
    >
      <div className="flex flex-wrap items-start gap-3">
        <ShieldAlert
          className={cn(
            'mt-0.5 size-5 shrink-0',
            variant === 'high'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-amber-600 dark:text-amber-400',
          )}
          aria-hidden
        />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold">
            {variant === 'high' ? 'High-risk allergies on file' : 'Allergies on file'}
            <span className="ms-2 text-xs font-normal text-muted-foreground">
              {high.length + lowOrIntol.length} recorded · review before ordering or prescribing
            </span>
          </p>
          <ul className="space-y-1.5 text-sm">
            {high.map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline gap-2">
                <Badge variant="destructive" className="font-semibold">
                  HIGH
                </Badge>
                <span className="font-medium">{a.substance.display}</span>
                {a.reactionText ? (
                  <span className="text-muted-foreground">— {a.reactionText}</span>
                ) : null}
              </li>
            ))}
            {lowOrIntol.map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline gap-2">
                <Badge variant="outline">
                  {a.criticality === 'unable_to_assess' ? '?' : 'LOW'}
                </Badge>
                <span className="font-medium">{a.substance.display}</span>
                {a.reactionText ? (
                  <span className="text-muted-foreground">— {a.reactionText}</span>
                ) : null}
                {a.type === 'intolerance' ? (
                  <span className="text-xs text-muted-foreground">(intolerance)</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
        {rightAction}
      </div>
      {required && !acked ? (
        <div className="flex justify-end gap-2 border-t border-current/10 pt-2">
          <Button
            size="sm"
            variant={variant === 'high' ? 'destructive' : 'default'}
            onClick={() => {
              setAcked(true)
              onAck?.()
            }}
          >
            I acknowledge
          </Button>
        </div>
      ) : null}
    </div>
  )
}

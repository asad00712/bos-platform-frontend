import { useState, type ReactNode } from 'react'
import { Lock, ShieldCheck } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Title rendered at the top of the dialog. */
  title: string
  /** Short description under the title. */
  description: string
  /** Read-only review block. Clinician sees this before authenticating. */
  preview: ReactNode
  /** Required signature PIN (mocked auth). */
  expectedPin?: string
  /** True when the resource being signed is controlled (CII–CV) — adds extra-strong copy. */
  controlled?: boolean
  /** Resolves true on a successful sign. */
  onConfirm: () => void | Promise<void>
}

/**
 * Two-step sign ceremony reused by SOAP note sign + Rx sign + lab result
 * sign. Step 1 is "review what you're signing"; step 2 is the
 * authentication challenge. Per medical-rule §10 once signed, the
 * resource is immutable; the caller must present an addendum path.
 */
export function SignCeremonyDialog({
  open,
  onOpenChange,
  title,
  description,
  preview,
  expectedPin,
  controlled,
  onConfirm,
}: Props) {
  const [step, setStep] = useState<'review' | 'auth'>('review')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function reset() {
    setStep('review')
    setPin('')
    setError(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) reset()
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {step === 'review' ? (
          <>
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">{preview}</div>
            <Alert>
              <Lock className="size-4" />
              <AlertTitle>This signature is permanent</AlertTitle>
              <AlertDescription>
                Once signed, this record becomes immutable. Use an addendum for any change.
              </AlertDescription>
            </Alert>
            {controlled ? (
              <Alert variant="destructive">
                <ShieldCheck className="size-4" />
                <AlertTitle>Controlled substance</AlertTitle>
                <AlertDescription>
                  Re-authentication is required and the signature is reported to the prescription drug monitoring program.
                </AlertDescription>
              </Alert>
            ) : null}
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => setStep('auth')}>Continue</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="pin">Signature PIN</Label>
              <Input
                id="pin"
                inputMode="numeric"
                autoComplete="off"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value)
                  setError(null)
                }}
                placeholder="Enter your PIN"
                aria-invalid={Boolean(error)}
                className="tabular-nums"
              />
              {error ? <p className="text-xs text-destructive">{error}</p> : null}
              <p className="text-xs text-muted-foreground">
                Demo PIN matches the practitioner's `signaturePin` (e.g. `0001`).
              </p>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setStep('review')}>
                Back
              </Button>
              <Button
                disabled={busy}
                onClick={async () => {
                  if (expectedPin && pin !== expectedPin) {
                    setError('Incorrect PIN.')
                    return
                  }
                  setBusy(true)
                  try {
                    await onConfirm()
                    onOpenChange(false)
                    reset()
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                {busy ? 'Signing…' : 'Confirm and sign'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

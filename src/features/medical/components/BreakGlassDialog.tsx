import { useState, type ReactNode } from 'react'
import { ShieldAlert } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'

type Props = {
  trigger: ReactNode
  /** Callback fired with the typed reason once confirmed. */
  onConfirm: (reason: string) => void | Promise<void>
}

/**
 * Break-glass emergency-access dialog. Per medical-rule §14:
 *   - Reason free-text is mandatory.
 *   - Action is logged as `break_glass_open` in the audit feed (caller).
 *   - Time-limited window (caller responsibility) — UI only collects intent here.
 *
 * The component is intentionally heavy-handed: large red banner + double
 * confirm. We never want a clinician to trip into break-glass by accident.
 */
export function BreakGlassDialog({ trigger, onConfirm }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Emergency chart access</DialogTitle>
          <DialogDescription>
            Empanelment scoping will be overridden for a 60-minute window.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <ShieldAlert className="size-4" />
          <AlertTitle>This action is audited</AlertTitle>
          <AlertDescription>
            Your name, the patient, and the reason you provide will be permanently recorded
            in the chart access log and reviewed by the privacy officer.
          </AlertDescription>
        </Alert>

        <div className="space-y-1.5">
          <Label htmlFor="bg-reason">Reason for emergency access</Label>
          <Textarea
            id="bg-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="e.g. ED on-call coverage; consulted for unstable patient."
            required
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={reason.trim().length < 10 || busy}
            onClick={async () => {
              setBusy(true)
              try {
                await onConfirm(reason.trim())
                setOpen(false)
                setReason('')
              } finally {
                setBusy(false)
              }
            }}
          >
            {busy ? 'Recording…' : 'Confirm emergency access'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

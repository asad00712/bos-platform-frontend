import { useNavigate } from 'react-router'
import { ArrowRightLeft } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'

import { useTenant } from '@/shared/hooks/useTenant'
import { routes } from '@/routes/routeMap'
import type { Lead } from '@/types/crm'

import { useConvertLead } from '../hooks'

type Props = {
  lead: Lead
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConvertLeadDialog({ lead, open, onOpenChange }: Props) {
  const { tenant } = useTenant()
  const navigate = useNavigate()
  const convert = useConvertLead(tenant.id)

  const handleConfirm = async () => {
    const result = await convert.mutateAsync(lead.id)
    onOpenChange(false)
    navigate(routes.app.crm.contact(result.contactId))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="inline-flex items-center gap-2">
            <ArrowRightLeft className="size-4 text-primary" /> Convert to contact
          </DialogTitle>
          <DialogDescription>
            Promote {lead.firstName} {lead.lastName ?? ''} to a CRM contact.
            The lead is marked as Won and the new contact carries the
            originLeadId reference.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border bg-muted/40 p-3 text-sm">
          <p className="font-medium">
            {lead.firstName} {lead.lastName ?? ''}
          </p>
          <p className="text-xs text-muted-foreground">
            {lead.email ?? lead.phone ?? lead.company ?? '—'}
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={convert.isPending}>
            {convert.isPending ? 'Converting…' : 'Convert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useEffect, useState } from 'react'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { useTenant } from '@/shared/hooks/useTenant'
import { useActiveBranchStore } from '@/stores/activeBranch.store'
import { useBranches } from '@/features/branches'
import { useRoles } from '@/features/roles'

import { useInviteStaff } from '../hooks'

type Props = {
  trigger: React.ReactNode
}

export function InviteStaffDialog({ trigger }: Props) {
  const { tenant } = useTenant()
  const branchId = useActiveBranchStore((s) => s.branchId) ?? 'br-main'

  const branchesQ = useBranches()
  const rolesQ = useRoles()
  const invite = useInviteStaff(tenant.id)

  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState<string | undefined>()
  const [targetBranch, setTargetBranch] = useState<string>(branchId)

  /* Default to a non-Owner role on open. */
  useEffect(() => {
    if (open && rolesQ.data && !roleId) {
      const fallback =
        rolesQ.data.find((r) => r.name === 'Staff') ??
        rolesQ.data.find((r) => !r.isSystem) ??
        rolesQ.data[0]
      if (fallback) setRoleId(fallback.id)
    }
    if (open) setTargetBranch(branchId)
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [open, rolesQ.data])

  const reset = () => {
    setEmail('')
    setRoleId(undefined)
  }

  const submit = async () => {
    if (!roleId || !email.trim()) return
    await invite.mutateAsync({ email: email.trim(), roleId, branchId: targetBranch })
    setOpen(false)
    reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>
            Sends an email invite. They set their own password on accept.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Role</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick a role" />
                </SelectTrigger>
                <SelectContent>
                  {(rolesQ.data ?? []).map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Branch</Label>
              <Select value={targetBranch} onValueChange={setTargetBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick a branch" />
                </SelectTrigger>
                <SelectContent>
                  {(branchesQ.data ?? []).map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={invite.isPending || !email.trim() || !roleId}
          >
            {invite.isPending ? 'Sending…' : 'Send invite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

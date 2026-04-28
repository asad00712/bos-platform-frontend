import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/shared/ui/button'
import { SignCeremonyDialog } from '../SignCeremonyDialog'
import { BreakGlassDialog } from '../BreakGlassDialog'

const meta = {
  title: 'Medical/Sign Ceremony',
  parameters: { layout: 'centered' },
} satisfies Meta

export default meta
type Story = StoryObj

export const NoteSign: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Sign note</Button>
        <SignCeremonyDialog
          open={open}
          onOpenChange={setOpen}
          title="Sign progress note"
          description="Confirm the assessment, plan, and orders before signing."
          expectedPin="0001"
          onConfirm={() => console.info('signed')}
          preview={
            <div className="space-y-1 text-sm">
              <p className="font-medium">Khalid Al-Saud · 78y · MRN-100004</p>
              <p>Visit: 99214 — established office visit, 14 Apr 2026</p>
              <p>Primary Dx: I48.91 Atrial fibrillation</p>
              <p>Plan: continue warfarin, recheck CMP in 1 week.</p>
            </div>
          }
        />
      </>
    )
  },
}

export const ControlledRxSign: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Sign controlled Rx
        </Button>
        <SignCeremonyDialog
          open={open}
          onOpenChange={setOpen}
          title="Sign prescription"
          description="Controlled substance — dual authentication required."
          controlled
          expectedPin="0001"
          onConfirm={() => console.info('rx signed')}
          preview={
            <div className="space-y-1 text-sm">
              <p className="font-medium">morphine 15 mg ER</p>
              <p>Sig: 1 tablet PO Q12H PRN severe pain</p>
              <p>Quantity: 14 tablets · Refills: 0</p>
              <p>Schedule II · pharmacy: Walgreens — Mission</p>
            </div>
          }
        />
      </>
    )
  },
}

export const BreakGlass: Story = {
  render: () => (
    <BreakGlassDialog
      trigger={<Button variant="destructive">Open emergency access</Button>}
      onConfirm={(reason) => console.info('break-glass:', reason)}
    />
  ),
}

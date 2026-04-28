import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Tenant-bootstrap onboarding state. The dashboard surfaces a
 * progressive-disclosure card that walks the user through the steps
 * needed to "graduate" their tenant out of demo mode.
 *
 * Each step is a small piece of work the user has to complete; we
 * persist the dismiss decisions so they don't reappear after the user
 * intentionally skipped them.
 */

export type OnboardingStepId =
  | 'brand-tenant'
  | 'invite-team'
  | 'connect-billing'
  | 'configure-locale'
  | 'create-first-record'
  | 'enable-2fa'
  | 'try-command-palette'

export type OnboardingStep = {
  id: OnboardingStepId
  title: string
  description: string
  to: string
  estimateMinutes: number
}

const STEPS: OnboardingStep[] = [
  {
    id: 'brand-tenant',
    title: 'Brand your tenant',
    description: 'Logo, accent color, and email-template tone.',
    to: '/app/settings/branding',
    estimateMinutes: 3,
  },
  {
    id: 'invite-team',
    title: 'Invite your team',
    description: 'Add members and assign roles.',
    to: '/app/settings/members',
    estimateMinutes: 2,
  },
  {
    id: 'connect-billing',
    title: 'Connect billing',
    description: 'Pick a plan and add a payment method.',
    to: '/app/settings/billing',
    estimateMinutes: 4,
  },
  {
    id: 'configure-locale',
    title: 'Set locale + units',
    description: 'Language, calendar, units of measure for clinical surfaces.',
    to: '/app/settings/organization',
    estimateMinutes: 2,
  },
  {
    id: 'create-first-record',
    title: 'Create your first record',
    description: 'Patient, student, contact, or invoice — start with one.',
    to: '/app/crm',
    estimateMinutes: 1,
  },
  {
    id: 'enable-2fa',
    title: 'Turn on 2-factor auth',
    description: 'Recommended for every team member.',
    to: '/app/settings',
    estimateMinutes: 2,
  },
  {
    id: 'try-command-palette',
    title: 'Try the command palette',
    description: 'Press ⌘K to find anything in seconds.',
    to: '#',
    estimateMinutes: 1,
  },
]

type OnboardingStore = {
  completed: OnboardingStepId[]
  dismissed: boolean
  steps: OnboardingStep[]
  /** Mark complete (idempotent). */
  complete: (id: OnboardingStepId) => void
  uncomplete: (id: OnboardingStepId) => void
  dismissAll: () => void
  reset: () => void
  /** Selectors. */
  remainingCount: () => number
  progress: () => number
}

export const useOnboarding = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      completed: [],
      dismissed: false,
      steps: STEPS,
      complete: (id) =>
        set((s) =>
          s.completed.includes(id)
            ? s
            : { ...s, completed: [...s.completed, id] },
        ),
      uncomplete: (id) =>
        set((s) => ({ ...s, completed: s.completed.filter((c) => c !== id) })),
      dismissAll: () => set({ dismissed: true }),
      reset: () => set({ completed: [], dismissed: false }),
      remainingCount: () => STEPS.length - get().completed.length,
      progress: () => get().completed.length / STEPS.length,
    }),
    { name: 'bos.onboarding', version: 1 },
  ),
)

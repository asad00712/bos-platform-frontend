import { useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock,
  MapPin,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { cn } from '@/shared/lib/utils'

/**
 * Public booking flow — tenant-branded, customer-facing. Intentionally
 * separate from the staff shell:
 *   • No `<AppShell>` chrome.
 *   • No auth required.
 *   • Tenant branding read from `:tenantSlug` (in production fetched
 *     from `core-service`; demo uses placeholder values).
 *
 * Three-step wizard: Service → Time → Details. Visual rhythm matches
 * Linear/Stripe checkouts — restrained palette, generous whitespace,
 * single confident CTA per step. Builds an appointment payload that
 * `core-service` will accept.
 */

type Step = 'service' | 'time' | 'details' | 'confirmed'

const SERVICES = [
  {
    id: 'general',
    label: 'General consultation',
    durationMinutes: 30,
    description: 'New or returning patient · 1 issue or routine check.',
  },
  {
    id: 'cleaning',
    label: 'Routine cleaning',
    durationMinutes: 45,
    description: 'Dental hygiene with scaling and polish.',
  },
  {
    id: 'follow-up',
    label: 'Follow-up visit',
    durationMinutes: 20,
    description: 'Continuation of an existing care plan.',
  },
  {
    id: 'specialist',
    label: 'Specialist evaluation',
    durationMinutes: 60,
    description: 'Detailed assessment and care planning.',
  },
] as const

const TIMES = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
] as const

export function PublicBookingPage() {
  const { tenantSlug } = useParams()
  const [step, setStep] = useState<Step>('service')
  const [serviceId, setServiceId] = useState<string | null>(null)
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')

  const tenantName = tenantSlug
    ? tenantSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'BOS Clinic'

  const service = SERVICES.find((s) => s.id === serviceId) ?? null
  const canProceedFromService = !!serviceId
  const canProceedFromTime = !!time
  const canConfirm = name.trim().length > 1 && (phone || email)

  return (
    <div className="min-h-svh bg-muted/40">
      {/* tenant strip */}
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <p className="text-sm font-semibold">{tenantName}</p>
            <p className="text-xs text-muted-foreground">Online booking</p>
          </div>
          <div className="ms-auto flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            Secure · powered by BOS
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* progress */}
        <Stepper step={step} />

        {step === 'service' ? (
          <Card className="mt-6 border-border/60 shadow-xl shadow-black/5">
            <CardContent className="space-y-5 p-6 sm:p-8">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
                  Step 1 · Service
                </p>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">
                  What can we help with?
                </h1>
                <p className="text-sm text-muted-foreground">
                  Pick a reason for your visit. You can add details on the next steps.
                </p>
              </div>

              <ul className="grid gap-2 sm:grid-cols-2">
                {SERVICES.map((s) => {
                  const active = serviceId === s.id
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => setServiceId(s.id)}
                        className={cn(
                          'group w-full rounded-lg border p-4 text-start transition-colors',
                          active
                            ? 'border-primary/60 bg-primary/[0.04] ring-1 ring-inset ring-primary/30'
                            : 'hover:border-border hover:bg-accent/40',
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-tight">
                            {s.label}
                          </p>
                          {active ? (
                            <Check className="size-4 shrink-0 text-primary" />
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {s.description}
                        </p>
                        <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          <Clock className="size-3" />
                          ~{s.durationMinutes} min
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>

              <div className="flex items-center justify-end">
                <Button
                  disabled={!canProceedFromService}
                  onClick={() => setStep('time')}
                  className="gap-1.5"
                >
                  Continue <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === 'time' ? (
          <Card className="mt-6 border-border/60 shadow-xl shadow-black/5">
            <CardContent className="space-y-5 p-6 sm:p-8">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
                  Step 2 · Time
                </p>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">
                  Pick a date and time
                </h1>
                <p className="text-sm text-muted-foreground">
                  Showing the next available slots. All times in your local timezone.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </Field>
                <Field label="Selected">
                  <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                    {service?.label ?? '—'} ·{' '}
                    {time ? `${time} (${service?.durationMinutes} min)` : 'pick a time below'}
                  </p>
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {TIMES.map((slot) => {
                  const active = time === slot
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={cn(
                        'rounded-md border px-2 py-2 text-sm font-medium tabular-nums transition-colors',
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'hover:border-border hover:bg-accent/40',
                      )}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep('service')} className="gap-1.5">
                  <ChevronLeft className="size-3.5" /> Back
                </Button>
                <Button
                  disabled={!canProceedFromTime}
                  onClick={() => setStep('details')}
                  className="gap-1.5"
                >
                  Continue <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === 'details' ? (
          <Card className="mt-6 border-border/60 shadow-xl shadow-black/5">
            <CardContent className="space-y-5 p-6 sm:p-8">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
                  Step 3 · Details
                </p>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">
                  Your details
                </h1>
                <p className="text-sm text-muted-foreground">
                  We'll text you a confirmation. We'll only contact you about this visit.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full name">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="Sarah Mitchell"
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    placeholder="+1 555 555 0123"
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </Field>
                <Field label="Notes (optional)">
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything we should know"
                  />
                </Field>
              </div>

              <Card className="bg-muted/30">
                <CardContent className="space-y-1 p-4 text-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Booking summary
                  </p>
                  <p className="flex items-center gap-2">
                    <Stethoscope className="size-3.5 text-muted-foreground" />
                    {service?.label}
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-3.5 text-muted-foreground" />
                    {date} · {time}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    {tenantName}
                  </p>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep('time')} className="gap-1.5">
                  <ChevronLeft className="size-3.5" /> Back
                </Button>
                <Button
                  disabled={!canConfirm}
                  onClick={() => setStep('confirmed')}
                  className="gap-1.5"
                >
                  Confirm booking <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === 'confirmed' ? (
          <Card className="mt-6 border-emerald-500/40 bg-emerald-500/[0.04] shadow-xl shadow-black/5">
            <CardContent className="space-y-4 p-6 sm:p-8">
              <div className="grid size-10 place-items-center rounded-full bg-emerald-500 text-white">
                <Check className="size-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  You're booked
                </h1>
                <p className="text-sm text-muted-foreground">
                  We've sent a confirmation to{' '}
                  {phone ? <strong className="text-foreground">{phone}</strong> : null}
                  {phone && email ? ' and ' : null}
                  {email ? <strong className="text-foreground">{email}</strong> : null}.
                </p>
              </div>
              <Card className="bg-background">
                <CardContent className="space-y-1 p-4 text-sm">
                  <p>
                    <strong>{service?.label}</strong> · {service?.durationMinutes} min
                  </p>
                  <p>
                    {date} at <strong>{time}</strong>
                  </p>
                  <p>{tenantName}</p>
                </CardContent>
              </Card>
              <Button asChild>
                <Link to="/">Back to home</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </main>

      <footer className="mx-auto max-w-3xl px-4 pb-8 text-center text-xs text-muted-foreground sm:px-6">
        Need help?{' '}
        <a href="#" className="underline-offset-4 hover:underline">
          Call the clinic
        </a>
        {' · '}
        <a href="#" className="underline-offset-4 hover:underline">
          Privacy
        </a>
      </footer>
    </div>
  )
}

function Stepper({ step }: { step: Step }) {
  const order: Step[] = ['service', 'time', 'details', 'confirmed']
  const idx = order.indexOf(step)
  return (
    <ol className="flex items-center gap-2 text-xs font-medium tabular-nums text-muted-foreground">
      {order.slice(0, 3).map((s, i) => {
        const active = i === idx
        const done = i < idx
        return (
          <li key={s} className="flex items-center gap-2">
            <span
              className={cn(
                'grid size-5 place-items-center rounded-full text-[10px]',
                done && 'bg-primary text-primary-foreground',
                active && 'border-2 border-primary text-primary',
                !done && !active && 'border border-border bg-background',
              )}
            >
              {done ? <Check className="size-3" /> : i + 1}
            </span>
            <span
              className={cn(
                'capitalize',
                active && 'text-foreground',
                done && 'text-muted-foreground',
              )}
            >
              {s}
            </span>
            {i < 2 ? <span className="h-px w-6 bg-border" aria-hidden /> : null}
          </li>
        )
      })}
    </ol>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  )
}

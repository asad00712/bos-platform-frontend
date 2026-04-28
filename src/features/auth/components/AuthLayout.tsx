import type { PropsWithChildren, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { useTenant } from '@/shared/hooks/useTenant'

type Props = PropsWithChildren<{
  /** Small kicker label above the headline. */
  eyebrow?: string
  /** Hero headline. Pass JSX so callers can style key words. */
  headline: ReactNode
  /** One-line supporting copy. */
  description?: string
  /** Optional bullet list rendered with `<AuthFeatureItem>` items. */
  features?: ReactNode
  /** Three short stat tiles at the foot of the brand panel. */
  stats?: { value: string; label: string }[]
}>

/**
 * Two-column auth shell.
 *
 *   • LEFT (`lg+`):    dark brand canvas with restrained mesh-gradient
 *                      backdrop, brand mark, hero headline, feature
 *                      bullets, and three stat tiles.
 *   • RIGHT (always):  muted page surface with the form card centered.
 *                      A mobile brand strip sticks to the top below `lg`.
 *
 * Visual contract:
 *   • All chrome built on shadcn tokens (`bg-muted`, `border-border`,
 *     etc.) — no hand-rolled CSS bleed.
 *   • Spacing follows an 8-point scale (24/32/40 outer, 16/20 inner).
 *   • Typography uses `tracking-tight` on the hero, `leading-[1.1]` to
 *     stop descenders clipping into the bullets below.
 */
export function AuthLayout({
  eyebrow,
  headline,
  description,
  features,
  stats,
  children,
}: Props) {
  const { t } = useTranslation()
  const { branding } = useTenant()
  const appName = branding?.appName ?? t('appName')
  const tagline = t('tagline')

  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* ---------- LEFT: brand canvas ---------- */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[oklch(0.16_0.05_270)] p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 50% at 0% 0%, oklch(0.65 0.21 277 / 0.45), transparent 60%), radial-gradient(50% 60% at 100% 100%, oklch(0.55 0.2 320 / 0.3), transparent 60%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <header className="relative flex items-center gap-3">
          {branding?.logoUrl ? (
            <img src={branding.logoUrl} alt="" className="size-9 rounded-lg" />
          ) : (
            <div className="grid size-9 place-items-center rounded-lg bg-white/10 ring-1 ring-inset ring-white/15 backdrop-blur">
              <span className="text-sm font-semibold">B</span>
            </div>
          )}
          <div className="leading-tight">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
              {appName}
            </p>
            <p className="text-sm font-medium text-white/90">{tagline}</p>
          </div>
        </header>

        <div className="relative max-w-md space-y-6 pb-2">
          {eyebrow ? (
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-[44px] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
            {headline}
          </h1>
          {description ? (
            <p className="text-base leading-relaxed text-white/70">{description}</p>
          ) : null}
          {features ? (
            <ul className="space-y-3 pt-1 text-sm text-white/80">{features}</ul>
          ) : null}
        </div>

        {stats && stats.length > 0 ? (
          <div className="relative grid grid-cols-3 gap-6 border-t border-white/10 pt-6 text-sm">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-semibold tracking-tight text-white">
                  {s.value}
                </div>
                <div className="mt-1 text-[12px] text-white/55">{s.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative" />
        )}
      </aside>

      {/* ---------- RIGHT: form canvas ---------- */}
      <main className="relative flex items-start justify-center bg-muted/40 p-6 pt-20 sm:p-10 sm:pt-24 lg:items-center lg:pt-10">
        {/* mobile brand strip */}
        <div className="absolute inset-x-0 top-0 flex items-center gap-2.5 border-b bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
          <div className="grid size-7 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            B
          </div>
          <span className="text-sm font-semibold">{appName}</span>
          <span className="size-1 rounded-full bg-muted-foreground/40" />
          <span className="text-xs text-muted-foreground">{tagline}</span>
        </div>

        <div className="w-full max-w-[440px]">{children}</div>
      </main>
    </div>
  )
}

export function AuthFeatureItem({
  icon,
  children,
}: PropsWithChildren<{ icon: ReactNode }>) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-white/10 text-white ring-1 ring-inset ring-white/10">
        {icon}
      </span>
      <span className="leading-relaxed">{children}</span>
    </li>
  )
}

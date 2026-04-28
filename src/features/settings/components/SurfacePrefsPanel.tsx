import { Palette, RotateCcw, Sparkles } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Slider } from '@/shared/ui/slider'
import { Switch } from '@/shared/ui/switch'
import { cn } from '@/shared/lib/utils'

import {
  useThemePrefs,
  type AccentMix,
  type BorderEmphasis,
  type ElevationLevel,
  type GrainLevel,
  type GradientShape,
  type SurfaceDirection,
  type SurfaceIntensity,
  type SurfaceScope,
  type SurfaceShape,
  type SurfaceTone,
} from '@/stores/themePrefs.store'

import { SectionPanel } from './SectionPanel'

/**
 * Full surface-prefs control surface — 13 axes split into four banks
 * (Palette / Strength / Geometry / Structure). Live preview at the top
 * shows a real hero card, a real standard card, and a flat card so the
 * user sees every axis change immediately.
 *
 * Composition follows an 8-pt grid; banks are separated by horizontal
 * dividers; Reset lives at the very top-right of the panel header.
 */

const TONES: { id: SurfaceTone; label: string; swatch: string }[] = [
  { id: 'brand', label: 'Brand', swatch: 'linear-gradient(135deg, oklch(0.585 0.233 277), oklch(0.7 0.21 290))' },
  { id: 'aurora', label: 'Aurora', swatch: 'linear-gradient(135deg, oklch(0.65 0.21 277), oklch(0.7 0.14 200) 50%, oklch(0.7 0.18 330))' },
  { id: 'mono', label: 'Mono', swatch: 'linear-gradient(135deg, oklch(0.4 0 0), oklch(0.7 0 0))' },
  { id: 'warm', label: 'Warm', swatch: 'linear-gradient(135deg, oklch(0.78 0.16 80), oklch(0.7 0.19 22))' },
  { id: 'cool', label: 'Cool', swatch: 'linear-gradient(135deg, oklch(0.7 0.16 240), oklch(0.65 0.21 277))' },
  { id: 'sunset', label: 'Sunset', swatch: 'linear-gradient(135deg, oklch(0.78 0.18 60), oklch(0.65 0.22 14) 50%, oklch(0.65 0.21 300))' },
  { id: 'ocean', label: 'Ocean', swatch: 'linear-gradient(135deg, oklch(0.7 0.13 180), oklch(0.65 0.18 230))' },
  { id: 'forest', label: 'Forest', swatch: 'linear-gradient(135deg, oklch(0.7 0.16 150), oklch(0.55 0.13 175))' },
  { id: 'rose', label: 'Rose', swatch: 'linear-gradient(135deg, oklch(0.74 0.18 350), oklch(0.6 0.21 14))' },
  { id: 'midnight', label: 'Midnight', swatch: 'linear-gradient(135deg, oklch(0.35 0.10 270), oklch(0.25 0.06 250))' },
  { id: 'custom', label: 'Custom', swatch: 'repeating-linear-gradient(45deg, oklch(0.5 0 0 / 0.4) 0 6px, transparent 6px 12px)' },
]

const ACCENT_MIXES: { id: AccentMix; label: string; hint: string }[] = [
  { id: 'pure', label: 'Pure', hint: 'Single accent color.' },
  { id: 'duotone', label: 'Duotone', hint: 'Two-stop blend.' },
  { id: 'tritone', label: 'Tritone', hint: 'Three-stop blend.' },
  { id: 'iridescent', label: 'Iridescent', hint: 'All available stops.' },
]

const INTENSITIES: { id: SurfaceIntensity; label: string }[] = [
  { id: 'off', label: 'Off' },
  { id: 'subtle', label: 'Subtle' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'bold', label: 'Bold' },
  { id: 'extra', label: 'Extra' },
]

const DIRECTIONS: { id: SurfaceDirection; label: string }[] = [
  { id: 'tl', label: 'Top-left' },
  { id: 'tr', label: 'Top-right' },
  { id: 'bl', label: 'Bot-left' },
  { id: 'br', label: 'Bot-right' },
  { id: 'radial', label: 'Radial' },
  { id: 'mesh', label: 'Mesh' },
  { id: 'conic', label: 'Conic' },
]

const GRADIENT_SHAPES: { id: GradientShape; label: string; hint: string }[] = [
  { id: 'linear', label: 'Linear', hint: 'Diagonal sweep.' },
  { id: 'radial', label: 'Radial', hint: 'Single corner glow.' },
  { id: 'mesh', label: 'Mesh', hint: 'Multi-corner blend.' },
  { id: 'conic', label: 'Conic', hint: 'Sweep around center.' },
]

const SURFACE_SHAPES: { id: SurfaceShape; label: string; hint: string }[] = [
  { id: 'sharp', label: 'Sharp', hint: '4 px corners.' },
  { id: 'rounded', label: 'Rounded', hint: '10 px corners.' },
  { id: 'soft', label: 'Soft', hint: '16 px corners.' },
  { id: 'pill', label: 'Pill', hint: '24 px corners.' },
]

const BORDER_EMPHASIS: { id: BorderEmphasis; label: string; hint: string }[] = [
  { id: 'none', label: 'None', hint: 'No border at all.' },
  { id: 'subtle', label: 'Subtle', hint: 'Quiet hairline.' },
  { id: 'standard', label: 'Standard', hint: 'Default border.' },
  { id: 'glow', label: 'Glow', hint: 'Brand-tinted edge.' },
]

const ELEVATIONS: { id: ElevationLevel; label: string; hint: string }[] = [
  { id: 'flat', label: 'Flat', hint: 'No shadow.' },
  { id: 'lifted', label: 'Lifted', hint: 'Soft shadow.' },
  { id: 'floating', label: 'Floating', hint: 'Layered shadow.' },
]

const GRAINS: { id: GrainLevel; label: string; hint: string }[] = [
  { id: 'off', label: 'Off', hint: 'No texture.' },
  { id: 'fine', label: 'Fine', hint: 'Subtle 3% grain.' },
  { id: 'film', label: 'Film', hint: 'Heavier 6% grain.' },
]

const SCOPES: { id: SurfaceScope; label: string; hint: string }[] = [
  { id: 'none', label: 'Nothing', hint: 'Flat surfaces only.' },
  { id: 'heroes', label: 'Heroes', hint: 'Banners + hero cards.' },
  { id: 'all', label: 'Every card', hint: 'Whole site.' },
]

export function SurfacePrefsPanel() {
  const prefs = useThemePrefs()

  return (
    <SectionPanel
      title="Surface"
      description="13 axes of control. Tone, strength, geometry, structure — all live."
      icon={<Palette className="size-4" />}
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={prefs.reset}
          className="gap-1 text-xs text-muted-foreground"
        >
          <RotateCcw className="size-3" />
          Reset surface
        </Button>
      }
    >
      <div className="space-y-6">
        {/* live preview */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Card data-surface="hero" className="overflow-hidden border-primary/20">
            <CardContent className="space-y-2 p-5">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-primary">
                <Sparkles className="size-3" /> Hero
              </p>
              <h3 className="text-base font-semibold tracking-tight">Hero surface</h3>
              <p className="text-xs text-muted-foreground">
                Always carries the boosted gradient.
              </p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="space-y-2 p-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Standard
              </p>
              <h3 className="text-base font-semibold tracking-tight">Standard card</h3>
              <p className="text-xs text-muted-foreground">
                Carries gradient when scope = all.
              </p>
            </CardContent>
          </Card>
          <Card data-surface="flat" className="overflow-hidden">
            <CardContent className="space-y-2 p-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Flat
              </p>
              <h3 className="text-base font-semibold tracking-tight">Flat surface</h3>
              <p className="text-xs text-muted-foreground">
                Permanently opted out — used by tables.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* PALETTE BANK */}
        <Bank title="Palette" hint="The color family the gradient draws from.">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-11">
            {TONES.map((t) => {
              const active = prefs.tone === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => prefs.setTone(t.id)}
                  aria-pressed={active}
                  className={cn(
                    'group flex flex-col items-center gap-1.5 rounded-lg border p-2 text-center transition-colors',
                    active
                      ? 'border-primary/60 bg-primary/[0.04] ring-1 ring-inset ring-primary/30'
                      : 'hover:border-border hover:bg-accent/40',
                  )}
                >
                  <span
                    className="h-7 w-full rounded-md ring-1 ring-inset ring-black/5 dark:ring-white/10"
                    style={{ background: t.swatch }}
                    aria-hidden
                  />
                  <span className="text-[11px] font-medium">{t.label}</span>
                </button>
              )
            })}
          </div>
          {prefs.tone === 'custom' ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium">Custom OKLCH triplet</p>
              <Input
                value={prefs.customAccent}
                onChange={(e) => prefs.setCustomAccent(e.target.value)}
                placeholder="0.585 0.233 277"
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Format <code className="rounded bg-muted px-1">L C H</code> — lightness 0–1,
                chroma 0–0.4, hue 0–360.
              </p>
            </div>
          ) : null}
          <div className="space-y-1.5">
            <SmallLabel label="Accent mix" hint="How many stops the gradient uses." />
            <div className="flex flex-wrap gap-1.5">
              {ACCENT_MIXES.map((m) => (
                <Pill
                  key={m.id}
                  label={m.label}
                  hint={m.hint}
                  active={prefs.accentMix === m.id}
                  onSelect={() => prefs.setAccentMix(m.id)}
                />
              ))}
            </div>
          </div>
        </Bank>

        {/* STRENGTH BANK */}
        <Bank title="Strength" hint="How loud the surface treatment is.">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-1.5">
              <SmallLabel label="Intensity" hint="5 named tiers from off → extra." />
              <div className="flex flex-wrap gap-1.5">
                {INTENSITIES.map((i) => (
                  <Pill
                    key={i.id}
                    label={i.label}
                    active={prefs.intensity === i.id}
                    onSelect={() => prefs.setIntensity(i.id)}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <SmallLabel
                label={`Opacity · ${prefs.opacity}%`}
                hint="Override on top of intensity."
              />
              <Slider
                value={[prefs.opacity]}
                onValueChange={([v]) => prefs.setOpacity(v ?? 100)}
                min={0}
                max={200}
                step={5}
              />
            </div>
            <div className="space-y-1.5">
              <SmallLabel
                label={`Backdrop blur · ${prefs.blur}px`}
                hint="Frosted-glass behind cards."
              />
              <Slider
                value={[prefs.blur]}
                onValueChange={([v]) => prefs.setBlur(v ?? 0)}
                min={0}
                max={20}
                step={1}
              />
            </div>
          </div>
        </Bank>

        {/* GEOMETRY BANK */}
        <Bank title="Geometry" hint="Where the highlight lives, what shape the cards take.">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-1.5">
              <SmallLabel label="Direction" hint="Where the highlight lands." />
              <div className="flex flex-wrap gap-1.5">
                {DIRECTIONS.map((d) => (
                  <Pill
                    key={d.id}
                    label={d.label}
                    active={prefs.direction === d.id}
                    onSelect={() => prefs.setDirection(d.id)}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <SmallLabel label="Gradient shape" hint="Drawing primitive." />
              <div className="flex flex-wrap gap-1.5">
                {GRADIENT_SHAPES.map((g) => (
                  <Pill
                    key={g.id}
                    label={g.label}
                    hint={g.hint}
                    active={prefs.gradientShape === g.id}
                    onSelect={() => prefs.setGradientShape(g.id)}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <SmallLabel label="Card corners" hint="Surface radius family." />
              <div className="flex flex-wrap gap-1.5">
                {SURFACE_SHAPES.map((s) => (
                  <Pill
                    key={s.id}
                    label={s.label}
                    hint={s.hint}
                    active={prefs.surfaceShape === s.id}
                    onSelect={() => prefs.setSurfaceShape(s.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </Bank>

        {/* STRUCTURE BANK */}
        <Bank title="Structure" hint="Border, elevation, grain, animation, scope.">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-1.5">
              <SmallLabel label="Border emphasis" />
              <div className="flex flex-wrap gap-1.5">
                {BORDER_EMPHASIS.map((b) => (
                  <Pill
                    key={b.id}
                    label={b.label}
                    hint={b.hint}
                    active={prefs.borderEmphasis === b.id}
                    onSelect={() => prefs.setBorderEmphasis(b.id)}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <SmallLabel label="Elevation" />
              <div className="flex flex-wrap gap-1.5">
                {ELEVATIONS.map((e) => (
                  <Pill
                    key={e.id}
                    label={e.label}
                    hint={e.hint}
                    active={prefs.elevation === e.id}
                    onSelect={() => prefs.setElevation(e.id)}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <SmallLabel label="Grain (heroes only)" />
              <div className="flex flex-wrap gap-1.5">
                {GRAINS.map((g) => (
                  <Pill
                    key={g.id}
                    label={g.label}
                    hint={g.hint}
                    active={prefs.grain === g.id}
                    onSelect={() => prefs.setGrain(g.id)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card data-surface="flat" className="overflow-hidden">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium">Animate gradient</p>
                  <p className="text-[11px] text-muted-foreground">
                    Slow drift across heroes + cards. Honours prefers-reduced-motion.
                  </p>
                </div>
                <Switch
                  checked={prefs.animateGradient}
                  onCheckedChange={(v) => prefs.setAnimateGradient(v)}
                />
              </CardContent>
            </Card>
            <div className="space-y-1.5">
              <SmallLabel label="Scope" hint="Where the gradient applies." />
              <div className="flex flex-wrap gap-1.5">
                {SCOPES.map((s) => (
                  <Pill
                    key={s.id}
                    label={s.label}
                    hint={s.hint}
                    active={prefs.scope === s.id}
                    onSelect={() => prefs.setScope(s.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </Bank>
      </div>
    </SectionPanel>
  )
}

function Bank({
  title,
  hint,
  children,
}: {
  title: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3 border-t pt-5 first:border-t-0 first:pt-0">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function SmallLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <p className="text-xs font-medium">{label}</p>
      {hint ? <p className="text-[10px] text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function Pill({
  label,
  hint,
  active,
  onSelect,
}: {
  label: string
  hint?: string
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      title={hint}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-foreground text-background shadow-sm'
          : 'border-border/70 bg-background text-muted-foreground hover:bg-accent/40 hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}

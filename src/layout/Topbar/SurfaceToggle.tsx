import { Link } from 'react-router'
import { Palette, Sparkles } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { Separator } from '@/shared/ui/separator'
import { Slider } from '@/shared/ui/slider'
import { Switch } from '@/shared/ui/switch'
import { cn } from '@/shared/lib/utils'

import {
  useThemePrefs,
  type GradientShape,
  type SurfaceIntensity,
  type SurfaceScope,
  type SurfaceTone,
} from '@/stores/themePrefs.store'

/**
 * Topbar quick-switch — the seven most-used surface axes in one popover:
 * tone swatches, intensity, gradient shape, opacity slider, animate
 * toggle, scope. Deeper controls (corners, elevation, grain, custom
 * accent, accent mix, border emphasis, direction, blur) live in
 * Settings → Preferences → Surface.
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
]

const INTENSITIES: SurfaceIntensity[] = ['off', 'subtle', 'balanced', 'bold', 'extra']
const SCOPES: SurfaceScope[] = ['none', 'heroes', 'all']
const SHAPES: GradientShape[] = ['linear', 'radial', 'mesh', 'conic']

export function SurfaceToggle() {
  const prefs = useThemePrefs()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Surface preferences">
          <Palette />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-3">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3 text-primary" />
            Surface
          </p>
          <Link
            to="/app/settings/preferences"
            className="text-[11px] font-medium text-primary hover:underline"
          >
            All controls →
          </Link>
        </div>

        {/* tones */}
        <div className="mt-2 grid grid-cols-10 gap-1">
          {TONES.map((t) => {
            const active = prefs.tone === t.id
            return (
              <button
                key={t.id}
                type="button"
                aria-label={t.label}
                aria-pressed={active}
                title={t.label}
                onClick={() => prefs.setTone(t.id)}
                className={cn(
                  'h-6 w-full rounded-md ring-1 ring-inset ring-black/10 transition-transform dark:ring-white/10',
                  active && 'ring-2 ring-primary',
                  !active && 'hover:scale-110',
                )}
                style={{ background: t.swatch }}
              />
            )
          })}
        </div>

        <Separator className="my-3" />

        {/* intensity */}
        <p className="text-[11px] font-medium text-muted-foreground">Intensity</p>
        <div className="mt-1.5 inline-flex w-full rounded-md border bg-background p-0.5">
          {INTENSITIES.map((i) => {
            const active = prefs.intensity === i
            return (
              <button
                key={i}
                type="button"
                aria-pressed={active}
                onClick={() => prefs.setIntensity(i)}
                className={cn(
                  'flex-1 rounded-sm px-1.5 py-1 text-[11px] font-medium capitalize transition-colors',
                  active
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {i}
              </button>
            )
          })}
        </div>

        {/* gradient shape */}
        <p className="mt-3 text-[11px] font-medium text-muted-foreground">Shape</p>
        <div className="mt-1.5 inline-flex w-full rounded-md border bg-background p-0.5">
          {SHAPES.map((s) => {
            const active = prefs.gradientShape === s
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => prefs.setGradientShape(s)}
                className={cn(
                  'flex-1 rounded-sm px-1.5 py-1 text-[11px] font-medium capitalize transition-colors',
                  active
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {s}
              </button>
            )
          })}
        </div>

        {/* opacity */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[11px] font-medium text-muted-foreground">Opacity</p>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {prefs.opacity}%
          </span>
        </div>
        <Slider
          className="mt-1.5"
          value={[prefs.opacity]}
          onValueChange={([v]) => prefs.setOpacity(v ?? 100)}
          min={0}
          max={200}
          step={5}
        />

        {/* animate */}
        <div className="mt-3 flex items-center justify-between rounded-md border bg-background px-2 py-1.5">
          <div>
            <p className="text-xs font-medium">Animate</p>
            <p className="text-[10px] text-muted-foreground">Slow drift across cards.</p>
          </div>
          <Switch
            checked={prefs.animateGradient}
            onCheckedChange={(v) => prefs.setAnimateGradient(v)}
          />
        </div>

        {/* scope */}
        <p className="mt-3 text-[11px] font-medium text-muted-foreground">Apply to</p>
        <div className="mt-1.5 inline-flex w-full rounded-md border bg-background p-0.5">
          {SCOPES.map((s) => {
            const active = prefs.scope === s
            const label = s === 'none' ? 'None' : s === 'heroes' ? 'Heroes' : 'Every card'
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => prefs.setScope(s)}
                className={cn(
                  'flex-1 rounded-sm px-2 py-1 text-[11px] font-medium transition-colors',
                  active
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Surface aesthetic preferences. Drives the gradient overlay system that
 * paints the OnboardingCard's "lifted" look across the whole app.
 *
 * Axes (each one persisted, live-previewed, controllable from the topbar
 * SurfaceToggle popover and the Preferences → Surface panel):
 *
 *   PALETTE                tone, accentMix, customAccent
 *   STRENGTH               intensity, opacity, blur
 *   GEOMETRY               direction, gradientShape, surfaceShape
 *   ANIMATION              animateGradient
 *   STRUCTURE              borderEmphasis, elevation, grain, radius
 *   SCOPE                  scope (heroes-only / all-cards / nothing)
 *
 * Hero surfaces (`data-surface="hero"`) always carry a stronger variant.
 * Data surfaces (`data-surface="flat"`) always opt out for legibility.
 */

export type SurfaceTone =
  | 'brand'
  | 'aurora'
  | 'mono'
  | 'warm'
  | 'cool'
  | 'sunset'
  | 'ocean'
  | 'forest'
  | 'rose'
  | 'midnight'
  | 'custom'

export type SurfaceIntensity = 'off' | 'subtle' | 'balanced' | 'bold' | 'extra'
export type SurfaceDirection = 'br' | 'bl' | 'tr' | 'tl' | 'radial' | 'mesh' | 'conic'
export type SurfaceShape = 'rounded' | 'soft' | 'sharp' | 'pill'
export type GradientShape = 'linear' | 'radial' | 'mesh' | 'conic'
export type SurfaceScope = 'none' | 'heroes' | 'all'
export type BorderEmphasis = 'none' | 'subtle' | 'standard' | 'glow'
export type ElevationLevel = 'flat' | 'lifted' | 'floating'
export type GrainLevel = 'off' | 'fine' | 'film'
export type AccentMix = 'pure' | 'duotone' | 'tritone' | 'iridescent'

export type ThemePrefs = {
  /* palette */
  tone: SurfaceTone
  /** Optional override accent for `tone === 'custom'`; OKLCH triplet (`0.585 0.233 277`). */
  customAccent: string
  /** How many color stops the gradient uses: pure (1), duotone (2), tritone (3), iridescent (4+). */
  accentMix: AccentMix

  /* strength */
  intensity: SurfaceIntensity
  /** 0..100 multiplier on top of intensity — `100` = no override, `50` = halve, `150` = exaggerate. */
  opacity: number
  /** Backdrop blur in px applied behind cards' gradient layer. 0 disables. */
  blur: number

  /* geometry */
  direction: SurfaceDirection
  /** Gradient drawing primitive: linear / radial / mesh / conic. */
  gradientShape: GradientShape
  /** Card corner family: rounded (12) · soft (16) · sharp (4) · pill (24). */
  surfaceShape: SurfaceShape

  /* animation */
  animateGradient: boolean

  /* structure */
  borderEmphasis: BorderEmphasis
  elevation: ElevationLevel
  grain: GrainLevel

  /* scope */
  scope: SurfaceScope

  /* mutators */
  setTone: (v: SurfaceTone) => void
  setCustomAccent: (v: string) => void
  setAccentMix: (v: AccentMix) => void
  setIntensity: (v: SurfaceIntensity) => void
  setOpacity: (v: number) => void
  setBlur: (v: number) => void
  setDirection: (v: SurfaceDirection) => void
  setGradientShape: (v: GradientShape) => void
  setSurfaceShape: (v: SurfaceShape) => void
  setAnimateGradient: (v: boolean) => void
  setBorderEmphasis: (v: BorderEmphasis) => void
  setElevation: (v: ElevationLevel) => void
  setGrain: (v: GrainLevel) => void
  setScope: (v: SurfaceScope) => void
  reset: () => void
}

const DEFAULTS: Omit<
  ThemePrefs,
  | 'setTone'
  | 'setCustomAccent'
  | 'setAccentMix'
  | 'setIntensity'
  | 'setOpacity'
  | 'setBlur'
  | 'setDirection'
  | 'setGradientShape'
  | 'setSurfaceShape'
  | 'setAnimateGradient'
  | 'setBorderEmphasis'
  | 'setElevation'
  | 'setGrain'
  | 'setScope'
  | 'reset'
> = {
  tone: 'brand',
  customAccent: '0.585 0.233 277',
  accentMix: 'duotone',
  intensity: 'subtle',
  opacity: 100,
  blur: 0,
  direction: 'br',
  gradientShape: 'radial',
  surfaceShape: 'rounded',
  animateGradient: false,
  borderEmphasis: 'none',
  elevation: 'lifted',
  grain: 'off',
  scope: 'all',
}

export const useThemePrefs = create<ThemePrefs>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setTone: (v) => set({ tone: v }),
      setCustomAccent: (v) => set({ customAccent: v }),
      setAccentMix: (v) => set({ accentMix: v }),
      setIntensity: (v) => set({ intensity: v }),
      setOpacity: (v) => set({ opacity: v }),
      setBlur: (v) => set({ blur: v }),
      setDirection: (v) => set({ direction: v }),
      setGradientShape: (v) => set({ gradientShape: v }),
      setSurfaceShape: (v) => set({ surfaceShape: v }),
      setAnimateGradient: (v) => set({ animateGradient: v }),
      setBorderEmphasis: (v) => set({ borderEmphasis: v }),
      setElevation: (v) => set({ elevation: v }),
      setGrain: (v) => set({ grain: v }),
      setScope: (v) => set({ scope: v }),
      reset: () => set(DEFAULTS),
    }),
    {
      name: 'bos.theme-prefs',
      /* v2 → all-cards default. v3 → 9 new axes. v4 → border default
         flipped to "none" so cards rely on gradient + shadow alone. */
      version: 4,
      migrate: (persisted: unknown, version): ThemePrefs => {
        const p = (persisted ?? {}) as Partial<ThemePrefs>
        const next: ThemePrefs = {
          ...DEFAULTS,
          ...p,
        } as ThemePrefs
        if (version < 2) {
          next.scope = 'all'
        }
        if (version < 3) {
          next.accentMix = DEFAULTS.accentMix
          next.opacity = DEFAULTS.opacity
          next.blur = DEFAULTS.blur
          next.gradientShape = DEFAULTS.gradientShape
          next.surfaceShape = DEFAULTS.surfaceShape
          next.animateGradient = DEFAULTS.animateGradient
          next.borderEmphasis = DEFAULTS.borderEmphasis
          next.elevation = DEFAULTS.elevation
          next.grain = DEFAULTS.grain
          next.customAccent = DEFAULTS.customAccent
        }
        if (version < 4) {
          next.borderEmphasis = 'none'
        }
        return next
      },
    },
  ),
)

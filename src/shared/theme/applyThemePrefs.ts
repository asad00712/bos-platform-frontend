import type {
  AccentMix,
  BorderEmphasis,
  ElevationLevel,
  GrainLevel,
  GradientShape,
  SurfaceDirection,
  SurfaceIntensity,
  SurfaceScope,
  SurfaceShape,
  SurfaceTone,
} from '@/stores/themePrefs.store'

/**
 * Composes the user's 13 surface axes into CSS variables + data
 * attributes on `<html>`. Single function called whenever any axis
 * changes; the cascade picks up the rest via `index.css` rules.
 *
 * Variables produced (read by `index.css`):
 *   --surface-gradient-card    standard-card overlay
 *   --surface-gradient-hero    hero overlay (~1.6× the card alpha)
 *   --surface-radius           card corner family
 *   --surface-blur             backdrop-filter blur (px)
 *   --surface-grain-opacity    noise overlay opacity
 *   --surface-shadow-card      composed shadow for cards
 *   --surface-shadow-hero      composed shadow for heroes
 *   --surface-border-color     border color override
 *
 * Data attributes:
 *   data-card-gradient   "all" | "heroes" | "none"
 *   data-surface-tone    canonical tone id
 *   data-surface-anim    "off" | "on"
 *   data-surface-grain   "off" | "fine" | "film"
 */

type ToneRecipe = {
  stops: string[]
  alphas: number[]
  preferMesh?: boolean
}

const TONES: Record<SurfaceTone, ToneRecipe> = {
  brand: { stops: ['0.585 0.233 277', '0.7 0.21 290'], alphas: [0.07, 0] },
  aurora: {
    stops: ['0.65 0.21 277', '0.7 0.14 200', '0.7 0.18 330'],
    alphas: [0.10, 0.08, 0.07],
    preferMesh: true,
  },
  mono: { stops: ['0.5 0 0', '0 0 0'], alphas: [0.05, 0] },
  warm: {
    stops: ['0.78 0.16 80', '0.7 0.19 22', '0 0 0'],
    alphas: [0.10, 0.06, 0],
    preferMesh: true,
  },
  cool: {
    stops: ['0.7 0.16 240', '0.65 0.21 277'],
    alphas: [0.09, 0.06],
    preferMesh: true,
  },
  sunset: {
    stops: ['0.78 0.18 60', '0.65 0.22 14', '0.65 0.21 300'],
    alphas: [0.10, 0.07, 0.05],
    preferMesh: true,
  },
  ocean: {
    stops: ['0.7 0.13 180', '0.65 0.18 230'],
    alphas: [0.10, 0.06],
    preferMesh: true,
  },
  forest: {
    stops: ['0.7 0.16 150', '0.55 0.13 175'],
    alphas: [0.09, 0.05],
    preferMesh: true,
  },
  rose: {
    stops: ['0.74 0.18 350', '0.6 0.21 14'],
    alphas: [0.10, 0.07],
    preferMesh: true,
  },
  midnight: {
    stops: ['0.35 0.10 270', '0.25 0.06 250'],
    alphas: [0.18, 0.10],
    preferMesh: true,
  },
  /* Overridden at runtime when `tone === 'custom'`. */
  custom: { stops: ['0.585 0.233 277'], alphas: [0.07] },
}

const INTENSITY_BASE: Record<SurfaceIntensity, number> = {
  off: 0,
  subtle: 1,
  balanced: 1.6,
  bold: 2.2,
  extra: 3.2,
}

const HERO_BOOST = 1.6

const DIRECTION_LINEAR: Record<SurfaceDirection, string> = {
  tl: 'to bottom right',
  tr: 'to bottom left',
  bl: 'to top right',
  br: 'to top left',
  radial: 'to top left',
  mesh: 'to top left',
  conic: 'to top left',
}

const DIRECTION_RADIAL: Record<
  SurfaceDirection,
  { ax: number; ay: number; bx: number; by: number; cx: number; cy: number }
> = {
  tl: { ax: 0, ay: 0, bx: 100, by: 100, cx: 50, cy: 50 },
  tr: { ax: 100, ay: 0, bx: 0, by: 100, cx: 50, cy: 50 },
  bl: { ax: 0, ay: 100, bx: 100, by: 0, cx: 50, cy: 50 },
  br: { ax: 100, ay: 100, bx: 0, by: 0, cx: 50, cy: 50 },
  radial: { ax: 0, ay: 0, bx: 100, by: 100, cx: 50, cy: 50 },
  mesh: { ax: 0, ay: 0, bx: 100, by: 100, cx: 50, cy: 100 },
  conic: { ax: 0, ay: 0, bx: 100, by: 100, cx: 50, cy: 50 },
}

const RADIUS_BY_SHAPE: Record<SurfaceShape, string> = {
  rounded: '0.625rem',
  soft: '1rem',
  sharp: '0.25rem',
  pill: '1.5rem',
}

const SHADOW_CARD: Record<ElevationLevel, string> = {
  flat: 'none',
  lifted: '0 1px 2px oklch(0 0 0 / 0.04), 0 4px 12px oklch(0 0 0 / 0.04)',
  floating:
    '0 1px 2px oklch(0 0 0 / 0.06), 0 12px 28px oklch(0 0 0 / 0.10), 0 24px 48px oklch(0 0 0 / 0.06)',
}

const SHADOW_HERO: Record<ElevationLevel, string> = {
  flat: 'none',
  lifted: '0 1px 2px oklch(0 0 0 / 0.06), 0 8px 24px oklch(0 0 0 / 0.06)',
  floating:
    '0 2px 4px oklch(0 0 0 / 0.08), 0 16px 40px oklch(0 0 0 / 0.12), 0 36px 64px oklch(0 0 0 / 0.10)',
}

const BORDER_BY_EMPHASIS: Record<BorderEmphasis, string> = {
  none: 'transparent',
  subtle: 'oklch(var(--border) / 0.6)',
  standard: 'var(--border)',
  glow: 'oklch(var(--ring) / 0.45)',
}

const BORDER_WIDTH_BY_EMPHASIS: Record<BorderEmphasis, string> = {
  none: '0px',
  subtle: '1px',
  standard: '1px',
  glow: '1px',
}

const GRAIN_OPACITY: Record<GrainLevel, number> = {
  off: 0,
  fine: 0.03,
  film: 0.06,
}

function trimAccentMixStops(
  stops: string[],
  alphas: number[],
  mix: AccentMix,
): { stops: string[]; alphas: number[] } {
  const wanted =
    mix === 'pure'
      ? 1
      : mix === 'duotone'
        ? 2
        : mix === 'tritone'
          ? 3
          : Math.max(stops.length, 4)
  return {
    stops: stops.slice(0, wanted),
    alphas: alphas.slice(0, wanted),
  }
}

function buildLinear(
  stops: string[],
  alphas: number[],
  scale: number,
  direction: SurfaceDirection,
): string {
  if (scale === 0) return 'none'
  const dir = DIRECTION_LINEAR[direction]
  const layered = stops
    .map((c, i) => {
      const a = (alphas[i]! * scale).toFixed(3)
      const pct = stops.length === 1 ? '100%' : `${Math.round((i / (stops.length - 1)) * 100)}%`
      return `oklch(${c} / ${a}) ${pct}`
    })
    .join(', ')
  return `linear-gradient(${dir}, ${layered})`
}

function buildRadial(
  stops: string[],
  alphas: number[],
  scale: number,
  direction: SurfaceDirection,
): string {
  if (scale === 0) return 'none'
  const pos = DIRECTION_RADIAL[direction]
  const layers = stops.map((c, i) => {
    const ax = i === 0 ? pos.ax : i === 1 ? pos.bx : pos.cx
    const ay = i === 0 ? pos.ay : i === 1 ? pos.by : pos.cy
    const a = (alphas[i]! * scale).toFixed(3)
    return `radial-gradient(60% 60% at ${ax}% ${ay}%, oklch(${c} / ${a}), transparent 70%)`
  })
  return layers.join(', ')
}

function buildMesh(stops: string[], alphas: number[], scale: number): string {
  if (scale === 0) return 'none'
  const positions = [
    { x: 0, y: 0 },
    { x: 100, y: 100 },
    { x: 100, y: 0 },
    { x: 0, y: 100 },
    { x: 50, y: 50 },
  ]
  const layers = stops.map((c, i) => {
    const p = positions[i % positions.length]!
    const a = (alphas[i]! * scale).toFixed(3)
    return `radial-gradient(50% 60% at ${p.x}% ${p.y}%, oklch(${c} / ${a}), transparent 70%)`
  })
  return layers.join(', ')
}

function buildConic(
  stops: string[],
  alphas: number[],
  scale: number,
  direction: SurfaceDirection,
): string {
  if (scale === 0) return 'none'
  const pos = DIRECTION_RADIAL[direction]
  const sweep = stops
    .map((c, i) => {
      const a = (alphas[i]! * scale).toFixed(3)
      const start = Math.round((i / stops.length) * 360)
      return `oklch(${c} / ${a}) ${start}deg`
    })
    .join(', ')
  const closure = `oklch(${stops[0]} / ${(alphas[0]! * scale).toFixed(3)}) 360deg`
  return `conic-gradient(from 180deg at ${pos.ax}% ${pos.ay}%, ${sweep}, ${closure})`
}

function buildGradient(
  recipe: ToneRecipe,
  shape: GradientShape,
  direction: SurfaceDirection,
  mix: AccentMix,
  scale: number,
): string {
  const trimmed = trimAccentMixStops(recipe.stops, recipe.alphas, mix)
  const effective: GradientShape =
    shape === 'mesh'
      ? 'mesh'
      : shape === 'conic'
        ? 'conic'
        : shape === 'radial' && recipe.preferMesh && trimmed.stops.length >= 3
          ? 'mesh'
          : shape

  switch (effective) {
    case 'linear':
      return buildLinear(trimmed.stops, trimmed.alphas, scale, direction)
    case 'mesh':
      return buildMesh(trimmed.stops, trimmed.alphas, scale)
    case 'conic':
      return buildConic(trimmed.stops, trimmed.alphas, scale, direction)
    case 'radial':
    default:
      return buildRadial(trimmed.stops, trimmed.alphas, scale, direction)
  }
}

export function applyThemePrefs(prefs: {
  tone: SurfaceTone
  customAccent: string
  accentMix: AccentMix
  intensity: SurfaceIntensity
  opacity: number
  blur: number
  direction: SurfaceDirection
  gradientShape: GradientShape
  surfaceShape: SurfaceShape
  animateGradient: boolean
  borderEmphasis: BorderEmphasis
  elevation: ElevationLevel
  grain: GrainLevel
  scope: SurfaceScope
}): void {
  const root = document.documentElement
  const recipe: ToneRecipe =
    prefs.tone === 'custom'
      ? { stops: [prefs.customAccent, prefs.customAccent], alphas: [0.10, 0] }
      : TONES[prefs.tone]

  const opacityScale = Math.max(0, prefs.opacity / 100)
  const baseScale = INTENSITY_BASE[prefs.intensity] * opacityScale

  const cardGradient = buildGradient(
    recipe,
    prefs.gradientShape,
    prefs.direction,
    prefs.accentMix,
    baseScale,
  )
  const heroGradient = buildGradient(
    recipe,
    prefs.gradientShape,
    prefs.direction,
    prefs.accentMix,
    baseScale * HERO_BOOST,
  )

  root.style.setProperty('--surface-gradient-card', cardGradient)
  root.style.setProperty('--surface-gradient-hero', heroGradient)
  root.style.setProperty('--surface-radius', RADIUS_BY_SHAPE[prefs.surfaceShape])
  root.style.setProperty('--surface-blur', `${prefs.blur}px`)
  root.style.setProperty('--surface-grain-opacity', String(GRAIN_OPACITY[prefs.grain]))
  root.style.setProperty('--surface-shadow-card', SHADOW_CARD[prefs.elevation])
  root.style.setProperty('--surface-shadow-hero', SHADOW_HERO[prefs.elevation])
  root.style.setProperty('--surface-border-color', BORDER_BY_EMPHASIS[prefs.borderEmphasis])
  root.style.setProperty('--surface-border-width', BORDER_WIDTH_BY_EMPHASIS[prefs.borderEmphasis])

  root.dataset.cardGradient = prefs.scope
  root.dataset.surfaceTone = prefs.tone
  root.dataset.surfaceAnim = prefs.animateGradient ? 'on' : 'off'
  root.dataset.surfaceGrain = prefs.grain
}

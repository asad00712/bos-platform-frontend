import { useEffect } from 'react'

import { useThemePrefs } from '@/stores/themePrefs.store'
import { applyThemePrefs } from './applyThemePrefs'

/**
 * Subscribes to all 13 theme axes and writes the resolved CSS variables
 * + data attributes to `<html>` whenever any of them changes. Mounted
 * once at the top of `<App>` so the cascade is live everywhere.
 */
export function useThemeSurface(): void {
  const tone = useThemePrefs((s) => s.tone)
  const customAccent = useThemePrefs((s) => s.customAccent)
  const accentMix = useThemePrefs((s) => s.accentMix)
  const intensity = useThemePrefs((s) => s.intensity)
  const opacity = useThemePrefs((s) => s.opacity)
  const blur = useThemePrefs((s) => s.blur)
  const direction = useThemePrefs((s) => s.direction)
  const gradientShape = useThemePrefs((s) => s.gradientShape)
  const surfaceShape = useThemePrefs((s) => s.surfaceShape)
  const animateGradient = useThemePrefs((s) => s.animateGradient)
  const borderEmphasis = useThemePrefs((s) => s.borderEmphasis)
  const elevation = useThemePrefs((s) => s.elevation)
  const grain = useThemePrefs((s) => s.grain)
  const scope = useThemePrefs((s) => s.scope)

  useEffect(() => {
    applyThemePrefs({
      tone,
      customAccent,
      accentMix,
      intensity,
      opacity,
      blur,
      direction,
      gradientShape,
      surfaceShape,
      animateGradient,
      borderEmphasis,
      elevation,
      grain,
      scope,
    })
  }, [
    tone,
    customAccent,
    accentMix,
    intensity,
    opacity,
    blur,
    direction,
    gradientShape,
    surfaceShape,
    animateGradient,
    borderEmphasis,
    elevation,
    grain,
    scope,
  ])
}

import { useEffect } from 'react'
import { useSessionStore } from '@/stores/session.store'

/**
 * Applies tenant.branding overrides as inline CSS variables on <html>.
 * Currently writes --primary, --ring, --sidebar-primary, --sidebar-ring,
 * and --font-sans when branding provides them. Removing them via inline
 * style "" lets the base tokens.css value take over again.
 */
export function useTenantThemeEffect() {
  const branding = useSessionStore((s) => s.tenant.branding)

  useEffect(() => {
    const root = document.documentElement
    const color = branding?.primaryColor
    const oklch = color ? `oklch(${color})` : ''

    if (oklch) {
      root.style.setProperty('--primary', oklch)
      root.style.setProperty('--ring', oklch)
      root.style.setProperty('--sidebar-primary', oklch)
      root.style.setProperty('--sidebar-ring', oklch)
    } else {
      root.style.removeProperty('--primary')
      root.style.removeProperty('--ring')
      root.style.removeProperty('--sidebar-primary')
      root.style.removeProperty('--sidebar-ring')
    }

    if (branding?.fontFamily) {
      root.style.setProperty('--font-sans', branding.fontFamily)
    } else {
      root.style.removeProperty('--font-sans')
    }
  }, [branding?.primaryColor, branding?.fontFamily])
}

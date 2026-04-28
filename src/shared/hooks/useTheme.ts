import { useEffect } from 'react'
import { useUiStore, type ThemeMode } from '@/stores/ui.store'

const MEDIA_QUERY = '(prefers-color-scheme: dark)'

/**
 * Reads the active theme from the UI store and applies the `.dark` class
 * to <html>. Honors `system` by tracking the prefers-color-scheme media
 * query. Mount this once at the app root.
 */
export function useThemeEffect() {
  const theme = useUiStore((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement
    const mql = window.matchMedia(MEDIA_QUERY)

    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mql.matches)
      root.classList.toggle('dark', isDark)
      root.dataset.theme = isDark ? 'dark' : 'light'
    }

    apply()

    if (theme === 'system') {
      mql.addEventListener('change', apply)
      return () => mql.removeEventListener('change', apply)
    }
  }, [theme])
}

export function useTheme() {
  const theme = useUiStore((state) => state.theme)
  const setTheme = useUiStore((state) => state.setTheme)
  return { theme, setTheme: (t: ThemeMode) => setTheme(t) }
}

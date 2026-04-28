import { useEffect, useState } from 'react'

/**
 * Reactive media-query hook. Returns true when the query matches.
 * Use Tailwind breakpoint queries verbatim, e.g. `useMediaQuery('(min-width: 1024px)')`.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

import { useEffect } from 'react'
import { authApi } from '../../api/auth.api'
import { useSessionStore } from '../../stores/session.store'

export function SessionBootstrap() {
  const status = useSessionStore((state) => state.status)

  useEffect(() => {
    if (status === 'ready') {
      return
    }

    let cancelled = false

    void (async () => {
      const store = useSessionStore.getState()
      try {
        const tokens = await authApi.refresh()
        if (cancelled) return
        store.setAccessToken({
          accessToken: tokens.accessToken,
          accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        })
        const user = await authApi.me()
        if (cancelled) return
        store.setAuthenticatedSession({
          accessToken: tokens.accessToken,
          accessTokenExpiresAt: tokens.accessTokenExpiresAt,
          user,
        })
      } catch {
        if (cancelled) return
        store.clearSession()
      }
    })()

    return () => {
      cancelled = true
    }
  }, [status])

  return null
}

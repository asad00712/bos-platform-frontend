import { Navigate, Outlet } from 'react-router'
import { useSessionStore } from '@/stores/session.store'
import { routes } from '@/routes/routeMap'

/**
 * Inverse of RequireAuth: only renders when *not* logged in. Used to
 * keep authenticated users out of /login, /signup, etc.
 */
export function RequireGuest() {
  const status = useSessionStore((s) => s.status)
  const accessToken = useSessionStore((s) => s.accessToken)
  const user = useSessionStore((s) => s.user)

  if (status === 'pending') return null

  if (accessToken && user) {
    return <Navigate to={routes.app.dashboard()} replace />
  }

  return <Outlet />
}

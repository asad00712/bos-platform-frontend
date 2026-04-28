import { Navigate, Outlet, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/shared/ui/spinner'
import { useSessionStore } from '@/stores/session.store'
import { routes } from '@/routes/routeMap'

export function RequireAuth() {
  const status = useSessionStore((state) => state.status)
  const accessToken = useSessionStore((state) => state.accessToken)
  const user = useSessionStore((state) => state.user)
  const location = useLocation()
  const { t } = useTranslation()

  if (status === 'pending') {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Spinner />
          <span className="text-sm">{t('states.loadingSession')}</span>
        </div>
      </div>
    )
  }

  if (!accessToken || !user) {
    const next = `${location.pathname}${location.search}`
    const qs = next && next !== '/' ? `?next=${encodeURIComponent(next)}` : ''
    return <Navigate to={`${routes.login()}${qs}`} replace />
  }

  return <Outlet />
}

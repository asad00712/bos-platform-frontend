import { AppProviders } from './app/AppProviders'
import { AppRoutes } from './routes/AppRoutes'
import { useThemeSurface } from '@/shared/theme/useThemeSurface'
import { PermissionsBootstrap } from '@/features/roles/PermissionsBootstrap'

function App() {
  // Apply persisted surface-gradient prefs to <html> on every change.
  useThemeSurface()
  return (
    <AppProviders>
      <PermissionsBootstrap />
      <AppRoutes />
    </AppProviders>
  )
}

export default App

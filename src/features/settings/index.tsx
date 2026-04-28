import { Database, KeyRound, Lock, ToggleLeft } from 'lucide-react'
import { Navigate } from 'react-router'

import { SettingsLayout } from './components/SettingsLayout'
import { OrganizationSettingsPage } from './pages/OrganizationSettingsPage'
import { BrandingSettingsPage } from './pages/BrandingSettingsPage'
import { MembersPage } from './pages/MembersPage'
import { RolesPage } from './pages/RolesPage'
import { IntegrationsPage } from './pages/IntegrationsPage'
import { PlanBillingPage } from './pages/PlanBillingPage'
import { PreferencesPage } from './pages/PreferencesPage'
import { PlaceholderSettingsPage } from './pages/PlaceholderPage'
import { routes } from '@/routes/routeMap'

export { SettingsLayout }
export { OrganizationSettingsPage }
export { BrandingSettingsPage }
export { MembersPage }
export { RolesPage }
export { IntegrationsPage }
export { PlanBillingPage }
export { PreferencesPage }

export function SettingsIndexRedirect() {
  return <Navigate to={routes.app.settings.organization()} replace />
}

export function ApiKeysPlaceholder() {
  return (
    <PlaceholderSettingsPage
      title="API & webhooks"
      description="Personal access tokens, service tokens, and webhook delivery logs."
      emptyTitle="API tokens & webhooks ship in a follow-up"
      emptyDescription="Generate scoped tokens and subscribe webhook URLs to BOS events."
      Icon={KeyRound}
    />
  )
}

export function FeatureFlagsPlaceholder() {
  return (
    <PlaceholderSettingsPage
      title="Feature flags"
      description="Per-tenant toggles for beta features and rollouts."
      emptyTitle="Feature flags ship in a follow-up"
      emptyDescription="Tenant-level overrides come once `core-service` exposes the flag store."
      Icon={ToggleLeft}
    />
  )
}

export function SecurityPlaceholder() {
  return (
    <PlaceholderSettingsPage
      title="Security"
      description="Sessions, 2FA enforcement, IP allowlists, and SSO."
      emptyTitle="Security center ships in a follow-up"
      emptyDescription="Live session viewer, 2FA enforcement, and SSO config land here."
      Icon={Lock}
    />
  )
}

export function DataPlaceholder() {
  return (
    <PlaceholderSettingsPage
      title="Data"
      description="Export, import, retention policies, and tenant deletion."
      emptyTitle="Data tools ship in a follow-up"
      emptyDescription="One-click exports and audit-friendly deletion flows land here."
      Icon={Database}
    />
  )
}

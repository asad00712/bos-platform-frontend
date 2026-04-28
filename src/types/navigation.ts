import type { LucideIcon } from 'lucide-react'
import type { FeatureKey, Permission, VerticalType } from './tenant'

export type NavigationItem = {
  /** i18n key for the item label, e.g. "common.navigation.dashboard". */
  i18nKey: string
  /** Resolved path (use routeMap to build). */
  path: string
  icon: LucideIcon
  permission?: Permission
  /** Restrict to specific verticals; omit to show for all. */
  verticals?: VerticalType[]
  /** Hide the item unless this feature is enabled for the tenant. */
  feature?: FeatureKey
  /** Optional badge value (count) shown on the nav item. */
  badgeKey?: string
}

export type NavigationGroup = {
  /** i18n key for the group label, e.g. "common.navigation.groups.modules". */
  i18nKey: string
  items: NavigationItem[]
  /** Hide the entire group unless this feature is enabled for the tenant. */
  feature?: FeatureKey
  /** Hide the group on `standard` caliber tenants (cleaner default UX). */
  advancedOnly?: boolean
}

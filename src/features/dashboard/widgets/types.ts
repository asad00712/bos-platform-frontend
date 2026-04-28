import type { ComponentType } from 'react'
import type { FeatureKey, Permission, VerticalType } from '@/types/tenant'

export type WidgetSpan = {
  /** 1..12 columns on lg+ */
  col: number
  /** optional row span on lg+ */
  row?: number
  /** col span on md (defaults to 12) */
  colMd?: number
}

export type Widget = {
  /** Stable id, e.g. 'dashboard.kpi-row'. Used by layouts. */
  id: string
  Component: ComponentType
  permission?: Permission
  verticals?: VerticalType[]
  /** Hide unless this feature is enabled for the active tenant. */
  feature?: FeatureKey
  span?: WidgetSpan
}

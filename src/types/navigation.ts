import type { LucideIcon } from 'lucide-react'
import type { Permission } from './tenant'

export type NavigationItem = {
  label: string
  path: string
  icon: LucideIcon
  permission?: Permission
}

export type NavigationGroup = {
  label: string
  items: NavigationItem[]
}

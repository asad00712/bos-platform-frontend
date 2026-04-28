import type { Widget } from '../widgets/types'

export type DashboardLayout = {
  id: string
  /** Title shown above the grid (resolved through i18n by consumers if needed). */
  title?: string
  widgets: Widget[]
}

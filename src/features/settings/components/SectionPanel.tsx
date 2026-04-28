import type { ReactNode } from 'react'
import { Card, CardContent } from '@/shared/ui/card'

type Props = {
  title: string
  description?: string
  /** Optional leading icon rendered in a soft chip next to the title. */
  icon?: ReactNode
  children: ReactNode
  actions?: ReactNode
}

/**
 * Standard frame for an inner Settings page (under SettingsLayout).
 * Keeps section heading + body consistent across all settings screens.
 */
export function SectionPanel({ title, description, icon, children, actions }: Props) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b pb-3">
          <div className="flex items-start gap-3">
            {icon ? (
              <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground">
                {icon}
              </span>
            ) : null}
            <div className="space-y-1">
              <h2 className="text-base font-semibold">{title}</h2>
              {description ? (
                <p className="text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
          </div>
          {actions}
        </header>
        {children}
      </CardContent>
    </Card>
  )
}

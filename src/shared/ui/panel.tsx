import type { ReactNode } from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'

type Props = {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  /** Remove inner padding (e.g. when child is a DataTable). */
  flush?: boolean
  className?: string
  contentClassName?: string
  children?: ReactNode
}

/**
 * Standard dashboard/feature panel: title + optional description on a
 * header row with optional right-aligned actions. Wraps shadcn Card.
 */
export function Panel({
  title,
  description,
  actions,
  flush = false,
  className,
  contentClassName,
  children,
}: Props) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {actions ? <CardAction>{actions}</CardAction> : null}
      </CardHeader>
      <CardContent
        className={cn(
          flush ? 'p-0' : 'p-5',
          'flex-1',
          contentClassName,
        )}
      >
        {children}
      </CardContent>
    </Card>
  )
}

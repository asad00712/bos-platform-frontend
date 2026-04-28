import type { ReactNode } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { cn } from '@/shared/lib/utils'

export type PageHeaderCrumb = {
  label: string
  href?: string
}

type Props = {
  title: string
  description?: string
  breadcrumbs?: PageHeaderCrumb[]
  actions?: ReactNode
  className?: string
}

/**
 * Standard page header. Every page starts with this — title, optional
 * breadcrumb trail, optional actions on the right.
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: Props) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((c, i) => {
              const isLast = i === breadcrumbs.length - 1
              return (
                <BreadcrumbItem key={`${c.label}-${i}`}>
                  {isLast || !c.href ? (
                    <BreadcrumbPage>{c.label}</BreadcrumbPage>
                  ) : (
                    <>
                      <BreadcrumbLink href={c.href}>{c.label}</BreadcrumbLink>
                      <BreadcrumbSeparator />
                    </>
                  )}
                </BreadcrumbItem>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}

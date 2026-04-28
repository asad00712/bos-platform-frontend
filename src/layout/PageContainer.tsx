import { cn } from '@/shared/lib/utils'
import type { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  className?: string
  /** Tighter horizontal padding for dense data screens. */
  density?: 'comfortable' | 'compact'
}>

/**
 * Standard page frame. Every authenticated page should be wrapped in
 * <PageContainer> to keep padding and max-width consistent across the app.
 */
export function PageContainer({ className, density = 'comfortable', children }: Props) {
  return (
    <main
      className={cn(
        'mx-auto w-full max-w-screen-2xl flex-1 space-y-6 p-4 md:p-6',
        density === 'compact' && 'space-y-4 p-3 md:p-4',
        className,
      )}
    >
      {children}
    </main>
  )
}

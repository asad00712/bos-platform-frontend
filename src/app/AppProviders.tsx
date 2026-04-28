import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import type { PropsWithChildren } from 'react'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { Toaster } from '@/shared/ui/sonner'
import { useThemeEffect } from '@/shared/hooks/useTheme'
import { useTenantThemeEffect } from '@/shared/hooks/useTenantTheme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export function AppProviders({ children }: PropsWithChildren) {
  useThemeEffect()
  useTenantThemeEffect()
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider delayDuration={250}>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

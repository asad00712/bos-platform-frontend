import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'
export type Density = 'comfortable' | 'compact'

type UiState = {
  theme: ThemeMode
  density: Density
  sidebarCollapsed: boolean
  setTheme: (theme: ThemeMode) => void
  setDensity: (density: Density) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'system',
      density: 'comfortable',
      sidebarCollapsed: false,
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
    }),
    {
      name: 'bos.ui',
      partialize: ({ theme, density, sidebarCollapsed }) => ({
        theme,
        density,
        sidebarCollapsed,
      }),
    },
  ),
)

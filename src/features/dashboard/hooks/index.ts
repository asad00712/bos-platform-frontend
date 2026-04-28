import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard.api'

export { useDashboardOverview } from './useDashboardOverview'

export function useRevenueByWeek(tenantId: string) {
  return useQuery({
    queryKey: ['dashboard.revenueWeekly', tenantId] as const,
    queryFn: dashboardApi.revenueWeekly,
    staleTime: 60_000,
  })
}

export function useRecentActivity(tenantId: string) {
  return useQuery({
    queryKey: ['dashboard.activities', tenantId] as const,
    queryFn: dashboardApi.activities,
    staleTime: 30_000,
  })
}

export function useTasks(tenantId: string) {
  return useQuery({
    queryKey: ['dashboard.tasks', tenantId] as const,
    queryFn: dashboardApi.tasks,
    staleTime: 30_000,
  })
}

export function usePipeline(tenantId: string) {
  return useQuery({
    queryKey: ['dashboard.pipeline', tenantId] as const,
    queryFn: dashboardApi.pipeline,
    staleTime: 60_000,
  })
}

export function useRevenueByVertical(tenantId: string) {
  return useQuery({
    queryKey: ['dashboard.revenueByVertical', tenantId] as const,
    queryFn: dashboardApi.revenueByVertical,
    staleTime: 60_000,
  })
}

export function useActiveVerticals(tenantId: string) {
  return useQuery({
    queryKey: ['dashboard.activeVerticals', tenantId] as const,
    queryFn: dashboardApi.activeVerticals,
    staleTime: 60_000,
  })
}

export function useRecentClients(tenantId: string) {
  return useQuery({
    queryKey: ['dashboard.recentClients', tenantId] as const,
    queryFn: dashboardApi.recentClients,
    staleTime: 30_000,
  })
}

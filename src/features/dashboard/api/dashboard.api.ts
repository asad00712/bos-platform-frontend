import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'

import {
  activeVerticalsResponseSchema,
  activitiesResponseSchema,
  overviewResponseSchema,
  pipelineResponseSchema,
  recentClientsResponseSchema,
  revenueByVerticalResponseSchema,
  revenueWeeklyResponseSchema,
  tasksResponseSchema,
  type ActiveVerticalsResponse,
  type ActivitiesResponse,
  type OverviewResponse,
  type PipelineResponse,
  type RecentClientsResponse,
  type RevenueByVerticalResponse,
  type RevenueWeeklyResponse,
  type TasksResponse,
} from './dashboard.contracts'
import { dashboardMocks } from './dashboard.mocks'

async function withMocks<T>(producer: () => T): Promise<T> {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
  return producer()
}

export const dashboardApi = {
  async overview(): Promise<OverviewResponse> {
    if (env.useMocks) {
      return overviewResponseSchema.parse(await withMocks(dashboardMocks.overview))
    }
    const data = await apiRequest<unknown>('/dashboard/overview')
    return overviewResponseSchema.parse(data)
  },

  async revenueWeekly(): Promise<RevenueWeeklyResponse> {
    if (env.useMocks) {
      return revenueWeeklyResponseSchema.parse(
        await withMocks(dashboardMocks.revenueWeekly),
      )
    }
    const data = await apiRequest<unknown>('/dashboard/revenue-weekly')
    return revenueWeeklyResponseSchema.parse(data)
  },

  async activities(): Promise<ActivitiesResponse> {
    if (env.useMocks) {
      return activitiesResponseSchema.parse(
        await withMocks(dashboardMocks.activities),
      )
    }
    const data = await apiRequest<unknown>('/dashboard/activities')
    return activitiesResponseSchema.parse(data)
  },

  async tasks(): Promise<TasksResponse> {
    if (env.useMocks) {
      return tasksResponseSchema.parse(await withMocks(dashboardMocks.tasks))
    }
    const data = await apiRequest<unknown>('/dashboard/tasks')
    return tasksResponseSchema.parse(data)
  },

  async pipeline(): Promise<PipelineResponse> {
    if (env.useMocks) {
      return pipelineResponseSchema.parse(
        await withMocks(dashboardMocks.pipeline),
      )
    }
    const data = await apiRequest<unknown>('/dashboard/pipeline')
    return pipelineResponseSchema.parse(data)
  },

  async revenueByVertical(): Promise<RevenueByVerticalResponse> {
    if (env.useMocks) {
      return revenueByVerticalResponseSchema.parse(
        await withMocks(dashboardMocks.revenueByVertical),
      )
    }
    const data = await apiRequest<unknown>('/dashboard/revenue-by-vertical')
    return revenueByVerticalResponseSchema.parse(data)
  },

  async activeVerticals(): Promise<ActiveVerticalsResponse> {
    if (env.useMocks) {
      return activeVerticalsResponseSchema.parse(
        await withMocks(dashboardMocks.activeVerticals),
      )
    }
    const data = await apiRequest<unknown>('/dashboard/active-verticals')
    return activeVerticalsResponseSchema.parse(data)
  },

  async recentClients(): Promise<RecentClientsResponse> {
    if (env.useMocks) {
      return recentClientsResponseSchema.parse(
        await withMocks(dashboardMocks.recentClients),
      )
    }
    const data = await apiRequest<unknown>('/dashboard/recent-clients')
    return recentClientsResponseSchema.parse(data)
  },
}

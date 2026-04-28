import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { notificationsApi } from '../api/notifications.api'
import type { NotificationPreferences } from '../api/notifications.contracts'

export const notifKeys = {
  list: (tenantId: string) => ['notifications', tenantId] as const,
  preferences: (tenantId: string) => ['notifications.preferences', tenantId] as const,
}

export function useNotificationsList(tenantId: string) {
  return useQuery({
    queryKey: notifKeys.list(tenantId),
    queryFn: notificationsApi.list,
    staleTime: 15_000,
  })
}

export function useMarkRead(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notifKeys.list(tenantId) })
    },
  })
}

export function useMarkAllRead(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notifKeys.list(tenantId) })
      toast.success('Marked all read')
    },
  })
}

export function useNotificationPreferences(tenantId: string) {
  return useQuery({
    queryKey: notifKeys.preferences(tenantId),
    queryFn: notificationsApi.preferences,
    staleTime: 5 * 60_000,
  })
}

export function useSaveNotificationPreferences(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NotificationPreferences) =>
      notificationsApi.savePreferences(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notifKeys.preferences(tenantId) })
      toast.success('Preferences saved')
    },
    onError: (error: Error) => {
      toast.error('Could not save preferences', { description: error.message })
    },
  })
}

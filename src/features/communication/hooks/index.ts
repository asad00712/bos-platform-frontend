import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { communicationApi } from '../api/communication.api'
import type {
  InboxFilters,
  MessageInput,
} from '../api/communication.contracts'

export const commKeys = {
  threads: (tenantId: string, filters: InboxFilters) =>
    ['communication.threads', tenantId, filters] as const,
  thread: (tenantId: string, id: string) =>
    ['communication.thread', tenantId, id] as const,
  templates: (tenantId: string) => ['communication.templates', tenantId] as const,
}

export function useThreadList(tenantId: string, filters: InboxFilters) {
  return useQuery({
    queryKey: commKeys.threads(tenantId, filters),
    queryFn: () => communicationApi.listThreads(filters),
    staleTime: 15_000,
  })
}

export function useThread(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: commKeys.thread(tenantId, id ?? ''),
    queryFn: () => communicationApi.getThread(id!),
    enabled: Boolean(id),
    staleTime: 15_000,
  })
}

export function useTemplates(tenantId: string) {
  return useQuery({
    queryKey: commKeys.templates(tenantId),
    queryFn: communicationApi.templates,
    staleTime: 5 * 60_000,
  })
}

export function useMarkRead(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => communicationApi.markRead(id),
    onSuccess: (updated) => {
      void qc.invalidateQueries({ queryKey: ['communication.threads', tenantId] })
      void qc.invalidateQueries({ queryKey: commKeys.thread(tenantId, updated.id) })
    },
  })
}

export function useSendMessage(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: MessageInput) => communicationApi.send(input),
    onSuccess: ({ thread }) => {
      void qc.invalidateQueries({ queryKey: ['communication.threads', tenantId] })
      void qc.invalidateQueries({ queryKey: commKeys.thread(tenantId, thread.id) })
      toast.success('Message sent')
    },
    onError: (error: Error) => {
      toast.error('Could not send message', { description: error.message })
    },
  })
}

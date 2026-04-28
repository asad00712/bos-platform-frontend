import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { supportApi } from '../api/support.api'
import type {
  Ticket,
  TicketFilters,
  TicketInput,
  TicketReplyInput,
} from '../api/support.contracts'

export const supportKeys = {
  list: (tenantId: string, filters: TicketFilters) =>
    ['support.tickets', tenantId, filters] as const,
  detail: (tenantId: string, id: string) =>
    ['support.ticket', tenantId, id] as const,
  help: (tenantId: string) => ['support.help', tenantId] as const,
}

export function useTicketList(tenantId: string, filters: TicketFilters) {
  return useQuery({
    queryKey: supportKeys.list(tenantId, filters),
    queryFn: () => supportApi.list(filters),
    staleTime: 30_000,
  })
}

export function useTicket(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: supportKeys.detail(tenantId, id ?? ''),
    queryFn: () => supportApi.get(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

export function useHelpArticles(tenantId: string) {
  return useQuery({
    queryKey: supportKeys.help(tenantId),
    queryFn: supportApi.helpArticles,
    staleTime: 5 * 60_000,
  })
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>, tenantId: string) {
  void qc.invalidateQueries({ queryKey: ['support.tickets', tenantId] })
}

export function useCreateTicket(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      input,
      requester,
    }: {
      input: TicketInput
      requester: { name: string; email: string }
    }) => supportApi.create(input, requester),
    onSuccess: (created) => {
      invalidateAll(qc, tenantId)
      toast.success('Ticket created', { description: created.number })
    },
    onError: (error: Error) => {
      toast.error('Could not create ticket', { description: error.message })
    },
  })
}

export function useReplyTicket(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
      authorName,
    }: {
      id: string
      input: TicketReplyInput
      authorName: string
    }) => supportApi.reply(id, input, authorName),
    onSuccess: (updated) => {
      invalidateAll(qc, tenantId)
      void qc.invalidateQueries({ queryKey: supportKeys.detail(tenantId, updated.id) })
      toast.success('Reply sent')
    },
    onError: (error: Error) => {
      toast.error('Could not send reply', { description: error.message })
    },
  })
}

export function useChangeTicketStatus(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Ticket['status'] }) =>
      supportApi.changeStatus(id, status),
    onSuccess: (updated) => {
      invalidateAll(qc, tenantId)
      void qc.invalidateQueries({ queryKey: supportKeys.detail(tenantId, updated.id) })
    },
    onError: (error: Error) => {
      toast.error('Could not change status', { description: error.message })
    },
  })
}

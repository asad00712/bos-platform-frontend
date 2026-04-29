import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { useActiveBranchId } from '@/stores/activeBranch.store'
import { staffApi, type StaffInviteInput } from '../api/staff.api'

export const staffKeys = {
  list: (tenantId: string, branchId: string | null) =>
    ['staff.list', tenantId, branchId] as const,
  invites: (tenantId: string) => ['staff.invites', tenantId] as const,
  invite: (token: string) => ['staff.invite', token] as const,
}

export function useStaff(tenantId: string) {
  const branchId = useActiveBranchId()
  return useQuery({
    queryKey: staffKeys.list(tenantId, branchId),
    queryFn: staffApi.list,
    staleTime: 60_000,
  })
}

export function useStaffInvites(tenantId: string) {
  return useQuery({
    queryKey: staffKeys.invites(tenantId),
    queryFn: staffApi.invites,
    staleTime: 60_000,
  })
}

export function useInviteStaff(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: StaffInviteInput) => staffApi.invite(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['staff.list', tenantId] })
      void qc.invalidateQueries({ queryKey: staffKeys.invites(tenantId) })
      toast.success('Invite sent')
    },
    onError: (error: Error) => {
      toast.error('Could not send invite', { description: error.message })
    },
  })
}

export function useCancelInvite(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => staffApi.cancelInvite(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['staff.list', tenantId] })
      void qc.invalidateQueries({ queryKey: staffKeys.invites(tenantId) })
      toast.success('Invite cancelled')
    },
    onError: (error: Error) => {
      toast.error('Could not cancel invite', { description: error.message })
    },
  })
}

export function useSetStaffRole(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      staffApi.setRole(userId, roleIds),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['staff.list', tenantId] })
    },
    onError: (error: Error) => {
      toast.error('Could not change role', { description: error.message })
    },
  })
}

export function useSetStaffRoundRobin(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, available }: { userId: string; available: boolean }) =>
      staffApi.setRoundRobin(userId, available),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['staff.list', tenantId] })
    },
    onError: (error: Error) => {
      toast.error('Could not toggle round-robin', { description: error.message })
    },
  })
}

export function useRemoveStaff(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => staffApi.remove(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['staff.list', tenantId] })
      toast.success('Member removed')
    },
    onError: (error: Error) => {
      toast.error('Could not remove member', { description: error.message })
    },
  })
}

/* ─── invite-accept ─────────────────────────────────────────── */

export function useInviteDescribe(token: string | null) {
  return useQuery({
    queryKey: staffKeys.invite(token ?? ''),
    queryFn: () => staffApi.describeInvite(token!),
    enabled: Boolean(token),
    staleTime: 60_000,
    retry: false,
  })
}

export function useAcceptInvite() {
  return useMutation({
    mutationFn: (input: {
      token: string
      firstName: string
      lastName?: string
      password: string
    }) => staffApi.acceptInvite(input),
    onError: (error: Error) => {
      toast.error('Could not accept invite', { description: error.message })
    },
  })
}

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { settingsApi } from '../api/settings.api'
import type {
  BrandingInput,
  InviteInput,
  OrganizationProfileInput,
} from '../api/settings.contracts'

export const settingsKeys = {
  organization: (tenantId: string) => ['settings.organization', tenantId] as const,
  branding: (tenantId: string) => ['settings.branding', tenantId] as const,
  members: (tenantId: string) => ['settings.members', tenantId] as const,
  roles: (tenantId: string) => ['settings.roles', tenantId] as const,
  integrations: (tenantId: string) => ['settings.integrations', tenantId] as const,
}

export function useOrganization(tenantId: string) {
  return useQuery({
    queryKey: settingsKeys.organization(tenantId),
    queryFn: settingsApi.organization,
    staleTime: 5 * 60_000,
  })
}

export function useSaveOrganization(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: OrganizationProfileInput) =>
      settingsApi.saveOrganization(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: settingsKeys.organization(tenantId) })
      toast.success('Organization saved')
    },
    onError: (error: Error) => {
      toast.error('Could not save', { description: error.message })
    },
  })
}

export function useBranding(tenantId: string) {
  return useQuery({
    queryKey: settingsKeys.branding(tenantId),
    queryFn: settingsApi.branding,
    staleTime: 5 * 60_000,
  })
}

export function useSaveBranding(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: BrandingInput) => settingsApi.saveBranding(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: settingsKeys.branding(tenantId) })
      toast.success('Branding saved')
    },
    onError: (error: Error) => {
      toast.error('Could not save branding', { description: error.message })
    },
  })
}

export function useMembers(tenantId: string) {
  return useQuery({
    queryKey: settingsKeys.members(tenantId),
    queryFn: settingsApi.members,
    staleTime: 60_000,
  })
}

export function useInviteMember(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: InviteInput) => settingsApi.invite(input),
    onSuccess: (m) => {
      void qc.invalidateQueries({ queryKey: settingsKeys.members(tenantId) })
      void qc.invalidateQueries({ queryKey: settingsKeys.roles(tenantId) })
      toast.success('Invitation sent', { description: m.email })
    },
    onError: (error: Error) => {
      toast.error('Could not send invite', { description: error.message })
    },
  })
}

export function useRemoveMember(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => settingsApi.removeMember(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: settingsKeys.members(tenantId) })
      void qc.invalidateQueries({ queryKey: settingsKeys.roles(tenantId) })
      toast.success('Member removed')
    },
    onError: (error: Error) => {
      toast.error('Could not remove', { description: error.message })
    },
  })
}

export function useChangeMemberRole(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) =>
      settingsApi.changeMemberRole(id, roleId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: settingsKeys.members(tenantId) })
      void qc.invalidateQueries({ queryKey: settingsKeys.roles(tenantId) })
      toast.success('Role updated')
    },
    onError: (error: Error) => {
      toast.error('Could not change role', { description: error.message })
    },
  })
}

export function useRoles(tenantId: string) {
  return useQuery({
    queryKey: settingsKeys.roles(tenantId),
    queryFn: settingsApi.roles,
    staleTime: 5 * 60_000,
  })
}

export function useIntegrations(tenantId: string) {
  return useQuery({
    queryKey: settingsKeys.integrations(tenantId),
    queryFn: settingsApi.integrations,
    staleTime: 5 * 60_000,
  })
}

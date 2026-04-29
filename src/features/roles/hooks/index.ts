import { useEffect } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { useSessionStore } from '@/stores/session.store'
import { rolesApi, type RoleInput } from '../api/roles.api'

export const roleKeys = {
  list: () => ['roles'] as const,
  permissions: () => ['permissions.catalog'] as const,
  current: () => ['permissions.current'] as const,
}

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: rolesApi.list,
    staleTime: 5 * 60_000,
  })
}

export function usePermissionCatalog() {
  return useQuery({
    queryKey: roleKeys.permissions(),
    queryFn: rolesApi.listPermissions,
    staleTime: 60 * 60_000,
  })
}

/**
 * Mounted once at the app shell. Loads the current user's permission
 * slugs and pushes them into the session store so `useHasPermission`
 * can read from a single source of truth.
 */
export function usePermissionsBootstrap() {
  const setPermissions = useSessionStore((s) => s.setPermissions)
  const query = useQuery({
    queryKey: roleKeys.current(),
    queryFn: rolesApi.currentPermissions,
    staleTime: 5 * 60_000,
  })

  useEffect(() => {
    if (query.data) {
      setPermissions(query.data.slugs)
    }
  }, [query.data, setPermissions])

  return query
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: RoleInput) => rolesApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: roleKeys.list() })
      toast.success('Role created')
    },
    onError: (error: Error) => {
      toast.error('Could not create role', { description: error.message })
    },
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string
      patch: Partial<{ name: string; description: string | null; permissionSlugs: string[] }>
    }) => rolesApi.update(id, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: roleKeys.list() })
      void qc.invalidateQueries({ queryKey: roleKeys.current() })
    },
    onError: (error: Error) => {
      toast.error('Could not update role', { description: error.message })
    },
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rolesApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: roleKeys.list() })
      toast.success('Role removed')
    },
    onError: (error: Error) => {
      toast.error('Could not remove role', { description: error.message })
    },
  })
}

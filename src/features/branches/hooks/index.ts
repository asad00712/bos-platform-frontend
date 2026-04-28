import { useEffect } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { useActiveBranchStore } from '@/stores/activeBranch.store'
import { branchesApi, type BranchInput } from '../api/branches.api'

export const branchKeys = {
  list: () => ['branches'] as const,
}

/**
 * Loads the tenant's branches and hydrates the active-branch store. Mount
 * once at the app shell so every CRM-scoped query has a branchId
 * available.
 */
export function useBranchesBootstrap() {
  const setBranches = useActiveBranchStore((s) => s.setBranches)
  const query = useQuery({
    queryKey: branchKeys.list(),
    queryFn: branchesApi.list,
    staleTime: 5 * 60_000,
  })

  useEffect(() => {
    if (query.data) {
      setBranches(query.data)
    }
  }, [query.data, setBranches])

  return query
}

export function useBranches() {
  return useQuery({
    queryKey: branchKeys.list(),
    queryFn: branchesApi.list,
    staleTime: 5 * 60_000,
  })
}

export function useCreateBranch() {
  const qc = useQueryClient()
  const setBranches = useActiveBranchStore((s) => s.setBranches)
  return useMutation({
    mutationFn: (input: BranchInput) => branchesApi.create(input),
    onSuccess: async () => {
      const fresh = await branchesApi.list()
      setBranches(fresh)
      qc.setQueryData(branchKeys.list(), fresh)
      toast.success('Branch created')
    },
    onError: (error: Error) => {
      toast.error('Could not create branch', { description: error.message })
    },
  })
}

export function useUpdateBranch() {
  const qc = useQueryClient()
  const setBranches = useActiveBranchStore((s) => s.setBranches)
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<BranchInput> }) =>
      branchesApi.update(id, patch),
    onSuccess: async () => {
      const fresh = await branchesApi.list()
      setBranches(fresh)
      qc.setQueryData(branchKeys.list(), fresh)
    },
    onError: (error: Error) => {
      toast.error('Could not update branch', { description: error.message })
    },
  })
}

export function useDeleteBranch() {
  const qc = useQueryClient()
  const setBranches = useActiveBranchStore((s) => s.setBranches)
  return useMutation({
    mutationFn: (id: string) => branchesApi.remove(id),
    onSuccess: async () => {
      const fresh = await branchesApi.list()
      setBranches(fresh)
      qc.setQueryData(branchKeys.list(), fresh)
      toast.success('Branch removed')
    },
    onError: (error: Error) => {
      toast.error('Could not remove branch', { description: error.message })
    },
  })
}

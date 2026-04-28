import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { hrmApi } from '../api/hrm.api'
import type {
  EmployeeInput,
  EmployeeListFilters,
  LeaveInput,
} from '../api/hrm.contracts'

export const hrmKeys = {
  employees: (tenantId: string, filters: EmployeeListFilters) =>
    ['hrm.employees', tenantId, filters] as const,
  employee: (tenantId: string, id: string) =>
    ['hrm.employee', tenantId, id] as const,
  attendance: (tenantId: string) => ['hrm.attendance.today', tenantId] as const,
  leaves: (tenantId: string) => ['hrm.leaves', tenantId] as const,
  overview: (tenantId: string) => ['hrm.overview', tenantId] as const,
}

export function useEmployeeList(tenantId: string, filters: EmployeeListFilters) {
  return useQuery({
    queryKey: hrmKeys.employees(tenantId, filters),
    queryFn: () => hrmApi.listEmployees(filters),
    staleTime: 30_000,
  })
}

export function useEmployee(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: hrmKeys.employee(tenantId, id ?? ''),
    queryFn: () => hrmApi.getEmployee(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

export function useTodayAttendance(tenantId: string) {
  return useQuery({
    queryKey: hrmKeys.attendance(tenantId),
    queryFn: hrmApi.todayAttendance,
    staleTime: 30_000,
  })
}

export function useLeavesList(tenantId: string) {
  return useQuery({
    queryKey: hrmKeys.leaves(tenantId),
    queryFn: hrmApi.listLeaves,
    staleTime: 30_000,
  })
}

export function useHrmOverview(tenantId: string) {
  return useQuery({
    queryKey: hrmKeys.overview(tenantId),
    queryFn: hrmApi.overview,
    staleTime: 60_000,
  })
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>, tenantId: string) {
  void qc.invalidateQueries({ queryKey: ['hrm.employees', tenantId] })
  void qc.invalidateQueries({ queryKey: hrmKeys.attendance(tenantId) })
  void qc.invalidateQueries({ queryKey: hrmKeys.leaves(tenantId) })
  void qc.invalidateQueries({ queryKey: hrmKeys.overview(tenantId) })
}

export function useCreateEmployee(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: EmployeeInput) => hrmApi.createEmployee(input),
    onSuccess: (created) => {
      invalidateAll(qc, tenantId)
      toast.success('Employee added', {
        description: `${created.firstName} ${created.lastName}`,
      })
    },
    onError: (error: Error) => {
      toast.error('Could not add employee', { description: error.message })
    },
  })
}

export function useUpdateEmployee(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<EmployeeInput> }) =>
      hrmApi.updateEmployee(id, patch),
    onSuccess: (updated) => {
      invalidateAll(qc, tenantId)
      void qc.invalidateQueries({ queryKey: hrmKeys.employee(tenantId, updated.id) })
    },
    onError: (error: Error) => {
      toast.error('Could not update employee', { description: error.message })
    },
  })
}

export function useDeleteEmployee(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => hrmApi.deleteEmployee(id),
    onSuccess: () => {
      invalidateAll(qc, tenantId)
      toast.success('Employee removed')
    },
    onError: (error: Error) => {
      toast.error('Could not remove employee', { description: error.message })
    },
  })
}

export function useClockIn(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ employeeId, employeeName }: { employeeId: string; employeeName: string }) =>
      hrmApi.clockIn(employeeId, employeeName),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hrmKeys.attendance(tenantId) })
      void qc.invalidateQueries({ queryKey: hrmKeys.overview(tenantId) })
      toast.success('Clocked in')
    },
    onError: (error: Error) => {
      toast.error('Could not clock in', { description: error.message })
    },
  })
}

export function useClockOut(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (employeeId: string) => hrmApi.clockOut(employeeId),
    onSuccess: (entry) => {
      void qc.invalidateQueries({ queryKey: hrmKeys.attendance(tenantId) })
      void qc.invalidateQueries({ queryKey: hrmKeys.overview(tenantId) })
      toast.success('Clocked out', {
        description: `${entry.hoursWorked}h logged`,
      })
    },
    onError: (error: Error) => {
      toast.error('Could not clock out', { description: error.message })
    },
  })
}

export function useCreateLeave(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: LeaveInput) => hrmApi.createLeave(input),
    onSuccess: () => {
      invalidateAll(qc, tenantId)
      toast.success('Leave request submitted')
    },
    onError: (error: Error) => {
      toast.error('Could not submit leave', { description: error.message })
    },
  })
}

export function useDecideLeave(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      decision,
      decidedBy,
    }: {
      id: string
      decision: 'approved' | 'rejected'
      decidedBy: string
    }) => hrmApi.decideLeave(id, decision, decidedBy),
    onSuccess: (leave) => {
      invalidateAll(qc, tenantId)
      toast.success(
        leave.status === 'approved' ? 'Leave approved' : 'Leave rejected',
      )
    },
    onError: (error: Error) => {
      toast.error('Could not update leave', { description: error.message })
    },
  })
}

export function useCancelLeave(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => hrmApi.cancelLeave(id),
    onSuccess: () => {
      invalidateAll(qc, tenantId)
      toast.success('Leave cancelled')
    },
    onError: (error: Error) => {
      toast.error('Could not cancel leave', { description: error.message })
    },
  })
}

import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'

import {
  attendanceEntrySchema,
  attendanceListResponseSchema,
  employeeDetailSchema,
  employeesListResponseSchema,
  hrmOverviewSchema,
  leaveSchema,
  leavesResponseSchema,
  type AttendanceEntry,
  type AttendanceListResponse,
  type EmployeeDetail,
  type EmployeeInput,
  type EmployeeListFilters,
  type EmployeesListResponse,
  type HrmOverview,
  type Leave,
  type LeaveInput,
  type LeavesResponse,
} from './hrm.contracts'
import { hrmMocks } from './hrm.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export const hrmApi = {
  async listEmployees(filters: EmployeeListFilters): Promise<EmployeesListResponse> {
    if (env.useMocks) {
      await delay()
      return employeesListResponseSchema.parse(hrmMocks.listEmployees(filters))
    }
    const qs = new URLSearchParams()
    if (filters.search) qs.set('search', filters.search)
    if (filters.status) qs.set('status', filters.status)
    if (filters.department) qs.set('department', filters.department)
    const data = await apiRequest<unknown>(`/hrm/employees?${qs.toString()}`)
    return employeesListResponseSchema.parse(data)
  },

  async getEmployee(id: string): Promise<EmployeeDetail> {
    if (env.useMocks) {
      await delay()
      const result = hrmMocks.getEmployee(id)
      if (!result) throw new Error('Employee not found')
      return employeeDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/hrm/employees/${id}`)
    return employeeDetailSchema.parse(data)
  },

  async createEmployee(input: EmployeeInput): Promise<EmployeeDetail> {
    if (env.useMocks) {
      await delay()
      return employeeDetailSchema.parse(hrmMocks.createEmployee(input))
    }
    const data = await apiRequest<unknown>('/hrm/employees', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return employeeDetailSchema.parse(data)
  },

  async updateEmployee(
    id: string,
    patch: Partial<EmployeeInput>,
  ): Promise<EmployeeDetail> {
    if (env.useMocks) {
      await delay()
      const result = hrmMocks.updateEmployee(id, patch)
      if (!result) throw new Error('Employee not found')
      return employeeDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/hrm/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    return employeeDetailSchema.parse(data)
  },

  async deleteEmployee(id: string): Promise<void> {
    if (env.useMocks) {
      await delay()
      const ok = hrmMocks.removeEmployee(id)
      if (!ok) throw new Error('Employee not found')
      return
    }
    await apiRequest<void>(`/hrm/employees/${id}`, { method: 'DELETE' })
  },

  async todayAttendance(): Promise<AttendanceListResponse> {
    if (env.useMocks) {
      await delay()
      return attendanceListResponseSchema.parse(hrmMocks.todayAttendance())
    }
    const data = await apiRequest<unknown>('/hrm/attendance/today')
    return attendanceListResponseSchema.parse(data)
  },

  async clockIn(employeeId: string, employeeName: string): Promise<AttendanceEntry> {
    if (env.useMocks) {
      await delay()
      return attendanceEntrySchema.parse(
        hrmMocks.clockInForEmployee(employeeId, employeeName),
      )
    }
    const data = await apiRequest<unknown>(`/hrm/attendance/clock-in`, {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    })
    return attendanceEntrySchema.parse(data)
  },

  async clockOut(employeeId: string): Promise<AttendanceEntry> {
    if (env.useMocks) {
      await delay()
      const result = hrmMocks.clockOutForEmployee(employeeId)
      if (!result) throw new Error('No open clock-in found')
      return attendanceEntrySchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/hrm/attendance/clock-out`, {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    })
    return attendanceEntrySchema.parse(data)
  },

  async listLeaves(): Promise<LeavesResponse> {
    if (env.useMocks) {
      await delay()
      return leavesResponseSchema.parse(hrmMocks.listLeaves())
    }
    const data = await apiRequest<unknown>('/hrm/leaves')
    return leavesResponseSchema.parse(data)
  },

  async createLeave(input: LeaveInput): Promise<Leave> {
    if (env.useMocks) {
      await delay()
      return leaveSchema.parse(hrmMocks.createLeave(input))
    }
    const data = await apiRequest<unknown>('/hrm/leaves', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return leaveSchema.parse(data)
  },

  async decideLeave(
    id: string,
    decision: 'approved' | 'rejected',
    decidedBy: string,
  ): Promise<Leave> {
    if (env.useMocks) {
      await delay()
      const result = hrmMocks.decideLeave(id, decision, decidedBy)
      if (!result) throw new Error('Leave not found')
      return leaveSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/hrm/leaves/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision, decidedBy }),
    })
    return leaveSchema.parse(data)
  },

  async cancelLeave(id: string): Promise<Leave> {
    if (env.useMocks) {
      await delay()
      const result = hrmMocks.cancelLeave(id)
      if (!result) throw new Error('Leave not found')
      return leaveSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/hrm/leaves/${id}/cancel`, {
      method: 'POST',
    })
    return leaveSchema.parse(data)
  },

  async overview(): Promise<HrmOverview> {
    if (env.useMocks) {
      await delay()
      return hrmOverviewSchema.parse(hrmMocks.overview())
    }
    const data = await apiRequest<unknown>('/hrm/overview')
    return hrmOverviewSchema.parse(data)
  },
}

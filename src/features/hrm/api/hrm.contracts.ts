import { z } from 'zod'

/* -------------------- enums -------------------- */

export const employmentTypeSchema = z.enum([
  'full_time',
  'part_time',
  'contract',
  'intern',
])
export type EmploymentType = z.infer<typeof employmentTypeSchema>

export const employeeStatusSchema = z.enum([
  'active',
  'on_leave',
  'inactive',
  'terminated',
])
export type EmployeeStatus = z.infer<typeof employeeStatusSchema>

export const leaveKindSchema = z.enum([
  'vacation',
  'sick',
  'personal',
  'unpaid',
  'bereavement',
])
export type LeaveKind = z.infer<typeof leaveKindSchema>

export const leaveStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'cancelled',
])
export type LeaveStatus = z.infer<typeof leaveStatusSchema>

export const attendanceStateSchema = z.enum([
  'present',
  'late',
  'absent',
  'on_leave',
])
export type AttendanceState = z.infer<typeof attendanceStateSchema>

/* -------------------- employee -------------------- */

export const employeeSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  jobTitle: z.string(),
  department: z.string(),
  employmentType: employmentTypeSchema,
  status: employeeStatusSchema,
  startDate: z.string(),
  managerName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
})
export type Employee = z.infer<typeof employeeSchema>

export const employeeDetailSchema = employeeSchema.extend({
  endDate: z.string().nullable(),
  /** PTO balance in days. */
  ptoBalanceDays: z.number(),
  notes: z.string().nullable(),
})
export type EmployeeDetail = z.infer<typeof employeeDetailSchema>

/* -------------------- list -------------------- */

export const employeeListFiltersSchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  status: employeeStatusSchema.optional(),
})
export type EmployeeListFilters = z.infer<typeof employeeListFiltersSchema>

export const employeesListResponseSchema = z.object({
  items: z.array(employeeSchema),
  total: z.number(),
})
export type EmployeesListResponse = z.infer<typeof employeesListResponseSchema>

/* -------------------- attendance -------------------- */

export const attendanceEntrySchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  employeeName: z.string(),
  date: z.string(),
  clockInAt: z.string().nullable(),
  clockOutAt: z.string().nullable(),
  state: attendanceStateSchema,
  hoursWorked: z.number(),
  notes: z.string().nullable(),
})
export type AttendanceEntry = z.infer<typeof attendanceEntrySchema>

export const attendanceListResponseSchema = z.object({
  items: z.array(attendanceEntrySchema),
})
export type AttendanceListResponse = z.infer<typeof attendanceListResponseSchema>

/* -------------------- leave -------------------- */

export const leaveSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  employeeName: z.string(),
  kind: leaveKindSchema,
  status: leaveStatusSchema,
  startDate: z.string(),
  endDate: z.string(),
  /** Working days requested. */
  days: z.number(),
  reason: z.string().nullable(),
  decidedBy: z.string().nullable(),
  decidedAt: z.string().nullable(),
  createdAt: z.string(),
})
export type Leave = z.infer<typeof leaveSchema>

export const leavesResponseSchema = z.object({
  items: z.array(leaveSchema),
})
export type LeavesResponse = z.infer<typeof leavesResponseSchema>

/* -------------------- inputs -------------------- */

export const employeeInputSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().optional(),
  jobTitle: z.string().min(1),
  department: z.string().min(1),
  employmentType: employmentTypeSchema,
  status: employeeStatusSchema,
  startDate: z.string(),
  managerName: z.string().nullable().optional(),
  notes: z.string().optional(),
})
export type EmployeeInput = z.infer<typeof employeeInputSchema>

export const leaveInputSchema = z.object({
  employeeId: z.string(),
  kind: leaveKindSchema,
  startDate: z.string(),
  endDate: z.string(),
  days: z.number().positive(),
  reason: z.string().optional(),
})
export type LeaveInput = z.infer<typeof leaveInputSchema>

/* -------------------- overview -------------------- */

export const hrmOverviewSchema = z.object({
  headcount: z.number(),
  presentToday: z.number(),
  onLeaveToday: z.number(),
  pendingLeaves: z.number(),
  newHiresThisMonth: z.number(),
})
export type HrmOverview = z.infer<typeof hrmOverviewSchema>

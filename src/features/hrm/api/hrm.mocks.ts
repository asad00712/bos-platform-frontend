import type {
  AttendanceEntry,
  AttendanceListResponse,
  Employee,
  EmployeeDetail,
  EmployeeInput,
  EmployeeListFilters,
  EmployeesListResponse,
  HrmOverview,
  Leave,
  LeaveInput,
  LeavesResponse,
} from './hrm.contracts'

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}
function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toISOString()
}
function todayAt(hour: number, minute = 0): string {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}
function todayDateOnly(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}
function round1(n: number): number {
  return Math.round(n * 10) / 10
}

let employees: Employee[] = [
  {
    id: 'emp-001',
    firstName: 'Ahmed',
    lastName: 'Khan',
    email: 'ahmed@acmedental.com',
    phone: '+1 415 555 1010',
    jobTitle: 'Lead Dentist',
    department: 'Clinical',
    employmentType: 'full_time',
    status: 'active',
    startDate: daysAgo(820),
    managerName: 'Owner',
    avatarUrl: null,
  },
  {
    id: 'emp-002',
    firstName: 'Maya',
    lastName: 'Patel',
    email: 'maya@acmedental.com',
    phone: '+1 415 555 1011',
    jobTitle: 'Office Manager',
    department: 'Operations',
    employmentType: 'full_time',
    status: 'active',
    startDate: daysAgo(540),
    managerName: 'Owner',
    avatarUrl: null,
  },
  {
    id: 'emp-003',
    firstName: 'Lina',
    lastName: 'Diaz',
    email: 'lina@acmedental.com',
    phone: '+1 415 555 1012',
    jobTitle: 'Hygienist',
    department: 'Clinical',
    employmentType: 'full_time',
    status: 'on_leave',
    startDate: daysAgo(310),
    managerName: 'Dr. Ahmed',
    avatarUrl: null,
  },
  {
    id: 'emp-004',
    firstName: 'Tomás',
    lastName: 'Hidalgo',
    email: 'tomas@acmedental.com',
    phone: '+1 415 555 1013',
    jobTitle: 'Front Desk',
    department: 'Operations',
    employmentType: 'part_time',
    status: 'active',
    startDate: daysAgo(120),
    managerName: 'Maya',
    avatarUrl: null,
  },
  {
    id: 'emp-005',
    firstName: 'Priya',
    lastName: 'Shah',
    email: 'priya@acmedental.com',
    phone: '+1 415 555 1014',
    jobTitle: 'Dental Assistant',
    department: 'Clinical',
    employmentType: 'full_time',
    status: 'active',
    startDate: daysAgo(60),
    managerName: 'Dr. Ahmed',
    avatarUrl: null,
  },
  {
    id: 'emp-006',
    firstName: 'Noah',
    lastName: 'Williams',
    email: 'noah@acmedental.com',
    phone: null,
    jobTitle: 'Billing Specialist',
    department: 'Finance',
    employmentType: 'contract',
    status: 'active',
    startDate: daysAgo(20),
    managerName: 'Maya',
    avatarUrl: null,
  },
  {
    id: 'emp-007',
    firstName: 'Aisha',
    lastName: 'Rahman',
    email: 'aisha@acmedental.com',
    phone: '+1 415 555 1015',
    jobTitle: 'Marketing Coordinator',
    department: 'Marketing',
    employmentType: 'full_time',
    status: 'inactive',
    startDate: daysAgo(900),
    managerName: 'Owner',
    avatarUrl: null,
  },
]

let attendance: AttendanceEntry[] = [
  {
    id: 'att-1',
    employeeId: 'emp-001',
    employeeName: 'Ahmed Khan',
    date: todayDateOnly(),
    clockInAt: todayAt(8, 5),
    clockOutAt: null,
    state: 'present',
    hoursWorked: round1((Date.now() - new Date(todayAt(8, 5)).getTime()) / 3_600_000),
    notes: null,
  },
  {
    id: 'att-2',
    employeeId: 'emp-002',
    employeeName: 'Maya Patel',
    date: todayDateOnly(),
    clockInAt: todayAt(8, 30),
    clockOutAt: null,
    state: 'present',
    hoursWorked: round1((Date.now() - new Date(todayAt(8, 30)).getTime()) / 3_600_000),
    notes: null,
  },
  {
    id: 'att-3',
    employeeId: 'emp-003',
    employeeName: 'Lina Diaz',
    date: todayDateOnly(),
    clockInAt: null,
    clockOutAt: null,
    state: 'on_leave',
    hoursWorked: 0,
    notes: 'Vacation through end of week.',
  },
  {
    id: 'att-4',
    employeeId: 'emp-004',
    employeeName: 'Tomás Hidalgo',
    date: todayDateOnly(),
    clockInAt: todayAt(9, 18),
    clockOutAt: null,
    state: 'late',
    hoursWorked: round1((Date.now() - new Date(todayAt(9, 18)).getTime()) / 3_600_000),
    notes: 'Bus delay.',
  },
  {
    id: 'att-5',
    employeeId: 'emp-005',
    employeeName: 'Priya Shah',
    date: todayDateOnly(),
    clockInAt: todayAt(7, 55),
    clockOutAt: null,
    state: 'present',
    hoursWorked: round1((Date.now() - new Date(todayAt(7, 55)).getTime()) / 3_600_000),
    notes: null,
  },
  {
    id: 'att-6',
    employeeId: 'emp-006',
    employeeName: 'Noah Williams',
    date: todayDateOnly(),
    clockInAt: null,
    clockOutAt: null,
    state: 'absent',
    hoursWorked: 0,
    notes: null,
  },
]

let leaves: Leave[] = [
  {
    id: 'lv-1',
    employeeId: 'emp-003',
    employeeName: 'Lina Diaz',
    kind: 'vacation',
    status: 'approved',
    startDate: daysAgo(2),
    endDate: daysFromNow(2),
    days: 5,
    reason: 'Family trip.',
    decidedBy: 'Dr. Ahmed',
    decidedAt: daysAgo(10),
    createdAt: daysAgo(14),
  },
  {
    id: 'lv-2',
    employeeId: 'emp-004',
    employeeName: 'Tomás Hidalgo',
    kind: 'sick',
    status: 'pending',
    startDate: daysFromNow(1),
    endDate: daysFromNow(2),
    days: 2,
    reason: 'Doctor appointment + recovery.',
    decidedBy: null,
    decidedAt: null,
    createdAt: daysAgo(0),
  },
  {
    id: 'lv-3',
    employeeId: 'emp-005',
    employeeName: 'Priya Shah',
    kind: 'personal',
    status: 'pending',
    startDate: daysFromNow(7),
    endDate: daysFromNow(8),
    days: 2,
    reason: 'Family event.',
    decidedBy: null,
    decidedAt: null,
    createdAt: daysAgo(1),
  },
  {
    id: 'lv-4',
    employeeId: 'emp-002',
    employeeName: 'Maya Patel',
    kind: 'vacation',
    status: 'approved',
    startDate: daysAgo(60),
    endDate: daysAgo(57),
    days: 4,
    reason: null,
    decidedBy: 'Owner',
    decidedAt: daysAgo(70),
    createdAt: daysAgo(72),
  },
]

export const hrmMocks = {
  listEmployees(filters: EmployeeListFilters): EmployeesListResponse {
    const q = filters.search?.trim().toLowerCase()
    const items = employees.filter((e) => {
      if (filters.status && e.status !== filters.status) return false
      if (filters.department && e.department !== filters.department) return false
      if (q) {
        const hay = `${e.firstName} ${e.lastName} ${e.email ?? ''} ${e.jobTitle} ${e.department}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    return { items, total: items.length }
  },

  getEmployee(id: string): EmployeeDetail | null {
    const e = employees.find((x) => x.id === id)
    if (!e) return null
    return {
      ...e,
      endDate: null,
      ptoBalanceDays: id === 'emp-003' ? 4 : 12,
      notes:
        id === 'emp-001' ? 'Lead clinician; carries on-call responsibility.' : null,
    }
  },

  createEmployee(input: EmployeeInput): EmployeeDetail {
    const id = `emp-${Date.now()}`
    const created: Employee = {
      id,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email && input.email.length > 0 ? input.email : null,
      phone: input.phone && input.phone.length > 0 ? input.phone : null,
      jobTitle: input.jobTitle,
      department: input.department,
      employmentType: input.employmentType,
      status: input.status,
      startDate: input.startDate,
      managerName: input.managerName ?? null,
      avatarUrl: null,
    }
    employees = [created, ...employees]
    return {
      ...created,
      endDate: null,
      ptoBalanceDays: 14,
      notes: input.notes ?? null,
    }
  },

  updateEmployee(id: string, patch: Partial<EmployeeInput>): EmployeeDetail | null {
    const idx = employees.findIndex((e) => e.id === id)
    if (idx < 0) return null
    const cur = employees[idx]
    const next: Employee = {
      ...cur,
      firstName: patch.firstName ?? cur.firstName,
      lastName: patch.lastName ?? cur.lastName,
      email:
        patch.email !== undefined ? (patch.email || null) : cur.email,
      phone:
        patch.phone !== undefined ? (patch.phone || null) : cur.phone,
      jobTitle: patch.jobTitle ?? cur.jobTitle,
      department: patch.department ?? cur.department,
      employmentType: patch.employmentType ?? cur.employmentType,
      status: patch.status ?? cur.status,
      startDate: patch.startDate ?? cur.startDate,
      managerName:
        patch.managerName !== undefined
          ? patch.managerName ?? null
          : cur.managerName,
    }
    employees[idx] = next
    return hrmMocks.getEmployee(id)
  },

  removeEmployee(id: string): boolean {
    const before = employees.length
    employees = employees.filter((e) => e.id !== id)
    return employees.length < before
  },

  todayAttendance(): AttendanceListResponse {
    return { items: [...attendance].sort((a, b) => a.employeeName.localeCompare(b.employeeName)) }
  },

  clockInForEmployee(employeeId: string, employeeName: string): AttendanceEntry {
    const existing = attendance.find(
      (e) => e.employeeId === employeeId && e.date === todayDateOnly(),
    )
    const now = new Date()
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0)
    if (existing) {
      const updated: AttendanceEntry = {
        ...existing,
        clockInAt: now.toISOString(),
        clockOutAt: null,
        state: isLate ? 'late' : 'present',
        hoursWorked: 0,
      }
      attendance = attendance.map((e) => (e.id === existing.id ? updated : e))
      return updated
    }
    const created: AttendanceEntry = {
      id: `att-${Date.now()}`,
      employeeId,
      employeeName,
      date: todayDateOnly(),
      clockInAt: now.toISOString(),
      clockOutAt: null,
      state: isLate ? 'late' : 'present',
      hoursWorked: 0,
      notes: null,
    }
    attendance = [...attendance, created]
    return created
  },

  clockOutForEmployee(employeeId: string): AttendanceEntry | null {
    const idx = attendance.findIndex(
      (e) => e.employeeId === employeeId && e.date === todayDateOnly(),
    )
    if (idx < 0) return null
    const cur = attendance[idx]
    if (!cur.clockInAt) return cur
    const now = new Date()
    const hours = round1(
      (now.getTime() - new Date(cur.clockInAt).getTime()) / 3_600_000,
    )
    const updated: AttendanceEntry = {
      ...cur,
      clockOutAt: now.toISOString(),
      hoursWorked: hours,
    }
    attendance[idx] = updated
    return updated
  },

  listLeaves(): LeavesResponse {
    return {
      items: [...leaves].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }
  },

  createLeave(input: LeaveInput): Leave {
    const emp = employees.find((e) => e.id === input.employeeId)
    if (!emp) throw new Error('Employee not found')
    const created: Leave = {
      id: `lv-${Date.now()}`,
      employeeId: input.employeeId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      kind: input.kind,
      status: 'pending',
      startDate: input.startDate,
      endDate: input.endDate,
      days: input.days,
      reason: input.reason ?? null,
      decidedBy: null,
      decidedAt: null,
      createdAt: new Date().toISOString(),
    }
    leaves = [created, ...leaves]
    return created
  },

  decideLeave(
    id: string,
    decision: 'approved' | 'rejected',
    decidedBy: string,
  ): Leave | null {
    const idx = leaves.findIndex((l) => l.id === id)
    if (idx < 0) return null
    const updated: Leave = {
      ...leaves[idx],
      status: decision,
      decidedBy,
      decidedAt: new Date().toISOString(),
    }
    leaves[idx] = updated
    return updated
  },

  cancelLeave(id: string): Leave | null {
    const idx = leaves.findIndex((l) => l.id === id)
    if (idx < 0) return null
    const updated: Leave = {
      ...leaves[idx],
      status: 'cancelled',
    }
    leaves[idx] = updated
    return updated
  },

  overview(): HrmOverview {
    const today = todayDateOnly()
    const presentToday = attendance.filter(
      (a) => a.date === today && (a.state === 'present' || a.state === 'late'),
    ).length
    const onLeaveToday = attendance.filter(
      (a) => a.date === today && a.state === 'on_leave',
    ).length
    const pendingLeaves = leaves.filter((l) => l.status === 'pending').length
    const since = Date.now() - 30 * 86_400_000
    const newHiresThisMonth = employees.filter(
      (e) => new Date(e.startDate).getTime() >= since,
    ).length
    return {
      headcount: employees.filter((e) => e.status !== 'terminated').length,
      presentToday,
      onLeaveToday,
      pendingLeaves,
      newHiresThisMonth,
    }
  },
}

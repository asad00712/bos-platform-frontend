import { Badge } from '@/shared/ui/badge'
import type {
  AttendanceState,
  EmployeeStatus,
  LeaveKind,
  LeaveStatus,
} from '../api/hrm.contracts'

const EMPLOYEE_VARIANT: Record<
  EmployeeStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  active: 'default',
  on_leave: 'secondary',
  inactive: 'outline',
  terminated: 'destructive',
}

const EMPLOYEE_LABEL: Record<EmployeeStatus, string> = {
  active: 'Active',
  on_leave: 'On leave',
  inactive: 'Inactive',
  terminated: 'Terminated',
}

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return <Badge variant={EMPLOYEE_VARIANT[status]}>{EMPLOYEE_LABEL[status]}</Badge>
}

const LEAVE_VARIANT: Record<
  LeaveStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
  cancelled: 'outline',
}

const LEAVE_LABEL: Record<LeaveStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  return <Badge variant={LEAVE_VARIANT[status]}>{LEAVE_LABEL[status]}</Badge>
}

const LEAVE_KIND_LABEL: Record<LeaveKind, string> = {
  vacation: 'Vacation',
  sick: 'Sick',
  personal: 'Personal',
  unpaid: 'Unpaid',
  bereavement: 'Bereavement',
}

export function LeaveKindBadge({ kind }: { kind: LeaveKind }) {
  return <Badge variant="outline">{LEAVE_KIND_LABEL[kind]}</Badge>
}

const ATTENDANCE_VARIANT: Record<
  AttendanceState,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  present: 'default',
  late: 'secondary',
  absent: 'destructive',
  on_leave: 'outline',
}

const ATTENDANCE_LABEL: Record<AttendanceState, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  on_leave: 'On leave',
}

export function AttendanceStateBadge({ state }: { state: AttendanceState }) {
  return <Badge variant={ATTENDANCE_VARIANT[state]}>{ATTENDANCE_LABEL[state]}</Badge>
}

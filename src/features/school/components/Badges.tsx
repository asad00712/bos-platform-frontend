import { Badge } from '@/shared/ui/badge'
import type {
  AttendanceState,
  ExamStatus,
  FeeStatus,
  StudentStatus,
} from '../api/school.contracts'

const STUDENT_STATUS_VARIANT: Record<
  StudentStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  enrolled: 'default',
  on_leave: 'secondary',
  graduated: 'outline',
  withdrawn: 'outline',
  suspended: 'destructive',
}

const STUDENT_STATUS_LABEL: Record<StudentStatus, string> = {
  enrolled: 'Enrolled',
  on_leave: 'On leave',
  graduated: 'Graduated',
  withdrawn: 'Withdrawn',
  suspended: 'Suspended',
}

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  return (
    <Badge variant={STUDENT_STATUS_VARIANT[status]}>
      {STUDENT_STATUS_LABEL[status]}
    </Badge>
  )
}

export const ATTENDANCE_STATE_TONE: Record<AttendanceState, string> = {
  present:
    'bg-emerald-500/15 text-emerald-700 border-emerald-500/40 dark:text-emerald-300',
  absent:
    'bg-rose-500/15 text-rose-700 border-rose-500/40 dark:text-rose-300',
  late:
    'bg-amber-500/15 text-amber-700 border-amber-500/40 dark:text-amber-300',
  excused:
    'bg-sky-500/15 text-sky-700 border-sky-500/40 dark:text-sky-300',
  sick:
    'bg-violet-500/15 text-violet-700 border-violet-500/40 dark:text-violet-300',
}

export const ATTENDANCE_STATE_LABEL: Record<AttendanceState, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  excused: 'Excused',
  sick: 'Sick',
}

export function AttendanceStateBadge({ state }: { state: AttendanceState }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${ATTENDANCE_STATE_TONE[state]}`}
    >
      {ATTENDANCE_STATE_LABEL[state]}
    </span>
  )
}

const EXAM_STATUS_VARIANT: Record<
  ExamStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  scheduled: 'outline',
  in_progress: 'secondary',
  graded: 'secondary',
  published: 'default',
  cancelled: 'destructive',
}

const EXAM_STATUS_LABEL: Record<ExamStatus, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In progress',
  graded: 'Graded',
  published: 'Published',
  cancelled: 'Cancelled',
}

export function ExamStatusBadge({ status }: { status: ExamStatus }) {
  return (
    <Badge variant={EXAM_STATUS_VARIANT[status]}>
      {EXAM_STATUS_LABEL[status]}
    </Badge>
  )
}

const FEE_STATUS_VARIANT: Record<
  FeeStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  paid: 'default',
  partial: 'secondary',
  unpaid: 'outline',
  waived: 'outline',
  overdue: 'destructive',
}

const FEE_STATUS_LABEL: Record<FeeStatus, string> = {
  paid: 'Paid',
  partial: 'Partial',
  unpaid: 'Unpaid',
  waived: 'Waived',
  overdue: 'Overdue',
}

export function FeeStatusBadge({ status }: { status: FeeStatus }) {
  return (
    <Badge variant={FEE_STATUS_VARIANT[status]}>
      {FEE_STATUS_LABEL[status]}
    </Badge>
  )
}

import { Navigate } from 'react-router'

export { StudentsListPage } from './pages/StudentsListPage'
export { StudentDetailPage } from './pages/StudentDetailPage'
export { ParentsPage } from './pages/ParentsPage'
export { ClassesListPage } from './pages/ClassesListPage'
export { SubjectsPage } from './pages/SubjectsPage'
export { TeachersListPage } from './pages/TeachersListPage'
export { TimetablePage } from './pages/TimetablePage'
export { TakeAttendancePage } from './pages/TakeAttendancePage'
export { AttendanceOverviewPage } from './pages/AttendanceOverviewPage'
export { ExamsListPage } from './pages/ExamsListPage'
export { ExamDetailPage } from './pages/ExamDetailPage'
export { GradebookPage } from './pages/GradebookPage'
export { ReportCardsPage } from './pages/ReportCardsPage'
export { FeesOverviewPage } from './pages/FeesOverviewPage'
export { FeeStructuresPage } from './pages/FeeStructuresPage'
export { ScholarshipsPage } from './pages/ScholarshipsPage'
export { TransportPage } from './pages/TransportPage'
export { LibraryPage } from './pages/LibraryPage'
export { HostelPage } from './pages/HostelPage'
export { AnnouncementsPage } from './pages/AnnouncementsPage'
export { AcademicCalendarPage } from './pages/AcademicCalendarPage'
export { AuditOverviewPage as SchoolAuditOverviewPage } from './pages/AuditOverviewPage'
export { NewStudentDialog } from './components/NewStudentDialog'

export function SchoolIndexRedirect() {
  return <Navigate to="/app/school/students" replace />
}

export type {
  AnnouncementAudience,
  AttendanceState,
  ExamStatus,
  ExamType,
  FeeFrequency,
  FeeStatus,
  Student,
  StudentDetail,
  StudentStatus,
  Teacher,
} from './api/school.contracts'

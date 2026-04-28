import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'

import {
  announcementsResponseSchema,
  attendanceRosterResponseSchema,
  attendanceSummarySchema,
  calendarEventsResponseSchema,
  classesResponseSchema,
  examDetailSchema,
  examsResponseSchema,
  feeStructuresResponseSchema,
  gradebookResponseSchema,
  hostelResponseSchema,
  libraryBooksResponseSchema,
  libraryIssuancesResponseSchema,
  parentsResponseSchema,
  reportCardsResponseSchema,
  scholarshipsResponseSchema,
  schoolOverviewSchema,
  studentDetailSchema,
  studentFeesResponseSchema,
  studentsResponseSchema,
  subjectsResponseSchema,
  teachersResponseSchema,
  timetableSchema,
  transportRoutesResponseSchema,
  type AnnouncementsResponse,
  type AttendanceRosterResponse,
  type AttendanceState,
  type AttendanceSummary,
  type CalendarEventsResponse,
  type ClassesResponse,
  type ExamDetail,
  type ExamsResponse,
  type FeeStructuresResponse,
  type GradebookResponse,
  type HostelResponse,
  type LibraryBooksResponse,
  type LibraryIssuancesResponse,
  type ParentsResponse,
  type ReportCardsResponse,
  type ScholarshipsResponse,
  type SchoolOverview,
  type StudentDetail,
  type StudentFeesResponse,
  type StudentInput,
  type StudentListFilters,
  type StudentsResponse,
  type SubjectsResponse,
  type TeachersResponse,
  type Timetable,
  type TransportRoutesResponse,
} from './school.contracts'
import { schoolMocks } from './school.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export const schoolApi = {
  /* students */
  async listStudents(filters: StudentListFilters): Promise<StudentsResponse> {
    if (env.useMocks) {
      await delay()
      return studentsResponseSchema.parse(schoolMocks.listStudents(filters))
    }
    const qs = new URLSearchParams()
    if (filters.search) qs.set('search', filters.search)
    if (filters.classId) qs.set('classId', filters.classId)
    if (filters.sectionId) qs.set('sectionId', filters.sectionId)
    if (filters.status) qs.set('status', filters.status)
    const data = await apiRequest<unknown>(`/school/students?${qs.toString()}`)
    return studentsResponseSchema.parse(data)
  },

  async getStudent(id: string): Promise<StudentDetail> {
    if (env.useMocks) {
      await delay()
      const result = schoolMocks.getStudent(id)
      if (!result) throw new Error('Student not found')
      return studentDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/school/students/${id}`)
    return studentDetailSchema.parse(data)
  },

  async createStudent(input: StudentInput): Promise<StudentDetail> {
    if (env.useMocks) {
      await delay()
      return studentDetailSchema.parse(schoolMocks.createStudent(input))
    }
    const data = await apiRequest<unknown>('/school/students', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return studentDetailSchema.parse(data)
  },

  /* parents */
  async listParents(): Promise<ParentsResponse> {
    if (env.useMocks) {
      await delay()
      return parentsResponseSchema.parse(schoolMocks.listParents())
    }
    const data = await apiRequest<unknown>('/school/parents')
    return parentsResponseSchema.parse(data)
  },

  /* classes / subjects / teachers */
  async classes(): Promise<ClassesResponse> {
    if (env.useMocks) {
      await delay()
      return classesResponseSchema.parse(schoolMocks.classes())
    }
    const data = await apiRequest<unknown>('/school/classes')
    return classesResponseSchema.parse(data)
  },

  async subjects(): Promise<SubjectsResponse> {
    if (env.useMocks) {
      await delay()
      return subjectsResponseSchema.parse(schoolMocks.subjects())
    }
    const data = await apiRequest<unknown>('/school/subjects')
    return subjectsResponseSchema.parse(data)
  },

  async teachers(): Promise<TeachersResponse> {
    if (env.useMocks) {
      await delay()
      return teachersResponseSchema.parse(schoolMocks.teachers())
    }
    const data = await apiRequest<unknown>('/school/teachers')
    return teachersResponseSchema.parse(data)
  },

  /* timetable */
  async timetable(): Promise<Timetable> {
    if (env.useMocks) {
      await delay()
      return timetableSchema.parse(schoolMocks.timetable())
    }
    const data = await apiRequest<unknown>('/school/timetable')
    return timetableSchema.parse(data)
  },

  /* attendance */
  async attendanceRoster(sectionId: string): Promise<AttendanceRosterResponse> {
    if (env.useMocks) {
      await delay()
      return attendanceRosterResponseSchema.parse(
        schoolMocks.attendanceRoster(sectionId),
      )
    }
    const data = await apiRequest<unknown>(
      `/school/attendance/roster?sectionId=${encodeURIComponent(sectionId)}`,
    )
    return attendanceRosterResponseSchema.parse(data)
  },

  async markAttendance(
    sectionId: string,
    studentId: string,
    state: AttendanceState,
    notes: string | null,
  ): Promise<AttendanceRosterResponse> {
    if (env.useMocks) {
      await delay()
      return attendanceRosterResponseSchema.parse(
        schoolMocks.markAttendance(sectionId, studentId, state, notes),
      )
    }
    const data = await apiRequest<unknown>('/school/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ sectionId, studentId, state, notes }),
    })
    return attendanceRosterResponseSchema.parse(data)
  },

  async attendanceSummary(): Promise<AttendanceSummary> {
    if (env.useMocks) {
      await delay()
      return attendanceSummarySchema.parse(schoolMocks.attendanceSummary())
    }
    const data = await apiRequest<unknown>('/school/attendance/summary')
    return attendanceSummarySchema.parse(data)
  },

  /* exams + grading */
  async exams(): Promise<ExamsResponse> {
    if (env.useMocks) {
      await delay()
      return examsResponseSchema.parse(schoolMocks.exams())
    }
    const data = await apiRequest<unknown>('/school/exams')
    return examsResponseSchema.parse(data)
  },

  async exam(id: string): Promise<ExamDetail> {
    if (env.useMocks) {
      await delay()
      const result = schoolMocks.exam(id)
      if (!result) throw new Error('Exam not found')
      return examDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/school/exams/${id}`)
    return examDetailSchema.parse(data)
  },

  async gradebook(
    examId: string,
    paperId: string,
    sectionId: string,
  ): Promise<GradebookResponse> {
    if (env.useMocks) {
      await delay()
      const result = schoolMocks.gradebook(examId, paperId, sectionId)
      if (!result) throw new Error('Gradebook unavailable')
      return gradebookResponseSchema.parse(result)
    }
    const qs = new URLSearchParams({ paperId, sectionId })
    const data = await apiRequest<unknown>(
      `/school/exams/${examId}/gradebook?${qs.toString()}`,
    )
    return gradebookResponseSchema.parse(data)
  },

  async reportCards(termName?: string): Promise<ReportCardsResponse> {
    if (env.useMocks) {
      await delay()
      return reportCardsResponseSchema.parse(schoolMocks.reportCards(termName))
    }
    const qs = new URLSearchParams()
    if (termName) qs.set('term', termName)
    const data = await apiRequest<unknown>(
      `/school/report-cards?${qs.toString()}`,
    )
    return reportCardsResponseSchema.parse(data)
  },

  /* fees */
  async feeStructures(): Promise<FeeStructuresResponse> {
    if (env.useMocks) {
      await delay()
      return feeStructuresResponseSchema.parse(schoolMocks.feeStructures())
    }
    const data = await apiRequest<unknown>('/school/fees/structures')
    return feeStructuresResponseSchema.parse(data)
  },

  async studentFees(): Promise<StudentFeesResponse> {
    if (env.useMocks) {
      await delay()
      return studentFeesResponseSchema.parse(schoolMocks.studentFees())
    }
    const data = await apiRequest<unknown>('/school/fees/student-rows')
    return studentFeesResponseSchema.parse(data)
  },

  async collectFee(id: string): Promise<StudentFeesResponse> {
    if (env.useMocks) {
      await delay()
      return studentFeesResponseSchema.parse(schoolMocks.collectFee(id))
    }
    const data = await apiRequest<unknown>(`/school/fees/${id}/collect`, {
      method: 'POST',
    })
    return studentFeesResponseSchema.parse(data)
  },

  async scholarships(): Promise<ScholarshipsResponse> {
    if (env.useMocks) {
      await delay()
      return scholarshipsResponseSchema.parse(schoolMocks.scholarships())
    }
    const data = await apiRequest<unknown>('/school/scholarships')
    return scholarshipsResponseSchema.parse(data)
  },

  /* transport */
  async transportRoutes(): Promise<TransportRoutesResponse> {
    if (env.useMocks) {
      await delay()
      return transportRoutesResponseSchema.parse(schoolMocks.transportRoutes())
    }
    const data = await apiRequest<unknown>('/school/transport/routes')
    return transportRoutesResponseSchema.parse(data)
  },

  /* library */
  async libraryBooks(): Promise<LibraryBooksResponse> {
    if (env.useMocks) {
      await delay()
      return libraryBooksResponseSchema.parse(schoolMocks.libraryBooks())
    }
    const data = await apiRequest<unknown>('/school/library/books')
    return libraryBooksResponseSchema.parse(data)
  },

  async libraryIssuances(): Promise<LibraryIssuancesResponse> {
    if (env.useMocks) {
      await delay()
      return libraryIssuancesResponseSchema.parse(schoolMocks.libraryIssuances())
    }
    const data = await apiRequest<unknown>('/school/library/issuances')
    return libraryIssuancesResponseSchema.parse(data)
  },

  /* hostel */
  async hostel(): Promise<HostelResponse> {
    if (env.useMocks) {
      await delay()
      return hostelResponseSchema.parse(schoolMocks.hostel())
    }
    const data = await apiRequest<unknown>('/school/hostel')
    return hostelResponseSchema.parse(data)
  },

  /* announcements + calendar */
  async announcements(): Promise<AnnouncementsResponse> {
    if (env.useMocks) {
      await delay()
      return announcementsResponseSchema.parse(schoolMocks.announcements())
    }
    const data = await apiRequest<unknown>('/school/announcements')
    return announcementsResponseSchema.parse(data)
  },

  async calendar(): Promise<CalendarEventsResponse> {
    if (env.useMocks) {
      await delay()
      return calendarEventsResponseSchema.parse(schoolMocks.calendar())
    }
    const data = await apiRequest<unknown>('/school/calendar')
    return calendarEventsResponseSchema.parse(data)
  },

  /* overview */
  async overview(): Promise<SchoolOverview> {
    if (env.useMocks) {
      await delay()
      return schoolOverviewSchema.parse(schoolMocks.overview())
    }
    const data = await apiRequest<unknown>('/school/overview')
    return schoolOverviewSchema.parse(data)
  },
}

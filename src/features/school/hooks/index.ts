import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { schoolApi } from '../api/school.api'
import type {
  AttendanceState,
  StudentInput,
  StudentListFilters,
} from '../api/school.contracts'

export const schoolKeys = {
  students: (tenantId: string, filters: StudentListFilters) =>
    ['school.students', tenantId, filters] as const,
  student: (tenantId: string, id: string) =>
    ['school.student', tenantId, id] as const,
  parents: (tenantId: string) => ['school.parents', tenantId] as const,
  classes: (tenantId: string) => ['school.classes', tenantId] as const,
  subjects: (tenantId: string) => ['school.subjects', tenantId] as const,
  teachers: (tenantId: string) => ['school.teachers', tenantId] as const,
  timetable: (tenantId: string) => ['school.timetable', tenantId] as const,
  attendanceRoster: (tenantId: string, sectionId: string) =>
    ['school.attendance.roster', tenantId, sectionId] as const,
  attendanceSummary: (tenantId: string) =>
    ['school.attendance.summary', tenantId] as const,
  exams: (tenantId: string) => ['school.exams', tenantId] as const,
  exam: (tenantId: string, id: string) => ['school.exam', tenantId, id] as const,
  gradebook: (
    tenantId: string,
    examId: string,
    paperId: string,
    sectionId: string,
  ) => ['school.gradebook', tenantId, examId, paperId, sectionId] as const,
  reportCards: (tenantId: string, term?: string) =>
    ['school.reportCards', tenantId, term ?? 'current'] as const,
  feeStructures: (tenantId: string) =>
    ['school.feeStructures', tenantId] as const,
  studentFees: (tenantId: string) => ['school.studentFees', tenantId] as const,
  scholarships: (tenantId: string) => ['school.scholarships', tenantId] as const,
  transportRoutes: (tenantId: string) =>
    ['school.transportRoutes', tenantId] as const,
  libraryBooks: (tenantId: string) =>
    ['school.libraryBooks', tenantId] as const,
  libraryIssuances: (tenantId: string) =>
    ['school.libraryIssuances', tenantId] as const,
  hostel: (tenantId: string) => ['school.hostel', tenantId] as const,
  announcements: (tenantId: string) =>
    ['school.announcements', tenantId] as const,
  calendar: (tenantId: string) => ['school.calendar', tenantId] as const,
  overview: (tenantId: string) => ['school.overview', tenantId] as const,
}

/* students */
export function useStudentList(tenantId: string, filters: StudentListFilters) {
  return useQuery({
    queryKey: schoolKeys.students(tenantId, filters),
    queryFn: () => schoolApi.listStudents(filters),
    staleTime: 30_000,
  })
}

export function useStudent(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: schoolKeys.student(tenantId, id ?? ''),
    queryFn: () => schoolApi.getStudent(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

export function useCreateStudent(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: StudentInput) => schoolApi.createStudent(input),
    onSuccess: (created) => {
      void qc.invalidateQueries({ queryKey: ['school.students', tenantId] })
      void qc.invalidateQueries({ queryKey: schoolKeys.overview(tenantId) })
      toast.success('Student admitted', {
        description: `${created.firstName} ${created.lastName} — Roll ${created.rollNumber}`,
      })
    },
    onError: (error: Error) => {
      toast.error('Could not admit student', { description: error.message })
    },
  })
}

/* parents / org */
export function useParentsList(tenantId: string) {
  return useQuery({
    queryKey: schoolKeys.parents(tenantId),
    queryFn: schoolApi.listParents,
    staleTime: 60_000,
  })
}

export function useClassesList(tenantId: string) {
  return useQuery({
    queryKey: schoolKeys.classes(tenantId),
    queryFn: schoolApi.classes,
    staleTime: 5 * 60_000,
  })
}

export function useSubjectsList(tenantId: string) {
  return useQuery({
    queryKey: schoolKeys.subjects(tenantId),
    queryFn: schoolApi.subjects,
    staleTime: 5 * 60_000,
  })
}

export function useTeachersList(tenantId: string) {
  return useQuery({
    queryKey: schoolKeys.teachers(tenantId),
    queryFn: schoolApi.teachers,
    staleTime: 60_000,
  })
}

/* timetable */
export function useTimetable(tenantId: string) {
  return useQuery({
    queryKey: schoolKeys.timetable(tenantId),
    queryFn: schoolApi.timetable,
    staleTime: 5 * 60_000,
  })
}

/* attendance */
export function useAttendanceRoster(
  tenantId: string,
  sectionId: string | undefined,
) {
  return useQuery({
    queryKey: schoolKeys.attendanceRoster(tenantId, sectionId ?? ''),
    queryFn: () => schoolApi.attendanceRoster(sectionId!),
    enabled: Boolean(sectionId),
    staleTime: 10_000,
  })
}

export function useAttendanceSummary(tenantId: string) {
  return useQuery({
    queryKey: schoolKeys.attendanceSummary(tenantId),
    queryFn: schoolApi.attendanceSummary,
    staleTime: 10_000,
  })
}

export function useMarkAttendance(tenantId: string, sectionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      studentId,
      state,
      notes,
    }: {
      studentId: string
      state: AttendanceState
      notes?: string | null
    }) => schoolApi.markAttendance(sectionId, studentId, state, notes ?? null),
    onSuccess: (data) => {
      qc.setQueryData(
        schoolKeys.attendanceRoster(tenantId, sectionId),
        data,
      )
      void qc.invalidateQueries({
        queryKey: schoolKeys.attendanceSummary(tenantId),
      })
    },
    onError: (error: Error) => {
      toast.error('Could not save', { description: error.message })
    },
  })
}

/* exams + grading */
export function useExamsList(tenantId: string) {
  return useQuery({
    queryKey: schoolKeys.exams(tenantId),
    queryFn: schoolApi.exams,
    staleTime: 60_000,
  })
}

export function useExam(tenantId: string, id: string | undefined) {
  return useQuery({
    queryKey: schoolKeys.exam(tenantId, id ?? ''),
    queryFn: () => schoolApi.exam(id!),
    enabled: Boolean(id),
    staleTime: 60_000,
  })
}

export function useGradebook(
  tenantId: string,
  examId: string | undefined,
  paperId: string | undefined,
  sectionId: string | undefined,
) {
  return useQuery({
    queryKey: schoolKeys.gradebook(
      tenantId,
      examId ?? '',
      paperId ?? '',
      sectionId ?? '',
    ),
    queryFn: () => schoolApi.gradebook(examId!, paperId!, sectionId!),
    enabled: Boolean(examId && paperId && sectionId),
    staleTime: 30_000,
  })
}

export function useReportCards(tenantId: string, termName?: string) {
  return useQuery({
    queryKey: schoolKeys.reportCards(tenantId, termName),
    queryFn: () => schoolApi.reportCards(termName),
    staleTime: 60_000,
  })
}

/* fees */
export function useFeeStructures(tenantId: string) {
  return useQuery({
    queryKey: schoolKeys.feeStructures(tenantId),
    queryFn: schoolApi.feeStructures,
    staleTime: 5 * 60_000,
  })
}

export function useStudentFees(tenantId: string) {
  return useQuery({
    queryKey: schoolKeys.studentFees(tenantId),
    queryFn: schoolApi.studentFees,
    staleTime: 30_000,
  })
}

export function useCollectFee(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => schoolApi.collectFee(id),
    onSuccess: (data) => {
      qc.setQueryData(schoolKeys.studentFees(tenantId), data)
      void qc.invalidateQueries({ queryKey: schoolKeys.overview(tenantId) })
      toast.success('Fee collected', {
        description: 'Payment recorded against the student.',
      })
    },
    onError: (error: Error) => {
      toast.error('Could not record payment', { description: error.message })
    },
  })
}

export function useScholarshipsList(tenantId: string) {
  return useQuery({
    queryKey: schoolKeys.scholarships(tenantId),
    queryFn: schoolApi.scholarships,
    staleTime: 60_000,
  })
}

/* transport */
export function useTransportRoutes(tenantId: string) {
  return useQuery({
    queryKey: schoolKeys.transportRoutes(tenantId),
    queryFn: schoolApi.transportRoutes,
    staleTime: 5 * 60_000,
  })
}

/* library */
export function useLibraryBooks(tenantId: string) {
  return useQuery({
    queryKey: schoolKeys.libraryBooks(tenantId),
    queryFn: schoolApi.libraryBooks,
    staleTime: 60_000,
  })
}

export function useLibraryIssuances(tenantId: string) {
  return useQuery({
    queryKey: schoolKeys.libraryIssuances(tenantId),
    queryFn: schoolApi.libraryIssuances,
    staleTime: 60_000,
  })
}

/* hostel */
export function useHostel(tenantId: string) {
  return useQuery({
    queryKey: schoolKeys.hostel(tenantId),
    queryFn: schoolApi.hostel,
    staleTime: 60_000,
  })
}

/* announcements + calendar */
export function useAnnouncementsList(tenantId: string) {
  return useQuery({
    queryKey: schoolKeys.announcements(tenantId),
    queryFn: schoolApi.announcements,
    staleTime: 60_000,
  })
}

export function useAcademicCalendar(tenantId: string) {
  return useQuery({
    queryKey: schoolKeys.calendar(tenantId),
    queryFn: schoolApi.calendar,
    staleTime: 5 * 60_000,
  })
}

/* overview */
export function useSchoolOverview(tenantId: string) {
  return useQuery({
    queryKey: schoolKeys.overview(tenantId),
    queryFn: schoolApi.overview,
    staleTime: 30_000,
  })
}

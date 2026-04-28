import { z } from 'zod'

/* ==================== enums ==================== */

export const studentStatusSchema = z.enum([
  'enrolled',
  'on_leave',
  'graduated',
  'withdrawn',
  'suspended',
])
export type StudentStatus = z.infer<typeof studentStatusSchema>

export const attendanceStateSchema = z.enum([
  'present',
  'absent',
  'late',
  'excused',
  'sick',
])
export type AttendanceState = z.infer<typeof attendanceStateSchema>

export const examTypeSchema = z.enum([
  'unit_test',
  'mid_term',
  'final',
  'practical',
  'oral',
])
export type ExamType = z.infer<typeof examTypeSchema>

export const examStatusSchema = z.enum([
  'scheduled',
  'in_progress',
  'graded',
  'published',
  'cancelled',
])
export type ExamStatus = z.infer<typeof examStatusSchema>

export const feeStatusSchema = z.enum([
  'unpaid',
  'partial',
  'paid',
  'waived',
  'overdue',
])
export type FeeStatus = z.infer<typeof feeStatusSchema>

export const feeFrequencySchema = z.enum([
  'one_time',
  'monthly',
  'quarterly',
  'termly',
  'annual',
])
export type FeeFrequency = z.infer<typeof feeFrequencySchema>

export const announcementAudienceSchema = z.enum([
  'school',
  'class',
  'staff',
  'parents',
])
export type AnnouncementAudience = z.infer<typeof announcementAudienceSchema>

/* ==================== students + parents ==================== */

export const parentSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  relationship: z.enum(['father', 'mother', 'guardian', 'other']),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  primary: z.boolean(),
})
export type Parent = z.infer<typeof parentSchema>

export const studentSchema = z.object({
  id: z.string(),
  admissionNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string(),
  gender: z.enum(['male', 'female', 'other']),
  status: studentStatusSchema,
  classId: z.string(),
  className: z.string(),
  sectionId: z.string(),
  sectionName: z.string(),
  rollNumber: z.number(),
  homeroomTeacher: z.string().nullable(),
  primaryParentName: z.string(),
  primaryParentPhone: z.string().nullable(),
  email: z.string().email().nullable(),
  attendanceRate: z.number(),
  outstandingFees: z.number(),
  currency: z.string(),
  enrolledAt: z.string(),
  avatarUrl: z.string().nullable(),
})
export type Student = z.infer<typeof studentSchema>

export const studentDetailSchema = studentSchema.extend({
  bloodGroup: z.string().nullable(),
  allergies: z.array(z.string()),
  medicalNotes: z.string().nullable(),
  address: z.string().nullable(),
  emergencyContact: z.string().nullable(),
  parents: z.array(parentSchema),
  hostelRoom: z.string().nullable(),
  transportRouteId: z.string().nullable(),
  transportRouteName: z.string().nullable(),
  notes: z.string().nullable(),
})
export type StudentDetail = z.infer<typeof studentDetailSchema>

export const studentListFiltersSchema = z.object({
  search: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  status: studentStatusSchema.optional(),
})
export type StudentListFilters = z.infer<typeof studentListFiltersSchema>

export const studentsResponseSchema = z.object({
  items: z.array(studentSchema),
  total: z.number(),
})
export type StudentsResponse = z.infer<typeof studentsResponseSchema>

export const studentInputSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string(),
  gender: z.enum(['male', 'female', 'other']),
  classId: z.string().min(1),
  sectionId: z.string().min(1),
  rollNumber: z.number().positive(),
  primaryParentName: z.string().min(1),
  primaryParentPhone: z.string().optional(),
  primaryParentEmail: z.string().email().or(z.literal('')).optional(),
  email: z.string().email().or(z.literal('')).optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})
export type StudentInput = z.infer<typeof studentInputSchema>

export const parentsResponseSchema = z.object({
  items: z.array(
    parentSchema.extend({
      childCount: z.number(),
      childrenNames: z.array(z.string()),
    }),
  ),
})
export type ParentsResponse = z.infer<typeof parentsResponseSchema>

/* ==================== classes / sections / subjects ==================== */

export const classSectionSchema = z.object({
  id: z.string(),
  classId: z.string(),
  className: z.string(),
  sectionName: z.string(),
  capacity: z.number(),
  enrolled: z.number(),
  homeroomTeacher: z.string().nullable(),
  roomName: z.string().nullable(),
})
export type ClassSection = z.infer<typeof classSectionSchema>

export const classSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Grade level number, e.g. 1 = grade 1, 11 = grade 11. */
  level: z.number(),
  sectionCount: z.number(),
  totalStudents: z.number(),
  sections: z.array(classSectionSchema),
})
export type SchoolClass = z.infer<typeof classSchema>

export const classesResponseSchema = z.object({
  items: z.array(classSchema),
})
export type ClassesResponse = z.infer<typeof classesResponseSchema>

export const subjectSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  category: z.enum(['core', 'language', 'science', 'arts', 'sports', 'elective']),
  /** Number of weekly periods. */
  weeklyPeriods: z.number(),
  classCount: z.number(),
  teacherCount: z.number(),
})
export type Subject = z.infer<typeof subjectSchema>

export const subjectsResponseSchema = z.object({
  items: z.array(subjectSchema),
})
export type SubjectsResponse = z.infer<typeof subjectsResponseSchema>

/* ==================== teachers ==================== */

export const teacherSchema = z.object({
  id: z.string(),
  employeeNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  qualification: z.string(),
  subjects: z.array(z.string()),
  classesAssigned: z.array(z.string()),
  isHomeroom: z.boolean(),
  joinedAt: z.string(),
})
export type Teacher = z.infer<typeof teacherSchema>

export const teachersResponseSchema = z.object({
  items: z.array(teacherSchema),
})
export type TeachersResponse = z.infer<typeof teachersResponseSchema>

/* ==================== timetable ==================== */

export const periodSchema = z.object({
  /** 1..N period ordinal in the day. */
  number: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  /** True for "Break" / "Lunch" rows. */
  isBreak: z.boolean().default(false),
  breakLabel: z.string().nullable().optional(),
})
export type Period = z.infer<typeof periodSchema>

export const timetableEntrySchema = z.object({
  id: z.string(),
  /** 0=Mon, 1=Tue, …, 5=Sat. */
  day: z.number(),
  period: z.number(),
  classId: z.string(),
  className: z.string(),
  sectionId: z.string(),
  sectionName: z.string(),
  subjectId: z.string(),
  subjectName: z.string(),
  teacherId: z.string(),
  teacherName: z.string(),
  roomName: z.string().nullable(),
})
export type TimetableEntry = z.infer<typeof timetableEntrySchema>

export const timetableSchema = z.object({
  periods: z.array(periodSchema),
  entries: z.array(timetableEntrySchema),
})
export type Timetable = z.infer<typeof timetableSchema>

/* ==================== attendance ==================== */

export const attendanceRecordSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  rollNumber: z.number(),
  date: z.string(),
  state: attendanceStateSchema,
  notes: z.string().nullable(),
})
export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>

export const attendanceRosterResponseSchema = z.object({
  classId: z.string(),
  className: z.string(),
  sectionName: z.string(),
  date: z.string(),
  records: z.array(attendanceRecordSchema),
})
export type AttendanceRosterResponse = z.infer<typeof attendanceRosterResponseSchema>

export const attendanceSummarySchema = z.object({
  date: z.string(),
  totalStudents: z.number(),
  present: z.number(),
  absent: z.number(),
  late: z.number(),
  excused: z.number(),
  byClass: z.array(
    z.object({
      classId: z.string(),
      className: z.string(),
      sectionName: z.string(),
      present: z.number(),
      absent: z.number(),
      attendanceRate: z.number(),
    }),
  ),
})
export type AttendanceSummary = z.infer<typeof attendanceSummarySchema>

export const markAttendanceInputSchema = z.object({
  studentId: z.string(),
  state: attendanceStateSchema,
  notes: z.string().optional(),
})
export type MarkAttendanceInput = z.infer<typeof markAttendanceInputSchema>

/* ==================== exams + marks ==================== */

export const examSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: examTypeSchema,
  status: examStatusSchema,
  termName: z.string(),
  classIds: z.array(z.string()),
  startDate: z.string(),
  endDate: z.string(),
  paperCount: z.number(),
})
export type Exam = z.infer<typeof examSchema>

export const examPaperSchema = z.object({
  id: z.string(),
  examId: z.string(),
  subjectId: z.string(),
  subjectName: z.string(),
  date: z.string(),
  startTime: z.string(),
  durationMinutes: z.number(),
  maxMarks: z.number(),
  passingMarks: z.number(),
})
export type ExamPaper = z.infer<typeof examPaperSchema>

export const examDetailSchema = examSchema.extend({
  papers: z.array(examPaperSchema),
})
export type ExamDetail = z.infer<typeof examDetailSchema>

export const examsResponseSchema = z.object({
  items: z.array(examSchema),
})
export type ExamsResponse = z.infer<typeof examsResponseSchema>

export const markEntrySchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  rollNumber: z.number(),
  marks: z.number(),
  maxMarks: z.number(),
  grade: z.string(),
})
export type MarkEntry = z.infer<typeof markEntrySchema>

export const gradebookResponseSchema = z.object({
  examId: z.string(),
  examName: z.string(),
  paperId: z.string(),
  subjectName: z.string(),
  classId: z.string(),
  className: z.string(),
  sectionName: z.string(),
  maxMarks: z.number(),
  passingMarks: z.number(),
  rows: z.array(markEntrySchema),
})
export type GradebookResponse = z.infer<typeof gradebookResponseSchema>

export const reportCardSubjectSchema = z.object({
  subjectName: z.string(),
  marks: z.number(),
  maxMarks: z.number(),
  grade: z.string(),
  remarks: z.string().nullable(),
})

export const reportCardSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  className: z.string(),
  sectionName: z.string(),
  termName: z.string(),
  totalMarks: z.number(),
  totalMaxMarks: z.number(),
  percentage: z.number(),
  overallGrade: z.string(),
  rank: z.number().nullable(),
  classSize: z.number(),
  attendanceRate: z.number(),
  conduct: z.string(),
  subjects: z.array(reportCardSubjectSchema),
  homeroomRemarks: z.string().nullable(),
})
export type ReportCard = z.infer<typeof reportCardSchema>

export const reportCardsResponseSchema = z.object({
  items: z.array(reportCardSchema),
})
export type ReportCardsResponse = z.infer<typeof reportCardsResponseSchema>

/* ==================== fees ==================== */

export const feeStructureSchema = z.object({
  id: z.string(),
  name: z.string(),
  classId: z.string().nullable(),
  className: z.string().nullable(),
  amount: z.number(),
  frequency: feeFrequencySchema,
  currency: z.string(),
  /** Late-fee amount applied per occurrence after the due date. */
  lateFee: z.number(),
  dueDay: z.number().nullable(),
  studentsAssigned: z.number(),
})
export type FeeStructure = z.infer<typeof feeStructureSchema>

export const feeStructuresResponseSchema = z.object({
  items: z.array(feeStructureSchema),
})
export type FeeStructuresResponse = z.infer<typeof feeStructuresResponseSchema>

export const studentFeeRowSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  className: z.string(),
  sectionName: z.string(),
  feeStructureName: z.string(),
  termName: z.string(),
  amount: z.number(),
  paid: z.number(),
  outstanding: z.number(),
  dueDate: z.string(),
  status: feeStatusSchema,
  currency: z.string(),
})
export type StudentFeeRow = z.infer<typeof studentFeeRowSchema>

export const studentFeesResponseSchema = z.object({
  items: z.array(studentFeeRowSchema),
  totals: z.object({
    expected: z.number(),
    collected: z.number(),
    outstanding: z.number(),
    overdue: z.number(),
    currency: z.string(),
  }),
})
export type StudentFeesResponse = z.infer<typeof studentFeesResponseSchema>

export const scholarshipSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  scholarshipName: z.string(),
  type: z.enum(['merit', 'need', 'sports', 'staff_child']),
  /** Either a percent (0..100) or a flat amount. */
  percent: z.number().nullable(),
  amount: z.number().nullable(),
  termName: z.string(),
  status: z.enum(['active', 'expired', 'revoked']),
})
export type Scholarship = z.infer<typeof scholarshipSchema>

export const scholarshipsResponseSchema = z.object({
  items: z.array(scholarshipSchema),
})
export type ScholarshipsResponse = z.infer<typeof scholarshipsResponseSchema>

/* ==================== transport ==================== */

export const transportRouteSchema = z.object({
  id: z.string(),
  name: z.string(),
  vehicleNumber: z.string(),
  driverName: z.string(),
  driverPhone: z.string().nullable(),
  capacity: z.number(),
  studentsAssigned: z.number(),
  /** Sequential stop list along the route. */
  stops: z.array(
    z.object({
      name: z.string(),
      morningPickup: z.string(),
      afternoonDrop: z.string(),
    }),
  ),
})
export type TransportRoute = z.infer<typeof transportRouteSchema>

export const transportRoutesResponseSchema = z.object({
  items: z.array(transportRouteSchema),
})
export type TransportRoutesResponse = z.infer<typeof transportRoutesResponseSchema>

/* ==================== library ==================== */

export const libraryBookSchema = z.object({
  id: z.string(),
  isbn: z.string().nullable(),
  title: z.string(),
  author: z.string(),
  category: z.string(),
  copiesTotal: z.number(),
  copiesAvailable: z.number(),
})
export type LibraryBook = z.infer<typeof libraryBookSchema>

export const libraryBooksResponseSchema = z.object({
  items: z.array(libraryBookSchema),
})
export type LibraryBooksResponse = z.infer<typeof libraryBooksResponseSchema>

export const libraryIssuanceSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  bookTitle: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  issuedAt: z.string(),
  dueAt: z.string(),
  returnedAt: z.string().nullable(),
  fineAmount: z.number(),
  status: z.enum(['issued', 'returned', 'overdue']),
})
export type LibraryIssuance = z.infer<typeof libraryIssuanceSchema>

export const libraryIssuancesResponseSchema = z.object({
  items: z.array(libraryIssuanceSchema),
})
export type LibraryIssuancesResponse = z.infer<typeof libraryIssuancesResponseSchema>

/* ==================== hostel ==================== */

export const hostelRoomSchema = z.object({
  id: z.string(),
  building: z.string(),
  roomNumber: z.string(),
  capacity: z.number(),
  occupied: z.number(),
  type: z.enum(['boys', 'girls', 'staff']),
  occupants: z.array(
    z.object({
      studentId: z.string(),
      studentName: z.string(),
      className: z.string(),
    }),
  ),
})
export type HostelRoom = z.infer<typeof hostelRoomSchema>

export const hostelResponseSchema = z.object({
  items: z.array(hostelRoomSchema),
  totals: z.object({
    rooms: z.number(),
    capacity: z.number(),
    occupied: z.number(),
  }),
})
export type HostelResponse = z.infer<typeof hostelResponseSchema>

/* ==================== announcements + calendar ==================== */

export const announcementSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  audience: announcementAudienceSchema,
  /** Optional class/section scoping when audience=class. */
  scope: z.string().nullable(),
  authorName: z.string(),
  publishedAt: z.string(),
  pinned: z.boolean(),
})
export type Announcement = z.infer<typeof announcementSchema>

export const announcementsResponseSchema = z.object({
  items: z.array(announcementSchema),
})
export type AnnouncementsResponse = z.infer<typeof announcementsResponseSchema>

export const calendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.enum(['holiday', 'event', 'exam', 'parent_meeting', 'sports', 'term']),
  startDate: z.string(),
  endDate: z.string(),
  notes: z.string().nullable(),
})
export type CalendarEvent = z.infer<typeof calendarEventSchema>

export const calendarEventsResponseSchema = z.object({
  items: z.array(calendarEventSchema),
})
export type CalendarEventsResponse = z.infer<typeof calendarEventsResponseSchema>

/* ==================== overview ==================== */

export const schoolOverviewSchema = z.object({
  totalStudents: z.number(),
  totalTeachers: z.number(),
  totalClasses: z.number(),
  presentToday: z.number(),
  attendanceRate: z.number(),
  feesCollectedTerm: z.number(),
  feesOutstanding: z.number(),
  upcomingExams: z.number(),
  unreadAnnouncements: z.number(),
  currency: z.string(),
})
export type SchoolOverview = z.infer<typeof schoolOverviewSchema>

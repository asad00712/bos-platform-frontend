import type {
  Announcement,
  AnnouncementsResponse,
  AttendanceRecord,
  AttendanceRosterResponse,
  AttendanceState,
  AttendanceSummary,
  CalendarEventsResponse,
  ClassesResponse,
  ExamDetail,
  ExamsResponse,
  FeeStructuresResponse,
  GradebookResponse,
  HostelResponse,
  LibraryBooksResponse,
  LibraryIssuancesResponse,
  ParentsResponse,
  ReportCardsResponse,
  ScholarshipsResponse,
  SchoolOverview,
  Student,
  StudentDetail,
  StudentFeesResponse,
  StudentInput,
  StudentListFilters,
  StudentsResponse,
  SubjectsResponse,
  TeachersResponse,
  Timetable,
  TransportRoutesResponse,
} from './school.contracts'

const CURRENCY = 'USD'

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}
function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toISOString()
}
function todayDateOnly(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

/* ==================== classes / sections / subjects ==================== */

const classesData = [
  {
    id: 'cls-9',
    name: 'Grade 9',
    level: 9,
    sections: [
      { id: 'sec-9a', name: 'A', capacity: 35, enrolled: 32, teacher: 'Ms. Patel', room: 'Block A · 201' },
      { id: 'sec-9b', name: 'B', capacity: 35, enrolled: 30, teacher: 'Mr. Khan', room: 'Block A · 202' },
    ],
  },
  {
    id: 'cls-10',
    name: 'Grade 10',
    level: 10,
    sections: [
      { id: 'sec-10a', name: 'A', capacity: 35, enrolled: 33, teacher: 'Ms. Mehta', room: 'Block A · 301' },
      { id: 'sec-10b', name: 'B', capacity: 35, enrolled: 31, teacher: 'Mr. Iqbal', room: 'Block A · 302' },
    ],
  },
  {
    id: 'cls-11',
    name: 'Grade 11',
    level: 11,
    sections: [
      { id: 'sec-11a', name: 'A · Science', capacity: 30, enrolled: 28, teacher: 'Dr. Singh', room: 'Block B · 401' },
      { id: 'sec-11b', name: 'B · Commerce', capacity: 30, enrolled: 24, teacher: 'Ms. Joshi', room: 'Block B · 402' },
    ],
  },
]

const subjectsData = [
  { id: 'sub-eng', code: 'ENG', name: 'English', category: 'language' as const, weeklyPeriods: 6, classes: 3, teachers: 4 },
  { id: 'sub-math', code: 'MATH', name: 'Mathematics', category: 'core' as const, weeklyPeriods: 6, classes: 3, teachers: 4 },
  { id: 'sub-sci', code: 'SCI', name: 'Science', category: 'science' as const, weeklyPeriods: 5, classes: 3, teachers: 5 },
  { id: 'sub-hist', code: 'HIST', name: 'History', category: 'core' as const, weeklyPeriods: 4, classes: 3, teachers: 3 },
  { id: 'sub-cs', code: 'CS', name: 'Computer Science', category: 'elective' as const, weeklyPeriods: 4, classes: 2, teachers: 2 },
  { id: 'sub-art', code: 'ART', name: 'Art', category: 'arts' as const, weeklyPeriods: 2, classes: 3, teachers: 1 },
  { id: 'sub-pe', code: 'PE', name: 'Physical Education', category: 'sports' as const, weeklyPeriods: 3, classes: 3, teachers: 2 },
  { id: 'sub-urdu', code: 'URDU', name: 'Urdu', category: 'language' as const, weeklyPeriods: 4, classes: 3, teachers: 2 },
  { id: 'sub-econ', code: 'ECON', name: 'Economics', category: 'core' as const, weeklyPeriods: 5, classes: 1, teachers: 2 },
  { id: 'sub-bio', code: 'BIO', name: 'Biology', category: 'science' as const, weeklyPeriods: 5, classes: 1, teachers: 2 },
]

/* ==================== teachers ==================== */

const teachersData = [
  { id: 't-001', employeeNumber: 'T-001', firstName: 'Anita', lastName: 'Patel', email: 'apatel@greenfield.edu', phone: '+92 300 555 0101', qualification: 'M.Sc. Mathematics', subjects: ['Mathematics'], classes: ['Grade 9-A'], homeroom: true, joinedDays: 1850 },
  { id: 't-002', employeeNumber: 'T-002', firstName: 'Imran', lastName: 'Khan', email: 'ikhan@greenfield.edu', phone: '+92 300 555 0102', qualification: 'M.A. English', subjects: ['English', 'Urdu'], classes: ['Grade 9-B'], homeroom: true, joinedDays: 1620 },
  { id: 't-003', employeeNumber: 'T-003', firstName: 'Sara', lastName: 'Mehta', email: 'smehta@greenfield.edu', phone: '+92 300 555 0103', qualification: 'M.Sc. Physics, B.Ed.', subjects: ['Science', 'Mathematics'], classes: ['Grade 10-A'], homeroom: true, joinedDays: 980 },
  { id: 't-004', employeeNumber: 'T-004', firstName: 'Iqbal', lastName: 'Hussain', email: 'iqbal@greenfield.edu', phone: '+92 300 555 0104', qualification: 'M.A. History', subjects: ['History'], classes: ['Grade 10-B'], homeroom: true, joinedDays: 720 },
  { id: 't-005', employeeNumber: 'T-005', firstName: 'Ravi', lastName: 'Singh', email: 'rsingh@greenfield.edu', phone: '+92 300 555 0105', qualification: 'Ph.D. Chemistry', subjects: ['Science', 'Biology'], classes: ['Grade 11-A'], homeroom: true, joinedDays: 1450 },
  { id: 't-006', employeeNumber: 'T-006', firstName: 'Priya', lastName: 'Joshi', email: 'pjoshi@greenfield.edu', phone: '+92 300 555 0106', qualification: 'M.Com.', subjects: ['Economics'], classes: ['Grade 11-B'], homeroom: true, joinedDays: 540 },
  { id: 't-007', employeeNumber: 'T-007', firstName: 'David', lastName: 'Wong', email: 'dwong@greenfield.edu', phone: '+92 300 555 0107', qualification: 'B.Tech. CS', subjects: ['Computer Science'], classes: ['Grade 10-A', 'Grade 11-A'], homeroom: false, joinedDays: 360 },
  { id: 't-008', employeeNumber: 'T-008', firstName: 'Maya', lastName: 'Diaz', email: 'mdiaz@greenfield.edu', phone: '+92 300 555 0108', qualification: 'BFA, M.A. Education', subjects: ['Art'], classes: ['Grade 9-A', 'Grade 9-B', 'Grade 10-A'], homeroom: false, joinedDays: 200 },
  { id: 't-009', employeeNumber: 'T-009', firstName: 'Asad', lastName: 'Bhatti', email: 'abhatti@greenfield.edu', phone: '+92 300 555 0109', qualification: 'B.P.Ed.', subjects: ['Physical Education'], classes: ['Grade 9-A', 'Grade 10-A', 'Grade 11-A'], homeroom: false, joinedDays: 880 },
]

/* ==================== students ==================== */

let students: StudentDetail[] = [
  mkStudent({
    id: 'st-001', adm: 'GFA-2026-001', first: 'Aiden', last: 'Wright', dob: '2010-04-12', gender: 'male',
    classId: 'cls-9', className: 'Grade 9', sectionId: 'sec-9a', sectionName: 'A',
    rollNumber: 1, parent: { name: 'Robert Wright', phone: '+1 415 555 1101', email: 'r.wright@example.com', rel: 'father' },
    attendance: 0.96, outstanding: 0, blood: 'A+', allergies: ['Peanuts'], hostel: null, route: 'route-1', enrolledDays: 540,
    medicalNotes: 'Carries EpiPen in backpack.',
    address: '14 Maple Avenue',
    notes: 'Strong in math; debate club captain.',
  }),
  mkStudent({
    id: 'st-002', adm: 'GFA-2026-002', first: 'Layla', last: 'Mahmood', dob: '2010-08-22', gender: 'female',
    classId: 'cls-9', className: 'Grade 9', sectionId: 'sec-9a', sectionName: 'A',
    rollNumber: 2, parent: { name: 'Faisal Mahmood', phone: '+92 333 555 2202', email: 'fm@example.com', rel: 'father' },
    attendance: 0.99, outstanding: 0, blood: 'O+', allergies: [], hostel: null, route: 'route-1', enrolledDays: 540,
    medicalNotes: null,
    address: '22 Park Lane',
    notes: 'Top of class — last term rank #1.',
  }),
  mkStudent({
    id: 'st-003', adm: 'GFA-2026-003', first: 'Diego', last: 'Hidalgo', dob: '2010-11-05', gender: 'male',
    classId: 'cls-9', className: 'Grade 9', sectionId: 'sec-9b', sectionName: 'B',
    rollNumber: 8, parent: { name: 'Carmen Hidalgo', phone: '+34 612 333 4444', email: 'carmen@example.com', rel: 'mother' },
    attendance: 0.88, outstanding: 250, blood: 'B+', allergies: [], hostel: 'Block A · 12', route: null, enrolledDays: 380,
    medicalNotes: null,
    address: 'On-campus hostel',
    notes: 'Hostel resident; football team.',
  }),
  mkStudent({
    id: 'st-004', adm: 'GFA-2026-004', first: 'Priya', last: 'Sharma', dob: '2009-03-15', gender: 'female',
    classId: 'cls-10', className: 'Grade 10', sectionId: 'sec-10a', sectionName: 'A',
    rollNumber: 5, parent: { name: 'Anil Sharma', phone: '+91 98 7654 3210', email: 'anil.sharma@example.com', rel: 'father' },
    attendance: 0.94, outstanding: 0, blood: 'AB+', allergies: ['Lactose'], hostel: null, route: 'route-2', enrolledDays: 880,
    medicalNotes: 'Lactose intolerant — note for cafeteria.',
    address: '47 Oak Street',
    notes: null,
  }),
  mkStudent({
    id: 'st-005', adm: 'GFA-2026-005', first: 'Omar', last: 'Bashir', dob: '2009-07-30', gender: 'male',
    classId: 'cls-10', className: 'Grade 10', sectionId: 'sec-10a', sectionName: 'A',
    rollNumber: 12, parent: { name: 'Hassan Bashir', phone: '+971 50 999 8888', email: 'hb@example.com', rel: 'father' },
    attendance: 0.91, outstanding: 480, blood: 'O-', allergies: [], hostel: null, route: 'route-2', enrolledDays: 880,
    medicalNotes: null,
    address: 'Tower 3, Apt 14B',
    notes: 'Outstanding fees flagged — payment plan in progress.',
  }),
  mkStudent({
    id: 'st-006', adm: 'GFA-2026-006', first: 'Maya', last: 'Chen', dob: '2009-01-04', gender: 'female',
    classId: 'cls-10', className: 'Grade 10', sectionId: 'sec-10b', sectionName: 'B',
    rollNumber: 3, parent: { name: 'Linda Chen', phone: '+1 415 555 3303', email: 'lchen@example.com', rel: 'mother' },
    attendance: 0.97, outstanding: 0, blood: 'A-', allergies: [], hostel: null, route: 'route-1', enrolledDays: 880,
    medicalNotes: null,
    address: '8 Pine Court',
    notes: 'School orchestra — first violin.',
  }),
  mkStudent({
    id: 'st-007', adm: 'GFA-2026-007', first: 'Daniel', last: 'O’Brien', dob: '2009-09-19', gender: 'male',
    classId: 'cls-10', className: 'Grade 10', sectionId: 'sec-10b', sectionName: 'B',
    rollNumber: 9, parent: { name: 'Mary O’Brien', phone: '+353 1 555 4444', email: 'mo@example.com', rel: 'mother' },
    attendance: 0.78, outstanding: 0, blood: 'O+', allergies: [], hostel: 'Block A · 14', route: null, enrolledDays: 540,
    medicalNotes: null,
    address: 'On-campus hostel',
    notes: 'Attendance attention — mom contacted twice this term.',
  }),
  mkStudent({
    id: 'st-008', adm: 'GFA-2026-008', first: 'Sara', last: 'Khan', dob: '2008-06-10', gender: 'female',
    classId: 'cls-11', className: 'Grade 11', sectionId: 'sec-11a', sectionName: 'A · Science',
    rollNumber: 1, parent: { name: 'Asma Khan', phone: '+92 333 111 0000', email: 'akhan@example.com', rel: 'mother' },
    attendance: 0.99, outstanding: 0, blood: 'A+', allergies: [], hostel: null, route: 'route-3', enrolledDays: 1240,
    medicalNotes: null,
    address: '12 Garden Road',
    notes: 'Pre-med track; merit scholarship recipient.',
  }),
  mkStudent({
    id: 'st-009', adm: 'GFA-2026-009', first: 'Theo', last: 'Müller', dob: '2008-10-25', gender: 'male',
    classId: 'cls-11', className: 'Grade 11', sectionId: 'sec-11a', sectionName: 'A · Science',
    rollNumber: 4, parent: { name: 'Klaus Müller', phone: '+49 30 1234 5678', email: 'km@example.com', rel: 'father' },
    attendance: 0.93, outstanding: 0, blood: 'B-', allergies: [], hostel: 'Block B · 22', route: null, enrolledDays: 1240,
    medicalNotes: null,
    address: 'On-campus hostel',
    notes: null,
  }),
  mkStudent({
    id: 'st-010', adm: 'GFA-2026-010', first: 'Ananya', last: 'Reddy', dob: '2008-12-02', gender: 'female',
    classId: 'cls-11', className: 'Grade 11', sectionId: 'sec-11b', sectionName: 'B · Commerce',
    rollNumber: 2, parent: { name: 'Rajesh Reddy', phone: '+91 99 8877 6655', email: 'rr@example.com', rel: 'father' },
    attendance: 0.95, outstanding: 0, blood: 'O+', allergies: [], hostel: null, route: 'route-2', enrolledDays: 1240,
    medicalNotes: null,
    address: '99 Lakeview Drive',
    notes: null,
  }),
  mkStudent({
    id: 'st-011', adm: 'GFA-2026-011', first: 'Lucas', last: 'Silva', dob: '2008-05-28', gender: 'male',
    classId: 'cls-11', className: 'Grade 11', sectionId: 'sec-11b', sectionName: 'B · Commerce',
    rollNumber: 7, parent: { name: 'Carla Silva', phone: '+55 11 9999 8888', email: 'cs@example.com', rel: 'mother' },
    attendance: 0.86, outstanding: 0, blood: 'AB+', allergies: [], hostel: null, route: 'route-3', enrolledDays: 1240,
    medicalNotes: null,
    address: '5 River Road',
    notes: null,
  }),
  mkStudent({
    id: 'st-012', adm: 'GFA-2026-012', first: 'Zara', last: 'Iqbal', dob: '2010-02-18', gender: 'female',
    classId: 'cls-9', className: 'Grade 9', sectionId: 'sec-9b', sectionName: 'B',
    rollNumber: 14, parent: { name: 'Tariq Iqbal', phone: '+92 333 777 6666', email: 'tariq@example.com', rel: 'father' },
    attendance: 0.92, outstanding: 0, blood: 'A+', allergies: [], hostel: null, route: 'route-1', enrolledDays: 380,
    medicalNotes: null,
    address: '7 Sunshine Lane',
    notes: 'Drama club; school newspaper editor.',
  }),
]

function mkStudent(opts: {
  id: string
  adm: string
  first: string
  last: string
  dob: string
  gender: 'male' | 'female' | 'other'
  classId: string
  className: string
  sectionId: string
  sectionName: string
  rollNumber: number
  parent: { name: string; phone: string; email: string; rel: 'father' | 'mother' | 'guardian' | 'other' }
  attendance: number
  outstanding: number
  blood: string | null
  allergies: string[]
  hostel: string | null
  route: string | null
  enrolledDays: number
  medicalNotes: string | null
  address: string | null
  notes: string | null
}): StudentDetail {
  const homeroom =
    classesData.find((c) => c.id === opts.classId)?.sections.find((s) => s.id === opts.sectionId)?.teacher ?? null
  const routeName =
    opts.route === 'route-1'
      ? 'Route 1 · East Side'
      : opts.route === 'route-2'
        ? 'Route 2 · West Side'
        : opts.route === 'route-3'
          ? 'Route 3 · North Express'
          : null
  return {
    id: opts.id,
    admissionNumber: opts.adm,
    firstName: opts.first,
    lastName: opts.last,
    dateOfBirth: opts.dob,
    gender: opts.gender,
    status: 'enrolled',
    classId: opts.classId,
    className: opts.className,
    sectionId: opts.sectionId,
    sectionName: opts.sectionName,
    rollNumber: opts.rollNumber,
    homeroomTeacher: homeroom,
    primaryParentName: opts.parent.name,
    primaryParentPhone: opts.parent.phone,
    email: null,
    attendanceRate: opts.attendance,
    outstandingFees: opts.outstanding,
    currency: CURRENCY,
    enrolledAt: daysAgo(opts.enrolledDays),
    avatarUrl: null,
    bloodGroup: opts.blood,
    allergies: opts.allergies,
    medicalNotes: opts.medicalNotes,
    address: opts.address,
    emergencyContact: opts.parent.phone,
    parents: [
      {
        id: `${opts.id}-p1`,
        firstName: opts.parent.name.split(' ')[0],
        lastName: opts.parent.name.split(' ').slice(1).join(' '),
        relationship: opts.parent.rel,
        email: opts.parent.email,
        phone: opts.parent.phone,
        primary: true,
      },
    ],
    hostelRoom: opts.hostel,
    transportRouteId: opts.route,
    transportRouteName: routeName,
    notes: opts.notes,
  }
}

/* ==================== timetable ==================== */

const periods = [
  { number: 1, startTime: '08:00', endTime: '08:45', isBreak: false, breakLabel: null },
  { number: 2, startTime: '08:45', endTime: '09:30', isBreak: false, breakLabel: null },
  { number: 3, startTime: '09:30', endTime: '10:15', isBreak: false, breakLabel: null },
  { number: 4, startTime: '10:15', endTime: '10:35', isBreak: true, breakLabel: 'Recess' },
  { number: 5, startTime: '10:35', endTime: '11:20', isBreak: false, breakLabel: null },
  { number: 6, startTime: '11:20', endTime: '12:05', isBreak: false, breakLabel: null },
  { number: 7, startTime: '12:05', endTime: '12:50', isBreak: true, breakLabel: 'Lunch' },
  { number: 8, startTime: '12:50', endTime: '13:35', isBreak: false, breakLabel: null },
  { number: 9, startTime: '13:35', endTime: '14:20', isBreak: false, breakLabel: null },
]

// Build a deterministic timetable for Grade 10-A across the week.
const subjectShortlist: { id: string; name: string; teacherId: string; teacherName: string }[] = [
  { id: 'sub-math', name: 'Mathematics', teacherId: 't-001', teacherName: 'Anita Patel' },
  { id: 'sub-eng', name: 'English', teacherId: 't-002', teacherName: 'Imran Khan' },
  { id: 'sub-sci', name: 'Science', teacherId: 't-003', teacherName: 'Sara Mehta' },
  { id: 'sub-hist', name: 'History', teacherId: 't-004', teacherName: 'Iqbal Hussain' },
  { id: 'sub-cs', name: 'Computer Science', teacherId: 't-007', teacherName: 'David Wong' },
  { id: 'sub-art', name: 'Art', teacherId: 't-008', teacherName: 'Maya Diaz' },
  { id: 'sub-pe', name: 'Physical Education', teacherId: 't-009', teacherName: 'Asad Bhatti' },
  { id: 'sub-urdu', name: 'Urdu', teacherId: 't-002', teacherName: 'Imran Khan' },
]

const timetableEntries = (() => {
  const out = []
  for (let day = 0; day < 5; day++) {
    let n = 0
    for (const p of periods) {
      if (p.isBreak) continue
      const subj = subjectShortlist[(day * 3 + n) % subjectShortlist.length]
      out.push({
        id: `tt-${day}-${p.number}`,
        day,
        period: p.number,
        classId: 'cls-10',
        className: 'Grade 10',
        sectionId: 'sec-10a',
        sectionName: 'A',
        subjectId: subj.id,
        subjectName: subj.name,
        teacherId: subj.teacherId,
        teacherName: subj.teacherName,
        roomName: subj.id === 'sub-pe' ? 'Field 1' : subj.id === 'sub-cs' ? 'Lab CS' : 'Block A · 301',
      })
      n++
    }
  }
  return out
})()

/* ==================== attendance ==================== */

const attendanceTodayRecords: Record<string, AttendanceRecord[]> = {}

function bootstrapAttendance() {
  for (const c of classesData) {
    for (const s of c.sections) {
      const sectionStudents = students
        .filter((st) => st.sectionId === s.id)
        .map<AttendanceRecord>((st) => {
          // Most kids present, sprinkle absence/late deterministically.
          const idx = parseInt(st.id.replace(/[^0-9]/g, ''), 10)
          const r = idx % 7
          const state: AttendanceState =
            r === 0 ? 'absent' : r === 3 ? 'late' : r === 5 ? 'excused' : 'present'
          return {
            id: `att-${st.id}-${todayDateOnly()}`,
            studentId: st.id,
            studentName: `${st.firstName} ${st.lastName}`,
            rollNumber: st.rollNumber,
            date: todayDateOnly(),
            state,
            notes: state === 'excused' ? 'Doctor’s note on file' : null,
          }
        })
      attendanceTodayRecords[s.id] = sectionStudents
    }
  }
}
bootstrapAttendance()

/* ==================== exams + marks ==================== */

const examsData: ExamDetail[] = [
  {
    id: 'ex-001',
    name: 'Term 2 · Mid-term',
    type: 'mid_term',
    status: 'published',
    termName: 'Term 2',
    classIds: ['cls-9', 'cls-10', 'cls-11'],
    startDate: daysAgo(28),
    endDate: daysAgo(20),
    paperCount: 6,
    papers: [
      { id: 'pp-001-1', examId: 'ex-001', subjectId: 'sub-math', subjectName: 'Mathematics', date: daysAgo(28), startTime: '09:00', durationMinutes: 90, maxMarks: 100, passingMarks: 33 },
      { id: 'pp-001-2', examId: 'ex-001', subjectId: 'sub-eng', subjectName: 'English', date: daysAgo(26), startTime: '09:00', durationMinutes: 90, maxMarks: 100, passingMarks: 33 },
      { id: 'pp-001-3', examId: 'ex-001', subjectId: 'sub-sci', subjectName: 'Science', date: daysAgo(24), startTime: '09:00', durationMinutes: 90, maxMarks: 100, passingMarks: 33 },
      { id: 'pp-001-4', examId: 'ex-001', subjectId: 'sub-hist', subjectName: 'History', date: daysAgo(22), startTime: '09:00', durationMinutes: 90, maxMarks: 100, passingMarks: 33 },
      { id: 'pp-001-5', examId: 'ex-001', subjectId: 'sub-cs', subjectName: 'Computer Science', date: daysAgo(21), startTime: '09:00', durationMinutes: 60, maxMarks: 50, passingMarks: 17 },
      { id: 'pp-001-6', examId: 'ex-001', subjectId: 'sub-urdu', subjectName: 'Urdu', date: daysAgo(20), startTime: '09:00', durationMinutes: 90, maxMarks: 100, passingMarks: 33 },
    ],
  },
  {
    id: 'ex-002',
    name: 'Term 2 · Unit Test 3',
    type: 'unit_test',
    status: 'graded',
    termName: 'Term 2',
    classIds: ['cls-10'],
    startDate: daysAgo(8),
    endDate: daysAgo(6),
    paperCount: 3,
    papers: [
      { id: 'pp-002-1', examId: 'ex-002', subjectId: 'sub-math', subjectName: 'Mathematics', date: daysAgo(8), startTime: '10:00', durationMinutes: 45, maxMarks: 25, passingMarks: 9 },
      { id: 'pp-002-2', examId: 'ex-002', subjectId: 'sub-eng', subjectName: 'English', date: daysAgo(7), startTime: '10:00', durationMinutes: 45, maxMarks: 25, passingMarks: 9 },
      { id: 'pp-002-3', examId: 'ex-002', subjectId: 'sub-sci', subjectName: 'Science', date: daysAgo(6), startTime: '10:00', durationMinutes: 45, maxMarks: 25, passingMarks: 9 },
    ],
  },
  {
    id: 'ex-003',
    name: 'Term 2 · Final',
    type: 'final',
    status: 'scheduled',
    termName: 'Term 2',
    classIds: ['cls-9', 'cls-10', 'cls-11'],
    startDate: daysFromNow(20),
    endDate: daysFromNow(35),
    paperCount: 8,
    papers: [],
  },
]

function gradeFor(percent: number): string {
  if (percent >= 0.9) return 'A+'
  if (percent >= 0.8) return 'A'
  if (percent >= 0.7) return 'B'
  if (percent >= 0.6) return 'C'
  if (percent >= 0.5) return 'D'
  if (percent >= 0.4) return 'E'
  return 'F'
}

/* ==================== fees ==================== */

const feeStructuresData = [
  { id: 'fs-tuition-9', name: 'Tuition · Grade 9', classId: 'cls-9', className: 'Grade 9', amount: 850, frequency: 'monthly' as const, lateFee: 25, dueDay: 5, students: 62 },
  { id: 'fs-tuition-10', name: 'Tuition · Grade 10', classId: 'cls-10', className: 'Grade 10', amount: 950, frequency: 'monthly' as const, lateFee: 25, dueDay: 5, students: 64 },
  { id: 'fs-tuition-11', name: 'Tuition · Grade 11', classId: 'cls-11', className: 'Grade 11', amount: 1_100, frequency: 'monthly' as const, lateFee: 25, dueDay: 5, students: 52 },
  { id: 'fs-transport', name: 'Transport', classId: null, className: null, amount: 120, frequency: 'monthly' as const, lateFee: 10, dueDay: 5, students: 88 },
  { id: 'fs-hostel', name: 'Hostel · Boys', classId: null, className: null, amount: 480, frequency: 'monthly' as const, lateFee: 30, dueDay: 5, students: 18 },
  { id: 'fs-lab', name: 'Lab fee · Grade 11 Science', classId: 'cls-11', className: 'Grade 11', amount: 280, frequency: 'termly' as const, lateFee: 0, dueDay: null, students: 28 },
]

let studentFeeRows = students.map((s, i) => {
  const fs =
    s.classId === 'cls-9'
      ? feeStructuresData[0]
      : s.classId === 'cls-10'
        ? feeStructuresData[1]
        : feeStructuresData[2]
  const overdue = i % 5 === 0
  const partial = i % 7 === 0
  const status = s.outstandingFees > 0 ? (overdue ? 'overdue' : 'partial') : 'paid'
  const paid = s.outstandingFees > 0 ? (partial ? fs.amount / 2 : 0) : fs.amount
  return {
    id: `sf-${s.id}`,
    studentId: s.id,
    studentName: `${s.firstName} ${s.lastName}`,
    className: s.className,
    sectionName: s.sectionName,
    feeStructureName: fs.name,
    termName: 'Term 2',
    amount: fs.amount,
    paid,
    outstanding: fs.amount - paid,
    dueDate: daysAgo(2),
    status: status as 'paid' | 'partial' | 'overdue',
    currency: CURRENCY,
  }
})

const scholarshipsData = [
  { id: 'sc-1', studentId: 'st-008', studentName: 'Sara Khan', scholarshipName: 'Merit · Top of class', type: 'merit' as const, percent: 25, amount: null, termName: 'Term 2', status: 'active' as const },
  { id: 'sc-2', studentId: 'st-002', studentName: 'Layla Mahmood', scholarshipName: 'Merit · Olympiad', type: 'merit' as const, percent: 15, amount: null, termName: 'Term 2', status: 'active' as const },
  { id: 'sc-3', studentId: 'st-007', studentName: 'Daniel O’Brien', scholarshipName: 'Need-based · Hardship', type: 'need' as const, percent: null, amount: 600, termName: 'Term 2', status: 'active' as const },
  { id: 'sc-4', studentId: 'st-003', studentName: 'Diego Hidalgo', scholarshipName: 'Sports · Football team', type: 'sports' as const, percent: 10, amount: null, termName: 'Term 2', status: 'active' as const },
]

/* ==================== transport ==================== */

const transportRoutesData = [
  {
    id: 'route-1', name: 'Route 1 · East Side', vehicleNumber: 'BUS-12-A', driverName: 'Hassan Ali', driverPhone: '+92 333 100 1100', capacity: 35, studentsAssigned: 28,
    stops: [
      { name: 'Garden Town', morningPickup: '07:05', afternoonDrop: '14:50' },
      { name: 'Maple Avenue', morningPickup: '07:18', afternoonDrop: '14:35' },
      { name: 'Park Lane', morningPickup: '07:30', afternoonDrop: '14:25' },
      { name: 'Greenfield Academy', morningPickup: '07:50', afternoonDrop: '14:15' },
    ],
  },
  {
    id: 'route-2', name: 'Route 2 · West Side', vehicleNumber: 'BUS-15-C', driverName: 'Mohammad Younas', driverPhone: '+92 333 100 2200', capacity: 35, studentsAssigned: 30,
    stops: [
      { name: 'Lakeview Drive', morningPickup: '07:10', afternoonDrop: '14:45' },
      { name: 'Tower 3', morningPickup: '07:22', afternoonDrop: '14:33' },
      { name: 'Oak Street', morningPickup: '07:36', afternoonDrop: '14:22' },
      { name: 'Greenfield Academy', morningPickup: '07:50', afternoonDrop: '14:15' },
    ],
  },
  {
    id: 'route-3', name: 'Route 3 · North Express', vehicleNumber: 'BUS-21-B', driverName: 'Iqbal Khan', driverPhone: '+92 333 100 3300', capacity: 40, studentsAssigned: 30,
    stops: [
      { name: 'River Road', morningPickup: '07:00', afternoonDrop: '14:50' },
      { name: 'Sunshine Lane', morningPickup: '07:14', afternoonDrop: '14:36' },
      { name: 'Greenfield Academy', morningPickup: '07:50', afternoonDrop: '14:15' },
    ],
  },
]

/* ==================== library ==================== */

const libraryBooksData = [
  { id: 'bk-1', isbn: '978-0-19-953556-9', title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', total: 5, available: 3 },
  { id: 'bk-2', isbn: '978-0-393-31755-8', title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', total: 4, available: 2 },
  { id: 'bk-3', isbn: '978-0-7432-7356-5', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', total: 8, available: 6 },
  { id: 'bk-4', isbn: '978-0-13-110362-7', title: 'The C Programming Language', author: 'Kernighan & Ritchie', category: 'Computer Science', total: 6, available: 4 },
  { id: 'bk-5', isbn: '978-0-19-861119-6', title: 'Oxford English Dictionary (Concise)', author: 'OUP', category: 'Reference', total: 3, available: 3 },
  { id: 'bk-6', isbn: '978-0-553-21311-7', title: 'Mathematics for the Curious', author: 'Peter Higgins', category: 'Mathematics', total: 4, available: 3 },
]

const libraryIssuancesData = [
  { id: 'iss-1', bookId: 'bk-1', bookTitle: 'A Brief History of Time', studentId: 'st-008', studentName: 'Sara Khan', issuedAt: daysAgo(10), dueAt: daysFromNow(4), returnedAt: null, fineAmount: 0, status: 'issued' as const },
  { id: 'iss-2', bookId: 'bk-2', bookTitle: 'Sapiens', studentId: 'st-004', studentName: 'Priya Sharma', issuedAt: daysAgo(20), dueAt: daysAgo(6), returnedAt: null, fineAmount: 30, status: 'overdue' as const },
  { id: 'iss-3', bookId: 'bk-3', bookTitle: 'To Kill a Mockingbird', studentId: 'st-006', studentName: 'Maya Chen', issuedAt: daysAgo(40), dueAt: daysAgo(26), returnedAt: daysAgo(28), fineAmount: 0, status: 'returned' as const },
  { id: 'iss-4', bookId: 'bk-4', bookTitle: 'The C Programming Language', studentId: 'st-009', studentName: 'Theo Müller', issuedAt: daysAgo(5), dueAt: daysFromNow(9), returnedAt: null, fineAmount: 0, status: 'issued' as const },
  { id: 'iss-5', bookId: 'bk-6', bookTitle: 'Mathematics for the Curious', studentId: 'st-002', studentName: 'Layla Mahmood', issuedAt: daysAgo(7), dueAt: daysFromNow(7), returnedAt: null, fineAmount: 0, status: 'issued' as const },
]

/* ==================== hostel ==================== */

const hostelData = [
  { id: 'hr-a12', building: 'Block A', roomNumber: '12', capacity: 4, type: 'boys' as const, occupants: [{ studentId: 'st-003', studentName: 'Diego Hidalgo', className: 'Grade 9-B' }] },
  { id: 'hr-a14', building: 'Block A', roomNumber: '14', capacity: 4, type: 'boys' as const, occupants: [{ studentId: 'st-007', studentName: 'Daniel O’Brien', className: 'Grade 10-B' }] },
  { id: 'hr-a16', building: 'Block A', roomNumber: '16', capacity: 4, type: 'boys' as const, occupants: [] },
  { id: 'hr-b22', building: 'Block B', roomNumber: '22', capacity: 4, type: 'boys' as const, occupants: [{ studentId: 'st-009', studentName: 'Theo Müller', className: 'Grade 11-A' }] },
  { id: 'hr-c10', building: 'Block C', roomNumber: '10', capacity: 4, type: 'girls' as const, occupants: [] },
  { id: 'hr-c12', building: 'Block C', roomNumber: '12', capacity: 4, type: 'girls' as const, occupants: [] },
]

/* ==================== announcements + calendar ==================== */

const announcementsData: Announcement[] = [
  { id: 'ann-1', title: 'Mid-term results published', body: 'Term 2 mid-term results are now visible in the parent portal. Report card cards available next week.', audience: 'school', scope: null, authorName: 'Owner', publishedAt: daysAgo(2), pinned: true },
  { id: 'ann-2', title: 'Sports day on March 15', body: 'Annual sports day is on March 15. Inter-house competitions begin at 9 AM.', audience: 'school', scope: null, authorName: 'Asad Bhatti', publishedAt: daysAgo(5), pinned: false },
  { id: 'ann-3', title: 'Grade 10-A · field trip permission', body: 'Permission slips for the science museum trip are due by Friday.', audience: 'class', scope: 'Grade 10-A', authorName: 'Sara Mehta', publishedAt: daysAgo(1), pinned: false },
  { id: 'ann-4', title: 'PTM next Saturday', body: 'Parent-teacher meetings next Saturday from 10 AM to 1 PM. Slot booking via parent app.', audience: 'parents', scope: null, authorName: 'Owner', publishedAt: daysAgo(0), pinned: true },
  { id: 'ann-5', title: 'Staff briefing — Monday morning', body: 'Brief huddle in the staff room at 7:30 AM Monday. Term 2 final exam prep.', audience: 'staff', scope: null, authorName: 'Owner', publishedAt: daysAgo(0), pinned: false },
]

const calendarEventsData = [
  { id: 'ev-1', title: 'Term 2 begins', kind: 'term' as const, startDate: daysAgo(60), endDate: daysAgo(60), notes: null },
  { id: 'ev-2', title: 'Mid-term exams', kind: 'exam' as const, startDate: daysAgo(28), endDate: daysAgo(20), notes: null },
  { id: 'ev-3', title: 'Sports Day', kind: 'sports' as const, startDate: daysFromNow(15), endDate: daysFromNow(15), notes: 'House captains report at 8 AM' },
  { id: 'ev-4', title: 'Spring break', kind: 'holiday' as const, startDate: daysFromNow(40), endDate: daysFromNow(48), notes: null },
  { id: 'ev-5', title: 'Term 2 finals', kind: 'exam' as const, startDate: daysFromNow(20), endDate: daysFromNow(35), notes: null },
  { id: 'ev-6', title: 'Parent-teacher meeting', kind: 'parent_meeting' as const, startDate: daysFromNow(7), endDate: daysFromNow(7), notes: '10 AM – 1 PM' },
]

/* ==================== mocks ==================== */

function applyFilters(items: Student[], f: StudentListFilters): Student[] {
  const q = f.search?.trim().toLowerCase()
  return items.filter((s) => {
    if (f.classId && s.classId !== f.classId) return false
    if (f.sectionId && s.sectionId !== f.sectionId) return false
    if (f.status && s.status !== f.status) return false
    if (q) {
      const hay = `${s.firstName} ${s.lastName} ${s.admissionNumber} ${s.primaryParentName}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

function listView(s: StudentDetail): Student {
  const {
    bloodGroup: _b,
    allergies: _a,
    medicalNotes: _m,
    address: _ad,
    emergencyContact: _ec,
    parents: _p,
    hostelRoom: _h,
    transportRouteId: _tri,
    transportRouteName: _trn,
    notes: _n,
    ...rest
  } = s
  void _b; void _a; void _m; void _ad; void _ec; void _p; void _h; void _tri; void _trn; void _n
  return rest
}

function classListResponse(): ClassesResponse {
  return {
    items: classesData.map((c) => ({
      id: c.id,
      name: c.name,
      level: c.level,
      sectionCount: c.sections.length,
      totalStudents: c.sections.reduce((sum, s) => sum + s.enrolled, 0),
      sections: c.sections.map((s) => ({
        id: s.id,
        classId: c.id,
        className: c.name,
        sectionName: s.name,
        capacity: s.capacity,
        enrolled: s.enrolled,
        homeroomTeacher: s.teacher,
        roomName: s.room,
      })),
    })),
  }
}

export const schoolMocks = {
  /* students */
  listStudents(filters: StudentListFilters): StudentsResponse {
    const items = applyFilters(students.map(listView), filters).sort(
      (a, b) =>
        a.className.localeCompare(b.className) ||
        a.sectionName.localeCompare(b.sectionName) ||
        a.rollNumber - b.rollNumber,
    )
    return { items, total: items.length }
  },

  getStudent(id: string): StudentDetail | null {
    return students.find((s) => s.id === id) ?? null
  },

  createStudent(input: StudentInput): StudentDetail {
    const id = `st-${Date.now()}`
    const klass = classesData.find((c) => c.id === input.classId)
    const section = klass?.sections.find((s) => s.id === input.sectionId)
    const created: StudentDetail = mkStudent({
      id,
      adm: `GFA-2026-${String(students.length + 1).padStart(3, '0')}`,
      first: input.firstName,
      last: input.lastName,
      dob: input.dateOfBirth,
      gender: input.gender,
      classId: input.classId,
      className: klass?.name ?? '',
      sectionId: input.sectionId,
      sectionName: section?.name ?? '',
      rollNumber: input.rollNumber,
      parent: {
        name: input.primaryParentName,
        phone: input.primaryParentPhone ?? '',
        email: input.primaryParentEmail ?? '',
        rel: 'father',
      },
      attendance: 1,
      outstanding: 0,
      blood: input.bloodGroup ?? null,
      allergies: [],
      hostel: null,
      route: null,
      enrolledDays: 0,
      medicalNotes: null,
      address: input.address ?? null,
      notes: input.notes ?? null,
    })
    students = [created, ...students]
    return created
  },

  /* parents */
  listParents(): ParentsResponse {
    const map = new Map<string, { p: { id: string; firstName: string; lastName: string; relationship: 'father' | 'mother' | 'guardian' | 'other'; email: string | null; phone: string | null; primary: boolean }; children: string[] }>()
    for (const s of students) {
      for (const par of s.parents) {
        const key = par.email ?? par.phone ?? par.id
        const existing = map.get(key)
        if (existing) {
          existing.children.push(`${s.firstName} ${s.lastName}`)
        } else {
          map.set(key, {
            p: par,
            children: [`${s.firstName} ${s.lastName}`],
          })
        }
      }
    }
    return {
      items: Array.from(map.values()).map((entry) => ({
        ...entry.p,
        childCount: entry.children.length,
        childrenNames: entry.children,
      })),
    }
  },

  /* classes */
  classes(): ClassesResponse {
    return classListResponse()
  },

  /* subjects */
  subjects(): SubjectsResponse {
    return {
      items: subjectsData.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        category: s.category,
        weeklyPeriods: s.weeklyPeriods,
        classCount: s.classes,
        teacherCount: s.teachers,
      })),
    }
  },

  /* teachers */
  teachers(): TeachersResponse {
    return {
      items: teachersData.map((t) => ({
        id: t.id,
        employeeNumber: t.employeeNumber,
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
        phone: t.phone,
        qualification: t.qualification,
        subjects: t.subjects,
        classesAssigned: t.classes,
        isHomeroom: t.homeroom,
        joinedAt: daysAgo(t.joinedDays),
      })),
    }
  },

  /* timetable */
  timetable(): Timetable {
    return {
      periods: periods.map((p) => ({
        number: p.number,
        startTime: p.startTime,
        endTime: p.endTime,
        isBreak: p.isBreak,
        breakLabel: p.breakLabel,
      })),
      entries: timetableEntries,
    }
  },

  /* attendance */
  attendanceRoster(sectionId: string): AttendanceRosterResponse {
    const section = classesData
      .flatMap((c) => c.sections.map((s) => ({ ...s, className: c.name })))
      .find((s) => s.id === sectionId)
    return {
      classId: section ? `${section.className}-${section.name}` : sectionId,
      className: section?.className ?? '',
      sectionName: section?.name ?? '',
      date: todayDateOnly(),
      records: attendanceTodayRecords[sectionId] ?? [],
    }
  },

  markAttendance(
    sectionId: string,
    studentId: string,
    state: AttendanceState,
    notes: string | null,
  ): AttendanceRosterResponse {
    const list = attendanceTodayRecords[sectionId] ?? []
    attendanceTodayRecords[sectionId] = list.map((r) =>
      r.studentId === studentId ? { ...r, state, notes } : r,
    )
    return schoolMocks.attendanceRoster(sectionId)
  },

  attendanceSummary(): AttendanceSummary {
    const today = todayDateOnly()
    let total = 0
    let present = 0
    let absent = 0
    let late = 0
    let excused = 0
    const byClass: AttendanceSummary['byClass'] = []
    for (const c of classesData) {
      for (const s of c.sections) {
        const list = attendanceTodayRecords[s.id] ?? []
        const p = list.filter((r) => r.state === 'present' || r.state === 'late').length
        const a = list.filter((r) => r.state === 'absent').length
        const l = list.filter((r) => r.state === 'late').length
        const e = list.filter((r) => r.state === 'excused').length
        total += list.length
        present += p
        absent += a
        late += l
        excused += e
        byClass.push({
          classId: s.id,
          className: c.name,
          sectionName: s.name,
          present: p,
          absent: a,
          attendanceRate: list.length === 0 ? 0 : p / list.length,
        })
      }
    }
    return {
      date: today,
      totalStudents: total,
      present,
      absent,
      late,
      excused,
      byClass,
    }
  },

  /* exams */
  exams(): ExamsResponse {
    return {
      items: examsData.map(({ papers: _, ...rest }) => {
        void _
        return rest
      }),
    }
  },

  exam(id: string): ExamDetail | null {
    return examsData.find((e) => e.id === id) ?? null
  },

  gradebook(examId: string, paperId: string, sectionId: string): GradebookResponse | null {
    const exam = examsData.find((e) => e.id === examId)
    const paper = exam?.papers.find((p) => p.id === paperId)
    if (!exam || !paper) return null
    const section = classesData
      .flatMap((c) => c.sections.map((s) => ({ ...s, className: c.name })))
      .find((s) => s.id === sectionId)
    if (!section) return null
    const sectionStudents = students.filter((s) => s.sectionId === sectionId)
    const rows = sectionStudents.map((st, i) => {
      // Spread marks deterministically — top-of-class kids score higher.
      const idx = parseInt(st.id.replace(/[^0-9]/g, ''), 10)
      const fudge = ((idx + i) % 13) / 13
      const ratio = 0.55 + fudge * 0.4
      const marks = Math.round(paper.maxMarks * ratio)
      const percent = marks / paper.maxMarks
      return {
        studentId: st.id,
        studentName: `${st.firstName} ${st.lastName}`,
        rollNumber: st.rollNumber,
        marks,
        maxMarks: paper.maxMarks,
        grade: gradeFor(percent),
      }
    })
    return {
      examId,
      examName: exam.name,
      paperId,
      subjectName: paper.subjectName,
      classId: sectionId,
      className: section.className,
      sectionName: section.name,
      maxMarks: paper.maxMarks,
      passingMarks: paper.passingMarks,
      rows,
    }
  },

  reportCards(termName = 'Term 2'): ReportCardsResponse {
    const items = students.map<ReportCardsResponse['items'][number]>((s) => {
      const idx = parseInt(s.id.replace(/[^0-9]/g, ''), 10)
      const baseRatio = 0.55 + ((idx % 11) / 11) * 0.42
      const subjects = ['Mathematics', 'English', 'Science', 'History', 'Computer Science', 'Urdu'].map(
        (subj, i) => {
          const r = Math.min(1, Math.max(0.4, baseRatio + ((i + idx) % 7) / 30))
          const max = 100
          const m = Math.round(max * r)
          return {
            subjectName: subj,
            marks: m,
            maxMarks: max,
            grade: gradeFor(m / max),
            remarks: r >= 0.85 ? 'Excellent' : r < 0.5 ? 'Needs improvement' : null,
          }
        },
      )
      const total = subjects.reduce((sum, x) => sum + x.marks, 0)
      const totalMax = subjects.reduce((sum, x) => sum + x.maxMarks, 0)
      const percent = total / totalMax
      return {
        id: `rc-${s.id}-${termName}`,
        studentId: s.id,
        studentName: `${s.firstName} ${s.lastName}`,
        className: s.className,
        sectionName: s.sectionName,
        termName,
        totalMarks: total,
        totalMaxMarks: totalMax,
        percentage: percent,
        overallGrade: gradeFor(percent),
        rank: idx % 9 === 0 ? 1 : null,
        classSize: students.filter((x) => x.classId === s.classId).length,
        attendanceRate: s.attendanceRate,
        conduct: s.attendanceRate > 0.95 ? 'Excellent' : s.attendanceRate > 0.85 ? 'Good' : 'Needs attention',
        subjects,
        homeroomRemarks:
          percent >= 0.85
            ? 'A pleasure to teach. Keep up the good work.'
            : percent < 0.55
              ? 'Will benefit from additional support — please review with the homeroom teacher.'
              : null,
      }
    })
    return { items }
  },

  /* fees */
  feeStructures(): FeeStructuresResponse {
    return {
      items: feeStructuresData.map((f) => ({
        id: f.id,
        name: f.name,
        classId: f.classId,
        className: f.className,
        amount: f.amount,
        frequency: f.frequency,
        currency: CURRENCY,
        lateFee: f.lateFee,
        dueDay: f.dueDay,
        studentsAssigned: f.students,
      })),
    }
  },

  studentFees(): StudentFeesResponse {
    const expected = studentFeeRows.reduce((s, r) => s + r.amount, 0)
    const collected = studentFeeRows.reduce((s, r) => s + r.paid, 0)
    const outstanding = studentFeeRows.reduce((s, r) => s + r.outstanding, 0)
    const overdue = studentFeeRows
      .filter((r) => r.status === 'overdue')
      .reduce((s, r) => s + r.outstanding, 0)
    return {
      items: studentFeeRows,
      totals: {
        expected,
        collected,
        outstanding,
        overdue,
        currency: CURRENCY,
      },
    }
  },

  collectFee(id: string): StudentFeesResponse {
    studentFeeRows = studentFeeRows.map((r) =>
      r.id === id
        ? { ...r, paid: r.amount, outstanding: 0, status: 'paid' as const }
        : r,
    )
    return schoolMocks.studentFees()
  },

  scholarships(): ScholarshipsResponse {
    return { items: scholarshipsData }
  },

  /* transport */
  transportRoutes(): TransportRoutesResponse {
    return { items: transportRoutesData }
  },

  /* library */
  libraryBooks(): LibraryBooksResponse {
    return { items: libraryBooksData.map((b) => ({ id: b.id, isbn: b.isbn, title: b.title, author: b.author, category: b.category, copiesTotal: b.total, copiesAvailable: b.available })) }
  },

  libraryIssuances(): LibraryIssuancesResponse {
    return { items: libraryIssuancesData }
  },

  /* hostel */
  hostel(): HostelResponse {
    const items = hostelData.map((h) => ({
      id: h.id,
      building: h.building,
      roomNumber: h.roomNumber,
      capacity: h.capacity,
      occupied: h.occupants.length,
      type: h.type,
      occupants: h.occupants,
    }))
    const totals = items.reduce(
      (acc, r) => ({
        rooms: acc.rooms + 1,
        capacity: acc.capacity + r.capacity,
        occupied: acc.occupied + r.occupied,
      }),
      { rooms: 0, capacity: 0, occupied: 0 },
    )
    return { items, totals }
  },

  /* announcements + calendar */
  announcements(): AnnouncementsResponse {
    return { items: [...announcementsData].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.publishedAt.localeCompare(a.publishedAt)) }
  },

  calendar(): CalendarEventsResponse {
    return { items: calendarEventsData.sort((a, b) => a.startDate.localeCompare(b.startDate)) }
  },

  overview(): SchoolOverview {
    const totalStudents = students.filter((s) => s.status === 'enrolled').length
    const summary = schoolMocks.attendanceSummary()
    return {
      totalStudents,
      totalTeachers: teachersData.length,
      totalClasses: classesData.length,
      presentToday: summary.present,
      attendanceRate:
        summary.totalStudents === 0 ? 0 : summary.present / summary.totalStudents,
      feesCollectedTerm: studentFeeRows.reduce((s, r) => s + r.paid, 0),
      feesOutstanding: studentFeeRows.reduce((s, r) => s + r.outstanding, 0),
      upcomingExams: examsData.filter((e) => e.status === 'scheduled').length,
      unreadAnnouncements: 3,
      currency: CURRENCY,
    }
  },
}

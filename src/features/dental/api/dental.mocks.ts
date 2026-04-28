import type {
  Claim,
  ClaimsResponse,
  InsuranceProvider,
  Patient,
  PatientDetail,
  PatientInput,
  PatientListFilters,
  PatientsResponse,
  ProcedureCode,
  ProcedureCodesResponse,
  ProvidersResponse,
  Recall,
  RecallsResponse,
  ToothChart,
  ToothMark,
  ToothMarkInput,
  TreatmentPlan,
  TreatmentPlanDetail,
  TreatmentPlansResponse,
} from './dental.contracts'

const CURRENCY = 'USD'

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}
function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toISOString()
}

/* -------------------- patients -------------------- */

let patients: PatientDetail[] = [
  {
    id: 'pt-1001',
    chartNumber: 'P-1001',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.m@example.com',
    phone: '+1 415 555 0182',
    dateOfBirth: '1986-03-12',
    status: 'active',
    insurer: 'Aetna PPO',
    primaryDentistName: 'Dr. Ahmed',
    lastVisitAt: daysAgo(8),
    nextVisitAt: daysFromNow(0),
    recallDueAt: daysFromNow(160),
    outstandingBalance: 0,
    currency: CURRENCY,
    allergies: ['Latex', 'Codeine'],
    conditions: ['Bruxism'],
    medications: ['Lisinopril 10mg'],
    notes: 'Prefers afternoon appointments. Wears night guard.',
  },
  {
    id: 'pt-1002',
    chartNumber: 'P-1002',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.g@example.com',
    phone: '+34 612 345 678',
    dateOfBirth: '1992-09-04',
    status: 'active',
    insurer: 'Delta Dental',
    primaryDentistName: 'Dr. Ahmed',
    lastVisitAt: daysAgo(2),
    nextVisitAt: daysFromNow(0),
    recallDueAt: daysFromNow(180),
    outstandingBalance: 365,
    currency: CURRENCY,
    allergies: [],
    conditions: [],
    medications: [],
    notes: 'New patient — completed intake last visit.',
  },
  {
    id: 'pt-1003',
    chartNumber: 'P-1003',
    firstName: 'Khalid',
    lastName: 'Al-Rashid',
    email: 'khalid@al-rashid-law.com',
    phone: '+971 50 123 4567',
    dateOfBirth: '1978-11-22',
    status: 'recall_due',
    insurer: 'Cigna',
    primaryDentistName: 'Dr. Ahmed',
    lastVisitAt: daysAgo(190),
    nextVisitAt: null,
    recallDueAt: daysAgo(10),
    outstandingBalance: 0,
    currency: CURRENCY,
    allergies: ['Penicillin'],
    conditions: [],
    medications: [],
    notes: null,
  },
  {
    id: 'pt-1004',
    chartNumber: 'P-1004',
    firstName: 'Tariq',
    lastName: 'Bajwa',
    email: null,
    phone: null,
    dateOfBirth: '1969-04-15',
    status: 'recall_due',
    insurer: null,
    primaryDentistName: 'Hygienist Lina',
    lastVisitAt: daysAgo(220),
    nextVisitAt: null,
    recallDueAt: daysAgo(40),
    outstandingBalance: 850,
    currency: CURRENCY,
    allergies: [],
    conditions: ['Hypertension'],
    medications: ['Amlodipine'],
    notes: 'Prefers paper receipts.',
  },
  {
    id: 'pt-1005',
    chartNumber: 'P-1005',
    firstName: 'Ahmed',
    lastName: 'Khan',
    email: 'ahmed.khan@clinic.com',
    phone: '+92 321 678 1234',
    dateOfBirth: '1955-07-30',
    status: 'inactive',
    insurer: 'Self-pay',
    primaryDentistName: 'Dr. Ahmed',
    lastVisitAt: daysAgo(420),
    nextVisitAt: null,
    recallDueAt: null,
    outstandingBalance: 4_100,
    currency: CURRENCY,
    allergies: [],
    conditions: ['Diabetes type 2'],
    medications: ['Metformin'],
    notes: 'Outstanding balance — collection paused while disputed.',
  },
]

/* -------------------- tooth charts -------------------- */

const charts: Record<string, ToothChart> = {
  'pt-1001': {
    patientId: 'pt-1001',
    marks: [
      { toothNumber: 14, surface: 'occlusal', kind: 'restoration', notes: 'Composite, 2024-08', recordedAt: daysAgo(120) },
      { toothNumber: 26, surface: null, kind: 'crown', notes: 'Porcelain crown', recordedAt: daysAgo(8) },
      { toothNumber: 36, surface: null, kind: 'root_canal', notes: 'Endo completed 2024', recordedAt: daysAgo(380) },
      { toothNumber: 47, surface: 'mesial', kind: 'caries', notes: 'Watch — small lesion', recordedAt: daysAgo(8) },
    ],
    updatedAt: daysAgo(8),
  },
  'pt-1002': {
    patientId: 'pt-1002',
    marks: [
      { toothNumber: 16, surface: 'occlusal', kind: 'caries', notes: null, recordedAt: daysAgo(2) },
      { toothNumber: 25, surface: 'distal', kind: 'caries', notes: null, recordedAt: daysAgo(2) },
    ],
    updatedAt: daysAgo(2),
  },
  'pt-1003': { patientId: 'pt-1003', marks: [], updatedAt: daysAgo(190) },
  'pt-1004': {
    patientId: 'pt-1004',
    marks: [
      { toothNumber: 17, surface: null, kind: 'extraction', notes: 'Lost 2018', recordedAt: daysAgo(220) },
      { toothNumber: 46, surface: null, kind: 'implant', notes: 'Implant — placed 2022', recordedAt: daysAgo(220) },
    ],
    updatedAt: daysAgo(220),
  },
  'pt-1005': {
    patientId: 'pt-1005',
    marks: [
      { toothNumber: 11, surface: 'mesial', kind: 'restoration', notes: null, recordedAt: daysAgo(420) },
      { toothNumber: 21, surface: 'mesial', kind: 'restoration', notes: null, recordedAt: daysAgo(420) },
    ],
    updatedAt: daysAgo(420),
  },
}

/* -------------------- treatment plans -------------------- */

let plans: TreatmentPlanDetail[] = [
  {
    id: 'tp-001',
    patientId: 'pt-1001',
    patientName: 'Sarah Mitchell',
    title: 'Crown #26 + watch caries #47',
    status: 'in_progress',
    totalFee: 2_555,
    totalInsurance: 1_650,
    totalPatient: 905,
    currency: CURRENCY,
    presentedAt: daysAgo(15),
    acceptedAt: daysAgo(14),
    procedureCount: 3,
    notes: 'Crown placement complete; sealant + watch on #47.',
    procedures: [
      {
        id: 'pr-001-1',
        code: 'D2740',
        name: 'Crown · porcelain',
        toothNumber: 26,
        surface: null,
        status: 'completed',
        fee: 2_400,
        insuranceCovered: 1_550,
        patientResponsibility: 850,
        scheduledFor: daysAgo(8),
        completedAt: daysAgo(8),
      },
      {
        id: 'pr-001-2',
        code: 'D9248',
        name: 'Local anesthesia',
        toothNumber: 26,
        surface: null,
        status: 'completed',
        fee: 60,
        insuranceCovered: 0,
        patientResponsibility: 60,
        scheduledFor: daysAgo(8),
        completedAt: daysAgo(8),
      },
      {
        id: 'pr-001-3',
        code: 'D1351',
        name: 'Sealant — first molar',
        toothNumber: 47,
        surface: 'occlusal',
        status: 'planned',
        fee: 95,
        insuranceCovered: 100,
        patientResponsibility: 0,
        scheduledFor: daysFromNow(14),
        completedAt: null,
      },
    ],
  },
  {
    id: 'tp-002',
    patientId: 'pt-1002',
    patientName: 'Maria Garcia',
    title: 'New patient package · 2 fillings',
    status: 'proposed',
    totalFee: 580,
    totalInsurance: 420,
    totalPatient: 160,
    currency: CURRENCY,
    presentedAt: daysAgo(2),
    acceptedAt: null,
    procedureCount: 2,
    notes: null,
    procedures: [
      {
        id: 'pr-002-1',
        code: 'D2391',
        name: 'Resin filling · 1 surface',
        toothNumber: 16,
        surface: 'occlusal',
        status: 'planned',
        fee: 225,
        insuranceCovered: 165,
        patientResponsibility: 60,
        scheduledFor: null,
        completedAt: null,
      },
      {
        id: 'pr-002-2',
        code: 'D2392',
        name: 'Resin filling · 2 surfaces',
        toothNumber: 25,
        surface: 'distal',
        status: 'planned',
        fee: 355,
        insuranceCovered: 255,
        patientResponsibility: 100,
        scheduledFor: null,
        completedAt: null,
      },
    ],
  },
  {
    id: 'tp-003',
    patientId: 'pt-1004',
    patientName: 'Tariq Bajwa',
    title: 'Comprehensive recall + scaling',
    status: 'draft',
    totalFee: 480,
    totalInsurance: 0,
    totalPatient: 480,
    currency: CURRENCY,
    presentedAt: null,
    acceptedAt: null,
    procedureCount: 2,
    notes: 'Self-pay; flag for payment plan.',
    procedures: [
      {
        id: 'pr-003-1',
        code: 'D0150',
        name: 'Comprehensive oral evaluation',
        toothNumber: null,
        surface: null,
        status: 'planned',
        fee: 180,
        insuranceCovered: 0,
        patientResponsibility: 180,
        scheduledFor: null,
        completedAt: null,
      },
      {
        id: 'pr-003-2',
        code: 'D4341',
        name: 'Scaling · 4+ teeth per quadrant',
        toothNumber: null,
        surface: null,
        status: 'planned',
        fee: 300,
        insuranceCovered: 0,
        patientResponsibility: 300,
        scheduledFor: null,
        completedAt: null,
      },
    ],
  },
]

/* -------------------- recalls -------------------- */

function buildRecalls(): Recall[] {
  return patients
    .filter((p) => p.recallDueAt !== null)
    .map((p) => {
      const due = new Date(p.recallDueAt!).getTime()
      const daysOverdue = Math.round((Date.now() - due) / 86_400_000)
      return {
        id: `rc-${p.id}`,
        patientId: p.id,
        patientName: `${p.firstName} ${p.lastName}`,
        reason: 'cleaning' as const,
        dueAt: p.recallDueAt!,
        daysOverdue,
        lastVisitAt: p.lastVisitAt,
        primaryDentistName: p.primaryDentistName,
        contacted: false,
      }
    })
}

/* -------------------- insurance + claims -------------------- */

const providers: InsuranceProvider[] = [
  { id: 'ins-aetna', name: 'Aetna', network: 'PPO', phone: '+1 800 872 3862', payerId: '60054', memberCount: 1 },
  { id: 'ins-delta', name: 'Delta Dental', network: 'PPO', phone: '+1 800 932 0783', payerId: 'CDCA1', memberCount: 1 },
  { id: 'ins-cigna', name: 'Cigna', network: 'DPPO', phone: '+1 800 244 6224', payerId: '62308', memberCount: 1 },
  { id: 'ins-uhc', name: 'UnitedHealthcare', network: 'PPO', phone: '+1 877 816 3596', payerId: '52133', memberCount: 0 },
]

let claims: Claim[] = [
  {
    id: 'cl-001',
    number: 'CLM-2026-014',
    patientId: 'pt-1001',
    patientName: 'Sarah Mitchell',
    insurerName: 'Aetna',
    status: 'paid',
    billedAmount: 2_460,
    approvedAmount: 1_550,
    patientPortion: 910,
    currency: CURRENCY,
    submittedAt: daysAgo(6),
    decidedAt: daysAgo(2),
  },
  {
    id: 'cl-002',
    number: 'CLM-2026-018',
    patientId: 'pt-1002',
    patientName: 'Maria Garcia',
    insurerName: 'Delta Dental',
    status: 'submitted',
    billedAmount: 580,
    approvedAmount: 0,
    patientPortion: 0,
    currency: CURRENCY,
    submittedAt: daysAgo(1),
    decidedAt: null,
  },
  {
    id: 'cl-003',
    number: 'CLM-2026-009',
    patientId: 'pt-1003',
    patientName: 'Khalid Al-Rashid',
    insurerName: 'Cigna',
    status: 'partial',
    billedAmount: 1_900,
    approvedAmount: 1_100,
    patientPortion: 800,
    currency: CURRENCY,
    submittedAt: daysAgo(20),
    decidedAt: daysAgo(7),
  },
  {
    id: 'cl-004',
    number: 'CLM-2025-211',
    patientId: 'pt-1005',
    patientName: 'Ahmed Khan',
    insurerName: 'Aetna',
    status: 'denied',
    billedAmount: 4_100,
    approvedAmount: 0,
    patientPortion: 4_100,
    currency: CURRENCY,
    submittedAt: daysAgo(60),
    decidedAt: daysAgo(45),
  },
]

/* -------------------- procedure codes -------------------- */

const procedureCodes: ProcedureCode[] = [
  { code: 'D0120', name: 'Periodic oral evaluation', category: 'Diagnostic', defaultFee: 60 },
  { code: 'D0150', name: 'Comprehensive oral evaluation', category: 'Diagnostic', defaultFee: 180 },
  { code: 'D0210', name: 'Full-mouth X-rays', category: 'Imaging', defaultFee: 145 },
  { code: 'D0274', name: 'Bitewing X-rays · 4 films', category: 'Imaging', defaultFee: 75 },
  { code: 'D1110', name: 'Adult prophylaxis (cleaning)', category: 'Preventive', defaultFee: 110 },
  { code: 'D1206', name: 'Topical fluoride varnish', category: 'Preventive', defaultFee: 45 },
  { code: 'D1351', name: 'Sealant per tooth', category: 'Preventive', defaultFee: 95 },
  { code: 'D2150', name: 'Amalgam filling · 2 surfaces', category: 'Restorative', defaultFee: 175 },
  { code: 'D2391', name: 'Resin filling · 1 surface', category: 'Restorative', defaultFee: 225 },
  { code: 'D2392', name: 'Resin filling · 2 surfaces', category: 'Restorative', defaultFee: 355 },
  { code: 'D2740', name: 'Crown · porcelain/ceramic', category: 'Restorative', defaultFee: 2_400 },
  { code: 'D3320', name: 'Endodontic · bicuspid', category: 'Endodontics', defaultFee: 1_050 },
  { code: 'D4341', name: 'Scaling · 4+ teeth per quadrant', category: 'Periodontics', defaultFee: 300 },
  { code: 'D7140', name: 'Extraction · erupted tooth', category: 'Oral surgery', defaultFee: 250 },
  { code: 'D7210', name: 'Extraction · surgical', category: 'Oral surgery', defaultFee: 480 },
  { code: 'D9248', name: 'Local anesthesia', category: 'Adjunctive', defaultFee: 60 },
]

/* -------------------- query helpers -------------------- */

function applyFilters(items: Patient[], f: PatientListFilters): Patient[] {
  const q = f.search?.trim().toLowerCase()
  return items.filter((p) => {
    if (f.status && p.status !== f.status) return false
    if (q) {
      const hay = `${p.firstName} ${p.lastName} ${p.chartNumber} ${p.email ?? ''} ${p.phone ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

function listView(p: PatientDetail): Patient {
  const { allergies: _a, conditions: _c, medications: _m, notes: _n, ...rest } = p
  void _a; void _c; void _m; void _n
  return rest
}

export const dentalMocks = {
  /* patients */
  list(filters: PatientListFilters): PatientsResponse {
    const items = applyFilters(patients.map(listView), filters).sort((a, b) =>
      (b.lastVisitAt ?? b.recallDueAt ?? '').localeCompare(
        a.lastVisitAt ?? a.recallDueAt ?? '',
      ),
    )
    return { items, total: items.length }
  },

  get(id: string): PatientDetail | null {
    return patients.find((p) => p.id === id) ?? null
  },

  create(input: PatientInput): PatientDetail {
    const id = `pt-${Date.now()}`
    const created: PatientDetail = {
      id,
      chartNumber: `P-${1000 + patients.length + 1}`,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email && input.email.length > 0 ? input.email : null,
      phone: input.phone && input.phone.length > 0 ? input.phone : null,
      dateOfBirth: input.dateOfBirth ?? null,
      status: 'active',
      insurer: input.insurer ?? null,
      primaryDentistName: input.primaryDentistName ?? null,
      lastVisitAt: null,
      nextVisitAt: null,
      recallDueAt: null,
      outstandingBalance: 0,
      currency: CURRENCY,
      allergies: [],
      conditions: [],
      medications: [],
      notes: input.notes ?? null,
    }
    patients = [created, ...patients]
    charts[id] = { patientId: id, marks: [], updatedAt: new Date().toISOString() }
    return created
  },

  update(id: string, patch: Partial<PatientInput>): PatientDetail | null {
    const idx = patients.findIndex((p) => p.id === id)
    if (idx < 0) return null
    const cur = patients[idx]
    patients[idx] = {
      ...cur,
      firstName: patch.firstName ?? cur.firstName,
      lastName: patch.lastName ?? cur.lastName,
      email: patch.email !== undefined ? (patch.email || null) : cur.email,
      phone: patch.phone !== undefined ? (patch.phone || null) : cur.phone,
      dateOfBirth: patch.dateOfBirth ?? cur.dateOfBirth,
      insurer: patch.insurer !== undefined ? (patch.insurer || null) : cur.insurer,
      primaryDentistName:
        patch.primaryDentistName !== undefined
          ? patch.primaryDentistName || null
          : cur.primaryDentistName,
      notes: patch.notes !== undefined ? (patch.notes || null) : cur.notes,
    }
    return patients[idx]
  },

  /* tooth chart */
  chart(patientId: string): ToothChart | null {
    return charts[patientId] ?? null
  },

  addMark(patientId: string, input: ToothMarkInput): ToothChart {
    const cur = charts[patientId] ?? {
      patientId,
      marks: [],
      updatedAt: new Date().toISOString(),
    }
    const mark: ToothMark = {
      toothNumber: input.toothNumber,
      surface: input.surface,
      kind: input.kind,
      notes: input.notes ?? null,
      recordedAt: new Date().toISOString(),
    }
    const next: ToothChart = {
      ...cur,
      marks: [...cur.marks, mark],
      updatedAt: new Date().toISOString(),
    }
    charts[patientId] = next
    return next
  },

  removeMarks(
    patientId: string,
    toothNumber: number,
    surface: ToothMark['surface'],
  ): ToothChart | null {
    const cur = charts[patientId]
    if (!cur) return null
    const next: ToothChart = {
      ...cur,
      marks: cur.marks.filter(
        (m) => !(m.toothNumber === toothNumber && m.surface === surface),
      ),
      updatedAt: new Date().toISOString(),
    }
    charts[patientId] = next
    return next
  },

  /* treatment plans */
  plansForPatient(patientId: string): TreatmentPlansResponse {
    const items = plans
      .filter((p) => p.patientId === patientId)
      .map<TreatmentPlan>(({ procedures: _p, notes: _n, ...rest }) => {
        void _p; void _n
        return rest
      })
    return { items }
  },

  plan(id: string): TreatmentPlanDetail | null {
    return plans.find((p) => p.id === id) ?? null
  },

  /* recalls */
  recalls(): RecallsResponse {
    const items = buildRecalls().sort((a, b) => b.daysOverdue - a.daysOverdue)
    return { items }
  },

  toggleContacted(id: string): Recall | null {
    // No persistence beyond the function call — rebuild and toggle a virtual flag.
    const built = buildRecalls()
    const found = built.find((r) => r.id === id)
    if (!found) return null
    return { ...found, contacted: !found.contacted }
  },

  /* insurance */
  providers(): ProvidersResponse {
    return { items: providers }
  },

  claims(): ClaimsResponse {
    return {
      items: [...claims].sort((a, b) =>
        (b.submittedAt ?? '').localeCompare(a.submittedAt ?? ''),
      ),
    }
  },

  /* procedure codes */
  procedureCodes(): ProcedureCodesResponse {
    return { items: procedureCodes }
  },
}

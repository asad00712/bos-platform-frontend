import type {
  Appointment,
  AppointmentDetail,
  AppointmentInput,
  AppointmentsResponse,
  RangeQuery,
  Resource,
  ResourcesResponse,
} from './scheduling.contracts'

const RESOURCES: Resource[] = [
  { id: 'res-1', name: 'Operatory 1', kind: 'Operatory', color: 'oklch(0.65 0.13 220)' },
  { id: 'res-2', name: 'Operatory 2', kind: 'Operatory', color: 'oklch(0.6 0.18 280)' },
  { id: 'res-3', name: 'Hygiene room', kind: 'Hygiene', color: 'oklch(0.7 0.18 50)' },
  { id: 'res-4', name: 'Consult room', kind: 'Consult', color: 'oklch(0.55 0.18 295)' },
]

function isoAt(daysFromToday: number, hour: number, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromToday)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

let appointments: Appointment[] = [
  {
    id: 'apt-1001',
    title: 'Crown fitting · Sarah Mitchell',
    startsAt: isoAt(0, 10, 0),
    endsAt: isoAt(0, 11, 0),
    status: 'confirmed',
    kind: 'procedure',
    contactId: 'c-1001',
    contactName: 'Sarah Mitchell',
    staffName: 'Dr. Ahmed',
    resourceId: 'res-1',
    resourceName: 'Operatory 1',
    notes: 'Final crown placement.',
  },
  {
    id: 'apt-1002',
    title: 'New patient consult · Maria Garcia',
    startsAt: isoAt(0, 14, 30),
    endsAt: isoAt(0, 15, 30),
    status: 'scheduled',
    kind: 'consultation',
    contactId: 'c-1006',
    contactName: 'Maria Garcia',
    staffName: 'Dr. Ahmed',
    resourceId: 'res-4',
    resourceName: 'Consult room',
    notes: null,
  },
  {
    id: 'apt-1003',
    title: 'Hygiene cleaning · Tariq Bajwa',
    startsAt: isoAt(0, 16, 0),
    endsAt: isoAt(0, 16, 45),
    status: 'scheduled',
    kind: 'screening',
    contactId: 'c-1007',
    contactName: 'Tariq Bajwa',
    staffName: 'Hygienist Lina',
    resourceId: 'res-3',
    resourceName: 'Hygiene room',
    notes: null,
  },
  {
    id: 'apt-1004',
    title: 'Follow-up · Khalid Al-Rashid',
    startsAt: isoAt(1, 11, 0),
    endsAt: isoAt(1, 11, 30),
    status: 'scheduled',
    kind: 'follow_up',
    contactId: 'c-1002',
    contactName: 'Khalid Al-Rashid',
    staffName: 'Dr. Ahmed',
    resourceId: 'res-2',
    resourceName: 'Operatory 2',
    notes: 'Discuss retainer.',
  },
  {
    id: 'apt-1005',
    title: 'Procedure · Greenfield Academy',
    startsAt: isoAt(2, 9, 0),
    endsAt: isoAt(2, 10, 30),
    status: 'confirmed',
    kind: 'procedure',
    contactId: 'c-1003',
    contactName: 'Greenfield Academy',
    staffName: 'Dr. Ahmed',
    resourceId: 'res-1',
    resourceName: 'Operatory 1',
    notes: null,
  },
  {
    id: 'apt-1006',
    title: 'Whitening · Bella Italia',
    startsAt: isoAt(3, 13, 0),
    endsAt: isoAt(3, 14, 0),
    status: 'scheduled',
    kind: 'procedure',
    contactId: 'c-1004',
    contactName: 'Bella Italia',
    staffName: 'Dr. Ahmed',
    resourceId: 'res-2',
    resourceName: 'Operatory 2',
    notes: null,
  },
  {
    id: 'apt-1007',
    title: 'Recall checkup · Sarah Mitchell',
    startsAt: isoAt(-2, 10, 0),
    endsAt: isoAt(-2, 10, 30),
    status: 'completed',
    kind: 'screening',
    contactId: 'c-1001',
    contactName: 'Sarah Mitchell',
    staffName: 'Hygienist Lina',
    resourceId: 'res-3',
    resourceName: 'Hygiene room',
    notes: null,
  },
  {
    id: 'apt-1008',
    title: 'Initial consult · Ahmed Khan',
    startsAt: isoAt(-3, 11, 0),
    endsAt: isoAt(-3, 11, 30),
    status: 'no_show',
    kind: 'consultation',
    contactId: 'c-1005',
    contactName: 'Ahmed Khan',
    staffName: 'Dr. Ahmed',
    resourceId: 'res-4',
    resourceName: 'Consult room',
    notes: null,
  },
]

function inRange(item: Appointment, from: string, to: string): boolean {
  const start = new Date(item.startsAt).getTime()
  return start >= new Date(from).getTime() && start <= new Date(to).getTime()
}

export const schedulingMocks = {
  list(query: RangeQuery): AppointmentsResponse {
    const items = appointments.filter((a) => {
      if (!inRange(a, query.from, query.to)) return false
      if (query.resourceId && a.resourceId !== query.resourceId) return false
      if (query.status && a.status !== query.status) return false
      return true
    })
    return { items: [...items].sort((a, b) => a.startsAt.localeCompare(b.startsAt)) }
  },

  resources(): ResourcesResponse {
    return { items: RESOURCES }
  },

  get(id: string): AppointmentDetail | null {
    const a = appointments.find((x) => x.id === id)
    if (!a) return null
    return {
      ...a,
      contactPhone: a.contactId === 'c-1001' ? '+1 415 555 0182' : null,
      contactEmail: a.contactId === 'c-1001' ? 'sarah.m@example.com' : null,
      createdAt: new Date(Date.now() - 86_400_000 * 5).toISOString(),
      cancelledReason: null,
    }
  },

  create(input: AppointmentInput): AppointmentDetail {
    const id = `apt-${Date.now()}`
    const resource = RESOURCES.find((r) => r.id === input.resourceId)
    const created: Appointment = {
      id,
      title: input.title,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: input.status,
      kind: input.kind,
      contactId: input.contactId ?? null,
      contactName: null,
      staffName: input.staffName ?? null,
      resourceId: input.resourceId ?? null,
      resourceName: resource?.name ?? null,
      notes: input.notes ?? null,
    }
    appointments = [...appointments, created]
    return {
      ...created,
      contactPhone: null,
      contactEmail: null,
      createdAt: new Date().toISOString(),
      cancelledReason: null,
    }
  },

  update(id: string, patch: Partial<AppointmentInput>): AppointmentDetail | null {
    const idx = appointments.findIndex((a) => a.id === id)
    if (idx < 0) return null
    const cur = appointments[idx]
    const next: Appointment = {
      ...cur,
      ...patch,
      contactId: patch.contactId !== undefined ? patch.contactId ?? null : cur.contactId,
      staffName: patch.staffName !== undefined ? patch.staffName ?? null : cur.staffName,
      resourceId: patch.resourceId !== undefined ? patch.resourceId ?? null : cur.resourceId,
      resourceName:
        patch.resourceId !== undefined
          ? RESOURCES.find((r) => r.id === patch.resourceId)?.name ?? null
          : cur.resourceName,
      notes: patch.notes !== undefined ? patch.notes ?? null : cur.notes,
    }
    appointments[idx] = next
    return schedulingMocks.get(id)
  },

  cancel(id: string, reason: string | null): AppointmentDetail | null {
    const idx = appointments.findIndex((a) => a.id === id)
    if (idx < 0) return null
    appointments[idx] = { ...appointments[idx], status: 'cancelled' }
    const detail = schedulingMocks.get(id)
    return detail ? { ...detail, cancelledReason: reason } : null
  },

  remove(id: string): boolean {
    const before = appointments.length
    appointments = appointments.filter((a) => a.id !== id)
    return appointments.length < before
  },
}

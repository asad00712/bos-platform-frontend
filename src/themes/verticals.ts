import type { VerticalType } from '../types/tenant'

export type VerticalTerminology = {
  customer: string
  customers: string
  appointment: string
  appointments: string
  record: string
  records: string
  primaryWorkspace: string
}

export type VerticalTheme = {
  vertical: VerticalType
  name: string
  accent: string
  accentSoft: string
  terminology: VerticalTerminology
}

export const verticalThemes: Record<VerticalType, VerticalTheme> = {
  medical: {
    vertical: 'medical',
    name: 'Medical Clinic',
    accent: '#0f766e',
    accentSoft: '#e6f4f1',
    terminology: {
      customer: 'Patient',
      customers: 'Patients',
      appointment: 'Appointment',
      appointments: 'Appointments',
      record: 'EMR',
      records: 'EMR Records',
      primaryWorkspace: 'Clinical Workspace',
    },
  },
  law: {
    vertical: 'law',
    name: 'Law Firm',
    accent: '#334155',
    accentSoft: '#eef2f7',
    terminology: {
      customer: 'Client',
      customers: 'Clients',
      appointment: 'Court Date',
      appointments: 'Court Dates',
      record: 'Case',
      records: 'Cases',
      primaryWorkspace: 'Case Desk',
    },
  },
  restaurant: {
    vertical: 'restaurant',
    name: 'Restaurant',
    accent: '#b45309',
    accentSoft: '#fff4e6',
    terminology: {
      customer: 'Guest',
      customers: 'Guests',
      appointment: 'Reservation',
      appointments: 'Reservations',
      record: 'Order',
      records: 'Orders',
      primaryWorkspace: 'Service Floor',
    },
  },
  school: {
    vertical: 'school',
    name: 'School',
    accent: '#2563eb',
    accentSoft: '#eaf1ff',
    terminology: {
      customer: 'Student',
      customers: 'Students',
      appointment: 'Class',
      appointments: 'Timetable',
      record: 'Academic Record',
      records: 'Academic Records',
      primaryWorkspace: 'Academic Desk',
    },
  },
  gym: {
    vertical: 'gym',
    name: 'Gym',
    accent: '#16a34a',
    accentSoft: '#eaf8ee',
    terminology: {
      customer: 'Member',
      customers: 'Members',
      appointment: 'Class Booking',
      appointments: 'Class Bookings',
      record: 'Fitness Profile',
      records: 'Fitness Profiles',
      primaryWorkspace: 'Training Floor',
    },
  },
}

export function getVerticalTheme(vertical: VerticalType): VerticalTheme {
  return verticalThemes[vertical]
}

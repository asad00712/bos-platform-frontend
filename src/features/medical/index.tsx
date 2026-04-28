import { Navigate } from 'react-router'

export { PatientsListPage } from './pages/PatientsListPage'
export { PatientChartLayout } from './pages/PatientChartLayout'
export { EncounterDetailPage } from './pages/EncounterDetailPage'
export { RefillQueuePage } from './pages/RefillQueuePage'
export { LabInboxPage } from './pages/LabInboxPage'
export { LabReportPage } from './pages/LabReportPage'
export { ImagingStudyPage } from './pages/ImagingStudyPage'
export { SchedulePage } from './pages/SchedulePage'
export { FrontDeskPage } from './pages/FrontDeskPage'
export { RecallsPage as MedicalRecallsPage } from './pages/RecallsPage'
export { TelehealthRoomPage } from './pages/TelehealthRoomPage'
export { SuperbillPage } from './pages/SuperbillPage'
export { BillingWorklistPage } from './pages/BillingWorklistPage'
export { ClaimDetailPage } from './pages/ClaimDetailPage'
export { ClinicalLocalePage } from './pages/admin/ClinicalLocalePage'
export { AuditOverviewPage as MedicalAuditOverviewPage } from './pages/admin/AuditOverviewPage'

/* Patient portal */
export { PortalLayout } from './portal/PortalLayout'
export { PortalHomePage } from './portal/PortalHomePage'
export { PortalAppointmentsPage } from './portal/PortalAppointmentsPage'
export { PortalMessagesPage } from './portal/PortalMessagesPage'
export { PortalResultsPage } from './portal/PortalResultsPage'
export { PortalMedicationsPage } from './portal/PortalMedicationsPage'
export { PortalBillingPage } from './portal/PortalBillingPage'

export { PatientSummaryPage } from './pages/chart/PatientSummaryPage'
export { ProblemsPage } from './pages/chart/ProblemsPage'
export { AllergiesPage } from './pages/chart/AllergiesPage'
export { MedicationsPage } from './pages/chart/MedicationsPage'
export { ImmunizationsPage } from './pages/chart/ImmunizationsPage'
export { GrowthPage } from './pages/chart/GrowthPage'
export { PregnancyPage } from './pages/chart/PregnancyPage'
export { PsychScalesPage } from './pages/chart/PsychScalesPage'
export { LabsPage } from './pages/chart/LabsPage'
export { ImagingPage } from './pages/chart/ImagingPage'
export { VitalsPage } from './pages/chart/VitalsPage'
export { EncountersPage } from './pages/chart/EncountersPage'
export { HistoryPage } from './pages/chart/HistoryPage'
export { DocumentsPage } from './pages/chart/DocumentsPage'
export { AccessLogPage } from './pages/chart/AccessLogPage'
export { CarePlanPage } from './pages/chart/CarePlanPage'
export { BillingPage } from './pages/chart/BillingPage'
export { ComingSoonPage } from './pages/chart/ComingSoonPage'

export function MedicalIndexRedirect() {
  return <Navigate to="/app/medical/patients" replace />
}

export type {
  Allergy,
  Appointment,
  AuditEvent,
  Claim,
  Coverage,
  DiagnosticReport,
  Document,
  Encounter,
  EncounterNote,
  ImagingStudy,
  Immunization,
  MedicationRequest,
  Patient,
  PatientDetail,
  Practitioner,
  Pregnancy,
  PsychScale,
  RecallEntry,
  RefillRequest,
  ServiceRequest,
  SoapNote,
} from './api/medical.contracts'

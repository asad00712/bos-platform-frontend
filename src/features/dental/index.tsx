import { Navigate } from 'react-router'

export { PatientsListPage } from './pages/PatientsListPage'
export { PatientDetailPage } from './pages/PatientDetailPage'
export { TreatmentPlanDetailPage } from './pages/TreatmentPlanDetailPage'
export { RecallsPage } from './pages/RecallsPage'
export { ClaimsPage } from './pages/ClaimsPage'
export { InsuranceProvidersPage } from './pages/InsuranceProvidersPage'
export { ProcedureCodesPage } from './pages/ProcedureCodesPage'
export { AuditOverviewPage as DentalAuditOverviewPage } from './pages/AuditOverviewPage'
export { NewPatientDialog } from './components/NewPatientDialog'
export { ToothChart } from './components/ToothChart'

export function DentalIndexRedirect() {
  return <Navigate to="/app/dental/patients" replace />
}

export type {
  Claim,
  ClaimStatus,
  InsuranceProvider,
  Patient,
  PatientDetail,
  PatientStatus,
  Procedure,
  ProcedureStatus,
  Recall,
  ToothChart as ToothChartShape,
  ToothMark,
  TreatmentPlan,
  TreatmentPlanDetail,
  TreatmentPlanStatus,
} from './api/dental.contracts'

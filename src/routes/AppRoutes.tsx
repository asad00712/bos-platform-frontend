import { Navigate, Route, Routes } from 'react-router'

import { AppShell } from '@/layout/AppShell'
import { RequireAuth } from '@/routes/guards/RequireAuth'
import { RequireGuest } from '@/routes/guards/RequireGuest'
import { SessionBootstrap } from '@/features/auth/SessionBootstrap'

import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignupPage } from '@/features/auth/pages/SignupPage'
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { ForgotPasswordSentPage } from '@/features/auth/pages/ForgotPasswordSentPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { ResetPasswordDonePage } from '@/features/auth/pages/ResetPasswordDonePage'
import { VerifyTwoFactorPage } from '@/features/auth/pages/VerifyTwoFactorPage'

import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import {
  ContactDetailPage,
  ContactsListPage,
  SegmentsPage,
} from '@/features/crm'
import {
  AppointmentDetailPage,
  ResourcesPage,
  ScheduleCalendarPage,
} from '@/features/scheduling'
import {
  BillingOverviewPage,
  InvoiceDetailPage,
  InvoicesListPage,
  PaymentsListPage,
} from '@/features/billing'
import {
  AttendancePage,
  EmployeeDetailPage,
  EmployeesListPage,
  LeavesPage,
} from '@/features/hrm'
import {
  DocumentDetailPage,
  DocumentsListPage,
  TemplatesPage,
} from '@/features/documents'
import {
  CommunicationTemplatesPage,
  InboxPage,
} from '@/features/communication'
import {
  OperationsReportPage,
  ReportsLibraryPage,
  SalesReportPage,
  StaffReportPage,
} from '@/features/reports'
import {
  ApiKeysPlaceholder,
  BrandingSettingsPage,
  DataPlaceholder,
  FeatureFlagsPlaceholder,
  IntegrationsPage,
  MembersPage,
  OrganizationSettingsPage,
  PlanBillingPage,
  PreferencesPage,
  RolesPage,
  SecurityPlaceholder,
  SettingsIndexRedirect,
  SettingsLayout,
} from '@/features/settings'
import { AuditLogPage, SessionsPage } from '@/features/audit'
import {
  NotificationPreferencesPage,
  NotificationsListPage,
} from '@/features/notifications'
import {
  SupportHomePage,
  TicketDetailPage,
  TicketsListPage,
} from '@/features/support'
import {
  AutomationRunsPage,
  AutomationTemplatesPage,
  WorkflowDetailPage,
  WorkflowsListPage,
} from '@/features/automation'
import {
  ClaimsPage as DentalClaimsPage,
  DentalAuditOverviewPage,
  DentalIndexRedirect,
  InsuranceProvidersPage,
  PatientDetailPage,
  PatientsListPage,
  ProcedureCodesPage,
  RecallsPage,
  TreatmentPlanDetailPage,
} from '@/features/dental'
import {
  AcademicCalendarPage,
  AnnouncementsPage as SchoolAnnouncementsPage,
  AttendanceOverviewPage,
  ClassesListPage,
  ExamDetailPage,
  ExamsListPage,
  FeeStructuresPage,
  FeesOverviewPage,
  GradebookPage,
  HostelPage,
  LibraryPage,
  ParentsPage,
  ReportCardsPage,
  ScholarshipsPage,
  SchoolAuditOverviewPage,
  SchoolIndexRedirect,
  StudentDetailPage,
  StudentsListPage,
  SubjectsPage,
  TakeAttendancePage,
  TeachersListPage,
  TimetablePage,
  TransportPage,
} from '@/features/school'
import {
  AccessLogPage as MedAccessLogPage,
  AllergiesPage as MedAllergiesPage,
  BillingPage as MedBillingPage,
  CarePlanPage as MedCarePlanPage,
  DocumentsPage as MedDocumentsPage,
  EncounterDetailPage as MedEncounterDetailPage,
  EncountersPage as MedEncountersPage,
  FrontDeskPage as MedFrontDeskPage,
  GrowthPage as MedGrowthPage,
  HistoryPage as MedHistoryPage,
  ImagingPage as MedImagingPage,
  ImagingStudyPage as MedImagingStudyPage,
  ImmunizationsPage as MedImmunizationsPage,
  LabInboxPage as MedLabInboxPage,
  LabReportPage as MedLabReportPage,
  LabsPage as MedLabsPage,
  MedicalIndexRedirect,
  MedicalRecallsPage,
  MedicationsPage as MedMedicationsPage,
  PatientChartLayout as MedChartLayout,
  PatientSummaryPage as MedSummaryPage,
  PatientsListPage as MedPatientsListPage,
  PregnancyPage as MedPregnancyPage,
  ProblemsPage as MedProblemsPage,
  PsychScalesPage as MedPsychScalesPage,
  PortalAppointmentsPage,
  PortalBillingPage,
  PortalHomePage,
  PortalLayout,
  PortalMedicationsPage,
  PortalMessagesPage,
  PortalResultsPage,
  RefillQueuePage as MedRefillQueuePage,
  SchedulePage as MedSchedulePage,
  TelehealthRoomPage as MedTelehealthRoomPage,
  SuperbillPage as MedSuperbillPage,
  BillingWorklistPage as MedBillingWorklistPage,
  ClaimDetailPage as MedClaimDetailPage,
  ClinicalLocalePage as MedClinicalLocalePage,
  MedicalAuditOverviewPage,
  VitalsPage as MedVitalsPage,
} from '@/features/medical'
import { ModulePlaceholderPage } from '@/pages/modules/ModulePlaceholderPage'
import { PublicBookingPage } from '@/pages/public/PublicBookingPage'

import { routes } from '@/routes/routeMap'

const moduleRoutes = [
  { path: 'profile', title: 'My profile', description: 'Personal details and preferences.' },
  /* vertical placeholders — full screens land in Phase 5+ */
  { path: 'law', title: 'Cases', description: 'Matters, court dates, time entries.' },
  { path: 'restaurant', title: 'Restaurant', description: 'Menu, tables, orders.' },
  { path: 'gym', title: 'Gym', description: 'Members, classes, trainers.' },
  { path: 'salon', title: 'Salon', description: 'Clients, services, stylists.' },
  { path: 'retail', title: 'Retail', description: 'Products, POS, inventory.' },
]

export function AppRoutes() {
  return (
    <>
      <SessionBootstrap />
      <Routes>
        <Route path={routes.root()} element={<Navigate to={routes.app.dashboard()} replace />} />

        {/* Public auth routes — bounce authed users to dashboard */}
        <Route element={<RequireGuest />}>
          <Route path={routes.login()} element={<LoginPage />} />
          <Route path={routes.signup()} element={<SignupPage />} />
          <Route path={routes.forgotPassword()} element={<ForgotPasswordPage />} />
          <Route path={routes.resetPassword()} element={<ResetPasswordPage />} />
        </Route>

        {/* Public auth-status pages (no guard) */}
        <Route path={routes.verifyEmail()} element={<VerifyEmailPage />} />
        <Route path={routes.verify2fa()} element={<VerifyTwoFactorPage />} />
        <Route path={routes.forgotPasswordSent()} element={<ForgotPasswordSentPage />} />
        <Route path={routes.resetPasswordDone()} element={<ResetPasswordDonePage />} />
        <Route path="/booking/:tenantSlug" element={<PublicBookingPage />} />

        {/* Patient portal — distinct sub-app, lean shell */}
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<PortalHomePage />} />
          <Route path="appointments" element={<PortalAppointmentsPage />} />
          <Route path="messages" element={<PortalMessagesPage />} />
          <Route path="results" element={<PortalResultsPage />} />
          <Route path="medications" element={<PortalMedicationsPage />} />
          <Route path="billing" element={<PortalBillingPage />} />
        </Route>

        {/* Authenticated app */}
        <Route element={<RequireAuth />}>
          <Route path={routes.app.root()} element={<AppShell />}>
            <Route index element={<Navigate to={routes.app.dashboard()} replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* CRM */}
            <Route path="crm" element={<ContactsListPage />} />
            <Route path="crm/contacts" element={<ContactsListPage />} />
            <Route path="crm/contacts/:id" element={<ContactDetailPage />} />
            <Route path="crm/segments" element={<SegmentsPage />} />

            {/* Scheduling */}
            <Route path="scheduling" element={<ScheduleCalendarPage />} />
            <Route path="scheduling/resources" element={<ResourcesPage />} />
            <Route path="scheduling/appointments/:id" element={<AppointmentDetailPage />} />

            {/* Billing */}
            <Route path="billing" element={<BillingOverviewPage />} />
            <Route path="billing/invoices" element={<InvoicesListPage />} />
            <Route path="billing/invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="billing/payments" element={<PaymentsListPage />} />

            {/* HRM */}
            <Route path="hrm" element={<EmployeesListPage />} />
            <Route path="hrm/employees" element={<EmployeesListPage />} />
            <Route path="hrm/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="hrm/attendance" element={<AttendancePage />} />
            <Route path="hrm/leaves" element={<LeavesPage />} />

            {/* Documents */}
            <Route path="documents" element={<DocumentsListPage />} />
            <Route path="documents/templates" element={<TemplatesPage />} />
            <Route path="documents/:id" element={<DocumentDetailPage />} />

            {/* Communication */}
            <Route path="communication" element={<InboxPage />} />
            <Route path="communication/inbox" element={<InboxPage />} />
            <Route path="communication/templates" element={<CommunicationTemplatesPage />} />

            {/* Reports */}
            <Route path="reports" element={<ReportsLibraryPage />} />
            <Route path="reports/sales" element={<SalesReportPage />} />
            <Route path="reports/operations" element={<OperationsReportPage />} />
            <Route path="reports/staff" element={<StaffReportPage />} />

            {/* Audit */}
            <Route path="audit" element={<AuditLogPage />} />
            <Route path="audit/sessions" element={<SessionsPage />} />

            {/* Notifications */}
            <Route path="notifications" element={<NotificationsListPage />} />
            <Route path="notifications/preferences" element={<NotificationPreferencesPage />} />

            {/* Support */}
            <Route path="support" element={<SupportHomePage />} />
            <Route path="support/tickets" element={<TicketsListPage />} />
            <Route path="support/tickets/:id" element={<TicketDetailPage />} />

            {/* Automation */}
            <Route path="automation" element={<WorkflowsListPage />} />
            <Route path="automation/templates" element={<AutomationTemplatesPage />} />
            <Route path="automation/runs" element={<AutomationRunsPage />} />
            <Route path="automation/:id" element={<WorkflowDetailPage />} />

            {/* Medical vertical */}
            <Route path="medical" element={<MedicalIndexRedirect />} />
            <Route path="medical/patients" element={<MedPatientsListPage />} />
            <Route path="medical/patients/:id" element={<MedChartLayout />}>
              <Route index element={<MedSummaryPage />} />
              <Route path="problems" element={<MedProblemsPage />} />
              <Route path="allergies" element={<MedAllergiesPage />} />
              <Route path="medications" element={<MedMedicationsPage />} />
              <Route path="immunizations" element={<MedImmunizationsPage />} />
              <Route path="vitals" element={<MedVitalsPage />} />
              <Route path="growth" element={<MedGrowthPage />} />
              <Route path="pregnancy" element={<MedPregnancyPage />} />
              <Route path="psych" element={<MedPsychScalesPage />} />
              <Route path="labs" element={<MedLabsPage />} />
              <Route path="imaging" element={<MedImagingPage />} />
              <Route path="history" element={<MedHistoryPage />} />
              <Route path="documents" element={<MedDocumentsPage />} />
              <Route path="encounters" element={<MedEncountersPage />} />
              <Route path="family" element={<MedHistoryPage />} />
              <Route path="care-plan" element={<MedCarePlanPage />} />
              <Route path="billing" element={<MedBillingPage />} />
              <Route path="audit" element={<MedAccessLogPage />} />
            </Route>
            <Route path="medical/encounters/:id" element={<MedEncounterDetailPage />} />
            <Route path="medical/rx/refills" element={<MedRefillQueuePage />} />
            <Route path="medical/labs/inbox" element={<MedLabInboxPage />} />
            <Route path="medical/labs/:id" element={<MedLabReportPage />} />
            <Route path="medical/imaging/:id" element={<MedImagingStudyPage />} />
            <Route path="medical/schedule" element={<MedSchedulePage />} />
            <Route path="medical/front-desk" element={<MedFrontDeskPage />} />
            <Route path="medical/recalls" element={<MedicalRecallsPage />} />
            <Route path="medical/telehealth/:id" element={<MedTelehealthRoomPage />} />
            <Route path="medical/encounters/:id/superbill" element={<MedSuperbillPage />} />
            <Route path="medical/billing" element={<MedBillingWorklistPage />} />
            <Route path="medical/billing/:id" element={<MedClaimDetailPage />} />
            <Route path="medical/admin/clinical-locale" element={<MedClinicalLocalePage />} />
            <Route path="medical/admin/audit" element={<MedicalAuditOverviewPage />} />

            {/* Dental vertical */}
            <Route path="dental" element={<DentalIndexRedirect />} />
            <Route path="dental/patients" element={<PatientsListPage />} />
            <Route path="dental/patients/:id" element={<PatientDetailPage />} />
            <Route path="dental/treatment-plans/:id" element={<TreatmentPlanDetailPage />} />
            <Route path="dental/recalls" element={<RecallsPage />} />
            <Route path="dental/insurance" element={<InsuranceProvidersPage />} />
            <Route path="dental/insurance/claims" element={<DentalClaimsPage />} />
            <Route path="dental/procedure-codes" element={<ProcedureCodesPage />} />
            <Route path="dental/audit" element={<DentalAuditOverviewPage />} />

            {/* School vertical */}
            <Route path="school" element={<SchoolIndexRedirect />} />
            <Route path="school/students" element={<StudentsListPage />} />
            <Route path="school/students/:id" element={<StudentDetailPage />} />
            <Route path="school/parents" element={<ParentsPage />} />
            <Route path="school/classes" element={<ClassesListPage />} />
            <Route path="school/subjects" element={<SubjectsPage />} />
            <Route path="school/teachers" element={<TeachersListPage />} />
            <Route path="school/timetable" element={<TimetablePage />} />
            <Route path="school/attendance" element={<TakeAttendancePage />} />
            <Route path="school/attendance/overview" element={<AttendanceOverviewPage />} />
            <Route path="school/exams" element={<ExamsListPage />} />
            <Route path="school/exams/:id" element={<ExamDetailPage />} />
            <Route path="school/gradebook" element={<GradebookPage />} />
            <Route path="school/report-cards" element={<ReportCardsPage />} />
            <Route path="school/fees" element={<FeesOverviewPage />} />
            <Route path="school/fees/structures" element={<FeeStructuresPage />} />
            <Route path="school/fees/scholarships" element={<ScholarshipsPage />} />
            <Route path="school/transport" element={<TransportPage />} />
            <Route path="school/library" element={<LibraryPage />} />
            <Route path="school/hostel" element={<HostelPage />} />
            <Route path="school/announcements" element={<SchoolAnnouncementsPage />} />
            <Route path="school/calendar" element={<AcademicCalendarPage />} />
            <Route path="school/audit" element={<SchoolAuditOverviewPage />} />

            {/* Settings (nested layout) */}
            <Route path="settings" element={<SettingsLayout />}>
              <Route index element={<SettingsIndexRedirect />} />
              <Route path="organization" element={<OrganizationSettingsPage />} />
              <Route path="branding" element={<BrandingSettingsPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="billing" element={<PlanBillingPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="preferences" element={<PreferencesPage />} />
              <Route path="api-keys" element={<ApiKeysPlaceholder />} />
              <Route path="feature-flags" element={<FeatureFlagsPlaceholder />} />
              <Route path="security" element={<SecurityPlaceholder />} />
              <Route path="data" element={<DataPlaceholder />} />
            </Route>

            {moduleRoutes.map((m) => (
              <Route
                key={m.path}
                path={m.path}
                element={<ModulePlaceholderPage title={m.title} description={m.description} />}
              />
            ))}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={routes.app.dashboard()} replace />} />
      </Routes>
    </>
  )
}

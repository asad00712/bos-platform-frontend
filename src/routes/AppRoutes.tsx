import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from '../layout/AppShell'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { SignupPage } from '../features/auth/pages/SignupPage'
import { VerifyEmailPage } from '../features/auth/pages/VerifyEmailPage'
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage'
import { ForgotPasswordSentPage } from '../features/auth/pages/ForgotPasswordSentPage'
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage'
import { ResetPasswordDonePage } from '../features/auth/pages/ResetPasswordDonePage'
import { VerifyTwoFactorPage } from '../features/auth/pages/VerifyTwoFactorPage'
import { SuperAdminDashboardPage } from '../pages/dashboard/SuperAdminDashboardPage'
import { ModulePlaceholderPage } from '../pages/modules/ModulePlaceholderPage'
import { PublicBookingPage } from '../pages/public/PublicBookingPage'

const moduleRoutes = [
  {
    path: 'medical',
    title: 'Clinical Workspace',
    description:
      'Medical-first workspace for SOAP notes, prescriptions, labs, vitals, and patient care.',
  },
  {
    path: 'patients',
    title: 'Patients',
    description:
      'Patient records, activity timelines, tags, documents, appointments, and billing context.',
  },
  {
    path: 'scheduling',
    title: 'Scheduling',
    description:
      'Day, week, month, agenda, resources, reminders, waiting lists, and public booking slots.',
  },
  {
    path: 'billing',
    title: 'Billing',
    description:
      'Invoices, payment links, partial payments, aging, receipts, and finance handoff.',
  },
  {
    path: 'hrm',
    title: 'HRM',
    description:
      'Employees, attendance, leaves, payroll basics, approvals, and team performance.',
  },
  {
    path: 'documents',
    title: 'Documents',
    description:
      'Secure file management, consent forms, contracts, e-signature, and version history.',
  },
  {
    path: 'communication',
    title: 'Communication',
    description:
      'Email, SMS, internal notes, reminders, and future omnichannel conversations.',
  },
  {
    path: 'automation',
    title: 'Automation',
    description:
      'Trigger-action workflows for reminders, assignments, follow-ups, and escalations.',
  },
  {
    path: 'analytics',
    title: 'Analytics',
    description:
      'Operational reporting, KPI trends, custom reports, and owner-level business intelligence.',
  },
  {
    path: 'audit',
    title: 'Audit & Access',
    description:
      'User activity, access reviews, session awareness, and compliance-facing traceability.',
  },
  {
    path: 'settings',
    title: 'Settings',
    description:
      'Tenant configuration, roles, permissions, branding, feature flags, and vertical settings.',
  },
  {
    path: 'health',
    title: 'System Health',
    description:
      'Frontend readiness surface for API status, queue health, integration status, and incidents.',
  },
]

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/verify-2fa" element={<VerifyTwoFactorPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/forgot-password/sent" element={<ForgotPasswordSentPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/reset-password/done" element={<ResetPasswordDonePage />} />
      <Route path="/booking/:tenantSlug" element={<PublicBookingPage />} />
      <Route path="/app/dashboard" element={<SuperAdminDashboardPage />} />
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        {moduleRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ModulePlaceholderPage
                title={route.title}
                description={route.description}
              />
            }
          />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  )
}

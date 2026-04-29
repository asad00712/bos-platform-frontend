/**
 * Central route registry. NEVER write a literal route string in a
 * component — import from here. When a path changes, this file is
 * the only place you update.
 *
 * Each leaf is a function so dynamic params are typed. Static routes
 * still use functions for consistency: `routes.app.dashboard()`.
 */

const join = (...parts: string[]) =>
  '/' + parts.filter(Boolean).join('/').replace(/^\/+|\/+$/g, '')

const APP = '/app'

export const routes = {
  root: () => '/',
  login: () => '/login',
  signup: () => '/signup',
  verifyEmail: () => '/verify-email',
  verify2fa: () => '/verify-2fa',
  forgotPassword: () => '/forgot-password',
  forgotPasswordSent: () => '/forgot-password/sent',
  resetPassword: () => '/reset-password',
  resetPasswordDone: () => '/reset-password/done',
  publicBooking: (tenantSlug: string) => join('booking', tenantSlug),

  acceptInvite: () => '/accept-invite',

  app: {
    root: () => APP,
    dashboard: () => join(APP, 'dashboard'),

    crm: {
      root: () => join(APP, 'crm'),
      contacts: () => join(APP, 'crm', 'contacts'),
      contactNew: () => join(APP, 'crm', 'contacts', 'new'),
      contact: (id: string) => join(APP, 'crm', 'contacts', id),
      segments: () => join(APP, 'crm', 'segments'),
      leads: () => join(APP, 'crm', 'leads'),
      leadKanban: () => join(APP, 'crm', 'leads', 'kanban'),
      leadNew: () => join(APP, 'crm', 'leads', 'new'),
      lead: (id: string) => join(APP, 'crm', 'leads', id),
      leadStatuses: () => join(APP, 'crm', 'leads', 'statuses'),
      leadAssignment: () => join(APP, 'crm', 'leads', 'assignment'),
      leadWebhooks: () => join(APP, 'crm', 'leads', 'webhooks'),
    },

    scheduling: {
      root: () => join(APP, 'scheduling'),
      appointmentNew: () => join(APP, 'scheduling', 'appointments', 'new'),
      appointment: (id: string) =>
        join(APP, 'scheduling', 'appointments', id),
    },

    billing: {
      root: () => join(APP, 'billing'),
      invoices: () => join(APP, 'billing', 'invoices'),
      invoiceNew: () => join(APP, 'billing', 'invoices', 'new'),
      invoice: (id: string) => join(APP, 'billing', 'invoices', id),
      payments: () => join(APP, 'billing', 'payments'),
    },

    hrm: {
      root: () => join(APP, 'hrm', 'employees'),
      employees: () => join(APP, 'hrm', 'employees'),
      employee: (id: string) => join(APP, 'hrm', 'employees', id),
      attendance: () => join(APP, 'hrm', 'attendance'),
      leaves: () => join(APP, 'hrm', 'leaves'),
    },

    documents: () => join(APP, 'documents'),
    communication: () => join(APP, 'communication', 'inbox'),
    automation: () => join(APP, 'automation'),
    reports: () => join(APP, 'reports'),
    audit: () => join(APP, 'audit'),
    notifications: () => join(APP, 'notifications'),
    support: () => join(APP, 'support'),

    settings: {
      root: () => join(APP, 'settings'),
      organization: () => join(APP, 'settings', 'organization'),
      branding: () => join(APP, 'settings', 'branding'),
      branches: () => join(APP, 'settings', 'branches'),
      members: () => join(APP, 'settings', 'members'),
      staff: () => join(APP, 'settings', 'staff'),
      roles: () => join(APP, 'settings', 'roles'),
      tags: () => join(APP, 'settings', 'tags'),
      sources: () => join(APP, 'settings', 'sources'),
      customFields: () => join(APP, 'settings', 'custom-fields'),
      billing: () => join(APP, 'settings', 'billing'),
      integrations: () => join(APP, 'settings', 'integrations'),
      security: () => join(APP, 'settings', 'security'),
    },

    profile: {
      root: () => join(APP, 'profile'),
      security: () => join(APP, 'profile', 'security'),
    },

    /* ---------- vertical: dental ---------- */
    dental: {
      root: () => join(APP, 'dental'),
      patients: () => join(APP, 'dental', 'patients'),
      patientNew: () => join(APP, 'dental', 'patients', 'new'),
      patient: (id: string) => join(APP, 'dental', 'patients', id),
      patientChart: (id: string) =>
        join(APP, 'dental', 'patients', id, 'chart'),
      treatmentPlans: (id: string) =>
        join(APP, 'dental', 'patients', id, 'treatment-plans'),
      recalls: () => join(APP, 'dental', 'recalls'),
      claims: () => join(APP, 'dental', 'insurance', 'claims'),
    },

    /* ---------- vertical: school ---------- */
    school: {
      root: () => join(APP, 'school'),
      students: () => join(APP, 'school', 'students'),
      student: (id: string) => join(APP, 'school', 'students', id),
      classes: () => join(APP, 'school', 'classes'),
      timetable: () => join(APP, 'school', 'timetable'),
      gradebook: () => join(APP, 'school', 'gradebook'),
      attendance: () => join(APP, 'school', 'attendance'),
      fees: () => join(APP, 'school', 'fees'),
    },

    /* ---------- vertical: medical ---------- */
    medical: {
      root: () => join(APP, 'medical'),
      patients: () => join(APP, 'medical', 'patients'),
      patient: (id: string) => join(APP, 'medical', 'patients', id),
      patientSection: (id: string, section: string) =>
        join(APP, 'medical', 'patients', id, section),
      encounter: (id: string) => join(APP, 'medical', 'encounters', id),
      superbill: (encounterId: string) =>
        join(APP, 'medical', 'encounters', encounterId, 'superbill'),
      telehealth: (encounterId: string) =>
        join(APP, 'medical', 'telehealth', encounterId),
      schedule: () => join(APP, 'medical', 'schedule'),
      frontDesk: () => join(APP, 'medical', 'front-desk'),
      recalls: () => join(APP, 'medical', 'recalls'),
      labsInbox: () => join(APP, 'medical', 'labs', 'inbox'),
      labReport: (id: string) => join(APP, 'medical', 'labs', id),
      imagingStudy: (id: string) => join(APP, 'medical', 'imaging', id),
      refills: () => join(APP, 'medical', 'rx', 'refills'),
      billing: () => join(APP, 'medical', 'billing'),
      claim: (id: string) => join(APP, 'medical', 'billing', id),
      clinicalLocale: () => join(APP, 'medical', 'admin', 'clinical-locale'),
      audit: () => join(APP, 'medical', 'admin', 'audit'),
    },
  },

  /* ---------- platform admin ---------- */
  admin: {
    tenants: () => '/admin/tenants',
    tenant: (id: string) => `/admin/tenants/${id}`,
    plans: () => '/admin/plans',
    featureFlags: () => '/admin/feature-flags',
    audit: () => '/admin/audit',
    health: () => '/admin/system-health',
  },
} as const

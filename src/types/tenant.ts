export type VerticalType =
  | 'medical'
  | 'dental'
  | 'school'
  | 'law'
  | 'restaurant'
  | 'gym'
  | 'salon'
  | 'retail'

/**
 * Plan tier — drives feature availability + seat limits + support SLA.
 * Mapped explicitly to the Stripe products in `core-service`.
 */
export type TenantPlan = 'starter' | 'growth' | 'professional' | 'enterprise'

/**
 * Caliber describes the *operational surface* this tenant cares about.
 * Independent of plan: a small clinic on Enterprise plan still wants the
 * `standard` caliber UX (tight nav, fewer modes); a large law firm on
 * Growth might still want `professional` density. The user picks this
 * during onboarding; it can be changed any time in settings.
 */
export type TenantCaliber = 'standard' | 'professional' | 'enterprise'

/**
 * Coarse size bucket. Lets layouts default sensibly without polling
 * every module for member counts. Server computes from headcount.
 */
export type TenantSize = 'solo' | 'small' | 'medium' | 'large' | 'enterprise'

/** Internal feature key the gating system accepts. */
export type FeatureKey =
  | 'multi_location'
  | 'custom_roles'
  | 'sso'
  | 'api_tokens'
  | 'webhooks'
  | 'audit_log'
  | 'access_reviews'
  | 'feature_flags'
  | 'data_export'
  | 'recurring_invoices'
  | 'campaigns'
  | 'automation_builder'
  | 'custom_reports'
  | 'scheduled_reports'
  | 'ai_insights'
  | 'whitelabel_full'
  | 'priority_support'
  /* medical vertical */
  | 'med_charting'
  | 'med_eprescribe'
  | 'med_eligibility_realtime'
  | 'med_lab_interface'
  | 'med_growth_charts'
  | 'med_decision_support'
  | 'med_cds_rules_engine'
  | 'med_prior_auth'
  | 'med_telehealth'
  | 'med_patient_portal'
  | 'med_population_health'
  | 'med_break_glass'
  | 'med_form_builder'

export type Permission =
  /* universal */
  | 'dashboard:view'
  | 'crm:read'
  | 'crm:write'
  | 'scheduling:read'
  | 'scheduling:write'
  | 'billing:read'
  | 'billing:write'
  | 'hrm:read'
  | 'hrm:write'
  | 'documents:read'
  | 'documents:write'
  | 'communication:read'
  | 'communication:write'
  | 'automation:read'
  | 'automation:write'
  | 'reports:read'
  | 'audit:view'
  | 'settings:manage'
  /* legacy aliases — kept until callers migrate */
  | 'patients:read'
  | 'patients:write'
  | 'appointments:read'
  | 'appointments:write'
  /* verticals */
  | 'dental:read'
  | 'dental:write'
  | 'school:read'
  | 'school:write'
  | 'medical:read'
  | 'medical:write'
  | 'medical:rx:write'
  | 'medical:rx:controlled'
  | 'medical:results:sign'
  | 'medical:results:release'
  | 'medical:billing:read'
  | 'medical:billing:write'
  | 'medical:audit:view'
  | 'medical:audit:break_glass'
  | 'medical:portal:admin'
  | 'law:read'
  | 'law:write'
  | 'restaurant:read'
  | 'restaurant:write'
  | 'gym:read'
  | 'gym:write'
  | 'salon:read'
  | 'salon:write'
  | 'retail:read'
  | 'retail:write'
  /* platform */
  | 'platform:admin'

export type TenantBranding = {
  primaryColor?: string
  logoUrl?: string
  faviconUrl?: string
  appName?: string
  fontFamily?: string
}

/**
 * Unit-system preference. Drives display only — stored values keep their
 * source unit so conversions are lossless and reversible.
 */
export type UnitSystem = 'metric' | 'us'

/**
 * Clinical-locale flags layered on top of the UI locale. Govern the
 * surfaces that follow medical conventions independent of UI strings:
 * secondary calendar, digit system, unit defaults.
 */
export type ClinicalLocale = {
  /** Render Hijri date alongside Gregorian on DOB / encounter / Rx surfaces. */
  dateSecondary?: 'hijri' | null
  /** Western (0123456789) is the default and the only safe choice for clinical
   *  values. Eastern (٠١٢٣٤٥٦٧٨٩) is allowed only in patient-facing portal
   *  prose, never in dosing / vitals / labs / dates inside the chart. */
  digits?: 'western' | 'eastern'
  /** Default unit system for this tenant. Per-user override may exist later. */
  units?: UnitSystem
}

export type TenantLocation = {
  id: string
  name: string
  /** ISO timezone for this location (overrides tenant timezone if set). */
  timezone?: string
  /** Truthy when this is the user's currently selected location. */
  current?: boolean
}

export type TenantUsage = {
  /** Active members occupying a seat. */
  members: number
  /** Permitted seats under the current plan. `null` = unlimited. */
  memberLimit: number | null
  /** Active locations counted toward the plan limit. */
  locations: number
  locationLimit: number | null
  /** Storage used in GB. */
  storageGb: number
  storageGbLimit: number | null
}

export type TenantContext = {
  id: string
  slug: string
  name: string
  plan: TenantPlan
  vertical: VerticalType
  /** Operational caliber — drives default density + advanced surfaces. */
  caliber: TenantCaliber
  /** Coarse size bucket; recomputed by server from headcount. */
  size: TenantSize
  locale: string
  timezone: string
  currency?: string
  /** Tenant-scoped feature flag overrides. Plan defaults apply when omitted. */
  featureFlags?: Partial<Record<FeatureKey, boolean>>
  /** Optional list of locations. Most small tenants have 1; large can have 50+. */
  locations?: TenantLocation[]
  /** Optional usage snapshot for plan + limit displays. */
  usage?: TenantUsage
  permissions: Permission[]
  branding?: TenantBranding
  /** Clinical-locale flags (secondary calendar, digit system, units). */
  clinicalLocale?: ClinicalLocale
}

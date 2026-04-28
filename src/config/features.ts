import type {
  FeatureKey,
  TenantCaliber,
  TenantPlan,
  TenantSize,
} from '@/types/tenant'

/**
 * Feature registry — every gated feature is listed once here.
 *
 * The rule engine: a feature is "enabled" when the tenant's plan is
 * at-or-above `minPlan`, the tenant's caliber is in `calibers` (or no
 * restriction), and the tenant's size is in `sizes` (or no restriction).
 * Tenant-level overrides in `tenant.featureFlags` always win.
 *
 * Adding a new gated feature: add a key here, then call
 * `useFeatureFlag('your_key')` in the component. Don't sprinkle
 * plan-checks across the codebase.
 */

const PLAN_RANK: Record<TenantPlan, number> = {
  starter: 0,
  growth: 1,
  professional: 2,
  enterprise: 3,
}

export type FeatureSpec = {
  key: FeatureKey
  /** Minimum plan tier required. */
  minPlan: TenantPlan
  /** Tenant calibers eligible for this feature. */
  calibers?: TenantCaliber[]
  /** Tenant sizes eligible for this feature. */
  sizes?: TenantSize[]
  /** Free-text label, used in plan comparisons + settings. */
  label: string
  description: string
}

export const FEATURES: Record<FeatureKey, FeatureSpec> = {
  multi_location: {
    key: 'multi_location',
    minPlan: 'growth',
    label: 'Multi-location',
    description: 'Operate multiple offices, schools, or branches under one tenant.',
  },
  custom_roles: {
    key: 'custom_roles',
    minPlan: 'professional',
    label: 'Custom roles',
    description: 'Author roles with bespoke permission sets beyond the built-ins.',
  },
  sso: {
    key: 'sso',
    minPlan: 'enterprise',
    label: 'SSO (SAML / OIDC)',
    description: 'Single sign-on with your identity provider.',
  },
  api_tokens: {
    key: 'api_tokens',
    minPlan: 'professional',
    label: 'API tokens',
    description: 'Personal and service tokens for the BOS REST API.',
  },
  webhooks: {
    key: 'webhooks',
    minPlan: 'professional',
    label: 'Webhooks',
    description: 'Subscribe external systems to BOS events.',
  },
  audit_log: {
    key: 'audit_log',
    minPlan: 'growth',
    label: 'Audit log',
    description: 'Searchable history of sensitive actions.',
  },
  access_reviews: {
    key: 'access_reviews',
    minPlan: 'enterprise',
    label: 'Access reviews',
    description: 'Periodic permission attestation flows.',
  },
  feature_flags: {
    key: 'feature_flags',
    minPlan: 'enterprise',
    label: 'Feature flags',
    description: 'Tenant-level toggles for beta features.',
  },
  data_export: {
    key: 'data_export',
    minPlan: 'growth',
    label: 'Data export',
    description: 'One-click CSV / JSON export of every dataset.',
  },
  recurring_invoices: {
    key: 'recurring_invoices',
    minPlan: 'growth',
    label: 'Recurring invoices',
    description: 'Auto-bill clients on a schedule.',
  },
  campaigns: {
    key: 'campaigns',
    minPlan: 'professional',
    calibers: ['professional', 'enterprise'],
    label: 'Campaigns',
    description: 'Multi-touch email + SMS campaigns to audience segments.',
  },
  automation_builder: {
    key: 'automation_builder',
    minPlan: 'growth',
    label: 'Automation builder',
    description: 'Visual workflow editor with conditions and branches.',
  },
  custom_reports: {
    key: 'custom_reports',
    minPlan: 'professional',
    label: 'Custom reports',
    description: 'Drag-drop dimensions and metrics into your own reports.',
  },
  scheduled_reports: {
    key: 'scheduled_reports',
    minPlan: 'professional',
    label: 'Scheduled reports',
    description: 'Cron-style report delivery to email or Slack.',
  },
  ai_insights: {
    key: 'ai_insights',
    minPlan: 'professional',
    label: 'AI insights',
    description: 'Auto-summary of anomalies and trends across modules.',
  },
  whitelabel_full: {
    key: 'whitelabel_full',
    minPlan: 'enterprise',
    label: 'Full white-label',
    description: 'Custom domain, login screen, and email-template branding.',
  },
  priority_support: {
    key: 'priority_support',
    minPlan: 'professional',
    label: 'Priority support',
    description: 'Faster SLAs and a dedicated support channel.',
  },

  /* ---------- medical vertical ---------- */
  med_charting: {
    key: 'med_charting',
    minPlan: 'starter',
    label: 'Clinical charting',
    description: 'Problem list, allergies, meds, vitals, SOAP notes.',
  },
  med_eprescribe: {
    key: 'med_eprescribe',
    minPlan: 'growth',
    calibers: ['professional', 'enterprise'],
    label: 'E-prescribing',
    description: 'Send prescriptions to pharmacies electronically.',
  },
  med_eligibility_realtime: {
    key: 'med_eligibility_realtime',
    minPlan: 'growth',
    label: 'Realtime eligibility',
    description: 'Verify insurance coverage in seconds (270/271).',
  },
  med_lab_interface: {
    key: 'med_lab_interface',
    minPlan: 'growth',
    calibers: ['professional', 'enterprise'],
    sizes: ['small', 'medium', 'large', 'enterprise'],
    label: 'Lab interface',
    description: 'Receive structured lab results into the inbox.',
  },
  med_growth_charts: {
    key: 'med_growth_charts',
    minPlan: 'starter',
    label: 'Pediatric growth charts',
    description: 'WHO 0–24 mo and CDC 2–20 yr percentile curves.',
  },
  med_decision_support: {
    key: 'med_decision_support',
    minPlan: 'professional',
    label: 'Drug decision support',
    description: 'Drug-allergy + drug-drug interaction checks at order entry.',
  },
  med_cds_rules_engine: {
    key: 'med_cds_rules_engine',
    minPlan: 'enterprise',
    calibers: ['enterprise'],
    label: 'CDS rules engine',
    description: 'Author org-defined Best Practice Advisories (CDS Hooks).',
  },
  med_prior_auth: {
    key: 'med_prior_auth',
    minPlan: 'professional',
    sizes: ['small', 'medium', 'large', 'enterprise'],
    label: 'Prior authorization',
    description: 'Track payer prior-auth submissions through to approval.',
  },
  med_telehealth: {
    key: 'med_telehealth',
    minPlan: 'growth',
    label: 'Telemedicine',
    description: 'Video visits with chart side-by-side.',
  },
  med_patient_portal: {
    key: 'med_patient_portal',
    minPlan: 'growth',
    label: 'Patient portal',
    description: 'Messages, results, prescriptions, billing — for patients.',
  },
  med_population_health: {
    key: 'med_population_health',
    minPlan: 'enterprise',
    calibers: ['enterprise'],
    sizes: ['medium', 'large', 'enterprise'],
    label: 'Population health',
    description: 'HEDIS / MIPS / QOF dashboards and chronic-disease registries.',
  },
  med_break_glass: {
    key: 'med_break_glass',
    minPlan: 'enterprise',
    calibers: ['enterprise'],
    label: 'Break-glass access',
    description: 'Logged emergency override of empanelment scoping.',
  },
  med_form_builder: {
    key: 'med_form_builder',
    minPlan: 'enterprise',
    calibers: ['enterprise'],
    label: 'Form builder',
    description: 'Author FHIR-bound intake and screening forms.',
  },
}

/**
 * Resolve whether a feature is enabled for a tenant based on plan + caliber
 * + size. Tenant-level `featureFlags` overrides always win.
 */
export function resolveFeatureFlag(
  key: FeatureKey,
  ctx: {
    plan: TenantPlan
    caliber: TenantCaliber
    size: TenantSize
    overrides?: Partial<Record<FeatureKey, boolean>>
  },
): boolean {
  if (ctx.overrides && key in ctx.overrides) {
    return ctx.overrides[key] ?? false
  }
  const spec = FEATURES[key]
  if (!spec) return false
  if (PLAN_RANK[ctx.plan] < PLAN_RANK[spec.minPlan]) return false
  if (spec.calibers && !spec.calibers.includes(ctx.caliber)) return false
  if (spec.sizes && !spec.sizes.includes(ctx.size)) return false
  return true
}

export function planRank(plan: TenantPlan): number {
  return PLAN_RANK[plan]
}

/* Plan tier metadata for the upgrade page + tenant-admin surfaces. */
export type PlanTierSpec = {
  plan: TenantPlan
  name: string
  tagline: string
  pricePerMonth: number | null
  /** Seat limit (null = unlimited). */
  memberLimit: number | null
  /** Location limit (null = unlimited). */
  locationLimit: number | null
  storageGb: number
  /** Highlight features for the comparison page. */
  highlightFeatures: FeatureKey[]
}

export const PLAN_TIERS: PlanTierSpec[] = [
  {
    plan: 'starter',
    name: 'Starter',
    tagline: 'For solo practitioners and side projects.',
    pricePerMonth: 0,
    memberLimit: 3,
    locationLimit: 1,
    storageGb: 5,
    highlightFeatures: [],
  },
  {
    plan: 'growth',
    name: 'Growth',
    tagline: 'For small teams that are scaling.',
    pricePerMonth: 49,
    memberLimit: 15,
    locationLimit: 3,
    storageGb: 50,
    highlightFeatures: [
      'multi_location',
      'audit_log',
      'data_export',
      'recurring_invoices',
      'automation_builder',
    ],
  },
  {
    plan: 'professional',
    name: 'Professional',
    tagline: 'For established multi-location operations.',
    pricePerMonth: 149,
    memberLimit: 50,
    locationLimit: 10,
    storageGb: 250,
    highlightFeatures: [
      'custom_roles',
      'api_tokens',
      'webhooks',
      'campaigns',
      'custom_reports',
      'scheduled_reports',
      'ai_insights',
      'priority_support',
    ],
  },
  {
    plan: 'enterprise',
    name: 'Enterprise',
    tagline: 'For large organizations with custom requirements.',
    pricePerMonth: null, // contact sales
    memberLimit: null,
    locationLimit: null,
    storageGb: 2_000,
    highlightFeatures: [
      'sso',
      'access_reviews',
      'feature_flags',
      'whitelabel_full',
    ],
  },
]

export function tierForPlan(plan: TenantPlan): PlanTierSpec {
  return PLAN_TIERS.find((t) => t.plan === plan) ?? PLAN_TIERS[0]
}

/* Caliber metadata — drives default density + which surfaces are visible. */
export type CaliberSpec = {
  id: TenantCaliber
  name: string
  description: string
  /** Suggested DataTable density. */
  defaultDensity: 'comfortable' | 'compact'
  /** When true, sidebar shows full intelligence + governance groups. */
  showAdvancedNav: boolean
}

export const CALIBERS: Record<TenantCaliber, CaliberSpec> = {
  standard: {
    id: 'standard',
    name: 'Standard',
    description:
      'Streamlined surface for solo practitioners and small teams who want sensible defaults and minimal configuration.',
    defaultDensity: 'comfortable',
    showAdvancedNav: false,
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description:
      'Denser layouts, all standard modules, plus reporting and automations. The default for established multi-staff operations.',
    defaultDensity: 'comfortable',
    showAdvancedNav: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description:
      'Compact density, multi-location pickers, audit + governance surfaces, and admin tooling for hundred-plus seat organizations.',
    defaultDensity: 'compact',
    showAdvancedNav: true,
  },
}

/* Size metadata — drives default empty-state copy and onboarding nudges. */
export type SizeSpec = {
  id: TenantSize
  name: string
  approxHeadcount: string
}

export const SIZES: Record<TenantSize, SizeSpec> = {
  solo: { id: 'solo', name: 'Solo', approxHeadcount: '1' },
  small: { id: 'small', name: 'Small', approxHeadcount: '2–10' },
  medium: { id: 'medium', name: 'Medium', approxHeadcount: '11–50' },
  large: { id: 'large', name: 'Large', approxHeadcount: '51–200' },
  enterprise: { id: 'enterprise', name: 'Enterprise', approxHeadcount: '200+' },
}

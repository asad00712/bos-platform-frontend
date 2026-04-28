# Scaling & Tiers

> How BOS adapts to every caliber of tenant — from a one-chair dental
> office to a 200-staff school district. This document is the contract
> for what shows up on screen at each plan/caliber/size combination.

## TL;DR

A tenant is described by **three orthogonal axes**:

| Axis      | Type         | Values                                                       | Drives                                            |
| --------- | ------------ | ------------------------------------------------------------ | ------------------------------------------------- |
| **Plan**    | `TenantPlan` | `starter` → `growth` → `professional` → `enterprise`         | Feature availability, seat/storage limits, SLA    |
| **Caliber** | `TenantCaliber` | `standard`, `professional`, `enterprise`                  | UI complexity, density, advanced surfaces, tone   |
| **Size**    | `TenantSize`    | `solo`, `small`, `medium`, `large`, `enterprise`         | Empty-state copy, onboarding nudges, default density |

These are independent. A solo dentist on the Growth plan can pick
`standard` caliber for a clean default UX; a 50-seat agency on the same
plan can pick `professional` to unlock dense layouts and the
intelligence sidebar group.

Tenant overrides in `tenant.featureFlags` always win over plan-derived
flags — useful when sales unlocks a feature for an Enterprise pilot.

## Where it's enforced

- **`src/types/tenant.ts`** — type definitions (`TenantPlan`, `TenantCaliber`, `TenantSize`, `FeatureKey`, `TenantUsage`, `TenantLocation`).
- **`src/config/features.ts`** — the single feature registry. Every gated feature is listed here with `minPlan`, optional `calibers`, optional `sizes`, label, description. Plan + caliber + size metadata also lives here (`PLAN_TIERS`, `CALIBERS`, `SIZES`).
- **`src/shared/hooks/useFeatureFlag.ts`** — `useFeatureFlag(key)`, `usePlanTier()`, `useCaliber()`. Components consume these — never hand-roll plan checks.
- **`src/layout/Sidebar/AppSidebar.tsx`** — applies `feature` and `advancedOnly` filters at render time so users on a `standard` caliber don't see the Intelligence + Audit groups.
- **`src/features/dashboard/components/DashboardGrid.tsx`** — same gating at the widget level. The AI-insight widget only renders when `ai_insights` is enabled (Professional+).
- **`src/features/settings/pages/PlanBillingPage.tsx`** — the user-facing surface: current plan, usage bars, four-tier comparison grid, full feature × tier matrix.

## Plan tiers

Defined in [`PLAN_TIERS`](../src/config/features.ts).

| Plan          | Price/mo    | Members        | Locations      | Storage | Highlight features                                                                |
| ------------- | ----------- | -------------- | -------------- | ------- | --------------------------------------------------------------------------------- |
| Starter       | Free        | 3              | 1              | 5 GB    | Core modules only                                                                 |
| Growth        | $49         | 15             | 3              | 50 GB   | Multi-location, audit log, exports, recurring invoices, automation builder        |
| Professional  | $149        | 50             | 10             | 250 GB  | Custom roles, API tokens, webhooks, campaigns, custom + scheduled reports, AI insights, priority support |
| Enterprise    | Custom      | Unlimited      | Unlimited      | 2 TB    | SSO, access reviews, feature flags, full white-label                              |

## Caliber

| Caliber      | Default density | Shows advanced nav?       | Use it for                                                              |
| ------------ | --------------- | ------------------------- | ----------------------------------------------------------------------- |
| Standard     | Comfortable     | No (Intelligence hidden)  | Solo, small teams, owners who want minimal UI                           |
| Professional | Comfortable     | Yes                       | Default for established multi-staff operations                          |
| Enterprise   | Compact         | Yes + multi-location, governance | 100+ seat orgs, multi-location management                          |

The caliber is **independent** from the plan — a solo on Enterprise
plan can still pick `standard` caliber if they prefer a clean UX.

## Size

Coarse headcount bucket. Drives:
- **Onboarding nudges**: a `solo` size sees "invite teammates" tips; an `enterprise` size sees SSO setup guidance.
- **Empty-state copy**: more inviting for small tenants, more directive for large.
- **Implicit density default**: `large`/`enterprise` size auto-suggest compact density.

| Size       | Approx headcount |
| ---------- | ---------------- |
| Solo       | 1                |
| Small      | 2–10             |
| Medium     | 11–50            |
| Large      | 51–200           |
| Enterprise | 200+             |

## Adding a new gated feature

1. Add the key to `FeatureKey` union in `src/types/tenant.ts`.
2. Add a spec to `FEATURES` in `src/config/features.ts` with `minPlan`, optional `calibers`/`sizes`, `label`, `description`.
3. In components, gate with `useFeatureFlag('your_key')` — never with raw `tenant.plan === '…'` checks.
4. Optionally add to a tier's `highlightFeatures` array so it appears on the Plan & Billing comparison page.

## Adding a new plan tier

1. Extend `TenantPlan` union in `src/types/tenant.ts`.
2. Add a row to `PLAN_TIERS` in `src/config/features.ts`.
3. Add the rank in `PLAN_RANK`.
4. The Plan & Billing page picks it up automatically.

## How navigation adapts

`NavigationItem` and `NavigationGroup` accept `feature` and `advancedOnly`
flags. The sidebar reads them at render time:

- A nav **item** with `feature: 'audit_log'` is hidden unless that feature is enabled.
- A nav **group** with `advancedOnly: true` is hidden on `standard` caliber.
- A nav **group** with `feature: 'X'` is hidden when feature `X` is disabled — useful for "hide entire Intelligence group from Starter tenants".

Items still respect their `permission` first; feature flags compose.

## How dashboard adapts

`Widget.feature` gates a widget the same way. Layouts list widgets;
`DashboardGrid` filters out anything failing permission/vertical/feature.
Adding a Professional-only widget is one prop change.

## How the user changes their tenant profile

- **Plan**: `Settings → Plan & billing` — switch tiers in the demo, opens Stripe Customer Portal in production.
- **Caliber + size**: `Settings → Organization` — operational profile card at the bottom. Both flips immediately reshape sidebar, dashboard, and densities.

## Migration story

When `core-service` ships:
1. The server returns `tenant.plan`, `tenant.caliber`, `tenant.size` on `/auth/me`.
2. Frontend session store hydrates from there instead of the demo defaults.
3. Plan changes invalidate the session and re-fetch tenant context.
4. Tenant-level `featureFlags` are persisted server-side and continue to override.

Nothing in components changes — the contract surface is already in place.

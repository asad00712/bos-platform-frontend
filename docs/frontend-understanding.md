# BOS Frontend Understanding

This note captures the frontend interpretation of the BOS BRD and Complete
System Document. Backend work is owned separately; this repo should focus on
building the React web application as a serious enterprise product surface.

## Product Positioning

BOS is a multi-tenant, vertical-specific business operating system. It is not a
generic CRM, ERP, or admin template. The same platform core must feel native to
clinics, law firms, restaurants, schools, gyms, and future industries through
terminology, workflows, navigation, dashboards, and visual configuration.

The core promise for the frontend is:

- One platform with many industry-specific faces.
- Dense operational workflows that staff can use all day.
- Owner-level dashboards that make the whole business visible.
- Customer-facing surfaces that are fast, mobile-first, and white-labeled.
- Security, tenant isolation, permissions, and auditability reflected in UI
  behavior.

## Current Frontend State

The repo is currently a small React 19 + Vite application based on the starter
template. It has no production BOS application structure yet.

Current files of interest:

- `src/App.tsx`: starter landing/demo content.
- `src/App.css` and `src/index.css`: starter styling.
- `package.json`: React and Vite only; no router, API client, query cache,
  form library, UI primitives, charts, or state store.

This means the next frontend work should establish the foundation before
building deep module screens.

## Required Frontend Capabilities

The documents imply these major frontend capabilities:

- Authentication flows: signup, email verification, login, refresh-aware
  session handling, logout, password reset, two-factor setup and verification.
- Tenant context: every authenticated screen should know the active tenant,
  vertical, plan, feature flags, branding, and permissions.
- Vertical engine: navigation, terminology, theme tokens, dashboards, and
  module labels must adapt by industry.
- RBAC-aware UI: hide, disable, or route-guard actions based on permissions;
  do not rely only on backend rejection for user experience.
- Core modules: dashboard, CRM, scheduling, billing, HRM, documents,
  communication, support, analytics, settings, and automation.
- First vertical depth: medical clinic should feel native, with Patient, EMR,
  SOAP Notes, Prescriptions, Lab Orders, Vitals, Consent Forms, and clinic KPIs.
- White-label readiness: tenant logo, favicon, domain branding, color tokens,
  email-facing previews, and reseller/client branding should be considered in
  the design system.
- Internationalization readiness: language switching, RTL layout support for
  Arabic and Urdu, and locale-aware dates, numbers, and currency.
- Accessibility: WCAG 2.1 AA target, keyboard navigability, usable focus
  states, semantic controls, and clear error messages.

## Recommended Architecture Direction

The system document recommends this kind of frontend structure:

- `api/`: API client, auth client, module-specific request functions.
- `components/`: shared application components.
- `ui/`: reusable primitives such as Button, Input, Modal, Table, Badge.
- `layout/`: app shell, sidebar, header, page frames, tenant switcher.
- `routes/`: route definitions, protected routes, role/permission guards.
- `pages/`: module pages grouped by domain.
- `hooks/`: auth, tenant, permissions, media, and feature flag hooks.
- `stores/`: client state for auth/session, tenant, UI preferences.
- `themes/`: vertical themes, design tokens, navigation definitions.
- `utils/`: formatting, validation helpers, error mapping.

Likely dependencies to add when implementation begins:

- `react-router` for route structure and protected pages.
- `@tanstack/react-query` for server state and cache invalidation.
- `zustand` for lightweight client state.
- `react-hook-form` and `zod` for forms and validation.
- A component system, likely Radix/shadcn-style primitives or a custom
  equivalent that can support enterprise density.
- Charts and tables for dashboards and reports.
- i18n support before text spreads across the app.

## Design Principles

The frontend should look and behave like high-trust business software:

- Prioritize clarity, speed, and density over decorative spectacle.
- Use vertical-specific language everywhere: Patients for clinics, Cases for
  law firms, Tables and Orders for restaurants, Students for schools.
- Make common work one or two clicks from the dashboard.
- Provide strong empty states, loading states, error states, and permission
  denied states.
- Use professional data views: tables, filters, saved views, timelines,
  calendars, kanban boards, forms, wizards, and KPI cards.
- Avoid toy dashboards. Every panel should imply a real workflow or decision.
- Mobile layouts must support quick actions and customer-facing flows, while
  desktop layouts should support dense operational work.

## Phase 1 Frontend Priorities

Based on the documents, a practical Phase 1 frontend sequence is:

1. Application foundation: routing, app shell, design tokens, auth/session
   store, API client, permission model, tenant/vertical context.
2. Auth and onboarding: signup, login, verification, reset password, 2FA,
   first organization setup wizard.
3. Owner dashboard: KPIs, schedule, revenue, tasks, alerts, onboarding status,
   and vertical-specific shortcuts.
4. Medical clinic vertical: patient list/detail, appointment calendar, SOAP
   note workspace, prescriptions, lab orders, vitals, billing hooks.
5. Core module shells: CRM, scheduling, billing, HRM, documents, settings,
   analytics, and support with realistic navigation and placeholders only where
   backend APIs are not ready.
6. Public booking page: mobile-first, white-labeled, no-login patient booking
   flow.

## Backend Boundary

Do not change backend code for frontend work unless explicitly instructed.
Backend APIs may be inspected for contract understanding, but implementation
changes should stay in `bos-platform-frontend`.

Frontend should consume backend endpoints via a typed API layer and gracefully
handle missing endpoints during staged development with mock adapters or clearly
isolated demo data.

## Quality Bar

Treat this as enterprise-grade software:

- TypeScript should be strict and intentional.
- Components should be reusable but not over-abstracted.
- UI state should be deterministic and testable.
- Forms should validate client-side and display backend errors clearly.
- Layout must work on desktop and mobile without overlap.
- New features should build toward the real BOS domain model, not a generic
  admin panel.


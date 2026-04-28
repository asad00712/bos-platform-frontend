# BOS Frontend — Master Rebuild Plan

> The single source of truth for the BOS frontend rebuild. Every PR, every
> module, every screen must trace back to a rule, structure, or sequence
> defined in this document. If something here is wrong, change *this* file
> first; never let the code drift from the plan silently.

---

## 0. Mission

Build the BOS frontend as **one** white-label, multi-tenant, vertical-aware
operating system on top of **shadcn/ui + Tailwind v4**. One codebase, every
vertical (dental, school, clinic, law, restaurant, gym, salon, retail, …),
one consistent design language, fully localized, role-aware, scalable to
100+ verticals without re-opening the foundation.

The promise is simple: a dentist logs in and the product feels purpose-built
for dentistry. A school principal logs in and the product feels purpose-built
for school administration. Same codebase. Same design language. Different
terminology, different default widgets, different vertical-specific module
set, all driven by tenant configuration — never by forking code.

---

## 1. Non-Negotiables (the rules every PR follows)

These are guardrails. PRs that break a rule must either fix the rule first
(with discussion) or be rejected.

1. **shadcn/ui is the only UI primitive source.** No hand-rolled buttons,
   inputs, dialogs, dropdowns, tabs, tables, toasts, sheets, command
   palettes, popovers, tooltips, calendars, pagination, accordions, skeletons,
   alerts, badges, avatars, breadcrumbs, cards, checkboxes, comboboxes,
   collapsibles, context menus, drawers, forms, hover cards, labels, menubars,
   navigation menus, progress bars, radio groups, resizable panels, scroll
   areas, selects, separators, sliders, switches, textareas, toggles, toggle
   groups. If shadcn ships it, we use it. If shadcn doesn't ship it but Radix
   does, we wrap Radix in our own component using the shadcn pattern.
2. **One source of truth for design tokens** in `src/styles/tokens.css` —
   colors, spacing, radius, typography, shadow, motion, z-index. CSS variables
   only. Tailwind reads from these vars; components read from Tailwind.
   No magic numbers in components.
3. **One source of truth for tables, forms, dialogs, toasts, drawers,
   command palette, empty/loading/error states** — generic implementations
   in `src/shared/ui/`, used across every feature. Never re-implement a
   table per feature.
4. **All copy goes through i18n.** No hardcoded strings in components.
   `t('crm.contact.create.title')` everywhere. English is the source locale;
   Arabic, Urdu, Spanish, Hindi are first-tier targets. RTL ready.
5. **Every screen respects RBAC** (permission gates) and **tenant vertical**
   (terminology + widget set). Routes, sidebar items, action buttons, table
   columns — all hide/disable based on `usePermissions()` and `useTenant()`.
6. **Folder structure is feature-modular.** Each feature owns
   `api/`, `hooks/`, `components/`, `types/`, `pages/`. Cross-cutting code
   lives in `src/shared/`. No feature imports from another feature directly;
   shared logic graduates to `src/shared/`.
7. **White-labeling is a tenant theme override**, not a fork. Logos,
   favicons, accent colors, terminology overrides, locale, optional fonts,
   email templates — all driven by `tenant.branding` config.
8. **Accessibility is not a polish wave.** Keyboard nav, ARIA labels, focus
   rings, color contrast WCAG AA, prefers-reduced-motion respected from PR 1.
9. **Responsive is desktop-first, tablet-OK, mobile-functional.** Sidebar
   collapses to a `Sheet` drawer below `lg`. All tables horizontally scroll
   below `md`. No "this page only works on desktop" in production.
10. **Dark mode + light mode** out of the gate, both first-class. Stored in
    `ui.store.ts`, persisted, respects `prefers-color-scheme` on first visit.
11. **Component overload is a code smell.** A component over ~250 lines, or
    with more than ~6 props, is a refactor candidate. Split, don't pile.
12. **No `any`, no `// @ts-ignore`** without an inline justification comment
    referencing a tracking issue.
13. **Every screen scales to every caliber.** Tenant size and caliber
    (solo / small / medium / large / enterprise; standard / professional /
    enterprise) reshape navigation, dashboard widget set, and density —
    *never* the other way around. Hand-rolled `tenant.plan === '…'`
    checks are forbidden; gate via `useFeatureFlag()` against the
    registry in `src/config/features.ts`. See
    [`scaling-and-tiers.md`](./scaling-and-tiers.md).

---

## 2. Tech Stack (locked)

| Layer            | Choice                                          | Reason |
| ---------------- | ----------------------------------------------- | ------ |
| Framework        | React 19 + Vite + TypeScript                    | Already in repo; current and fast. |
| Routing          | react-router v7                                 | Already in repo. |
| Server state     | @tanstack/react-query v5                        | Already in deps; standard. |
| Client state     | zustand                                         | Already in deps; minimal. |
| Forms            | react-hook-form + zod + @hookform/resolvers     | Already in deps. |
| UI primitives    | shadcn/ui (Radix + Tailwind v4)                 | Industry standard, owned components, accessible by default. |
| Styling          | Tailwind CSS v4                                 | Token-driven, atomic, consistent. |
| Icons            | lucide-react                                    | Already in deps; matches shadcn. |
| Charts           | Recharts (via shadcn `chart` component)         | shadcn ships official wrappers. |
| Tables           | @tanstack/react-table + shadcn `data-table`     | shadcn ships official recipe. |
| Dates            | date-fns + Intl APIs                            | Lightweight, locale-aware. |
| i18n             | i18next + react-i18next                         | SPA-friendly, RTL-friendly, namespace support. |
| Tests            | vitest + @testing-library/react + Playwright    | Standard for unit + e2e. |
| Lint/format      | ESLint + Prettier + organize-imports            | Already configured (eslint). |

---

## 3. Folder Structure (target)

```
bos-platform-frontend/
├── docs/                                  # planning, specs, decisions
├── public/
├── src/
│   ├── app/
│   │   ├── AppProviders.tsx               # QueryClient, Router, Theme, i18n
│   │   └── AppRoot.tsx
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   ├── routeMap.ts                    # central path constants
│   │   └── guards/
│   │       ├── RequireAuth.tsx
│   │       ├── RequireGuest.tsx
│   │       ├── RequirePermission.tsx
│   │       └── RequireVertical.tsx
│   ├── shared/                            # cross-cutting; reusable; no domain
│   │   ├── api/
│   │   │   ├── http.ts
│   │   │   ├── ApiError.ts
│   │   │   └── envelope.ts
│   │   ├── hooks/
│   │   │   ├── useTenant.ts
│   │   │   ├── usePermissions.ts
│   │   │   ├── useDateRange.ts
│   │   │   ├── useDebouncedValue.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   ├── useTheme.ts
│   │   │   ├── useLocale.ts
│   │   │   └── useFeatureFlag.ts
│   │   ├── ui/                            # shadcn primitives + custom shared UI
│   │   │   ├── button.tsx                 # shadcn-generated
│   │   │   ├── input.tsx
│   │   │   ├── ... (all shadcn components)
│   │   │   ├── DataTable/                 # generic shadcn data-table wrapper
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── DataTableToolbar.tsx
│   │   │   │   ├── DataTablePagination.tsx
│   │   │   │   ├── DataTableColumnHeader.tsx
│   │   │   │   └── DataTableViewOptions.tsx
│   │   │   ├── KpiCard.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── FormField.tsx              # rhf + shadcn form wrapper
│   │   │   ├── DatePicker.tsx
│   │   │   ├── DateRangePicker.tsx
│   │   │   ├── PhoneInput.tsx
│   │   │   ├── CurrencyInput.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── RichTextEditor.tsx
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── Stepper.tsx
│   │   │   ├── Filters.tsx
│   │   │   └── icons/
│   │   ├── lib/
│   │   │   ├── format.ts                  # currency, date, number, relative
│   │   │   ├── permissions.ts
│   │   │   ├── verticals.ts
│   │   │   ├── cn.ts                      # shadcn cn() helper
│   │   │   └── env.ts
│   │   └── types/
│   │       ├── api.ts
│   │       ├── auth.ts
│   │       ├── tenant.ts
│   │       ├── permissions.ts
│   │       └── vertical.ts
│   ├── stores/
│   │   ├── session.store.ts
│   │   ├── ui.store.ts                    # theme, sidebar collapsed, density
│   │   └── tenant.store.ts                # active tenant, branding, vertical
│   ├── styles/
│   │   ├── tokens.css                     # design tokens (CSS vars)
│   │   ├── globals.css                    # tailwind directives + base
│   │   └── tailwind.css                   # tailwind v4 config-via-css
│   ├── i18n/
│   │   ├── index.ts                       # i18next bootstrap
│   │   ├── resources/
│   │   │   ├── en/
│   │   │   ├── ar/
│   │   │   ├── ur/
│   │   │   ├── es/
│   │   │   └── hi/
│   │   └── namespaces.ts                  # type-safe namespace registry
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SidebarRail.tsx            # the dark vertical icon rail
│   │   │   ├── NavGroup.tsx
│   │   │   ├── NavItem.tsx
│   │   │   └── TenantSwitcher.tsx
│   │   ├── Topbar/
│   │   │   ├── Topbar.tsx
│   │   │   ├── GlobalSearch.tsx
│   │   │   ├── QuickCreate.tsx
│   │   │   ├── NotificationsPopover.tsx
│   │   │   ├── HelpMenu.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── LocaleSwitcher.tsx
│   │   │   └── ProfileMenu.tsx
│   │   └── PageContainer.tsx
│   ├── features/
│   │   ├── auth/                          # already exists
│   │   ├── dashboard/
│   │   ├── crm/                           # contacts/customers (terminology-aware)
│   │   ├── scheduling/
│   │   ├── billing/
│   │   ├── invoices/
│   │   ├── payments/
│   │   ├── hrm/
│   │   ├── documents/
│   │   ├── communication/
│   │   ├── automation/
│   │   ├── reports/
│   │   ├── audit/
│   │   ├── settings/
│   │   ├── notifications/
│   │   ├── support/
│   │   ├── tenant-admin/                  # tenant settings, branding, members
│   │   ├── platform-admin/                # super-admin only
│   │   └── verticals/
│   │       ├── dental/
│   │       │   ├── api/
│   │       │   ├── hooks/
│   │       │   ├── components/
│   │       │   ├── pages/
│   │       │   └── widgets/
│   │       ├── school/
│   │       ├── medical/
│   │       ├── law/
│   │       ├── restaurant/
│   │       ├── gym/
│   │       ├── salon/
│   │       └── retail/
│   ├── config/
│   │   ├── navigation.ts                  # vertical-aware nav generator
│   │   ├── verticals.ts                   # vertical registry
│   │   └── env.ts
│   ├── pages/
│   │   ├── public/
│   │   │   ├── PublicBookingPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   └── system/
│   │       └── HealthPage.tsx
│   ├── main.tsx
│   └── index.css
├── components.json                        # shadcn config
├── tailwind.config.ts                     # Tailwind v4 config (TS or CSS-based)
├── postcss.config.js
└── package.json
```

Each feature folder has the same shape:

```
features/<name>/
├── api/
│   ├── <name>.api.ts
│   ├── <name>.contracts.ts
│   └── <name>.mocks.ts
├── hooks/
├── components/
├── types/
├── pages/
└── index.ts                               # public API of the feature
```

---

## 4. Design System

### 4.1 Tokens (`src/styles/tokens.css`)

CSS variables grouped by purpose. Light + dark sets via `:root` and
`[data-theme="dark"]`. Every Tailwind utility resolves to a token.

```
:root {
  /* surface */
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --popover: 0 0% 100%;
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 222 47% 11%;

  /* brand */
  --primary: 238 75% 59%;          /* default BOS indigo */
  --primary-foreground: 0 0% 100%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222 47% 11%;

  /* status */
  --success: 142 71% 45%;
  --warning: 38 92% 50%;
  --destructive: 0 84% 60%;
  --info: 217 91% 60%;

  /* shape */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* shadow */
  --shadow-sm: 0 1px 2px rgba(0,0,0,.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,.08);
  --shadow-lg: 0 12px 32px rgba(0,0,0,.12);

  /* type */
  --font-sans: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
  --font-display: 'DM Serif Display', ui-serif, serif;
  --font-mono: 'DM Mono', ui-monospace, monospace;
}
```

### 4.2 shadcn components (install list, in order)

Phase 1 install — single `shadcn add` command via the MCP server we
configured at `.mcp.json`. Picked because they're used in every screen.

```
npx shadcn@latest add @shadcn/button @shadcn/button-group @shadcn/input \
  @shadcn/input-group @shadcn/input-otp @shadcn/textarea @shadcn/label \
  @shadcn/field @shadcn/checkbox @shadcn/radio-group @shadcn/switch \
  @shadcn/select @shadcn/native-select @shadcn/combobox @shadcn/slider \
  @shadcn/toggle @shadcn/toggle-group @shadcn/form @shadcn/calendar \
  @shadcn/card @shadcn/separator @shadcn/scroll-area @shadcn/resizable \
  @shadcn/sidebar @shadcn/sheet @shadcn/collapsible @shadcn/accordion \
  @shadcn/tabs @shadcn/breadcrumb @shadcn/pagination @shadcn/aspect-ratio \
  @shadcn/item @shadcn/alert @shadcn/alert-dialog @shadcn/dialog \
  @shadcn/drawer @shadcn/sonner @shadcn/progress @shadcn/skeleton \
  @shadcn/spinner @shadcn/tooltip @shadcn/hover-card @shadcn/empty \
  @shadcn/dropdown-menu @shadcn/context-menu @shadcn/menubar \
  @shadcn/navigation-menu @shadcn/command @shadcn/kbd @shadcn/avatar \
  @shadcn/badge @shadcn/chart @shadcn/table @shadcn/popover \
  @shadcn/carousel @shadcn/direction
```

Plus the pre-built blocks we'll graft onto:

```
npx shadcn@latest add @shadcn/dashboard-01 @shadcn/sidebar-08 \
  @shadcn/login-02 @shadcn/signup-04
```

These blocks are **starting scaffolds**, not final code. We rename
them into our feature folders and wire them to our own data layer,
i18n, and theme tokens.

### 4.3 Theming & White-label

- Default theme = "BOS Indigo" (`--primary: 238 75% 59%`).
- Each tenant has a `branding` config: `{ primaryColor, logoUrl, faviconUrl,
  fontFamily?, terminologyOverrides? }`.
- `useTenantTheme()` reads tenant config, sets CSS variables on
  `<html>` element. No re-render thrash.
- Vertical theme overlays tenant branding. Vertical sets sensible defaults
  (medical = teal, law = slate, restaurant = amber). Tenant branding wins
  if explicitly set.
- Whitelabel: a tenant can fully replace BOS branding — logo, name in
  topbar, login screen, email templates. The platform-admin role is the
  only one that ever sees the BOS brand.

### 4.4 Dark mode

- Toggle in topbar. Persists in `ui.store`. First visit honors
  `prefers-color-scheme`.
- Tailwind class strategy: `dark:` selectors throughout, gated by
  `[data-theme="dark"]` on `<html>`.

---

## 5. Architecture

### 5.1 Routing layer (`src/routes/`)

- `routeMap.ts` exports typed path builders: `routes.crm.contact(id)`.
  No string literals in components.
- `AppRoutes.tsx` composes route trees from each feature's exported
  `routes` constant. Adding a new module = adding one import.
- Guards live in `routes/guards/`:
  - `RequireAuth` (already built)
  - `RequireGuest` — redirects logged-in users away from `/login`
  - `RequirePermission` — gates by `Permission`
  - `RequireVertical` — gates by `VerticalType[]`

### 5.2 Layout layer (`src/layout/`)

- One `AppShell` for every authenticated screen.
- `Sidebar` is two-part: dark icon `Rail` (52px) + collapsible main panel
  (240px desktop / off-canvas mobile via `Sheet`).
- Topbar: breadcrumb (driven by route handle), global search command
  palette (`Cmd+K`), quick create, notifications, help, theme toggle,
  locale switcher, profile menu.
- `PageContainer` is the per-page padding/max-width frame; every page
  starts with `<PageContainer><PageHeader …/>…</PageContainer>`.

### 5.3 Feature modules

- One folder per feature. Self-contained. Imports only from
  `src/shared/`, `src/stores/`, `src/i18n/`, `src/config/`, and its own files.
- Each feature exports a `routes.tsx` and an `index.ts` declaring its
  public API.
- Cross-feature data goes through React Query, not imports.

### 5.4 Data layer

- `shared/api/http.ts` — single fetch wrapper; reads `accessToken` from
  session store; unwraps `{ success, data }`; throws `ApiError`.
- Each feature's `api/` defines:
  - **contracts** (zod schemas + TS types)
  - **api** (typed functions calling the http wrapper)
  - **mocks** (deterministic mock data, behind `VITE_USE_MOCKS=true`)
- Each feature's `hooks/` wraps `useQuery` / `useMutation` per endpoint.
  Components never call api functions directly.
- Query keys are namespaced: `['<feature>.<resource>', ...args]`.
- Mutations always invalidate the right keys. No stale data.

### 5.5 RBAC & vertical gating

- `src/shared/lib/permissions.ts` exports `Permission` enum + helpers.
- `usePermissions()` reads from `tenant.permissions`.
- `<Can permission="invoices:write">…</Can>` for inline gating.
- Routes use `<RequirePermission permission="…" />` parents.
- `useVertical()` returns the active vertical config (terminology,
  default widgets, allowed modules).

---

## 6. Localization (i18n)

- `i18next` + `react-i18next`. Namespaces per feature: `auth`, `crm`,
  `dashboard`, `dental`, `school`, `common`, `errors`, `validation`.
- Source locale: `en`. First-tier targets: `ar` (RTL), `ur` (RTL),
  `es`, `hi`.
- RTL: handled via `dir="rtl"` on `<html>`. Tailwind's logical properties
  (`ms-2`, `me-2`, `ps-4`, `pe-4`) used everywhere; no `ml-*`/`mr-*`.
- Date/number/currency formatting via `Intl.*` APIs, never hand-rolled.
- Pluralization via i18next plural rules.
- Missing keys log to console in dev, fall back to key name in prod
  (never crash).
- Translator workflow: keys live in `src/i18n/resources/en/<ns>.json`;
  exporters/translators pull from there.

---

## 7. Verticals & Their Module Sets

### 7.1 Universal modules (every vertical)

Dashboard · CRM · Scheduling · Billing & Invoices · HRM · Documents ·
Communication (email, SMS, internal notes) · Automation · Reports &
Analytics · Audit · Settings · Support · Notifications · Tenant Admin

### 7.2 Vertical specializations

| Vertical    | Specialized Modules                                                                 |
| ----------- | ----------------------------------------------------------------------------------- |
| Dental      | Patient Chart · Tooth Chart · Treatment Plans · Procedures · X-rays/Imaging · Lab Orders · Recalls · Insurance Claims · Prescriptions · Consents |
| School      | Students · Parents/Guardians · Classes/Sections · Subjects · Teachers · Attendance · Gradebook · Exams · Timetable · Fees · Transport · Library · Hostel |
| Medical     | Patients · EMR · SOAP Notes · Vitals · Labs · Prescriptions · Imaging · Referrals · Clinical Pathways |
| Law         | Cases/Matters · Clients · Court Dates · Documents/Pleadings · Time Tracking · Trust Accounting · Conflicts |
| Restaurant  | Menu · Tables · Reservations · Orders · KOT/Kitchen Display · Inventory · Suppliers · Recipes |
| Gym         | Members · Memberships · Class Bookings · Trainers · Equipment · Nutrition Plans · Workouts |
| Salon/Spa   | Clients · Services · Stylists · Appointments · Inventory · Loyalty · Packages |
| Retail      | Products · POS · Inventory · Suppliers · Returns · Loyalty · Promotions |

Full screen list per vertical lives in `docs/screens-inventory.md`.

---

## 8. Quality Gates

- **PR pre-checks (CI):** `tsc --noEmit`, `eslint`, `prettier --check`,
  `vitest --run`.
- **PR human review:** at least one approval; design review on any new
  shared UI component.
- **e2e (Playwright):** golden-path flows — login, signup, dashboard load,
  create contact, create appointment, create invoice. Run nightly.
- **Bundle size budget:** main chunk < 350KB gzipped at all times.
  Track in CI.
- **Accessibility:** axe-core in Playwright runs; zero violations on
  shipped pages.

---

## 9. Documentation Set

Located in `docs/`:

- `rebuild-master-plan.md` (this file)
- `screens-inventory.md` (every screen, every vertical)
- `design-system.md` (tokens, shadcn, theming, i18n, RBAC)
- `frontend-understanding.md` (already exists; product context)
- `backend-auth-dev-changes.md` (already exists)

Each new feature ships a one-page `features/<name>/README.md` with
purpose, public API, contracts, and known gaps.

---

## 10. Rollout Plan (PR sequence)

Phases are gates. Don't start phase N+1 until phase N is merged and the
app runs cleanly.

### Phase 1 — Foundation (no visible change)
1. Install Tailwind v4 + shadcn/ui (run `shadcn init`; configure
   `components.json`; pick base color → `slate`; CSS variables: yes).
2. Add `src/styles/tokens.css`, `tailwind.config.ts`/CSS, `globals.css`.
3. Install all shadcn primitives listed in §4.2.
4. Add `i18next` + `react-i18next` + first `en` resources.
5. Add `src/shared/` baseline: `lib/cn.ts`, `lib/format.ts`,
   `hooks/useTheme.ts`, `hooks/useLocale.ts`, `hooks/useMediaQuery.ts`.
6. Add `ui.store.ts` with theme + sidebar state. Persist to localStorage.
7. **Stand up Storybook** (Storybook 8 + Vite builder) with
   Tailwind/tokens loaded in the preview. Add stories for the first
   shadcn primitives (button, input, card, dialog, table) as smoke tests
   of the setup. Add `npm run storybook` and `npm run build-storybook`
   scripts. CI runs `build-storybook` to catch regressions.

### Phase 2 — Layout
7. Build new `AppShell` using shadcn `Sidebar` component.
8. Build `Topbar` with command palette (`Cmd+K`), notifications popover,
   profile menu, theme toggle, locale switcher.
9. Wire `routeMap.ts`. Migrate existing auth routes onto it.
10. Migrate auth pages to shadcn primitives (Card, Input, Button, Form,
    Tabs). Visual parity with existing auth design.

### Phase 3 — Dashboard widget system
11. Build `KpiCard`, `Panel`, `DataTable` shared primitives.
12. Implement widget contract from previous plan.
13. Migrate the 9 hardcoded dashboard panels into widgets one by one.
14. Add layout registry; wire `SuperAdminLayout`.
15. Add mock data layer behind `VITE_USE_MOCKS`.

### Phase 4 — Universal modules (CRM-first)
16. CRM (contacts, segments, activities, notes).
17. Scheduling (calendar, slots, resources).
18. Billing + Invoices + Payments.
19. HRM (employees, attendance, leaves).
20. Documents.
21. Communication.
22. Reports & Analytics.
23. Settings (tenant, members, billing, branding, integrations,
    feature flags, audit).
24. Notifications.
25. Support.
26. Automation (read-only first; builder is Phase 9 polish).

### Phase 5 — Dental vertical
27. Dental dashboard layout.
28. Patient chart + tooth chart.
29. Treatment plans + procedures.
30. Imaging viewer (read-only stub; full DICOM is Phase 9).
31. Recalls.
32. Insurance claims.

### Phase 6 — School vertical
33. School dashboard.
34. Students + parents.
35. Classes/sections + timetable.
36. Attendance.
37. Gradebook + exams.
38. Fees.
39. Library + transport + hostel.

### Phase 7 — Medical vertical (heaviest vertical; built across 12 sub-phases) ✅ shipped
40a. **7.0 Foundations** — clinical-locale tenant fields, 13 medical feature
     keys, 9 medical permissions, `bidi.tsx` (`<BidiNum>` / `<BidiCode>` /
     `<BidiRange>` / `toEasternDigits`), `hijri.ts` (Umm al-Qura via
     `Intl.DateTimeFormat`), `units.ts` (UCUM-aligned converters anchored on
     SI), `useClinicalLocale` + `useUnitPreference`, curated code datasets
     (ICD-10, SNOMED, LOINC, RxNorm, CPT, CVX, regional allergens),
     `medical.json` i18n namespace.
40b. **7.1 Contracts + mocks + api + hooks** — 25+ FHIR R4-aligned zod
     schemas, ~30-patient rich seed (every research §19 archetype incl.
     polypharmacy / pregnancy / peds / psych / OB / cardiology), 30+ typed
     api entrypoints branched on `env.useMocks`, 35+ React Query hooks.
40c. **7.2 Clinical primitives** — `HijriDate`, `AbnormalFlag`,
     `AllergyAckBanner`, `PatientStoryboard`, `ChartSidebar`, universal
     `CodePicker` w/ thin per-system wrappers, `VitalsRecorder` (lossless
     unit flip), `Calculators` (BMI / EDD Naegele / CrCl Cockcroft-Gault /
     CHA₂DS₂-VASc / HAS-BLED), `DDIAlertList` + `evaluateDDI()` engine,
     `BreakGlassDialog`, `SignCeremonyDialog` — all with Storybook stories.
40d. **7.3 Encounter shell + chart sections** — `SoapNoteEditor` (S/O/A/P
     tabs, ROS panel, ICD-10 picker per assessment, 8s autosave, draft-
     default, immutable-after-sign with addendum composer),
     `EncounterDetailPage`, `PatientChartLayout`, 11 chart-section pages.
40e. **7.4 Rx pad + refill queue** — `PrescribeDialog` with five gates
     (drug → strength → SIG → DDI/allergy ack → sign), peds-weight gate,
     CII auto-refill cap, override-reason capture; refill queue inbox.
40f. **7.5 Specialty depth** — `GrowthChart` SVG (WHO 0–24mo + CDC 2–20yr,
     percentile bands, patient overlay), Immunizations page (ACIP-aligned
     due/overdue calc), Pregnancy flowsheet + ultrasound biometry, Psych
     scales (PHQ-9 / GAD-7 trend with severity bars).
40g. **7.6 Labs + imaging** — Lab inbox (KPIs + filter + sign), Lab report
     detail with `LabTrendChart` per-analyte SVG, Imaging chart-list +
     standalone study detail w/ PACS deep-link.
40h. **7.7 Scheduling + front desk + recalls** — `SchedulePage` (Day/Week
     grid w/ class-tinted chips), `FrontDeskPage` Kanban pipeline
     (Scheduled → Arrived → Roomed → With provider → Checkout → Departed +
     No-show bucket), `RecallsPage` worklist.
40i. **7.8 Telehealth + Patient portal sub-app** — provider video room
     with chart side-rail; `/portal/*` (Home / Appointments / Messages /
     Results / Medications / Billing) with lean tenant-branded shell.
40j. **7.9 Billing** — `SuperbillPage` (CMS-1500 builder w/ A-D dx
     pointers + CPT lines + modifiers), `BillingWorklistPage` (AR /
     denial-rate KPIs + filter), `ClaimDetailPage` (live payment posting).
40k. **7.10 Admin + dashboard layout + a11y/RTL/Hijri pass** —
     `MedicalDashboardLayout` (KPI row + today's schedule + lab inbox +
     refills/recalls + billing snapshot), `ClinicalLocalePage`,
     `AuditOverviewPage`. a11y: every numeric `<bdi>`-isolated; flags
     carry icon + label + color; logical CSS properties throughout.
40l. **7.11 Wiring + verification** — routeMap medical entries,
     navigation icons resolved through routeMap, screens-inventory updated
     (MED-01..MED-33 + MEDP-01..MEDP-06), tsc clean.

### Phase 8 — Other verticals (one PR each, smaller scope)
41. Law firm.
42. Restaurant.
43. Gym.
44. Salon.
45. Retail.

### Phase 8 — Tenant admin & platform admin
46. Tenant admin: branding, locale, members + invites, roles,
    billing, integrations.
47. Platform admin: tenant list, tenant impersonation, feature flags,
    plans, system health.

### Phase 9 — Polish wave
48. Automation builder UI.
49. Imaging viewer full DICOM.
50. e2e Playwright suite.
51. Accessibility audit + fixes.
52. Performance pass (route-level code-split, image lazy-load,
    bundle budget).
53. RTL audit (Arabic + Urdu).
54. Storybook coverage audit — every shared UI component must have at
    least one story; backfill any gaps from earlier phases.

---

## 11. Risks / Tradeoffs

- **Backend lag.** Auth-service is the only backend. Every non-auth
  feature must ship against mocks until `core-service` exists. We accept
  this; mocks are first-class and gated by `VITE_USE_MOCKS`.
- **Scope creep.** "World's best system" is aspirational. Each phase has
  a defined exit criterion in §10. Don't gold-plate phase N to delay
  phase N+1.
- **Tailwind v4 migration.** V4 is config-via-CSS, different from v3.
  Lock the version; pin Tailwind in `package.json`.
- **shadcn churn.** shadcn updates often. Lock to the version we install
  via `components.json`. Re-generate components only with intent.
- **i18n debt.** Adding strings without keys is the easiest way to break
  this plan. ESLint rule (`react/jsx-no-literals` configured for our
  needs) enforces in CI from Phase 2.
- **Vertical sprawl.** Every new vertical adds maintenance load. Verticals
  are not free; we add them deliberately and only when a paying tenant
  needs depth.

---

## 12. Decisions (locked 2026-04-27)

1. **Tailwind v4** — locked. Config-via-CSS, `@theme` block in
   `tokens.css` drives Tailwind utilities. Pin the version in
   `package.json`.
2. **i18next** — recommended; not contested.
3. **Tenant theme** — server returns `tenant.branding`; client hydrates
   CSS variables on `<html>` via `useTenantTheme()` on
   tenant resolution.
4. **Whitelabel scope: full** — logo, favicon, accent, name, font
   override, and email-template overrides all land in v1 (not deferred
   to Phase 9). Phase 8 (Tenant admin) ships the configuration UI.
5. **Storybook — in scope.** Stood up in Phase 1 alongside Tailwind +
   shadcn. Every shared component in `src/shared/ui/` ships with at
   least one story. Vertical-specific components get stories when they
   land. Storybook becomes the canonical visual reference for the design
   system; the `/app/_kitchen-sink` route is removed once Storybook is
   live.
6. **Charts** — Recharts via shadcn `chart` and `chart-*-interactive`
   blocks.
7. **First vertical: dental** — Phase 5 ships full dental depth
   (DEN-01 .. DEN-22). School follows in Phase 6 (SCL-01 .. SCL-34).

---

## 13. Definition of Done — for the rebuild as a whole

The rebuild is "done" when:

- [ ] Every authenticated screen lives inside `AppShell`.
- [ ] Every UI primitive in use is shadcn or a documented wrapper.
- [ ] No hardcoded user-facing strings outside i18n resources.
- [ ] `VITE_USE_MOCKS=false` builds and runs without code changes once
      `core-service` ships its endpoints.
- [ ] Every module from §10 has at least the screens listed in
      `docs/screens-inventory.md`.
- [ ] Two verticals (dental + school) have full vertical-specific
      screens, not just terminology overrides.
- [ ] Playwright golden-path suite passes nightly.
- [ ] Bundle main chunk < 350KB gzipped.
- [ ] Lighthouse ≥ 95 (perf), ≥ 95 (a11y), 100 (best practices), 100
      (SEO) on `/login` and `/app/dashboard`.
- [ ] Arabic + Urdu RTL pass a manual audit on the dashboard, CRM,
      and dental patient chart.

---

## 14. How to use this document

- Reference it in every PR description: `Implements §10 step N.`
- When a rule needs to change, edit this file in the same PR that
  changes the code. Reviewers reject silent rule drift.
- Treat the screens inventory and design system docs as canonical
  alongside this one.

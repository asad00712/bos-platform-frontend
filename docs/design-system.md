# BOS Frontend — Design System Spec

> Companion to `rebuild-master-plan.md`. This file is the design contract:
> tokens, components, theming, i18n, accessibility, RBAC. Anything
> visual or behavioral that should be consistent across the app is
> defined here.

---

## 1. Tokens

### 1.1 Color (HSL channels for Tailwind v4)

Stored in `src/styles/tokens.css`. Two themes: `:root` (light) and
`[data-theme="dark"]`. All app color references go through these vars.
Tailwind utilities like `bg-primary`, `text-foreground` resolve here.

| Token                     | Light             | Dark              | Use                           |
| ------------------------- | ----------------- | ----------------- | ----------------------------- |
| `--background`            | `0 0% 100%`       | `222 47% 8%`      | Page background               |
| `--foreground`            | `222 47% 11%`     | `210 40% 98%`     | Primary text                  |
| `--card`                  | `0 0% 100%`       | `222 47% 11%`     | Card surface                  |
| `--card-foreground`       | `222 47% 11%`     | `210 40% 98%`     | Card text                     |
| `--popover`               | `0 0% 100%`       | `222 47% 11%`     | Popover surface               |
| `--popover-foreground`    | `222 47% 11%`     | `210 40% 98%`     | Popover text                  |
| `--primary`               | `238 75% 59%`     | `238 75% 65%`     | BOS brand                     |
| `--primary-foreground`    | `0 0% 100%`       | `0 0% 100%`       | Text on primary               |
| `--secondary`             | `210 40% 96%`     | `217 33% 17%`     | Soft surface                  |
| `--secondary-foreground`  | `222 47% 11%`     | `210 40% 98%`     | Text on secondary             |
| `--muted`                 | `210 40% 96%`     | `217 33% 17%`     | Muted surface                 |
| `--muted-foreground`      | `215 16% 47%`     | `215 20% 65%`     | Muted text                    |
| `--accent`                | `210 40% 96%`     | `217 33% 17%`     | Hover/focus surface           |
| `--accent-foreground`     | `222 47% 11%`     | `210 40% 98%`     | Text on accent                |
| `--destructive`           | `0 84% 60%`       | `0 70% 50%`       | Errors, destructive actions   |
| `--destructive-foreground`| `210 40% 98%`     | `210 40% 98%`     | Text on destructive           |
| `--success`               | `142 71% 45%`     | `142 71% 45%`     | Success                       |
| `--warning`               | `38 92% 50%`      | `38 92% 50%`      | Warning                       |
| `--info`                  | `217 91% 60%`     | `217 91% 60%`     | Info                          |
| `--border`                | `214 32% 91%`     | `217 33% 17%`     | Default borders               |
| `--input`                 | `214 32% 91%`     | `217 33% 17%`     | Input borders                 |
| `--ring`                  | `222 47% 11%`     | `212 27% 84%`     | Focus ring                    |
| `--rail`                  | `244 55% 20%`     | `244 55% 12%`     | Sidebar dark rail             |

White-label tenants override `--primary` and `--ring` via inline
style on `<html>` set by `useTenantTheme()`. Vertical defaults are
applied first, tenant overrides win.

### 1.2 Radius

| Token        | Value |
| ------------ | ----- |
| `--radius-sm`| 6px   |
| `--radius-md`| 8px   |
| `--radius-lg`| 12px  |
| `--radius-xl`| 16px  |

shadcn's `--radius` resolves to `--radius-md`.

### 1.3 Spacing

Tailwind defaults — 4px base. Don't override. Use `gap-*`, `p-*`,
`space-*` consistently.

### 1.4 Typography

| Token             | Value                                            |
| ----------------- | ------------------------------------------------ |
| `--font-sans`     | `'DM Sans', ui-sans-serif, system-ui`            |
| `--font-display`  | `'DM Serif Display', ui-serif, serif`            |
| `--font-mono`     | `'DM Mono', ui-monospace, monospace`             |

Type scale (Tailwind utilities):
- `text-xs` (12) — captions, table cell meta
- `text-sm` (14) — body, table content
- `text-base` (16) — paragraph
- `text-lg` (18) — small headings
- `text-xl` (20) — page subhead
- `text-2xl` (24) — page heading
- `text-3xl` (30) — display
- `text-4xl` (36) — login hero only

Line height: Tailwind defaults. Letter spacing: default; `tracking-tight`
on `text-2xl+`.

### 1.5 Shadow

| Token         | Value                          |
| ------------- | ------------------------------ |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,.05)`    |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,.08)`   |
| `--shadow-lg` | `0 12px 32px rgba(0,0,0,.12)`  |
| `--shadow-xl` | `0 24px 48px rgba(0,0,0,.16)`  |

### 1.6 Motion

| Token                    | Value     |
| ------------------------ | --------- |
| `--duration-fast`        | 120ms     |
| `--duration-base`        | 200ms     |
| `--duration-slow`        | 320ms     |
| `--ease-standard`        | `cubic-bezier(.2,.8,.2,1)` |
| `--ease-emphasized`      | `cubic-bezier(.3,0,.4,1)`  |

Always check `prefers-reduced-motion`; reduce to instant if true.

### 1.7 Z-index

| Layer            | Z |
| ---------------- | -- |
| base             | 0  |
| sticky           | 10 |
| sidebar          | 20 |
| topbar           | 30 |
| dropdown/popover | 40 |
| dialog           | 50 |
| toast            | 60 |
| tooltip          | 70 |

---

## 2. shadcn Component Inventory

Install via shadcn MCP server. Group by purpose. Don't install what
isn't on this list — keeps the bundle and the API surface lean.

### 2.1 Form & input
button · button-group · input · input-group · input-otp · textarea ·
label · field · checkbox · radio-group · switch · select ·
native-select · combobox · slider · toggle · toggle-group · form ·
date-picker · calendar · calendar-hijri (for ar/ur locales)

### 2.2 Layout
card · separator · scroll-area · resizable · sidebar · sheet ·
collapsible · accordion · tabs · breadcrumb · pagination · aspect-ratio ·
item

### 2.3 Feedback
alert · alert-dialog · dialog · drawer · sonner (toast) · progress ·
skeleton · spinner · tooltip · hover-card · empty

### 2.4 Navigation
dropdown-menu · context-menu · menubar · navigation-menu · command · kbd

### 2.5 Display
avatar · badge · chart · table (data-table) · popover · carousel

### 2.6 Utility
direction (RTL helper) · use-mobile (hook) · utils (lib)

### 2.7 Pre-built blocks to leverage (don't rebuild from scratch)
- **`dashboard-01`** — full dashboard scaffold: sidebar + interactive
  charts + sortable data table with row drag-reorder. 11 files. Pulls
  in `@dnd-kit/*`, `@tabler/icons-react`, `@tanstack/react-table`, `zod`.
  Use as the BOS dashboard skeleton, then graft widgets in.
- **`sidebar-08`** — inset sidebar with secondary nav. Closest layout
  match to the existing BOS rail+sidebar. Use as the basis for `AppShell`.
  Alternatives: `sidebar-07` (collapses to icons) for the rail look.
- **`login-02`** — two-column login with cover image. Drop-in match
  for the current `AuthBrandPanel` + form layout. Use for AUTH-09.
- **`signup-04`** — two-column signup with image. Use for AUTH-10.

### 2.8 Custom shared (built on top of shadcn — only what shadcn doesn't ship)
- `DataTable` — thin wrapper around `@tanstack/react-table` + shadcn
  `table`, adding our toolbar/filters/column-visibility/pagination/
  row-selection/row-actions API. (shadcn ships `table`; we wrap it.)
- `KpiCard` — title, value, delta, trend, icon, sparkline.
- `PageHeader` — title, breadcrumb slot, actions slot.
- `ErrorState` — icon, title, description, retry button. (Counterpart
  to shadcn's `empty`; same visual language.)
- `LoadingSkeleton` — pre-sized rectangles matching final layout.
  (Wraps shadcn `skeleton`.)
- `ConfirmDialog` — wrapper around `alert-dialog` with destructive default.
- `DatePicker` / `DateRangePicker` — locale-aware, RTL-safe; uses
  shadcn `calendar` + `calendar-hijri` based on locale.
- `PhoneInput` — E.164, locale-aware default country. (Built on
  `input-group`.)
- `CurrencyInput` — currency-aware mask, tenant currency. (Built on
  `input-group`.)
- `FileUpload` — drag/drop, progress, multiple, mime guards.
- `RichTextEditor` — Tiptap-based; minimal toolbar.
- `CommandPalette` — global `Cmd+K` over shadcn `command`.
- `Stepper` — for multi-step flows (signup, treatment plans, exams).
- `Filters` — declarative filter bar (date range, multi-select, search).

> **Rule:** if shadcn ships it, we never rebuild it. The list above
> exists only because shadcn does *not* ship those exact things.
> Whenever shadcn adds one (e.g. they recently shipped `empty`, `field`,
> `spinner`), we delete our custom version.

---

## 3. Theming

### 3.1 How tokens flow

1. `tokens.css` defines `:root` and `[data-theme="dark"]`.
2. `tailwind.config.ts` (or CSS-based config in v4) maps Tailwind
   utilities to those vars: `colors: { primary: 'hsl(var(--primary))' }`.
3. `useTheme()` toggles `data-theme` on `<html>`.
4. `useTenantTheme()` writes inline overrides for `--primary`, `--ring`,
   and any other branded vars when tenant has custom branding.

### 3.2 White-label config

```
type TenantBranding = {
  primaryColor?: string;          // HSL channels: "238 75% 59%"
  logoUrl?: string;
  faviconUrl?: string;
  appName?: string;               // overrides "BOS" in topbar/login
  fontFamily?: string;            // optional; loaded via @font-face
  emailHeaderHtml?: string;       // for transactional emails
  terminologyOverrides?: Record<string, string>;
};
```

`useTenantTheme()` applies all of the above. `appName` flows through
i18n via interpolation (`t('common.appName')` defaults to "BOS",
overridden at runtime).

### 3.3 Vertical defaults

| Vertical    | --primary (HSL)   | Notes                                |
| ----------- | ----------------- | ------------------------------------ |
| Default BOS | `238 75% 59%`     | Indigo                               |
| Medical     | `173 80% 36%`     | Teal                                 |
| Dental      | `200 95% 45%`     | Cyan-blue, clinical feel             |
| School      | `260 75% 55%`     | Violet                               |
| Law         | `217 33% 30%`     | Slate-blue                           |
| Restaurant  | `25 95% 55%`      | Amber-orange                         |
| Gym         | `0 75% 55%`       | Crimson                              |
| Salon       | `330 75% 60%`     | Magenta-pink                         |
| Retail      | `155 55% 45%`     | Emerald                              |

Resolution order: vertical default → tenant override → user theme
toggle (dark/light, never re-colors).

---

## 4. Localization

### 4.1 Setup

- `i18next` + `react-i18next` initialized in `src/i18n/index.ts`.
- Resources under `src/i18n/resources/<locale>/<namespace>.json`.
- Namespaces: `common`, `auth`, `dashboard`, `crm`, `scheduling`,
  `billing`, `hrm`, `documents`, `communication`, `automation`,
  `reports`, `settings`, `dental`, `school`, `medical`, `law`,
  `restaurant`, `gym`, `salon`, `retail`, `errors`, `validation`.
- Default locale: `en`. First-tier locales: `ar`, `ur`, `es`, `hi`.
- Locale persisted in `ui.store`; falls back to `navigator.language`.

### 4.2 Usage

```
const { t } = useTranslation('crm');
return <h1>{t('contact.create.title')}</h1>;
```

Never `<h1>Create Contact</h1>`. ESLint rule
`i18next/no-literal-string` enforced from Phase 2.

### 4.3 RTL

- `<html dir="rtl">` set automatically for Arabic/Urdu via
  `useLocale()`.
- Use Tailwind logical properties only: `ms-*`, `me-*`, `ps-*`, `pe-*`,
  `start-*`, `end-*`. Never `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`,
  `right-*`.
- Icons that imply direction (chevrons, arrows) flip via `rtl:scale-x-[-1]`
  or RTL-aware lucide variants.

### 4.4 Formatting

- Dates: `format(date, pattern, { locale })` from `date-fns`.
- Numbers: `Intl.NumberFormat(locale, options)`.
- Currency: `Intl.NumberFormat(locale, { style: 'currency', currency:
  tenant.currency })`.
- Relative time: `Intl.RelativeTimeFormat`.

---

## 5. Accessibility

### 5.1 Required behaviors

- All interactive elements reachable via keyboard.
- Focus rings visible (use shadcn defaults; never `outline-none` without
  a replacement).
- ARIA labels on icon-only buttons (`aria-label="Open notifications"`).
- Form fields always labeled (visible label or `aria-label`).
- Modal traps focus; closes on Escape; returns focus to invoker.
- Live regions (`aria-live="polite"`) for toast + async result text.
- Color is never the sole carrier of meaning — pair with icon or label.
- Contrast WCAG AA minimum on all text/foreground pairs.

### 5.2 Tooling

- `eslint-plugin-jsx-a11y` enforced.
- `axe-core` runs in Playwright e2e.

---

## 6. RBAC

### 6.1 Permission shape

```
type Permission =
  | 'dashboard:view'
  | 'crm:read' | 'crm:write'
  | 'scheduling:read' | 'scheduling:write'
  | 'billing:read' | 'billing:write'
  | 'hrm:read' | 'hrm:write'
  | 'documents:read' | 'documents:write'
  | 'communication:read' | 'communication:write'
  | 'automation:read' | 'automation:write'
  | 'reports:read'
  | 'settings:manage'
  | 'audit:view'
  | 'dental:read' | 'dental:write'
  | 'school:read' | 'school:write'
  | ...; // grow as features ship
```

### 6.2 Gate APIs

- Route: `<RequirePermission permission="…" />`
- Inline: `<Can permission="…">…</Can>`
- Hook: `usePermissions().has('crm:write')`

Backend authority is final. UI gates are UX, not security.

---

## 7. Patterns (do/don't)

### 7.1 Page layout

```
<PageContainer>
  <PageHeader
    title={t('crm.contact.list.title')}
    breadcrumbs={[{label: t('common.crm'), href: routes.crm.root()}]}
    actions={<Can permission="crm:write"><Button>+ {t('common.new')}</Button></Can>}
  />
  <Filters … />
  <DataTable … />
</PageContainer>
```

### 7.2 Async UI

Every data view handles three states explicitly:

```
if (query.isLoading) return <LoadingSkeleton variant="table" />;
if (query.isError)   return <ErrorState onRetry={query.refetch} />;
if (!query.data?.items.length) return <EmptyState … />;
return <DataTable rows={query.data.items} … />;
```

Never `query.isLoading ? null : <Table .../>` — that flashes empty.

### 7.3 Forms

- One source of truth: `react-hook-form` + `zod`.
- Validation messages come from i18n (`validation.required`, etc.).
- Submit button disabled while `isSubmitting`; shows spinner.
- Server errors map via `setError` to specific fields.
- Never alert(); never console.error in catch.

### 7.4 Tables

Always via `DataTable`. Required features per table:
- column sort (server- or client-side declared explicitly)
- row selection (when actions exist)
- row hover state
- empty state inside the table area
- sticky header on scroll
- pagination with page size selector
- column visibility toggle (in toolbar)
- export (CSV) when permission allows

### 7.5 Density

`ui.store.density` is `'comfortable' | 'compact'`. DataTable + cards
respect it. Defaults to `comfortable`.

---

## 8. Code-quality rules

- Components: function components only. No `React.FC`. Props typed
  inline or in same file.
- File names: `PascalCase.tsx` for components, `camelCase.ts` for
  hooks/utilities.
- One default export per component file. Named exports for hooks.
- Imports: external first, then `@/shared`, then `@/features/<self>`,
  then relative.
- Path alias `@/` → `src/` configured in `tsconfig` and Vite.
- No barrel files except feature `index.ts` declaring public API.
- Comments are rare; when present, explain *why*, not *what*.

---

## 9. Definition of "shadcn-grade"

A component is shadcn-grade when it:
1. Uses shadcn primitives (or wraps Radix/Tailwind in the shadcn pattern).
2. Reads color/spacing/typography only via tokens or Tailwind utilities.
3. Supports light + dark mode without conditional logic in JSX.
4. Is keyboard-accessible and has correct ARIA semantics.
5. Has loading, empty, and error variants where applicable.
6. Has no hardcoded user-facing strings.
7. Is responsive: works at 360px wide and at 1920px.
8. Is RTL-safe (uses logical properties).
9. Compiles with strict TypeScript and lints clean.
10. Has at least one Vitest test if it has logic, or a smoke test if
    it's purely presentational.

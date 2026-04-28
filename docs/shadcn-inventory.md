# shadcn Registry Inventory (live snapshot)

> Snapshot of what `@shadcn` ships, captured via the shadcn MCP on
> 2026-04-27. Refresh by running
> `mcp__shadcn__list_items_in_registries({ registries: ["@shadcn"] })`.
>
> 405 items total. This file lists what we *care about*. Examples and
> internals are omitted; pull them on demand via the MCP.

---

## 1. Primitives (UI)

These are the building blocks. Install once, use everywhere.

### Form & input
`button` · `button-group` · `input` · `input-group` · `input-otp` ·
`textarea` · `label` · `field` · `checkbox` · `radio-group` · `switch` ·
`select` · `native-select` · `combobox` · `slider` · `toggle` ·
`toggle-group` · `form` · `date-picker` · `calendar`

### Layout & containers
`card` · `separator` · `scroll-area` · `resizable` · `sidebar` ·
`sheet` · `collapsible` · `accordion` · `tabs` · `breadcrumb` ·
`pagination` · `aspect-ratio` · `item`

### Feedback
`alert` · `alert-dialog` · `dialog` · `drawer` · `sonner` (toast) ·
`progress` · `skeleton` · `spinner` · `tooltip` · `hover-card` · `empty`

### Navigation
`dropdown-menu` · `context-menu` · `menubar` · `navigation-menu` ·
`command` · `kbd`

### Display
`avatar` · `badge` · `chart` · `table` · `popover` · `carousel`

### Utility
`direction` (RTL plumbing) · `use-mobile` (hook) · `utils` (lib)

---

## 2. Blocks (full pre-built sections)

Blocks are larger than primitives; they ship as scaffolds we adapt.

### Application scaffolds
- **`dashboard-01`** — sidebar + interactive charts + sortable data
  table (with row drag-reorder via dnd-kit). 11 files. Deps: `@dnd-kit/*`,
  `@tabler/icons-react`, `@tanstack/react-table`, `zod`. **Use this as
  the BOS dashboard skeleton.**

### Sidebar variants (16 total)
Pick one, don't ship multiple. Closest matches for BOS:
- **`sidebar-08`** — inset sidebar with secondary navigation. **Best
  match for current BOS layout.**
- `sidebar-07` — collapses to icons. Good for the dark rail look.
- `sidebar-04` — floating sidebar with submenus.
- `sidebar-09` — collapsible nested sidebars.
- `sidebar-12` — sidebar with a calendar (could be useful in scheduling).

### Auth scaffolds
- **`login-02`** — two-column with cover image. Matches current
  `AuthBrandPanel` design.
- **`signup-04`** — two-column signup with image. Match for AUTH-10.
- Alternatives: `login-01` (simple), `login-03` (muted bg),
  `login-04` (form + image), `login-05` (email-only),
  `signup-01..05` for matching variants.

### Charts (Recharts wrappers)
Area, bar, line, pie/donut, radar, radial. Each shipped with default,
interactive, stacked, label, legend, tooltip variants. We pick:
- `chart-area-interactive` for revenue-by-week.
- `chart-bar-interactive` for tasks by status.
- `chart-pie-donut-active` for revenue-by-vertical.
- `chart-radial-stacked` for KPI summaries.

---

## 3. Themes (preset color bases)

Stone · zinc · neutral · gray · slate. All neutral-base; we override
`--primary` to BOS indigo (or per vertical/tenant). Pick one as base —
recommend `slate` for a slightly cool neutral.

---

## 4. Notable extras

- **`calendar-hijri`** — Persian/Hijri calendar. Use when locale is
  `ar` or `ur` and tenant requests Hijri dates.
- **`mode-toggle`** — light/dark toggle pattern; copy verbatim into
  the topbar `ThemeToggle`.
- **`sidebar-rsc`** — RSC-aware sidebar; reference for SSR (not
  needed in Vite SPA).

---

## 5. Audit checklist

After every installation phase, run
`mcp__shadcn__get_audit_checklist` to verify integration. Add the
result to the relevant PR.

---

## 6. How to consume this list

- **Adding a new feature:** check this list first. If shadcn ships
  what you need, use it. If not, build it under `src/shared/ui/`
  and document why shadcn didn't fit.
- **Refresh cycle:** re-run the MCP list every quarter; shadcn
  ships new primitives often (`empty`, `field`, `spinner`,
  `input-group`, `input-otp` are all recent additions).
- **Don't import from blocks blindly:** blocks ship with
  placeholder data, mock components, and design choices we may not
  want. Always rename + clean before merging into a feature folder.

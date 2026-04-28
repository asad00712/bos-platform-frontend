# Backend Alignment Plan — FE ↔ `crm-core` (port 3002)

> **Status**: planning. No code written yet.
> **Trigger**: backend PR #2 (`1c24b29`) shipped a CRM scaffold with branches, lead/contact split, RBAC, custom fields, lead pipeline, lead activities, tags, sources, webhooks, staff invites, lead assignment.
> **Goal**: bring the FE domain model up to the BE shape so we can swap mocks → real calls module by module, while preserving FE-only concepts that the BE has no opinion on yet.

---

## Ground rules

1. **BE shape wins** for fields the BE owns. FE renames/shapes shift to match.
2. **FE-only fields stay** when the BE has no equivalent — they live as denormalized/derived state on the FE side only.
   - `vertical` (per-contact classifier — Patient/Student/Client)
   - `ltv`, `currency` (lifetime value)
   - `birthday`, `preferredLocale`
   - Activity kinds `appointment`, `invoice`, `system` (these will become real once we have scheduling/billing/audit modules)
   - Structured address (`{line1, city, country}`) — we'll keep our nicer shape and flatten at the adapter
3. **Adapter layer** between BE DTOs and FE types. Never let `UPPERCASE` enum values or `branchId` UUIDs leak into components.
4. **Active branch** is a global FE concept — every list call appends `branchId`, every create form has it pre-filled. No screen asks the user every time.
5. **Permission-driven UI**: when we wire real auth, components consult a `useHasPermission(slug)` hook. Until then, hook returns `true`.
6. **Phase by phase**, no skipping. After each phase: tsc clean + manual smoke + commit.

---

## What stays, what changes, what's new

### A) Stays the same on FE (BE has no replacement)
- `Contact.vertical` — sub-classifier per vertical
- `Contact.ltv` / `currency` — lifetime value display
- `Contact.lastActivityAt` — derived field (FE computes from activities)
- `ContactDetail.birthday` / `preferredLocale`
- `ContactDetail.address: { line1, city, country }` — kept as nested shape, adapter flattens to BE's flat fields
- `ContactActivity.kind` extra values: `appointment`, `invoice`, `system` (FE-only kinds for now)
- `Segment` simplified shape `{id, name, count, color}` — kept as a lighter view over BE `ContactList`

### B) Changes on FE to match BE
| FE concept | Old shape | New shape |
|---|---|---|
| `Contact.status` | `lead \| active \| inactive \| archived` | `active \| inactive \| archived` (lead promoted to its own entity) |
| `Contact.source` | `enum manual\|website\|import\|referral\|integration` | `sourceId: string` → looked up against `ContactSource[]` |
| `Contact.tags` | `string[]` | `Tag[]` (M:N join) |
| `Contact.ownerName` | denormalized string | `ownerUserId: string` + lookup against staff |
| `Contact` flat fields added | — | `company`, `jobTitle`, `state`, `postalCode`, `branchId`, `originLeadId` |
| Pagination response | `{ items, total }` | `{ data, total, page, limit }` (adapter normalizes back to `{ items, total }` for components) |
| Activity discriminator | `kind: lower` | `type: UPPER` for BE-backed kinds; `kind: 'appointment'\|'invoice'\|'system'` stays FE-only |
| Activity author | `authorName: string` | `createdByUserId: string` + lookup |

### C) New on FE (BE already has the endpoints)
1. **Branches** — entity, store (active branch), picker in topbar, branches CRUD page in settings
2. **Lead** — separate entity, list page, detail page, kanban-by-statusId page, conversion flow (`POST /leads/:id/convert`)
3. **Lead Statuses** — pipeline stage CRUD page
4. **Lead Activities (BE-backed)** — timeline rebuild with `type: NOTE|CALL|EMAIL|SMS|WHATSAPP|MEETING|TASK`, direction, call outcome, recording URLs, task fields (dueAt/scheduledAt/taskStatus/assignedToUserId)
5. **Tags** — tag library page in settings, tag picker component
6. **Contact Sources** — sources CRUD page, source picker
7. **Custom Fields** — dynamic field editor (settings) + dynamic field renderer in contact/lead forms
8. **Roles & Permissions** — role list, role editor with permission-tree picker, `useHasPermission` hook
9. **Staff & Invites** — staff list, invite flow, invite-accept page (FE for `auth-service.invite-accept`)
10. **Lead Assignment Config** — round-robin rules per branch (eligible roles, isActive)
11. **Lead Webhooks** — CRUD + token regenerate + public ingestion URL display + copy-to-clipboard
12. **Tasks** (when BE controllers land) — task list and detail; FE may scaffold without backing

---

## Phases

### Phase A — Foundation (no UI changes, plumbing only)
- [ ] `src/types/crm.ts` — add `Branch`, `Lead`, `LeadStatus`, `LeadActivity`, `Tag`, `ContactSource`, `ContactList`, `CustomField`, `CustomFieldValue`, `Role`, `Permission`, `Staff`, `LeadAssignmentConfig`, `LeadWebhook`
- [ ] `src/api/adapters/crm.ts` — bidirectional mappers (BE DTO ↔ FE type) for every entity above + Contact + ContactActivity. Pagination normalizer `{data, total, page, limit}` → `{items, total, page, limit}`.
- [ ] `src/stores/activeBranch.store.ts` — `{branchId, setBranchId, branches[]}` with persist
- [ ] `src/shared/auth/useHasPermission.ts` — stub returning `true` until permissions wired
- [ ] `src/api/http.ts` update — auto-inject `X-Branch-Id` header (or query param) when `activeBranch` is set
- [ ] tsc clean

### Phase B — Refactor existing Contact UI
- [ ] Update `crm.contracts.ts`: drop `lead` from status enum, switch source to `sourceId`, switch tags to `Tag[]`, add `branchId/company/jobTitle/state/postalCode/originLeadId`, swap `ownerName`→`ownerUserId`
- [ ] Keep FE-only fields: `vertical`, `ltv`, `currency`, `birthday`, `preferredLocale`, nested `address` (adapter flattens)
- [ ] Update `ContactsTable`, `ContactForm`, `ContactFilters`, `NewContactDialog`, `ContactDetailPage`, `ContactStatusBadge` to new shape
- [ ] Update `crm.mocks.ts` to emit new shape
- [ ] tsc clean + smoke test

### Phase C — Branches (smallest new entity, biggest cross-cutting effect)
- [ ] `src/features/branches/` — types, api, mocks, hooks
- [ ] `BranchPicker` component in topbar (next to ProfileMenu)
- [ ] `BranchesPage` in settings (CRUD)
- [ ] Wire `activeBranch.store` to picker; on change, invalidate all queries
- [ ] Every contact/lead/activity list call now scoped by `branchId`

### Phase D — Lead pipeline (the structural gap)
- [ ] `src/features/leads/` — types, api, mocks, hooks
- [ ] `LeadsListPage` (table view)
- [ ] `LeadKanbanPage` (board by `statusId`, drag-to-change-status)
- [ ] `LeadDetailPage` (split with activities timeline + lead fields + convert button)
- [ ] `LeadStatusesPage` (settings — CRUD pipeline stages with `displayOrder` drag-reorder)
- [ ] `ConvertLeadDialog` (lead → contact)
- [ ] Add Leads to sidebar nav (under CRM)

### Phase E — Activities timeline rebuild
- [ ] New `ActivityTimeline` component supporting both BE-backed types (NOTE/CALL/EMAIL/SMS/WHATSAPP/MEETING/TASK) and FE-only kinds (appointment/invoice/system)
- [ ] Per-type renderers (call → outcome chip + duration + recording link; task → dueAt + status)
- [ ] Replace `ContactActivityTimeline.tsx` with shared timeline; reuse on `LeadDetailPage`
- [ ] `NewActivityDialog` with type picker and conditional fields

### Phase F — Tag library + sources + custom fields
- [ ] `TagsPage` + `TagPicker`
- [ ] `ContactSourcesPage` + `SourcePicker`
- [ ] `CustomFieldsPage` (settings — drag-reorder, type picker: TEXT/NUMBER/DATE/SELECT/MULTI_SELECT/etc.)
- [ ] `<CustomFieldsRenderer entity="contact|lead">` — renders dynamic fields on contact/lead forms

### Phase G — Roles & Permissions
- [ ] `RolesPage` + `RoleEditor` with permission-tree
- [ ] Wire `useHasPermission` to real role data
- [ ] Sidebar nav filtered by permission
- [ ] Buttons/menu items hidden when user lacks permission

### Phase H — Staff & Invites
- [ ] `StaffPage` (list with role + round-robin toggle)
- [ ] `InviteDialog` (`POST /staff/invite`)
- [ ] `InviteAcceptPage` route — FE for the BE `invite-accept` flow

### Phase I — Lead Assignment Config + Webhooks
- [ ] `LeadAssignmentConfigPage` (per-branch — eligible roles, isActive)
- [ ] `LeadWebhooksPage` (CRUD + regenerate token + copy public ingestion URL)
- [ ] Token reveal/hide UX

### Phase J — Tasks (deferred until BE tasks controller lands)
- [ ] Mocked tasks page if BE not ready

---

## Naming conventions in adapters

```ts
// Status
'ACTIVE' ↔ 'active'
'INACTIVE' ↔ 'inactive'
'ARCHIVED' ↔ 'archived'

// Activity type
'NOTE' ↔ 'note'
'CALL' ↔ 'call'      // new on FE
'EMAIL' ↔ 'email'
'SMS' ↔ 'sms'
'WHATSAPP' ↔ 'whatsapp' // new on FE
'MEETING' ↔ 'meeting'   // new on FE (was 'appointment' partially)
'TASK' ↔ 'task'         // new on FE

// FE-only (no BE round-trip)
'appointment' (FE-only — separate from MEETING)
'invoice' (FE-only)
'system' (FE-only)
```

---

## Out of scope (this round)

- Wiring to real backend (still on `VITE_USE_MOCKS=true`). We're reshaping the FE so the swap is mechanical when we're ready.
- Backend changes — none.
- Replacing the surface gradient theme system or any aesthetic work.

---

## Done definition per phase

- tsc `-b --noEmit` clean
- Mocks updated to new shape
- Manual smoke pass on `localhost:5173`
- Single commit per phase, scoped message

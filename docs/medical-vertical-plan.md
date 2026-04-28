# Phase 7 — Medical Vertical: Implementation Plan

**Status:** Draft for sign-off — no code begins until you approve.
**Inputs:** [`docs/medical-vertical-research.md`](./medical-vertical-research.md) (research foundation), [`docs/rebuild-master-plan.md`](./rebuild-master-plan.md), [`docs/scaling-and-tiers.md`](./scaling-and-tiers.md), [`docs/screens-inventory.md`](./screens-inventory.md), [`docs/design-system.md`](./design-system.md).
**Bar:** clinically credible, FHIR-aligned, fully localized (en/ar/ur/es/hi + Hijri), accessible (WCAG 2.2 AA), scales solo → enterprise via the central feature flag registry. Same bar applies to every vertical that follows.

---

## 1. Goals & non-goals

### Goals
- Every screen in §6 ships at the depth of dental + school workspaces — interactive, mock-backed, RTL-clean.
- FHIR R4 alignment for entity contracts (Patient, Encounter, Observation, Condition, AllergyIntolerance, MedicationRequest, MedicationStatement, Immunization, Procedure, DiagnosticReport, ServiceRequest, CarePlan, Goal, FamilyMemberHistory, Appointment, Coverage, Claim).
- Three priority specialties usable in MVP: **Family Medicine (P0)**, **Pediatrics (P0)**, **OB-GYN (P1)**. Psych/Cardio/Derm scaffolded but lighter.
- World-class allergy + drug-safety ceremonies, two-step Rx sign, draft-default notes.
- Deep localization: INN-first drug names, region-aware allergens, Hijri date dual-display, unit toggles, RTL Rx pad + lab reports, bidi-isolation for numerics.
- Caliber × size scaling: Standard / Professional / Enterprise feature gates per §16 of research.
- Dashboard layout tuned for medical (today's panel, lab inbox, refills, recalls, telehealth).
- Patient portal sub-app routes wired (read-only by default).

### Non-goals (this phase)
- Real e-prescribe network connectivity (SureScripts / EPS / EPCS)
- Real lab interface (HL7 v2 ORU ingestion) — manual + PDF only in mocks
- Real DICOM viewer — metadata + PDF + PACS deep-link placeholder
- Real eligibility (270/271) — UI ceremony only, mock responses
- HIPAA-grade audit infra (we surface the *UX*, not the immutable storage)
- Inpatient (IMP), ER (EMER), institutional billing (837I / UB-04)
- ICD-10-PCS, CPT modifiers exhaustive; we ship the picker patterns + a curated subset
- AI ambient scribe (DAX/Suki/Abridge) — leave a placeholder slot in the note editor

---

## 2. Hard rules (medical edition of master-plan rule #13)

These extend the existing 13 non-negotiables. Every PR in this phase must clear all of them:

1. **Drug names never truncate.** Wrap, don't ellipsis. Generic (INN) + brand + strength + form visible at every decision point.
2. **Allergy banner is sticky + acknowledgment-required** on first chart-open per session for criticality=high.
3. **Multi-channel abnormal flagging** — icon shape + Okabe-Ito-safe color + text label. Color alone is forbidden.
4. **Audit-trail surface** is one click away from every chart screen.
5. **Notes default to DRAFT.** Autosave 2-3 s. Sign is a deliberate two-step.
6. **Two-step Rx sign** with TDD + mg/kg recap on the confirm screen for peds + controlled + high-alert meds.
7. **Numbers always show units + reference ranges** at the value-render site. No hover-only units.
8. **Date+time always include TZ.** Hijri rendered alongside Gregorian when tenant locale flags it.
9. **Pediatric weight is gated.** Peds Rx blocks until weight present; staleness >30 d amber, >90 d red.
10. **Allergies + active meds visible from every clinical surface** via `<ClinicalSidebar>` slot.
11. **Bidi isolation** wraps every numeric field, BP `120/80`, lab range `low–high`, dose strings, and date-time strings — even in LTR. Use `<bdi>` or `dir="auto"` consistently.
12. **Two-identifier confirmation** (name + DOB minimum) before any destructive write on a patient record.
13. **Zod-validated FHIR shape** with `{ system, code, display }` for every CodeableConcept. Never store a bare string code.
14. **Source-of-truth units preserved.** When a tenant flips US↔metric we display-convert; we never overwrite stored values.

---

## 3. Architecture

### 3.1 Folder layout

```
src/features/medical/
├── api/
│   ├── medical.contracts.ts      # zod for FHIR-aligned entities
│   ├── medical.mocks.ts          # rich seed (patients, encounters, labs…)
│   └── medical.api.ts            # branched on env.useMocks
├── hooks/
│   └── index.ts                  # 30+ hooks, namespaced query keys
├── codes/                        # static datasets (vendored, small)
│   ├── icd10.curated.ts          # ~400 common ambulatory codes
│   ├── snomed.curated.ts         # ~300 problem-list-friendly concepts
│   ├── loinc.curated.ts          # ~120 common labs + vitals
│   ├── rxnorm.curated.ts         # ~200 common drugs w/ strengths/forms
│   ├── cpt.curated.ts            # E/M + common in-office procedures
│   ├── cvx.curated.ts            # vaccines (CDC schedule)
│   ├── allergens.regional.ts     # per-locale allergen lists
│   └── units.ts                  # UCUM table + converters
├── clinical/                     # pure-fn calculators + checkers
│   ├── ddi.ts                    # mock drug-drug interaction checker
│   ├── dosing.peds.ts            # mg/kg/day, peds caps
│   ├── ranges.ts                 # age/sex reference ranges
│   ├── growth.ts                 # WHO + CDC percentile lookup
│   ├── ga.ts                     # gestational age + EDD
│   ├── calculators.ts            # CHA2DS2-VASc, ASCVD, Wells, MELD, BMI
│   ├── flags.ts                  # H/L/HH/LL/N/A interpretation
│   └── beers.ts                  # geriatric inappropriate-meds list
├── components/                    # composable clinical primitives
│   ├── ClinicalSidebar.tsx       # allergies + meds + DNR; persistent slot
│   ├── PatientStoryboard.tsx     # sticky banner header (Epic pattern)
│   ├── AllergyAckBanner.tsx      # session-acknowledgment ceremony
│   ├── AllergyForm.tsx           # add/edit allergy w/ severity + criticality
│   ├── ProblemListEditor.tsx     # SNOMED+ICD10 dual-coded
│   ├── MedReconciliation.tsx     # home vs prescribed diff
│   ├── RxPad.tsx                 # full SIG builder
│   ├── DosageBuilder.tsx         # dose + route + freq + duration + PRN
│   ├── DDIAlertBanner.tsx        # interaction tier visualization
│   ├── PrescriptionSignReview.tsx# two-step ceremony screen
│   ├── ICD10Picker.tsx           # async search + favorites
│   ├── SNOMEDPicker.tsx
│   ├── LOINCPicker.tsx
│   ├── RxNormCombobox.tsx        # generic-first + brand chip
│   ├── CPTPicker.tsx
│   ├── ModifierChips.tsx
│   ├── VitalsRecorder.tsx        # adult vitals form w/ unit toggles
│   ├── PedsVitalsRecorder.tsx    # adds head circumference + weight gate
│   ├── GrowthChart.tsx           # WHO/CDC percentile plot (Recharts)
│   ├── GestationalAgePill.tsx    # weeks+days display
│   ├── PrenatalFlowsheet.tsx     # OB-GYN visit-grid
│   ├── ImmunizationRecord.tsx    # given + due + schedule overlay
│   ├── LabResultRow.tsx          # value + unit + range + flag
│   ├── LabTrendChart.tsx
│   ├── ResultsFlowsheet.tsx      # rows=analytes, cols=dates
│   ├── BodyDiagramPicker.tsx     # for derm + procedures
│   ├── PhotoTimeline.tsx         # derm photo series
│   ├── MentalStatusExam.tsx      # MSE form
│   ├── PHQ9.tsx, GAD7.tsx, CSSRS.tsx  # standardized scales
│   ├── EncounterTimeline.tsx     # past visits ribbon
│   ├── SOAPEditor.tsx            # 4-section editor w/ autosave
│   ├── DotPhraseInput.tsx        # `.cc` expansion
│   ├── NoteSignReview.tsx        # two-step
│   ├── AuditPeekDrawer.tsx       # who-viewed-this-chart
│   ├── BreakGlassDialog.tsx
│   ├── ConsentCapturePad.tsx
│   ├── EligibilityBanner.tsx
│   ├── SuperbillEditor.tsx
│   ├── ClaimLineEditor.tsx
│   ├── HijriDate.tsx             # dual Gregorian + Hijri
│   ├── BidiNum.tsx               # `<bdi dir="ltr">` numeric wrapper
│   └── badges/
│       ├── EncounterStatusBadge.tsx
│       ├── OrderStatusBadge.tsx
│       ├── RxStatusBadge.tsx
│       ├── ClaimStatusBadge.tsx
│       ├── CriticalityBadge.tsx
│       └── AbnormalFlag.tsx       # multi-channel ▲/▼/!! + color + text
├── widgets/                      # dashboard widgets (school pattern)
│   ├── MedicalKpiRow.tsx
│   ├── TodayPanelWidget.tsx      # arrival queue snapshot
│   ├── LabInboxWidget.tsx
│   ├── RefillQueueWidget.tsx
│   ├── RecallListWidget.tsx
│   └── TelehealthRoomsWidget.tsx
├── pages/                        # ~38-40 pages, see §6
└── index.tsx                     # router exports + IndexRedirect
```

### 3.2 New shared building blocks (pulled out for reuse)
- `src/shared/lib/bidi.tsx` — `<BidiNum>`, `<BidiCode>`, `<BidiRange>` wrappers; bidi-isolation helpers.
- `src/shared/lib/hijri.ts` — Umm al-Qura conversion; pinned algorithm; pure functions only.
- `src/shared/lib/units.ts` — UCUM-based converters (mg/dL ↔ mmol/L, lb ↔ kg, °F ↔ °C, ft-in ↔ cm). Lossless: store source unit + value, derive display.
- `src/shared/hooks/useUnitPreference.ts` — reads tenant locale + per-user override.
- `src/shared/hooks/useClinicalLocale.ts` — exposes `{ digits: 'western' | 'eastern', dateSecondary: 'hijri' | null }`.
- `src/shared/ui/data-table` enhancements (if any) stay in shared; medical uses as-is.

### 3.3 Feature flag additions (`src/config/features.ts`)
| key | minPlan | calibers | sizes | label |
|---|---|---|---|---|
| `med_charting` | starter | * | * | Clinical charting |
| `med_eprescribe` | growth | professional, enterprise | * | E-prescribing |
| `med_eligibility_realtime` | growth | * | * | Realtime eligibility (270/271) |
| `med_lab_interface` | growth | professional, enterprise | small+ | Lab interface (results inbox) |
| `med_growth_charts` | starter | * | * | Pediatric growth charts |
| `med_decision_support` | professional | * | * | Drug-allergy + DDI checking |
| `med_cds_rules_engine` | enterprise | enterprise | * | Org-defined CDS rules |
| `med_prior_auth` | professional | * | small+ | Prior authorization workflow |
| `med_telehealth` | growth | * | * | Telemedicine room |
| `med_patient_portal` | growth | * | * | Patient portal |
| `med_population_health` | enterprise | enterprise | medium+ | HEDIS/MIPS/QOF + registries |
| `med_break_glass` | enterprise | enterprise | * | Break-glass emergency access |
| `med_form_builder` | enterprise | enterprise | * | Custom form builder |

Every page + component in this phase reads through `useFeatureFlag` — never raw plan checks (master-plan rule #13).

### 3.4 Permissions added to `Permission` union
- `medical:read`, `medical:write`
- `medical:rx:write`, `medical:rx:controlled` (extra gate)
- `medical:results:sign`, `medical:results:release`
- `medical:billing:read`, `medical:billing:write`
- `medical:audit:view`, `medical:audit:break_glass`
- `medical:portal:admin`

Demo tenant gets the read+write+rx+results+billing set; not break-glass.

### 3.5 Routes (`src/routes/AppRoutes.tsx` + routeMap)
All under `/app/medical/*`. Patient portal under `/portal/medical/*` (separate guard).

### 3.6 i18n
- New namespace `medical` in `en/ar/ur/es/hi`. English authored fully; others stub-translated for the demo (school pattern).
- `medical.json` keys: status enums, action labels, alert text, SIG components, calculator names, form labels.
- Drug names through `INN` codepath; brand names through codes/rxnorm.curated.ts (per-locale brand variants).

### 3.7 Dashboard layout
- New `src/features/dashboard/layouts/MedicalDashboardLayout.ts` with: `MedicalKpiRow` (patients today / labs to sign / refills pending / messages unread / recalls due / claims AR) → `TodayPanelWidget` + `LabInboxWidget` → `RefillQueueWidget` + `RecallListWidget` → `TelehealthRoomsWidget`.
- Registered in `layout.registry.ts` for `vertical === 'medical'`.

### 3.8 Sidebar
- Single workspace entry already exists in `src/config/navigation.ts` (`common.navigation.medicalWorkspace`). Path `/app/medical` redirects to `/app/medical/today`.

---

## 4. Data contracts (zod, FHIR-aligned, simplified)

Source: research §2. Each entity is a zod schema in `medical.contracts.ts`. Listing only the entities; field-level shape will be exhaustive in code.

### Identity / scheduling
- `Patient` — MRN, name, preferred name, pronouns, sex at birth, gender identity, DOB (Gregorian + computed Hijri display), telecom[], address, languages, race/ethnicity, deceased, photoUrl, vipFlag, breakGlassRequired
- `Practitioner` — NPI/national-id, name, specialty[], credentials, locations[]
- `Location` — id, name, type (clinic / satellite / lab-draw / telehealth-virtual)
- `Appointment`, `Slot`, `Schedule`
- `Coverage`, `EligibilityResult`

### Encounter + chart
- `Encounter` — class (AMB/VR), visitType, status, providerId, locationId, startAt, endAt, reasonText, primaryDxCode
- `EncounterNote` — soap.subjective / objective / assessment / plan, draftHistory[], signedAt, signerId, addenda[]
- `Condition` (problem list)
- `AllergyIntolerance`
- `MedicationRequest`, `MedicationStatement`
- `Immunization`
- `Observation` (vitals + labs + surveys; LOINC-coded)
- `DiagnosticReport` (lab + imaging container)
- `ServiceRequest` (orders)
- `Procedure`
- `CarePlan`, `Goal`
- `FamilyMemberHistory`
- `Document` (faxes, scans, external)

### Specialty
- `Pregnancy` (G/P/TPAL, LMP, EDD, GA snapshot)
- `PrenatalVisit` (BP, weight, fundalHeight, FHR, fetalMovement, urineDip, notes)
- `UltrasoundEntry` (BPD, HC, AC, FL, EFW, AFI, GA at scan)
- `PsychiatricScale` (PHQ-9, GAD-7, etc.) — typed instrument with scoring
- `MSE` (mental status exam)
- `DermLesion` (bodySite, attributes, photoIds[], biopsyId?)

### Billing
- `Claim` (simplified) — diagnoses[], items[].cpt + modifiers[] + units + charge
- `Superbill` — encounter-level charge capture
- `EligibilityRequest` / `EligibilityResponse`

### Portal
- `PortalMessage`, `PortalThread`
- `PortalForm` (intake, screening) — questions[].kind = text/number/likert/scale-instrument

### Audit
- `AuditEvent` — actorId, action, resourceType, resourceId, timestamp, ip, breakGlass?, before?, after?

### Codes (curated subsets vendored as TS modules — not in API contracts)
- `Icd10Entry`, `SnomedEntry`, `LoincEntry`, `RxNormEntry`, `CptEntry`, `CvxEntry`, `Modifier`, `UcumUnit`

---

## 5. Mock data plan

Demo tenant `Acme Family Medicine + Specialties` (multi-specialty group, professional caliber, medium size). 5 providers, 2 locations.

### 5.1 Patients (target ~30, every archetype from research §19 represented)
- Layla H. — peds 18mo, WHO growth, due DTaP-IPV, mom Arabic-preferred (Hijri DOB display fires)
- Marcus J. — peds 9yo, CDC growth, BMI 95th, asthma, ADHD eval pending
- Priya S. — pregnant 22w, G2P1, GDM hx, prenatal flowsheet populated, Hindi preferred
- Khalid A. — geriatric, polypharmacy, Beers flags, INR overdue, eGFR 42, Arabic preferred (Hijri DOB)
- Sandra L. — DM+HTN trending, complete chronic-disease picture
- Diego M. — penicillin anaphylaxis (criticality=high), demo for allergy hard-stop
- Yusra K. — TSH trending into overt hypothyroid
- Tom O. — overdue immunizations (Shingrix series, Tdap, soon pneumococcal)
- Aisha R. — anxiety, telehealth scheduled, PHQ-9/GAD-7 trending
- Daniel C. — depression, PHQ-9 18→12→8, C-SSRS done, safety plan
- Fernando G. — AFib, CHA2DS2-VASc 4, on apixaban, NSAID DDI demo
- Nora M. — derm, body diagram + biopsy + photo timeline
- + 18 routine adults to make the schedule + lab inbox feel busy

### 5.2 Other seed
- 5 providers (FM Dr. Hassan, Peds Dr. Park, OB Dr. Adeyemi, Psych Dr. Vargas, Cardio Dr. Iqbal)
- 2 locations + 1 telehealth virtual location
- ~6 mock pharmacies in the area
- ~6 mock external labs (LabCorp / Quest / regional)
- Lab inbox: 8 results (4 normal, 2 abnormal, 1 critical, 1 corrected)
- Refill queue: 5 pending (1 controlled blocked from bulk approve)
- Messages: 4 unread threads
- Today's schedule: 14 appointments mixed in-person + telehealth, two empty slots, one no-show
- Recall list: 12 patients (annuals, mammos, paps, A1c overdue, peds well-checks)
- Audit: 200 mock entries across patients (regular access + 1 break-glass flagged)

---

## 6. Screen inventory + page builds

Mapped to research §18. ~38 pages this phase. Each page lands at full polish.

### Patient + intake (4)
- **MED-01 PatientRegistrationPage** — multi-step wizard
- **MED-02 PatientSearchPage** — MPI search; duplicate merge view
- **MED-03 PatientStoryboard** — sticky banner (component, used everywhere)
- **MED-04 PatientDemographicsPage** — full editor, two-identifier confirm gate on save

### Scheduling (5)
- **MED-05 ScheduleDayPage** — provider/resource grid, drag-drop, telehealth markers
- **MED-06 ScheduleWeekPage**
- **MED-07 AppointmentBookingDialog** (component used from list)
- **MED-08 WaitlistPage** — standby + bumping rules
- **MED-09 RecallListPage**

### Front desk (3)
- **MED-10 ArrivalQueuePage** — status pipeline with timers
- **MED-11 EligibilityResultPage** — payer response detail
- **MED-12 CheckInKioskPage** — patient-facing intake under `/portal`

### Encounter + chart (6)
- **MED-13 EncounterShellPage** — left chart sections, center note editor, right ClinicalSidebar
- **MED-14 ChiefComplaintHpiSection** (route: `encounter/:id/cc-hpi`)
- **MED-15 ROSPage** — 14-system grid
- **MED-16 PhysicalExamPage** — system-by-system templated
- **MED-17 AssessmentPlanPage** — problem-oriented A/P
- **MED-18 NoteSignPage** — two-step review + sign

### Chart sections (11)
- **MED-19 ProblemListPage**
- **MED-20 AllergiesPage**
- **MED-21 MedicationsPage** — w/ MedReconciliation tab
- **MED-22 ImmunizationsPage** — record + due + schedule
- **MED-23 VitalsPage** — entry + trend + flowsheet tabs
- **MED-24 GrowthChartsPage** — peds, WHO/CDC selector
- **MED-25 LabInboxPage** — sign / forward / patient-letter actions
- **MED-26 LabResultDetailPage** — single Observation w/ trend
- **MED-27 ImagingListPage** + **ImagingReportDetailPage** (two pages, one detail)
- **MED-28 HistoryPage** — family + social history
- **MED-29 DocumentsInboxPage**

### Orders + Rx (3)
- **MED-30 OrderEntryPage** — tabbed: med / lab / imaging / referral / procedure
- **MED-31 RxPadPage** + **RefillQueuePage** combined into one page-pair
- **MED-32 LabRequisitionPreviewPage**

### Telemedicine (2)
- **MED-33 TelehealthRoomPage** — provider side, video + chart split
- **MED-34 PreVisitFormPage** — patient side under portal

### Patient portal (5)
- **MED-35 PortalHomePage** (`/portal/medical/`)
- **MED-36 PortalMessagesPage**
- **MED-37 PortalResultsPage**
- **MED-38 PortalRxPage**
- **MED-39 PortalBillingPage**

### Billing (3)
- **MED-40 SuperbillPage**
- **MED-41 ClaimWorklistPage** (+ DenialQueue tab)
- **MED-42 PaymentPostingPage** — ERA + manual

### Admin / settings (subroutes under existing Settings layout, 4)
- **MED-43 SpecialtyConfigPage**
- **MED-44 TemplatesManagerPage** — notes / dot-phrases / order sets / AOEs
- **MED-45 ReferenceRangesPage**
- **MED-46 LocaleAndUnitsPage** — Hijri toggle, digit system, unit defaults

(Plus Audit log viewer + break-glass review piggy-back on existing audit module — extend not duplicate.)

---

## 7. Phase rollout (sub-phases — never half-build a clinical surface)

Each sub-phase ships green tsc + dev-server smoke-test + (where relevant) Storybook stories.

### 7.0 Foundations (no UI yet)
- Add `medical` permissions + features
- Add demo permissions to session store
- New shared libs: `bidi`, `hijri`, `units`
- New shared hooks: `useUnitPreference`, `useClinicalLocale`
- Vendor curated code datasets (icd10/snomed/loinc/rxnorm/cpt/cvx + units + allergens)
- Stub `medical.json` i18n in en/ar/ur/es/hi (English full, others bootstrapped)

### 7.1 Contracts + mocks + api + hooks
- `medical.contracts.ts` (~25 entity schemas)
- `medical.mocks.ts` (rich, ~30 patients, full encounters)
- `medical.api.ts` + `hooks/index.ts` (30+ hooks, namespaced query keys)
- Sub-phase complete only when every endpoint listed in §6 has a typed entrypoint + a hook + zod-parsed mock

### 7.2 Clinical primitives (composable building blocks)
- `<ClinicalSidebar>`, `<PatientStoryboard>`, `<AllergyAckBanner>`, `<AbnormalFlag>`, `<HijriDate>`, `<BidiNum>`
- Code pickers: `<ICD10Picker>`, `<SNOMEDPicker>`, `<LOINCPicker>`, `<RxNormCombobox>`, `<CPTPicker>`, `<ModifierChips>`
- Editors: `<AllergyForm>`, `<ProblemListEditor>`, `<DosageBuilder>`, `<RxPad>`, `<MedReconciliation>`
- Vitals: `<VitalsRecorder>`, `<PedsVitalsRecorder>`
- Charts: `<GrowthChart>`, `<LabTrendChart>`, `<ResultsFlowsheet>`
- Calculators: pure-fn modules + tiny inline UIs (`CHA2DS2VASc`, `ASCVD`, `BMI`, `CrCl`, `EDD`)
- Storybook stories for every primitive (catches up on the Phase-1 promise)

### 7.3 Encounter shell + chart sections (the workhorse)
- `EncounterShellPage` w/ ClinicalSidebar + draft-default note editor + autosave
- All 11 chart-section pages from §6
- Two-step note sign ceremony with re-auth stub

### 7.4 Orders + Rx
- OrderEntryPage (4 tabs: med / lab / imaging / referral)
- RxPad with allergy + DDI ceremonies; two-step sign
- Refill queue with controlled-substance guardrail

### 7.5 Specialty depth
- Pediatrics: growth charts page + immunization due-list + peds Rx weight gate
- OB-GYN: pregnancy entity + prenatal flowsheet + GA pill in storyboard
- Psychiatry: PHQ-9 / GAD-7 / C-SSRS scales + MSE form + safety plan template

### 7.6 Lab + imaging
- Lab inbox + result detail + trend
- Imaging list + report detail + PACS deep-link placeholder

### 7.7 Scheduling + front desk
- Day / Week / Recall pages
- Arrival queue with status pipeline
- Eligibility banner + result page (mock 270/271)

### 7.8 Telehealth + portal
- Provider TelehealthRoom (chart split-screen + placeholder video)
- Patient portal sub-app: home / messages / results / Rx / billing / pre-visit form
- New route guard `RequirePortalAuth` (separate from `RequireAuth`)

### 7.9 Billing
- Encounter coding + superbill
- Claim worklist + denial queue
- Payment posting (ERA + manual)

### 7.10 Admin + dashboard layout + i18n polish + a11y pass
- 4 admin pages
- Medical dashboard layout registered
- Audit-peek drawer wired
- WCAG 2.2 AA contrast pass; deuter/protan/tritanopia simulator review on every flag/badge
- RTL pass: Rx pad printable, lab report printable, prenatal flowsheet
- Hijri dual-display verified for KSA/PK/AE locale toggles

### 7.11 Final integration
- Wire all routes
- Update `screens-inventory.md` with MED-* IDs
- Update `rebuild-master-plan.md` Phase 7 status
- Demo flow: switch tenant vertical to `medical` in Settings → Organization → workspace flips → dashboard layout flips → school + dental still work

---

## 8. Quality gates per sub-phase

Every sub-phase merges only when:
- `tsc -b --noEmit` is clean
- Dev server starts and the touched routes render without console errors
- Mocks parse through zod (`schema.parse(...)` runs in api layer)
- New components have at least one Storybook story
- A11y: keyboard reachable; visible focus; aria roles; contrast ≥ 4.5:1
- RTL: when `dir="rtl"` set on `<html>`, screen still scans correctly; numbers stay LTR via bidi-isolation
- No raw `tenant.plan === '...'` checks introduced
- No new `console.log` / dead code

---

## 9. Risks + mitigations (medical-specific, distilled from research §20)

| Risk | Mitigation in this plan |
|---|---|
| Color-only abnormal flags | `<AbnormalFlag>` component is icon + color + text by construction |
| Truncated drug names | `<RxNormCombobox>` + tables use wrapping cells; CSS rule audit |
| Allergy hidden | `<ClinicalSidebar>` is a layout slot used by EncounterShell, RxPad, OrderEntry, Telehealth |
| Auto-sign | All editors use `useDraftAutosave` hook; sign is explicit two-step |
| Date ambiguity | All dates render through shared formatter w/ TZ; Hijri secondary when locale flagged |
| Unit conversion drift | Store source unit + value; converter is pure-fn; no conversion writes |
| Peds dosing without weight | `<RxPad>` reads `useActiveWeight(patientId)`; gates submit |
| Same-name patient mix-up | Two-identifier confirm gate component used at every destructive write |
| RTL number flip | `<BidiNum>` mandatory wrapper; lint rule (codeowner-enforced for now) |
| Drug brand-only failure non-US | Search hits both INN + brand columns; display always shows both |

---

## 10. What sign-off looks like

Tell me one of:
- **"Ship it"** → I start with sub-phase 7.0 (Foundations) and roll through.
- **"Adjust X"** → I edit this plan, re-share, then start.
- **"Cut Y, expand Z"** → same.
- **"Reorder: do telehealth first"** (or similar) → I rework §7 then start.

Specific ambiguities I want your call on before code:
1. **Hijri**: ship Umm al-Qura (KSA-pinned) by default for `ar` locale, or only when tenant flag `dateSecondary === 'hijri'` is on? My recommendation: only when flagged, so non-KSA Arabic tenants don't see drift.
2. **Eastern Arabic numerals**: my recommendation = Western digits everywhere clinical, Eastern allowed only in patient-facing portal prose, gated by tenant flag (research §15.6). Confirm or override.
3. **Patient portal sub-app**: same React app with route guard, OR a flagged separate experience? My recommendation: same app, separate route prefix `/portal`, separate guard, distinct chrome. Avoids a second build pipeline.
4. **Specialty depth in MVP**: FM + Peds + OB at full depth; Psych/Cardio/Derm at scaffold-level. Confirm or shift weight.
5. **Telehealth video provider**: placeholder only (no SDK integration this phase). Confirm.

When the plan is approved I'll mirror the school-vertical execution cadence: TodoWrite checklist, sub-phase-by-sub-phase, tsc green at every gate.

# Medical / EMR Vertical Research — BOS Platform

**Status:** Research foundation only. Not an implementation plan.
**Audience:** Architects, clinical product, design system leads.
**Bar:** "World's best of the best" — clinically credible, demo-grade, FHIR-aligned, fully localized.

---

## 1. Production EMR Feature Inventory

Cross-cutting feature taxonomy synthesized from Epic, Cerner/Oracle Health, Athenahealth, Practice Fusion, DrChrono, NextGen, eClinicalWorks, Tebra (formerly Kareo), Medplum, OpenEMR, OpenMRS, Bahmni.

### 1.1 Patient Demographics & Master Patient Index (MPI)
- Unique patient identifier (UUID + human-readable MRN)
- Legal name, preferred name, pronouns, sex assigned at birth, gender identity, sexual orientation (Epic, Cerner, USCDI v3 alignment)
- DOB, age, multiple birth indicator, deceased flag + date
- National identifiers (SSN US, NHS UK, Aadhaar IN, Iqama KSA, CNIC PK)
- Languages spoken, interpreter needed flag, communication preferences
- Race + ethnicity (OMB categories US, locale-specific elsewhere)
- Address(es) + telecom (multi-channel: home, mobile, work, email, SMS opt-in)
- Emergency contact, next of kin, guardian (peds), power of attorney
- Photo, biometric ID hooks (Epic Welcome kiosk pattern)
- Patient merge / unmerge (MPI duplicate resolution)
- Confidential / VIP / break-glass flagging

### 1.2 Scheduling
- Provider templates, resources (rooms, equipment), block schedules
- Visit types with duration + color coding (Athena, eClinicalWorks)
- Recurring appointments, group visits, telehealth visits
- Wait list, standby list, bumping rules
- No-show, late-cancel tracking + auto-charge rules (Tebra)
- Self-scheduling portal slots, family scheduling, multi-resource booking
- Recall / tickler reminders (annual physical, pap, mammo)
- Two-way SMS/email/voice reminders (Solutionreach, Phreesia patterns)

### 1.3 Front Desk / Check-in
- Arrival queue, copay collection, ID + insurance card scan
- Digital intake forms (Phreesia, Athena Patient Digital Engagement)
- Eligibility verification realtime (270/271 X12 EDI)
- Consent capture (HIPAA NPP, financial, telehealth, photo)
- Demographics confirmation flow ("verify and update")

### 1.4 Encounter / Charting
- Chart-open audit, chart-summary "snapshot" (Epic Storyboard pattern)
- Problem list (active/inactive/resolved), allergy list, medication list, immunization record, family history, social history, surgical history
- SOAP / APSO / DAR / focused note templates
- Smart phrases / dot phrases / macros (Epic SmartText, Cerner AutoText, Practice Fusion templates)
- Voice dictation (Dragon, Nuance DAX, Abridge, Suki, DeepScribe ambient AI)
- Co-sign workflow (resident → attending), addendum, amendment
- Note locking + delta-tracked amendments

### 1.5 Orders
- Order entry (CPOE) for meds, labs, imaging, referrals, procedures, DME
- Order sets (admission, post-op, asthma exacerbation, DKA)
- Standing orders (annual A1c for diabetics)
- Future / scheduled orders, recurring orders (chemo cycles)
- Order signing, hold-for-co-sign, pend & route

### 1.6 Results Management
- Lab inbox per provider, sign / forward / patient-letter actions
- Auto-letter on normal, manual review on abnormal
- Result trending, flowsheets, graph view
- Imaging report inbox, link to PACS deep-link
- Document inbox: faxes, scanned docs, OCR (eFax, Updox, Doximity Fax)

### 1.7 Prescribing
- Local Rx + e-prescribe (SureScripts US, EPS UK, NEHTA AU, eRx PK pilots)
- Controlled substance e-prescribe (EPCS, two-factor)
- Rx history + medication reconciliation
- Refill queue, refill request from pharmacy
- Drug-allergy / drug-drug / drug-disease / drug-pregnancy / drug-lab checking (First Databank, Medi-Span, Lexicomp, Multum)
- Formulary + benefit check (RxBenefit Clarity)

### 1.8 Billing / Revenue Cycle
- Encounter coding (ICD-10-CM dx, CPT/HCPCS px), modifier picker
- Superbill / charge capture, charge router
- Claim scrubbing, 837P/837I export, ERA/835 posting
- Patient statements, payment plans, collections
- Denial worklist, appeal templates
- Sliding-fee scale (FQHC), self-pay discount

### 1.9 Reporting / Analytics
- Quality measures (HEDIS, MIPS/MACRA US, QOF UK)
- Population health registries (DM, HTN, CHF, asthma, depression)
- Operational dashboards (no-show, cycle time, AR days)
- Custom report builder (Epic Reporting Workbench, Cerner Discern)

### 1.10 Patient Engagement / Portal
- MyChart / FollowMyHealth / Klara / Healow patterns
- Messages, appointment self-schedule, lab release, Rx renewal, billing pay
- Intake forms, pre-visit questionnaires (PHQ-9 etc.)
- Telehealth join, family proxy access, minor access rules

### 1.11 Interoperability
- HL7 v2 ADT/ORM/ORU/SIU feeds, FHIR R4 REST API (USCDI v3)
- CCDA export/import, IPS (International Patient Summary)
- Direct Trust messaging, Carequality, CommonWell, TEFCA QHIN
- Bulk FHIR ($export), SMART on FHIR app launch

### 1.12 Clinical Decision Support (CDS)
- Drug checking, immunization due, screening due (USPSTF), care gaps
- CDS Hooks (HL7 standard), order sets, calculators (CHA2DS2-VASc, Wells, MELD)
- Best Practice Advisories (Epic BPA), pop-ups vs inline

### 1.13 Compliance & Admin
- Audit log per row read/write, break-glass, login history
- Role-based access, location-based access, attending-of-record scoping
- Document retention, hold legal, patient request for amendment
- BAA / DPA management, vendor risk

---

## 2. FHIR R4 Resource Alignment

Source of truth: HL7 FHIR R4 (https://hl7.org/fhir/R4/). Map zod contracts 1:1 where reasonable; flatten optional sub-elements for SaaS demo simplicity.

### 2.1 Patient
- Must: id, identifier[], name (HumanName), gender, birthDate, telecom[], address[], maritalStatus, communication.language, contact[] (emergency)
- Demo simplification: collapse Identifier → single MRN string + optional national-id; HumanName → given/family + preferred; Address → flat
- Extensions: us-core-race, us-core-ethnicity, us-core-birthsex, gender-identity (USCDI)

### 2.2 Encounter
- Must: id, status (planned/arrived/in-progress/finished/cancelled), class (AMB/IMP/EMER/HH/VR), type, subject, participant (provider), period, reasonCode, diagnosis[], serviceProvider, location[]
- Demo: flatten to encounterType, status, providerId, locationId, startAt/endAt, reasonText, primaryDxCode

### 2.3 Observation
- Must: status (registered/preliminary/final/amended), category (vital-signs/laboratory/social-history/survey/exam), code (LOINC), subject, effectiveDateTime, value[x], interpretation, referenceRange, component (BP systolic+diastolic)
- Demo: keep value+unit+loincCode+interpretation flag; BP modeled as Observation w/ component[]

### 2.4 Condition
- Must: id, clinicalStatus (active/recurrence/relapse/inactive/remission/resolved), verificationStatus (confirmed/provisional/differential), category (problem-list-item/encounter-diagnosis), code (ICD-10 + SNOMED), severity, onset[x], subject, recorder
- Demo: clinicalStatus + ICD-10 + onsetDate + note

### 2.5 AllergyIntolerance
- Must: clinicalStatus, verificationStatus, type (allergy/intolerance), category (food/medication/environment/biologic), criticality (low/high/unable-to-assess), code (RxNorm or SNOMED), reaction[].manifestation, reaction[].severity (mild/moderate/severe)
- Demo: criticality + substance code + reactionText + severity; banner must always render

### 2.6 MedicationRequest
- Must: status (active/on-hold/cancelled/completed/stopped/draft), intent (proposal/plan/order), medicationCodeableConcept (RxNorm), subject, encounter, authoredOn, requester, dosageInstruction (timing, doseAndRate, route), dispenseRequest (quantity, refills), substitution.allowedBoolean
- Demo: collapse dosage to "1 tab PO BID x 10 days" + structured fields underneath; DAW = !allowedBoolean

### 2.7 MedicationStatement
- For meds taken outside the system (home meds, OTC). Must: status (active/completed/intended), medication, subject, effectivePeriod, dosage, informationSource (patient/family)

### 2.8 Immunization
- Must: status (completed/entered-in-error/not-done), vaccineCode (CVX), patient, occurrenceDateTime, lotNumber, manufacturer, site, route, doseQuantity, performer, reasonCode, protocolApplied (series + doseNumber)
- Demo: vaccine + date + lot + dose-in-series; auto-compute next-due via schedule (CDC/WHO/national)

### 2.9 Procedure
- Must: status, code (CPT or SNOMED), subject, performedDateTime, performer, bodySite, outcome, complication, note

### 2.10 DiagnosticReport
- Must: status (registered/partial/preliminary/final/amended/corrected), category (LAB/RAD/CARDIO), code (LOINC panel), subject, effectiveDateTime, issued, performer, result[] → Observation, conclusion, presentedForm[] (PDF)

### 2.11 ServiceRequest
- The "order" resource. Must: status (draft/active/completed), intent (order), category, code (LOINC for labs, CPT for procedures), subject, encounter, authoredOn, requester, performer, reasonCode, priority (routine/urgent/asap/stat), occurrence[x]

### 2.12 CarePlan
- Must: status, intent (proposal/plan/order/option), category, subject, period, addresses (Condition refs), goal (Goal refs), activity[]
- Demo: chronic-disease management plan: condition + goals + activities

### 2.13 Goal
- Must: lifecycleStatus (proposed/active/achieved), achievementStatus, description (text or SNOMED), subject, target[].measure (LOINC) + detailRange + dueDate

### 2.14 FamilyMemberHistory
- Must: status, patient, relationship (mother/father/sibling), sex, bornDate, deceasedAge, condition[].code (SNOMED) + onsetAge

### 2.15 Appointment
- Must: status (proposed/booked/arrived/fulfilled/cancelled/noshow), serviceType, specialty, appointmentType, start, end, minutesDuration, slot, participant[] (patient + practitioner + location)

### 2.16 Coverage
- Must: status, type (medical/dental/vision), policyHolder, subscriber, beneficiary, relationship, period, payor, class[] (group/plan), order (primary/secondary/tertiary), network, costToBeneficiary[]

### 2.17 Claim
- Must: status, type (institutional/professional/oral), use (claim/preauthorization/predetermination), patient, billablePeriod, insurer, provider, careTeam[], diagnosis[].diagnosisCodeableConcept (ICD-10), procedure[], insurance[], item[].productOrService (CPT/HCPCS) + modifier[] + unitPrice + net
- Demo: superbill = simplified Claim with line items + linked diagnoses

### 2.18 General simplification rules
- Reference fields → flat foreign key strings
- CodeableConcept → `{ system, code, display }` triple, never just a string
- Period → `{ start, end }` ISO strings
- Quantity → `{ value, unit, system, code }` per UCUM

---

## 3. Clinical Coding Systems

| Code system | Owner | Used for | Picker behavior |
|---|---|---|---|
| ICD-10-CM (US) / ICD-10 (WHO) / ICD-11 (WHO, future) | WHO + CMS/NCHS for US | Diagnoses, problem list, claim dx | Tree + search; chapter → block → category → code; favorites per provider; recent codes; specialty pre-filter |
| CPT | AMA (proprietary, license required) | Procedures, E/M visits, services billed in US | Search by code or term; modifier chip picker (-25, -59, -RT/-LT, -50, -76); E/M leveler |
| HCPCS Level II | CMS | Supplies, DME, drugs J-codes, ambulance | Same picker pattern as CPT |
| SNOMED CT | SNOMED International (national license; free for member countries) | Clinical findings, problems, allergies (substance), procedures, body sites — international clinical reference | Hierarchy navigator + ECL search; map-to-ICD-10 helper |
| LOINC | Regenstrief Institute (free) | Lab tests, vital signs codes, panels, document types, survey instruments (PHQ-9 = 44249-1) | Common-tests shortcut + full search; component / property / system / scale / method facets |
| RxNorm | NLM (free) | Medications, normalized drug names, ingredient ↔ brand crosswalk | Generic-first display; brand chip; strength + form; ties to NDC for dispense |
| ATC | WHO Collaborating Centre | EU/international drug classification | Optional secondary tag for EU tenants |
| CVX / MVX | CDC | Vaccine product / manufacturer codes | Vaccine picker uses CVX; site/route from HL7 v2 tables |
| UCUM | Regenstrief | Units of measure (mg, mmol/L, mmHg) | Backing every Quantity field |
| NDC | FDA | Specific drug package for dispense / billing | Resolved from RxNorm at e-prescribe time |
| ICD-10-PCS | CMS | US inpatient procedures only (institutional) | Out of scope for ambulatory MVP |

### 3.1 Code-picker component contract
- Async-search w/ debounce + locally cached "recent" + pinned "favorites per user / per specialty"
- Always render `code — display` (truncation forbidden, see §17)
- Show coding system badge (ICD-10 / SNOMED / LOINC) so users never confuse systems
- Multi-select where contract allows (problem list dual-coded SNOMED + ICD-10)
- Localized display name when available (SNOMED has translations; ICD-10 WHO has 40+ language editions)

---

## 4. Vitals + Growth

### 4.1 Adult vitals (LOINC anchored)
- BP systolic 8480-6, diastolic 8462-4, mean 8478-0; component pattern; arm + position + cuff size
- Heart rate 8867-4
- Respiratory rate 9279-1
- SpO2 2708-6 (% O2 sat) or 59408-5 (pulse-oximetry)
- Body temperature 8310-5; site (oral/tympanic/rectal/axillary/temporal) modifies normal range
- Body weight 29463-7
- Body height 8302-2
- BMI 39156-5 (computed; never typed)
- Pain score 38208-5 (0-10 numeric); FACES Wong-Baker for peds; FLACC <3yo
- Head circumference 9843-4 (peds <3yo)

### 4.2 Pediatric growth charts
- WHO 0-24 months (international standard, breastfed reference) — weight-for-age, length-for-age, weight-for-length, head circumference, BMI-for-age (≥2yo)
- CDC 2-20 years (US default after 24mo) — stature-for-age, weight-for-age, BMI-for-age
- Plot on percentile curves: 3rd / 5th / 10th / 25th / 50th / 75th / 90th / 95th / 97th
- Z-score display (WHO uses ±SD: -3, -2, -1, 0, +1, +2, +3)
- Specialty curves: Down syndrome, Turner, preterm (Fenton), CDC infant
- Corrected age toggle for preterm (until 24mo)

### 4.3 Unit toggles
- Weight: kg (global) ↔ lb-oz (US peds) ↔ st-lb (UK adult, rare)
- Height: cm ↔ ft-in
- Temperature: °C (global) ↔ °F (US)
- BP always mmHg
- Glucose: mmol/L (EU/UK/AU/CA) ↔ mg/dL (US)
- Hemoglobin: g/dL (US) ↔ g/L (UK) ↔ mmol/L (rare DE/SE)
- Cholesterol: mg/dL (US) ↔ mmol/L (UK/EU)
- Creatinine: mg/dL (US) ↔ µmol/L (most else)

### 4.4 Reference ranges
- Age + sex stratified; pregnancy-state stratified for some labs
- Pediatric ranges by age band (newborn / infant / toddler / child / adolescent)
- Source: institutional defaults + lab-provided overrides

### 4.5 Abnormal flagging
- Standard: H (high), L (low), HH (critical high), LL (critical low), N (normal), A (abnormal qualitative), positive/negative
- Critical = clinician notification required; HHS Lab CLIA panic-value norms
- Multi-channel encoding: icon + color + text label (never color-only; see §17 + §20)

---

## 5. Medication Safety

### 5.1 Checking categories
- Drug-allergy (RxNorm ingredient match + cross-reactivity classes — penicillins ↔ cephalosporins partial)
- Drug-drug interaction (severity tiers: contraindicated / severe / moderate / minor; First Databank, Lexicomp, Multum, Medscape)
- Drug-disease (e.g., NSAID + CKD, beta-blocker + asthma)
- Drug-pregnancy (FDA categories deprecated 2015 → PLLR narrative; still in many vendor DBs)
- Drug-lactation
- Drug-age (avoid in elderly — Beers Criteria; avoid in peds — codeine <12yo)
- Drug-lab (e.g., warfarin + INR overdue)
- Duplicate therapy (same ingredient / same class)
- Dose range check (min/max single dose, max daily, max per kg per day for peds)

### 5.2 Pediatric dosing
- mg/kg/dose AND mg/kg/day calculations
- Weight-banded dosing tables (e.g., amoxicillin 45 mg/kg/day BID)
- Capped at adult max (e.g., never exceed 4 g acetaminophen/day)
- BSA dosing for chemo (Mosteller, DuBois)
- Renal adjustment (CrCl Cockcroft-Gault) + hepatic adjustment

### 5.3 Controlled substances
- DEA Schedule II–V (US); equivalents: UK MDR Schedules 1-5, AU S4/S8, KSA narcotic register
- EPCS (Electronic Prescribing of Controlled Substances) requires identity-proofed two-factor; demo can show the ceremony, not enforce DEA
- Quantity limits, days-supply limits per state PDMP rules
- PDMP query stub (US state prescription drug monitoring program)

### 5.4 Alert design (anti-fatigue)
- Tier alerts: hard-stop (contraindicated / known fatal allergy), soft-stop (severe interaction, override w/ reason), informational (minor)
- Suppress duplicate alerts within encounter
- Track override reasons → audit + analytics (which alerts get overridden 95%+ are noise — retire)
- Inline at order entry, not modal popups, for low/med severity
- Modal only for hard-stop; one-liner banner for moderate
- Show *why* (drug, severity, mechanism) — not just "warning"
- Reference: AHRQ alert fatigue research, ONC SAFER guides

---

## 6. Prescription Workflows

### 6.1 Rx pad
- Patient header w/ allergies + active meds + weight (peds)
- Drug search (RxNorm) → strength → form → SIG builder (dose, route, frequency, duration, PRN) → quantity → refills → DAW
- SIG natural-language echo ("Take 1 tablet by mouth twice a day for 10 days")
- Indication (linked to problem list) — required for many payers + meaningful use
- Pharmacy selector (preferred pharmacy default + nearby alternates)
- Sign + send vs. print + handwrite + queue-for-renewal

### 6.2 Refill queue
- Inbound refill requests (pharmacy-initiated via SureScripts SCRIPT NewRx/RefillRequest/RefillResponse)
- Approve / approve-with-changes / deny + reason
- Bulk approve for chronic stable meds w/ guardrails (no controlled, no recent labs overdue)

### 6.3 e-Prescribing concepts (SureScripts US patterns)
- Eligibility, formulary, benefit (RTBC — Real-Time Benefit Check)
- Medication history (12-mo claims-derived view)
- Prescription routing (NCPDP SCRIPT 2017071+ standard)
- Cancel Rx, Change Rx, Resupply
- EPCS for controlled substances

### 6.4 Substitution
- DAW codes (NCPDP): 0 (no product selection indicated), 1 (prescriber DAW), 2 (patient requests brand), 3-9 specialized
- Generic-first default; brand override w/ reason

### 6.5 Pharmacy routing
- NCPDP ID lookup, preferred pharmacy on patient record, mail-order vs retail
- Print fallback (must include all required Rx elements + provider DEA/NPI/state license)

---

## 7. Lab Orders + Results

### 7.1 Order entry
- LOINC code per test or panel (e.g., CBC w/ diff = 58410-2; CMP = 24323-8; HbA1c = 4548-4)
- Order set bundles (DM annual: HbA1c + lipid + UACR + eGFR; pre-op: CBC + BMP + PT/INR + UA + EKG)
- Specimen type, fasting flag, collection-by, priority (routine/STAT/timed), recurring order
- ICD-10 indication (medical necessity for payer)
- Standing orders / future orders w/ release date
- AOE (ask-on-order-entry) questions for select tests (LMP for hCG, gestational age, etc.)

### 7.2 Requisition
- Generated PDF for lab; client-of-lab account number; patient + insurance + dx + ordering provider + collection instructions

### 7.3 Result entry
- Inbound HL7 v2 ORU^R01 or FHIR DiagnosticReport ingestion
- Manual result entry fallback (paper labs)
- Each result = Observation w/ code, value, unit, ref range, interpretation flag

### 7.4 Reference ranges + flags
- H / L / HH / LL / N / A
- "!" Critical = pager-worthy; CLIA + CAP define institutional panic ranges
- Delta check (sudden change from prior — possible specimen mixup)

### 7.5 Trending
- Time-series chart per analyte; multi-analyte overlay (ALT/AST trend; eGFR trend)
- Flowsheet view (rows=analytes, columns=dates) — Epic NoteWriter / Cerner PowerChart pattern

### 7.6 Result attachments
- PDF of full lab report (presentedForm); image attachments; corrected/amended versions w/ history

---

## 8. Imaging

(We will NOT build a real DICOM viewer — Cornerstone.js / OHIF are out of scope for MVP demo.)

### 8.1 Metadata to surface
- Modality (DICOM tag 0008,0060): CR, CT, DX, MG, MR, NM, OT, PT, RF, US, XA
- Study description, body part, laterality, contrast Y/N
- Accession number, study UID (cross-system reference)
- Performed date, performing facility/PACS source
- Status (ordered → scheduled → performed → dictated → final-read)
- Radiologist + signing
- Findings + impression (free text from DiagnosticReport)
- Linked priors

### 8.2 PACS link
- Deep-link out to external viewer by accession or study UID
- IHE XDS-I.b / WADO-RS / DICOMweb URL pattern (for future)
- Thumbnail (single representative frame) optional, never claim diagnostic-quality

### 8.3 Order placeholders
- Modality + body part + laterality + reason + priority
- ACR Appropriateness Criteria mention for CDS hooks

---

## 9. Encounter Types + SOAP

### 9.1 Encounter classes (FHIR ActEncounterCode)
- AMB ambulatory / IMP inpatient / EMER emergency / HH home health / VR virtual / SS short-stay / OBSENC observation
- BOS scope: AMB + VR (telehealth) for MVP; IMP/EMER deferred

### 9.2 Visit types
- New patient, established (E/M 99202-99215 US)
- Annual wellness, preventive, sick, follow-up, procedure-only, telehealth, group, post-op
- Specialty-specific (prenatal, well-child, derm full-body)

### 9.3 SOAP structure
- **Subjective**: Chief Complaint (CC); History of Present Illness (HPI) — OLDCARTS or OPQRST framework; Review of Systems (ROS) by 14 systems (constitutional, eyes, ENT, CV, resp, GI, GU, MSK, skin, neuro, psych, endo, heme/lymph, allergy/immuno); Past Medical / Surgical / Family / Social History (PMH/PSH/FH/SH); home meds + allergies confirmed
- **Objective**: vitals, exam by system, in-office labs/POC, in-office procedures
- **Assessment**: problem-oriented list w/ differential
- **Plan**: per-problem plan — orders, meds, education, follow-up, referrals

### 9.4 Variants
- APSO (Assessment-Plan first, then Subjective-Objective) — Epic default for fast scanning
- DAR / DAP (Data-Assessment-Plan) — psych
- Focused note (single-system, brief)
- H&P (full history & physical, admissions)

### 9.5 Templates
- Specialty templates (well-child by age, prenatal by trimester, DM follow-up, post-op)
- Smart phrases / dot phrases (`.cc`, `.dm2plan`)
- Pull-forward from prior encounter w/ delta highlighting

### 9.6 Draft → Sign workflow
- Default state: DRAFT (editable, autosave every keystroke)
- Pending co-sign: visible to attending
- SIGNED: locked; addendum required for additions; amendment for corrections
- Two-step sign: Review screen → confirm → password / PIN re-auth for EPCS / controlled

---

## 10. Specialty Considerations + Priority Order

### 10.1 P0 — General Practice / Family Medicine
- Broadest patient mix; SOAP + meds + labs + referrals; baseline for everything else

### 10.2 P0 — Pediatrics
- Growth charts (WHO/CDC, see §4.2)
- Immunization schedule + due-date logic (CDC ACIP US, NHS UK, EPI WHO)
- Weight-based dosing (§5.2)
- Developmental milestones (Bright Futures, ASQ-3)
- Newborn screening (heel stick, hearing, CCHD)

### 10.3 P1 — OB-GYN
- Gravida / Para / TPAL (Term, Preterm, Abortions, Living)
- LMP, EDD (Naegele's rule — LMP + 280d, or first-trimester US dating override)
- Gestational age in weeks+days, auto-updated
- Prenatal flowsheet: weekly visits w/ BP / weight / fundal height / FHR / fetal movement / urine dip
- Trimester-specific labs (T1: CBC, blood type, antibody, RPR, HIV, hep B/C, GC/CT, urine c&s, rubella; T2: AFP/quad, anatomy US; T3: GBS, GTT, repeat CBC)
- Ultrasound entries (BPD, HC, AC, FL, EFW, AFI)
- Postpartum visit at 6 weeks, mood screening (EPDS)

### 10.4 P1 — Cardiology
- ECG metadata (rate, rhythm, axis, intervals PR/QRS/QT/QTc, interpretation); attach 12-lead PDF/image
- Echo metadata (EF, chamber sizes, valve assessments)
- Stress test, Holter, event monitor metadata
- Risk calculators (ASCVD, CHA2DS2-VASc, HAS-BLED)

### 10.5 P2 — Dermatology
- Body-region map for lesion location (anatomic diagram clickable)
- Photo capture w/ consent + secure storage
- Lesion attributes (size, color, border, ABCDE for moles)
- Path tracking (biopsy → result → follow-up)

### 10.6 P2 — Psychiatry / Behavioral Health
- Mental Status Exam (MSE): appearance, behavior, speech, mood, affect, thought process, thought content, perception, cognition, insight, judgment
- Standardized scales: PHQ-9 (LOINC 44249-1), GAD-7 (LOINC 69737-5), MDQ, AUDIT, DAST, C-SSRS, PCL-5, MoCA, MMSE
- Suicide risk flag w/ safety plan template
- Therapy note vs psychiatric eval distinction; 42 CFR Part 2 confidentiality (US SUD)

### 10.7 Priority order
1. GP/FM (P0)
2. Peds (P0)
3. OB-GYN (P1)
4. Psych (P1, high demand telehealth)
5. Cardiology (P1)
6. Derm (P2)
7. Long-tail specialties (ortho, GI, endo, ID, pulm, neuro, urology, nephro, ENT, ophtho)

---

## 11. Insurance / Claims (Medical-Specific)

### 11.1 Eligibility
- Realtime 270/271 X12 EDI (US); ClaimMD, Availity, Change Healthcare, pVerify clearinghouses
- Returns: active coverage, copay, deductible met, OOP max met, in-network status
- Pre-visit batch eligibility (run T-2 days)

### 11.2 Prior authorization
- Required for: imaging (MRI/CT/PET), specialty meds, surgery, DME, some procedures
- Workflow: identify need → submit (fax/portal/X12 278) → track status → store auth number → attach to claim
- Payer-specific question sets; CoverMyMeds pattern for med PAs

### 11.3 Superbill
- Encounter-level summary: patient, provider, DOS, POS code, ICD-10 dx pointers, CPT/HCPCS lines w/ modifiers, units, charge
- Generated at encounter sign; routed to coder/biller or auto-filed

### 11.4 CMS-1500 / HCFA (paper) + 837P (electronic)
- 33 fields on CMS-1500 paper form; 837P is the X12 EDI equivalent
- Box 21 dx codes (A-L, 12 max); Box 24 service lines link dx pointers (A,B,C,D)
- Place of Service codes (11 office, 02 telehealth-non-home, 10 telehealth-home, 22 outpatient hospital, 21 inpatient, etc.)

### 11.5 Modifiers
- Pricing: -22 (increased), -52 (reduced), -53 (discontinued)
- Anatomical: -RT, -LT, -50 (bilateral), -E1-E4 (eyelids), -FA-F9 -TA-T9 (digits)
- Service-level: -25 (significant separate E/M same day), -59 (distinct procedural), -76 (repeat by same), -77 (repeat by other), -91 (repeat lab)
- Telehealth: -95, GT (legacy), GQ (asynchronous)

### 11.6 EOB / ERA (835)
- Posting w/ adjustments (CO contractual, PR patient resp, OA other)
- CARC (Claim Adjustment Reason Codes) + RARC (Remittance Advice Remark Codes)
- Denial worklist by reason code + payer

---

## 12. Telemedicine

### 12.1 Video room placeholder UX
- "Join visit" button enabled at T-15min; actual provider: Twilio Video / Daily / Zoom Healthcare / Doxy.me / Vonage / Amazon Chime SDK
- Pre-call tech check (camera/mic/network)
- Waiting room, virtual rooming staff
- Provider-side: chart-side-by-side w/ video; vitals self-reported intake

### 12.2 Pre-visit forms
- Symptom intake, vitals (home BP/weight/temp), photo upload (derm/wound)
- Consent to telehealth (state-specific in US; locale-specific elsewhere)
- ID verification (photo of ID + selfie) for new patients

### 12.3 Post-visit
- Rx send to pharmacy (no in-person pickup needed)
- Lab order routed to nearest in-network draw site
- Follow-up booking (in-person if needed)
- Visit summary + AVS (After-Visit Summary) auto-released to portal

### 12.4 E-signature
- Consent forms: typed name + checkbox + timestamp + IP + audit
- ESIGN Act / UETA compliant in US; eIDAS in EU (advanced electronic signature for sensitive)
- Stored as PDF with embedded signature metadata; immutable

---

## 13. Patient Portal

### 13.1 Features
- Appointments: upcoming + past, self-schedule, cancel/reschedule, telehealth join button
- Messages: secure inbox to/from care team; threaded; attachments; auto-routing to pool
- Lab results: released after delay (US: 21st Century Cures Act mandates near-immediate release w/ narrow exceptions)
- Medications: active list, refill request button, med history
- Billing: statement view, pay online, payment plan, financial assistance app
- Health summary: problems, allergies, immunizations, vitals trend
- Documents: visit summaries, after-visit summary, referral letters, immunization record, releases
- Forms: pre-visit intake, screening questionnaires (PHQ-9 etc.), update demographics
- Family / proxy access: parent → child (rules change at 12 / 13 / 18 by state); caregiver → adult
- Authorized representatives (POA, custodian)

### 13.2 Read-only default
- Default: read; explicit opt-in for proposing changes (med list reconciliation suggestions, demographics edits)
- All proposed changes route to staff queue for confirm/reject — never auto-mutate chart

### 13.3 Locale + accessibility
- Plain language (Flesch-Kincaid grade 6-8); medical glossary tooltips
- Screen reader, keyboard nav, high-contrast, font scale (WCAG 2.2 AA minimum, AAA aspirational)

---

## 14. Audit + Compliance

### 14.1 HIPAA-style audit log
- Every chart-open, every section-view, every change (who / what / when / from-IP / device / patient-id / record-id / before / after)
- Immutable append-only store; tamper-evident hash chain
- 6-year retention min (HIPAA §164.530(j))

### 14.2 Break-glass emergency access
- "Emergency access" button → reason required → time-limited access to non-empaneled patient → highlighted audit entry → automatic supervisor notification
- Used for: ER, on-call cross-coverage, code blue
- Reviewed weekly by privacy officer

### 14.3 Role-based PHI scoping
- Roles: provider, nurse, MA, front-desk, biller, scheduler, admin, super-admin, read-only researcher
- Plus attribute-based: empanelment (only my patients), location, specialty, sensitive-record carve-outs (psych, SUD 42 CFR Part 2, HIV, repro)
- Minimum necessary principle (HIPAA)

### 14.4 Data export
- Patient-initiated export (Right of Access; HIPAA + GDPR + 21st Century Cures): CCDA, FHIR Bulk, PDF
- Provider-initiated audit export
- Export gated by re-auth + reason + audit

### 14.5 BAA / DPA
- Each subprocessor (video, fax, e-Rx, lab connector, AI scribe, cloud) requires Business Associate Agreement (US HIPAA) or Data Processing Agreement (EU GDPR) or equivalent (PIPEDA CA, PDPL KSA, DIFC DPL, PDPB IN draft, LFPDPPP MX)
- Surface BAA inventory in admin settings

### 14.6 Other compliance touchpoints
- HITECH breach notification (>500 records → HHS + media)
- 21st Century Cures Act: information blocking rule — cannot artificially delay/block patient access to records
- USCDI v3 (US Core Data for Interoperability) data class coverage
- ONC certification if pursued (not MVP)
- GDPR Art. 9 special category data (health data) lawful basis
- KSA PDPL, UAE PDPL, Pakistan PECA + draft Personal Data Protection Bill, India DPDPA

---

## 15. Medical Localization Deep Cuts

### 15.1 Drug naming
- Default to **INN (International Nonproprietary Name, WHO)** for generic; show brand chip alongside
- Locale-specific brand mapping table required
- Famous splits:
  - paracetamol (INN, global) ↔ acetaminophen (US/JP USAN/JAN)
  - salbutamol (INN, global) ↔ albuterol (US USAN)
  - epinephrine (US) ↔ adrenaline (most else, both INN-recognized)
  - lidocaine (US) ↔ lignocaine (UK old, AU)
  - meperidine (US) ↔ pethidine (most else)
- RxNorm covers US; ATC + national drug codes cover others (BNF UK, AMT AU, KEGG JP, SAMA KSA registry)
- Display rule: `Generic (INN) — Brand (locale) — Strength — Form`

### 15.2 Allergen lists by region
- US FDA Top 9: milk, egg, fish, shellfish, tree nuts, peanut, wheat, soy, **sesame** (added 2023, FASTER Act)
- EU 14 declarable: above + **mustard, lupin, celery, sulphites, molluscs**, plus cereals containing gluten broken out
- AU/NZ FSANZ: similar to EU
- Halal/kosher considerations (gelatin, porcine insulin, alcohol-based vehicles) — pharmacy + dietary
- Regional environmentals: dust mite, cockroach (US urban), date palm pollen (Gulf), camel dander (Gulf), Alternaria (dry climates), Bermuda grass

### 15.3 Hijri date
- Display as secondary date alongside Gregorian for KSA, PK, AE, EG, JO and any tenant-flagged
- Format: `13 Shawwal 1447 AH (10 Apr 2026)`
- Use Umm al-Qura calendar for KSA; tabular Hijri elsewhere
- Critical: DOB, encounter date, Rx date all dual-displayed
- Storage always Gregorian ISO-8601 UTC; conversion at render only

### 15.4 Unit conventions per locale
| Measure | US default | UK/EU default | Global default | Notes |
|---|---|---|---|---|
| BP | mmHg | mmHg | mmHg | Universal; never kPa in clinical |
| Temp | °F | °C | °C | |
| Weight | lb (adult), lb-oz (peds) | kg | kg | |
| Height | ft-in | cm | cm | |
| Glucose | mg/dL | mmol/L | mmol/L | conv: mg/dL ÷ 18 = mmol/L |
| Cholesterol | mg/dL | mmol/L | mmol/L | conv: mg/dL ÷ 38.67 = mmol/L (TC); ÷ 88.57 (TG) |
| HbA1c | % (NGSP) | mmol/mol (IFCC) + % | both | dual display |
| Creatinine | mg/dL | µmol/L | µmol/L | |
| Hemoglobin | g/dL | g/L | g/dL or g/L | |
| Drug doses | mg, mcg, mL | same | same | UCUM throughout |

### 15.5 RTL output
- Rx pad RTL: drug + sig in source language; patient demographics RTL; provider sig block RTL
- Lab report RTL: rows mirror; numeric value column stays LTR for numbers (use bidi-isolation)
- Numbers in tables: always LTR-isolated even in RTL context; reference ranges `low–high` flow LTR
- Date columns: dual Hijri/Gregorian, both LTR-isolated
- Charts (growth, trending): axes labels RTL, axis numbers LTR; legend RTL

### 15.6 Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩)
- Industry norm in clinical software in MENA: **Western Arabic / European digits (0123456789)** for clinical values to avoid transcription error and to align w/ international literature, devices, lab analyzers
- Eastern Arabic numerals acceptable for prose, patient-facing documents, signage, but **not for dosing, BP, lab values, dates in clinical chart**
- Provide a tenant-level toggle, default OFF for clinical fields, ON for patient-facing portal prose
- Cite: Saudi MOH eHealth standards lean Western digits; UAE DHA/MOH similar; Egyptian MOHP mixed

### 15.7 Other locale items
- Name order (family-first JP/CN/KR/HU/VN; given-first most else); honorifics
- Phone formats (E.164 storage, locale display)
- Address formats (US 1-line; UK multi-line; KSA: district + city + postal)
- Working week (Sun-Thu KSA pre-2013, now Sun-Thu/Sat-Wed varies; Sun-Thu UAE pre-2022, Mon-Fri-half now; respect tenant config)
- Holidays affecting scheduling (Eid, Ramadan working-hour shifts, Diwali, Christmas, Easter, Passover, Yom Kippur, Lunar New Year, Golden Week)
- Ramadan-specific: med-timing adjustments for fasting patients (clinically relevant for diabetes, HTN, anticoagulation) — surface as patient flag

---

## 16. Caliber × Size Scaling for Medical

### 16.1 Standard tier (solo / micro 1-3 providers)
- Single-location, single-provider scheduling; basic resource calendar
- Basic chart: problems, allergies, meds, vitals, simple SOAP free-text + 3-5 templates
- Simple Rx: drug search + SIG free-text + print/PDF; manual refill log
- Simple lab orders: single-test pick + manual result entry; PDF attach
- Manual eligibility (staff calls payer); no e-prescribe
- Single language, single tenant brand, no advanced CDS
- Patient portal: appointments + messages only

### 16.2 Professional tier (small group 4-25 providers)
- Multi-provider scheduling, multi-resource, recall lists
- Order sets per specialty, dot-phrases, custom templates
- Growth charts (peds), basic decision support (allergy + DDI core), formulary flag
- E-prescribe (non-controlled), refill queue
- Lab interface (one or two major lab connectors), result inbox, trending
- Eligibility realtime, claim scrubbing, basic ERA posting
- Patient portal full features (results release, intake forms, telehealth)
- Multi-language (en + 1-2), basic RTL

### 16.3 Enterprise tier (large group, multi-specialty, multi-location, hospital-affiliated)
- CDS rules engine (CDS Hooks compatible), org-defined BPAs
- Custom form builder w/ FHIR-bound questions
- Advanced reporting (HEDIS/MIPS/QOF, custom registries, population health)
- Multi-location w/ per-location config; resource pools across locations
- Prior auth workflow w/ payer integrations
- Integration hub (HL7 v2 + FHIR R4 inbound/outbound, lab/PACS/HIE/state registries/IIS immunization registries)
- EPCS for controlled substances
- Research module (de-identified extract, cohort builder)
- All locales + RTL + Hijri + tenant-overridable terminologies
- SSO (SAML/OIDC), SCIM provisioning, IdP-based RBAC, IP-allowlist, audit SIEM export

### 16.4 Feature-flag governance
- Always gate via `useFeatureFlag('med.cdsRulesEngine')` etc., **never** raw plan-string check
- Doc: per spec in `docs/scaling-and-tiers.md`

---

## 17. "World's Best of the Best" UX Behaviors (Medical)

10 concrete behaviors that separate clinical-grade software from mediocre:

1. **Drug names never truncate.** Tooltip-on-hover is not enough; a clinician seeing "metoprolol succ..." cannot tell extended-release from tartrate. Wrap, don't ellipsis. Brand + generic + strength + form must all be visible at decision points.
2. **Allergy banner requires acknowledgment on first chart-open per session.** Sticky, top, contrasting; cannot be visually overlapped by toasts/dialogs; reads in ALL CAPS for criticality=high.
3. **Abnormal flagging is multi-channel** — icon shape (▲ high, ▼ low, !! critical) + color (palette must pass deuteranopia + protanopia + tritanopia simulation, e.g., Okabe-Ito) + text label ("HIGH"). Color alone is forbidden (WCAG 1.4.1 Use of Color).
4. **Audit trail is visible to the provider.** "Who else viewed this chart this week?" is one click. Reduces snooping; surfaces break-glass events.
5. **Notes default to DRAFT, never auto-sign.** Autosave every 2-3 seconds on draft; "sign" is deliberate two-step (review screen → confirm). Signed notes are immutable; addenda are first-class.
6. **Two-step sign for prescriptions.** Especially for controlled, peds-weight-based, and high-alert (insulin, anticoagulant, opioid). Show computed total daily dose / mg per kg one final time before commit.
7. **Numbers are always shown with units and reference ranges.** "120" is meaningless; "120 mg/dL (70–99)" is information. Never strip unit on hover-only.
8. **Date+time always include timezone.** UTC stored; local rendered with TZ abbreviation; encounters spanning DST handled cleanly. Hijri shown alongside Gregorian per locale.
9. **Pediatric weight is never optional.** Any peds Rx blocks at the missing-weight gate; weight has staleness indicator (>30 days flagged amber, >90 days red).
10. **Allergies and active meds visible from every clinical surface.** Sidebar persistence, not "click to view." Includes the chart, the order entry, the Rx pad, the discharge summary, the patient summary, the telehealth video room.

Bonus markers:
11. Critical labs phone-call workflow — on critical result, surface a "Result acknowledged + patient notified" task; cannot dismiss without notification path recorded.
12. Med reconciliation explicit at every transition (admit/discharge/visit start); diff view of home vs prescribed.
13. Specialty-aware chart sections: derm shows photo timeline first; psych shows MSE first; OB shows GA + flowsheet first.
14. Calculators inline at point of decision (CHA2DS2-VASc on the AFib problem, ASCVD on the lipid panel).
15. Localization extends to **clinical content**, not just UI strings: SIG language, condition descriptions, patient education, AVS, all in patient's preferred language with health-literacy adjustment.

---

## 18. Screen Inventory (MED-01..MED-NN)

Stable IDs for ~50 screens.

### Patient + intake
- **MED-01** Patient registration (multi-step: identity → contact → insurance → consents → photo)
- **MED-02** Patient search / MPI (typeahead, recent, advanced, duplicate-merge view)
- **MED-03** Patient summary / banner ("Storyboard") — sticky header on every chart screen
- **MED-04** Demographics + relationships editor

### Scheduling
- **MED-05** Schedule day-view (provider/resource grid, drag-drop, double-book, telehealth markers)
- **MED-06** Schedule week-view + month-view
- **MED-07** Appointment booking overlay (visit type → slot → confirm → reminders config)
- **MED-08** Wait-list / standby panel
- **MED-09** Recall + tickler list

### Front desk
- **MED-10** Arrival queue / day-roster (status: scheduled → arrived → roomed → with provider → checkout)
- **MED-11** Eligibility + benefits overlay
- **MED-12** Check-in kiosk flow (digital intake forms, consents, ID + insurance scan)

### Encounter + chart
- **MED-13** Encounter shell (left nav: chart sections; main: note; right rail: orders + meds)
- **MED-14** Chief complaint + HPI (OLDCARTS guided)
- **MED-15** Review of systems (14-system grid, "all negative" toggle)
- **MED-16** Physical exam (system-by-system templated)
- **MED-17** Assessment + plan (problem-oriented; per-problem plan blocks)
- **MED-18** Note review + sign (two-step ceremony, addendum stub)

### Chart sections
- **MED-19** Problem list (active/inactive/resolved; SNOMED+ICD-10 dual code)
- **MED-20** Allergies (severity, reaction, criticality; ack banner)
- **MED-21** Medications (active, prior, taking-but-not-prescribed; reconciliation)
- **MED-22** Immunizations (record + due-list + schedule overlay)
- **MED-23** Vitals (entry table + trend chart + flowsheet view)
- **MED-24** Growth charts (peds: WHO/CDC selector, chart-type tabs)
- **MED-25** Lab results inbox (per-provider, multi-status)
- **MED-26** Lab result detail + trend
- **MED-27** Imaging list + report viewer (metadata + PDF + PACS link)
- **MED-28** Family history + social history
- **MED-29** Documents inbox (faxes, scans, external records)

### Orders + Rx
- **MED-30** Order entry (med / lab / imaging / referral / procedure tabs; order-set library)
- **MED-31** Rx pad (search → SIG builder → review → sign)
- **MED-32** Refill queue
- **MED-33** Lab requisition preview + print

### Telemedicine
- **MED-34** Telehealth waiting room + video shell
- **MED-35** Pre-visit form filler (patient side)

### Patient portal (separate sub-app)
- **MED-36** Portal home (next visit, unread, action items)
- **MED-37** Portal messages
- **MED-38** Portal results
- **MED-39** Portal Rx + refill request
- **MED-40** Portal billing + pay

### Billing
- **MED-41** Encounter coding + superbill review
- **MED-42** Claim worklist + denial queue
- **MED-43** Payment posting (ERA + manual)

### Admin / settings
- **MED-44** Specialty config (which sections + templates per specialty)
- **MED-45** Templates manager (notes, dot-phrases, order sets, AOEs)
- **MED-46** Code-set manager (favorites, custom problem list, fee schedule)
- **MED-47** Reference range manager (per-lab, per-age-band)
- **MED-48** Reminder + recall rules
- **MED-49** User + role + location admin
- **MED-50** Audit log viewer + break-glass review
- **MED-51** Integrations (lab, e-Rx, eligibility, video, fax)
- **MED-52** Locale + units + Hijri toggle per tenant

---

## 19. Mock Data Shape — Demo Tenant Archetypes

Make the demo feel like a real practice. ~25-40 mock patients, each archetype represented:

### 19.1 Pediatric — well-child + growth
- "Layla H., 18 months F" — WHO 0-24mo curve, weight tracking 25th→50th percentile, immunizations on schedule with next DTaP-IPV due, hx of mild eczema, mom Arabic-preferred
- "Marcus J., 9 years M" — CDC 2-20 curve, BMI 95th percentile (overweight flag), asthma controller med + rescue, recent flu vaccine, ADHD evaluation in plan

### 19.2 Pregnant — prenatal flow
- "Priya S., 31 F, G2P1, EDD 2026-09-12" — currently 22 weeks, hx of GDM in prior pregnancy, prenatal flowsheet w/ 6 visits done, anatomy US scheduled, GBS not yet, Rh+, blood type A+, preferred Hindi

### 19.3 Geriatric — polypharmacy
- "Mr. Khalid A., 78 M" — 11 active meds (warfarin, metoprolol, lisinopril, atorvastatin, metformin, glipizide, omeprazole, alendronate, sertraline, donepezil, finasteride), Beers Criteria flags on 3, recent fall, INR overdue, eGFR 42 (stage 3b CKD), preferred Arabic, Hijri DOB display

### 19.4 Chronic — DM + HTN
- "Sandra L., 56 F" — T2DM 8 years, HbA1c trending 8.2 → 7.8 → 7.4, HTN, hyperlipidemia, microalbuminuria, on metformin + empagliflozin + lisinopril + atorvastatin, last eye exam overdue, foot exam done

### 19.5 Allergy alerts triggered
- "Diego M., 34 M" — documented penicillin allergy (anaphylaxis, criticality=high). When provider attempts to prescribe amoxicillin → hard-stop alert ceremony fires; demo shows the override-with-reason flow against a moderate alert (sulfa).

### 19.6 Abnormal labs trending
- "Yusra K., 47 F" — TSH 6.8 (high), free T4 0.7 (low) — subclinical hypothyroid → overt; trend shows 3 prior values progressing; result inbox flagged H; care plan stub "start levothyroxine 25 mcg"

### 19.7 Immunization due
- "Tom O., 64 M" — overdue: shingles (Shingrix series), Tdap booster >10y, pneumococcal due at 65 (not yet); recall list will surface him next month

### 19.8 Telemedicine scheduled
- "Aisha R., 28 F" — anxiety follow-up, telehealth visit at 14:00, PHQ-9 + GAD-7 sent as pre-visit forms, e-prescribe ready

### 19.9 Mental health complexity
- "Daniel C., 22 M" — major depression, PHQ-9 trending 18 → 12 → 8, on sertraline, weekly therapy notes, C-SSRS done, safety plan attached

### 19.10 Cardiology
- "Fernando G., 67 M" — AFib, CHA2DS2-VASc 4 (high stroke risk), on apixaban, ECG 6 months ago shows AFib w/ controlled rate, echo EF 48% (mildly reduced), DDI alert on recent NSAID

### 19.11 Derm
- "Nora M., 42 F" — multiple nevi mapped to body diagram, biopsy pending on R upper back lesion, photo series at 0/3/6 months

### 19.12 Demo tenant scaffolding
- 3-5 providers (FM, Peds, OB, Psych, Cardio)
- 2 locations (one main + one satellite)
- Mock pharmacy directory (5-10 entries)
- Mock labs (LabCorp / Quest / regional equivalents per locale demo)
- Mock immunization registry stub
- Today + ±30 days of appointments populated
- Refill queue with 4-6 pending
- Lab inbox with 6-10 results (mix normal / abnormal / critical)
- Messages with 3-5 unread

---

## 20. Risks + Things to Avoid

### 20.1 Visual / perceptual
- Color-only flagging (red abnormal, green normal) — ~8% of male users colorblind; pair color w/ shape + text
- Low-contrast critical-value indicators (must pass WCAG 2.2 AA contrast 4.5:1 minimum, AAA 7:1 for clinical)
- Truncated drug names, dose strengths, lab values
- Modal popups for low-severity alerts → alarm fatigue → real alerts ignored

### 20.2 Hidden information
- Allergies behind a tab/click — must be persistent banner
- Active meds not shown at order entry — interaction checks meaningless
- "DNR" / "Do not resuscitate" / "Allergy: latex" type flags collapsing on small viewports

### 20.3 Date / time
- Ambiguous date formats (`03/04/26`) — always ISO in storage, locale-aware in display, four-digit year minimum
- DST bugs around encounter timestamps near transitions; storing in local TZ instead of UTC
- Hijri ↔ Gregorian conversion drift (different calendars: tabular vs Umm al-Qura vs astronomical) → pin Umm al-Qura for KSA, document choice
- Off-by-one on age calculation (newborns measured in days/weeks; pregnancy in weeks+days; not whole years)

### 20.4 Units
- Implicit units (typing "120" w/o knowing if mg/dL or mmol/L)
- Auto-conversion drift (mg/dL ÷ 18 → mmol/L rounding errors compound)
- Mixed unit history when patient moves locales — always store source unit + display in current preference; never overwrite source
- Pediatric weight in lb-oz parsed wrong (5 lb 10 oz ≠ 5.10 lb)

### 20.5 Dosing
- Floating-point dose math (use decimal/BigInt mg representations)
- mg/kg vs mg/kg/day vs mg/kg/dose ambiguity in templates
- Rounding to convenient tablet sizes hides true dose intent — show calculated dose and dispensed dose separately
- Max dose check absent for peds drugs w/ adult cap

### 20.6 Identity / privacy
- Patient mix-up: 2-identifier rule (name + DOB minimum) at every confirm step
- Auto-complete sending Rx to wrong same-name patient
- Minor's record visible to parent past age-of-consent threshold (varies by jurisdiction + record type)
- Sensitive records (psych, SUD, repro) leaking via generic search/export

### 20.7 Workflow
- Auto-sign on idle / on tab-close (NEVER) — always autosave draft, never auto-sign
- Lost work on session timeout w/o draft restore
- Refill bulk-approve including controlled substances
- Order sets that re-fire prior orders (creating duplicates)

### 20.8 Localization
- LTR-only PDFs in Arabic locales (Rx illegible)
- Number direction in RTL prose without bidi-isolation (`120/80` flipping to `80/120` visually)
- Drug brand-only lookup failing in non-US locales (must fall back to INN)
- Translated drug names creating ambiguity (always show INN as anchor + brand chip)

### 20.9 Compliance / legal
- Audit log writeable / deletable
- Break-glass with no review process
- BAA missing on subprocessors
- Information blocking (delaying patient access to records — 21st Century Cures violation)
- Exporting PHI without re-auth
- Logs containing PHI shipped to non-BAA-covered observability tools

### 20.10 Performance / scale
- Loading entire chart history on open (lazy-load by section)
- Large image/PDF attachments blocking note save
- N+1 on problem-list / med-list queries on every chart paint
- Telehealth video competing with chart React renders (offload to worker / iframe)

---

**End of research foundation.**

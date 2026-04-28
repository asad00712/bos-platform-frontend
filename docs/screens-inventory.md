# BOS Frontend — Screens Inventory

> Exhaustive list of every screen the rebuild is targeting. Each row is
> a deliverable. Status legend: `□` planned · `▣` in progress · `✓` done.
>
> **Use this with `rebuild-master-plan.md` §10**: phases reference these
> screens. Every PR title should include the screen ID
> (e.g. `[CRM-04] Contact detail — overview tab`).

---

## Conventions

- Screen IDs are `<MODULE>-<NN>`. They never change once assigned.
- "Path" assumes the user is inside `/app/`.
- "Verticals" tells you which verticals get this screen by default.
  Universal = all. Vertical-specific screens list which verticals
  ship them.
- "Permission" is the gate. Multiple = OR.
- Each screen is one or more `<PageContainer>` page(s); tabs inside a
  detail page are listed as separate rows when they're meaningful work
  surfaces.

---

## 1. Auth (already exists; stays)

| ID      | Path                       | Title                       | Status |
| ------- | -------------------------- | --------------------------- | ------ |
| AUTH-01 | `/login`                   | Sign in                     | ✓      |
| AUTH-02 | `/signup`                  | Sign up                     | ✓      |
| AUTH-03 | `/verify-email`            | Verify email                | ✓      |
| AUTH-04 | `/verify-2fa`              | Two-factor verify           | ✓      |
| AUTH-05 | `/forgot-password`         | Forgot password             | ✓      |
| AUTH-06 | `/forgot-password/sent`    | Forgot password sent        | ✓      |
| AUTH-07 | `/reset-password`          | Reset password              | ✓      |
| AUTH-08 | `/reset-password/done`     | Reset password done         | ✓      |
| AUTH-09 | `/login` (next migration)  | Sign in (shadcn)            | □      |
| AUTH-10 | `/signup` (next migration) | Sign up (shadcn)            | □      |

---

## 2. Dashboard (universal, vertical-aware composition)

| ID    | Path                | Title                        | Permission        | Status |
| ----- | ------------------- | ---------------------------- | ----------------- | ------ |
| DSH-01| `/dashboard`        | Overview (vertical layout)   | `dashboard:view`  | ▣      |
| DSH-02| `/dashboard/team`   | Team performance             | `dashboard:view`  | □      |
| DSH-03| `/dashboard/reports`| Operational reports          | `reports:read`    | □      |
| DSH-04| `/dashboard/saved`  | Saved views                  | `dashboard:view`  | □      |

---

## 3. CRM (universal; terminology is vertical-aware)

| ID     | Path                                | Title                                      | Permission   | Status |
| ------ | ----------------------------------- | ------------------------------------------ | ------------ | ------ |
| CRM-01 | `/crm`                              | Contacts list                              | `crm:read`   | □      |
| CRM-02 | `/crm/contacts/new`                 | Create contact                             | `crm:write`  | □      |
| CRM-03 | `/crm/contacts/:id`                 | Contact detail — overview                  | `crm:read`   | □      |
| CRM-04 | `/crm/contacts/:id/activity`        | Contact detail — timeline                  | `crm:read`   | □      |
| CRM-05 | `/crm/contacts/:id/notes`           | Contact detail — notes                     | `crm:read`   | □      |
| CRM-06 | `/crm/contacts/:id/files`           | Contact detail — files                     | `crm:read`   | □      |
| CRM-07 | `/crm/contacts/:id/billing`         | Contact detail — billing                   | `billing:read` | □    |
| CRM-08 | `/crm/contacts/:id/communications`  | Contact detail — emails/SMS/calls          | `communication:read` | □ |
| CRM-09 | `/crm/segments`                     | Segments / saved filters                   | `crm:read`   | □      |
| CRM-10 | `/crm/imports`                      | Import contacts                            | `crm:write`  | □      |
| CRM-11 | `/crm/exports`                      | Exports                                    | `crm:read`   | □      |
| CRM-12 | `/crm/duplicates`                   | Duplicate detection / merge                | `crm:write`  | □      |
| CRM-13 | `/crm/tags`                         | Tags admin                                 | `crm:write`  | □      |
| CRM-14 | `/crm/lifecycle`                    | Lifecycle stages                           | `crm:write`  | □      |

---

## 4. Scheduling (universal)

| ID    | Path                              | Title                            | Permission         | Status |
| ----- | --------------------------------- | -------------------------------- | ------------------ | ------ |
| SCH-01| `/scheduling`                     | Calendar — week                  | `scheduling:read`  | □      |
| SCH-02| `/scheduling?view=day`            | Calendar — day                   | `scheduling:read`  | □      |
| SCH-03| `/scheduling?view=month`          | Calendar — month                 | `scheduling:read`  | □      |
| SCH-04| `/scheduling?view=agenda`        | Agenda                           | `scheduling:read`  | □      |
| SCH-05| `/scheduling/resources`          | Resources / rooms                | `scheduling:read`  | □      |
| SCH-06| `/scheduling/availability`       | Availability rules               | `scheduling:write` | □      |
| SCH-07| `/scheduling/booking-pages`      | Public booking pages config      | `scheduling:write` | □      |
| SCH-08| `/scheduling/waitlist`           | Wait list                        | `scheduling:read`  | □      |
| SCH-09| `/scheduling/reminders`          | Reminder templates               | `scheduling:write` | □      |
| SCH-10| `/scheduling/appointments/new`   | New appointment                  | `scheduling:write` | □      |
| SCH-11| `/scheduling/appointments/:id`   | Appointment detail               | `scheduling:read`  | □      |

---

## 5. Billing & Invoices

| ID    | Path                          | Title                       | Permission      | Status |
| ----- | ----------------------------- | --------------------------- | --------------- | ------ |
| BIL-01| `/billing`                    | Billing overview            | `billing:read`  | □      |
| BIL-02| `/billing/invoices`           | Invoices list               | `billing:read`  | □      |
| BIL-03| `/billing/invoices/new`       | Create invoice              | `billing:write` | □      |
| BIL-04| `/billing/invoices/:id`       | Invoice detail              | `billing:read`  | □      |
| BIL-05| `/billing/quotes`             | Quotes / estimates          | `billing:read`  | □      |
| BIL-06| `/billing/payments`           | Payments list               | `billing:read`  | □      |
| BIL-07| `/billing/payments/new`       | Record payment              | `billing:write` | □      |
| BIL-08| `/billing/credit-notes`       | Credit notes                | `billing:read`  | □      |
| BIL-09| `/billing/aging`              | Aging report                | `billing:read`  | □      |
| BIL-10| `/billing/recurring`          | Recurring invoices          | `billing:write` | □      |
| BIL-11| `/billing/payment-links`      | Payment links               | `billing:write` | □      |
| BIL-12| `/billing/products`           | Products / services catalog | `billing:write` | □      |
| BIL-13| `/billing/tax`                | Tax configuration           | `settings:manage` | □    |

---

## 6. HRM

| ID    | Path                            | Title                  | Permission    | Status |
| ----- | ------------------------------- | ---------------------- | ------------- | ------ |
| HRM-01| `/hrm/employees`                | Employees              | `hrm:read`    | □      |
| HRM-02| `/hrm/employees/new`            | New employee           | `hrm:write`   | □      |
| HRM-03| `/hrm/employees/:id`            | Employee detail        | `hrm:read`    | □      |
| HRM-04| `/hrm/attendance`               | Attendance log         | `hrm:read`    | □      |
| HRM-05| `/hrm/attendance/clock`         | Clock-in / clock-out   | `hrm:write`   | □      |
| HRM-06| `/hrm/leaves`                   | Leaves & approvals     | `hrm:read`    | □      |
| HRM-07| `/hrm/leaves/new`               | Request leave          | `hrm:write`   | □      |
| HRM-08| `/hrm/payroll`                  | Payroll runs           | `hrm:read`    | □      |
| HRM-09| `/hrm/payroll/new`              | Run payroll            | `hrm:write`   | □      |
| HRM-10| `/hrm/shifts`                   | Shifts / rosters       | `hrm:write`   | □      |
| HRM-11| `/hrm/performance`              | Performance reviews    | `hrm:read`    | □      |

---

## 7. Documents

| ID    | Path                       | Title                     | Permission             | Status |
| ----- | -------------------------- | ------------------------- | ---------------------- | ------ |
| DOC-01| `/documents`               | All documents             | `documents:read`       | □      |
| DOC-02| `/documents/templates`     | Templates                 | `documents:write`      | □      |
| DOC-03| `/documents/contracts`     | Contracts                 | `documents:read`       | □      |
| DOC-04| `/documents/consents`      | Consent forms             | `documents:read`       | □      |
| DOC-05| `/documents/signatures`    | E-signature requests      | `documents:write`      | □      |
| DOC-06| `/documents/upload`        | Upload                    | `documents:write`      | □      |
| DOC-07| `/documents/:id`           | Document viewer           | `documents:read`       | □      |
| DOC-08| `/documents/:id/versions`  | Version history           | `documents:read`       | □      |

---

## 8. Communication

| ID    | Path                          | Title                | Permission                | Status |
| ----- | ----------------------------- | -------------------- | ------------------------- | ------ |
| COM-01| `/communication/inbox`        | Unified inbox        | `communication:read`      | □      |
| COM-02| `/communication/email`        | Email                | `communication:read`      | □      |
| COM-03| `/communication/sms`          | SMS                  | `communication:read`      | □      |
| COM-04| `/communication/templates`    | Templates            | `communication:write`     | □      |
| COM-05| `/communication/campaigns`    | Campaigns            | `communication:write`     | □      |
| COM-06| `/communication/campaigns/new`| New campaign         | `communication:write`     | □      |
| COM-07| `/communication/integrations` | Channels / providers | `settings:manage`         | □      |

---

## 9. Automation

| ID    | Path                        | Title                 | Permission         | Status |
| ----- | --------------------------- | --------------------- | ------------------ | ------ |
| AUT-01| `/automation`               | Workflows list        | `automation:read`  | □      |
| AUT-02| `/automation/new`           | New workflow          | `automation:write` | □      |
| AUT-03| `/automation/:id`           | Workflow editor       | `automation:write` | □      |
| AUT-04| `/automation/runs`          | Run history           | `automation:read`  | □      |
| AUT-05| `/automation/templates`     | Template gallery      | `automation:read`  | □      |

---

## 10. Reports & Analytics

| ID    | Path                          | Title              | Permission       | Status |
| ----- | ----------------------------- | ------------------ | ---------------- | ------ |
| RPT-01| `/reports`                    | Report library     | `reports:read`   | □      |
| RPT-02| `/reports/sales`              | Sales              | `reports:read`   | □      |
| RPT-03| `/reports/operations`         | Operations         | `reports:read`   | □      |
| RPT-04| `/reports/staff`              | Staff              | `reports:read`   | □      |
| RPT-05| `/reports/builder`            | Custom builder     | `reports:read`   | □      |
| RPT-06| `/reports/scheduled`          | Scheduled reports  | `reports:read`   | □      |

---

## 11. Notifications

| ID    | Path                  | Title           | Permission | Status |
| ----- | --------------------- | --------------- | ---------- | ------ |
| NTF-01| `/notifications`      | All             | (auth)     | □      |
| NTF-02| `/notifications/preferences` | Preferences | (auth) | □     |

---

## 12. Support

| ID    | Path                          | Title           | Permission | Status |
| ----- | ----------------------------- | --------------- | ---------- | ------ |
| SUP-01| `/support`                    | Support home    | (auth)     | □      |
| SUP-02| `/support/tickets`            | Tickets list    | (auth)     | □      |
| SUP-03| `/support/tickets/new`        | New ticket      | (auth)     | □      |
| SUP-04| `/support/tickets/:id`        | Ticket detail   | (auth)     | □      |
| SUP-05| `/support/help`               | Help center     | (auth)     | □      |

---

## 13. Settings (tenant-scoped)

| ID    | Path                                | Title                  | Permission         | Status |
| ----- | ----------------------------------- | ---------------------- | ------------------ | ------ |
| SET-01| `/settings`                         | Settings home          | `settings:manage`  | □      |
| SET-02| `/settings/organization`            | Organization profile   | `settings:manage`  | □      |
| SET-03| `/settings/branding`                | Branding & whitelabel  | `settings:manage`  | □      |
| SET-04| `/settings/locale`                  | Locale & timezone      | `settings:manage`  | □      |
| SET-05| `/settings/members`                 | Members                | `settings:manage`  | □      |
| SET-06| `/settings/members/invite`          | Invite member          | `settings:manage`  | □      |
| SET-07| `/settings/roles`                   | Roles & permissions    | `settings:manage`  | □      |
| SET-08| `/settings/billing`                 | Plan & billing         | `settings:manage`  | □      |
| SET-09| `/settings/integrations`            | Integrations           | `settings:manage`  | □      |
| SET-10| `/settings/api-keys`                | API keys & webhooks    | `settings:manage`  | □      |
| SET-11| `/settings/feature-flags`           | Feature flags          | `settings:manage`  | □      |
| SET-12| `/settings/security`                | Security & sessions    | `settings:manage`  | □      |
| SET-13| `/settings/data`                    | Data export & deletion | `settings:manage`  | □      |

---

## 14. Audit

| ID    | Path                  | Title             | Permission   | Status |
| ----- | --------------------- | ----------------- | ------------ | ------ |
| AUD-01| `/audit`              | Activity log      | `audit:view` | □      |
| AUD-02| `/audit/sessions`     | Active sessions   | `audit:view` | □      |
| AUD-03| `/audit/access`       | Access reviews    | `audit:view` | □      |

---

## 15. Profile (per-user)

| ID    | Path                       | Title                | Permission | Status |
| ----- | -------------------------- | -------------------- | ---------- | ------ |
| PRF-01| `/profile`                 | My profile           | (auth)     | □      |
| PRF-02| `/profile/security`        | Password & 2FA       | (auth)     | □      |
| PRF-03| `/profile/notifications`   | Notification prefs   | (auth)     | □      |
| PRF-04| `/profile/api-tokens`      | Personal access tokens | (auth)   | □      |

---

## 16. Dental vertical

Verticals: dental.

| ID     | Path                                           | Title                            | Permission       | Status |
| ------ | ---------------------------------------------- | -------------------------------- | ---------------- | ------ |
| DEN-01 | `/dental`                                      | Dental dashboard                 | `dental:read`    | □      |
| DEN-02 | `/dental/patients`                             | Patients list                    | `dental:read`    | □      |
| DEN-03 | `/dental/patients/new`                         | New patient                      | `dental:write`   | □      |
| DEN-04 | `/dental/patients/:id`                         | Patient — overview               | `dental:read`    | □      |
| DEN-05 | `/dental/patients/:id/chart`                   | Tooth chart (FDI/Universal)      | `dental:read`    | □      |
| DEN-06 | `/dental/patients/:id/treatment-plans`         | Treatment plans                  | `dental:read`    | □      |
| DEN-07 | `/dental/patients/:id/treatment-plans/new`     | New treatment plan               | `dental:write`   | □      |
| DEN-08 | `/dental/patients/:id/treatment-plans/:tpId`   | Treatment plan detail            | `dental:read`    | □      |
| DEN-09 | `/dental/patients/:id/procedures`              | Procedures performed             | `dental:read`    | □      |
| DEN-10 | `/dental/patients/:id/imaging`                 | Imaging (X-ray, intraoral)       | `dental:read`    | □      |
| DEN-11 | `/dental/patients/:id/prescriptions`           | Prescriptions                    | `dental:read`    | □      |
| DEN-12 | `/dental/patients/:id/lab-orders`              | Lab orders                       | `dental:read`    | □      |
| DEN-13 | `/dental/patients/:id/consents`                | Consents                         | `dental:read`    | □      |
| DEN-14 | `/dental/patients/:id/medical-history`         | Medical history                  | `dental:read`    | □      |
| DEN-15 | `/dental/patients/:id/billing`                 | Patient billing                  | `billing:read`   | □      |
| DEN-16 | `/dental/recalls`                              | Recall queue                     | `dental:read`    | □      |
| DEN-17 | `/dental/insurance`                            | Insurance providers              | `dental:read`    | □      |
| DEN-18 | `/dental/insurance/claims`                     | Claims                           | `dental:read`    | □      |
| DEN-19 | `/dental/insurance/claims/new`                 | Submit claim                     | `dental:write`   | □      |
| DEN-20 | `/dental/lab`                                  | Lab cases                        | `dental:read`    | □      |
| DEN-21 | `/dental/inventory`                            | Materials & inventory            | `dental:read`    | □      |
| DEN-22 | `/dental/procedure-codes`                      | Procedure code library (CDT/SNODENT) | `dental:read`| □      |

---

## 17. School vertical

Verticals: school.

| ID     | Path                                       | Title                              | Permission     | Status |
| ------ | ------------------------------------------ | ---------------------------------- | -------------- | ------ |
| SCL-01 | `/school`                                  | School dashboard                   | `school:read`  | □      |
| SCL-02 | `/school/students`                         | Students                           | `school:read`  | □      |
| SCL-03 | `/school/students/new`                     | Admit student                      | `school:write` | □      |
| SCL-04 | `/school/students/:id`                     | Student — overview                 | `school:read`  | □      |
| SCL-05 | `/school/students/:id/academics`           | Academics & grades                 | `school:read`  | □      |
| SCL-06 | `/school/students/:id/attendance`          | Attendance                         | `school:read`  | □      |
| SCL-07 | `/school/students/:id/fees`                | Fees                               | `billing:read` | □      |
| SCL-08 | `/school/students/:id/discipline`          | Discipline & remarks               | `school:read`  | □      |
| SCL-09 | `/school/students/:id/transport`           | Transport assignment               | `school:read`  | □      |
| SCL-10 | `/school/parents`                          | Parents / guardians                | `school:read`  | □      |
| SCL-11 | `/school/classes`                          | Classes / sections                 | `school:read`  | □      |
| SCL-12 | `/school/classes/:id`                      | Class detail                       | `school:read`  | □      |
| SCL-13 | `/school/subjects`                         | Subjects                           | `school:read`  | □      |
| SCL-14 | `/school/teachers`                         | Teachers                           | `school:read`  | □      |
| SCL-15 | `/school/teachers/:id`                     | Teacher detail                     | `school:read`  | □      |
| SCL-16 | `/school/timetable`                        | Timetable                          | `school:read`  | □      |
| SCL-17 | `/school/timetable/builder`                | Timetable builder                  | `school:write` | □      |
| SCL-18 | `/school/attendance`                       | School attendance overview         | `school:read`  | □      |
| SCL-19 | `/school/attendance/take`                  | Take attendance                    | `school:write` | □      |
| SCL-20 | `/school/exams`                            | Exams                              | `school:read`  | □      |
| SCL-21 | `/school/exams/new`                        | Schedule exam                      | `school:write` | □      |
| SCL-22 | `/school/exams/:id`                        | Exam detail (sittings, papers)     | `school:read`  | □      |
| SCL-23 | `/school/gradebook`                        | Gradebook                          | `school:read`  | □      |
| SCL-24 | `/school/report-cards`                     | Report cards                       | `school:read`  | □      |
| SCL-25 | `/school/fees`                             | Fees overview                      | `billing:read` | □      |
| SCL-26 | `/school/fees/structures`                  | Fee structures                     | `billing:write`| □      |
| SCL-27 | `/school/fees/scholarships`                | Scholarships                       | `billing:write`| □      |
| SCL-28 | `/school/transport`                        | Transport                          | `school:read`  | □      |
| SCL-29 | `/school/transport/routes`                 | Routes                             | `school:write` | □      |
| SCL-30 | `/school/library`                          | Library                            | `school:read`  | □      |
| SCL-31 | `/school/library/issuance`                 | Issuance log                       | `school:write` | □      |
| SCL-32 | `/school/hostel`                           | Hostel                             | `school:read`  | □      |
| SCL-33 | `/school/announcements`                    | Announcements                      | `school:write` | □      |
| SCL-34 | `/school/calendar`                         | Academic calendar                  | `school:read`  | □      |

---

## 18. Medical clinic vertical

Verticals: medical. Phase 7 shipped — MED-01 through MED-32. Vertical workspace dashboard composes via `MedicalDashboardLayout` (KPI row + today's schedule + lab inbox + refills/recalls + billing snapshot).

### Provider workspace

| ID     | Path                                          | Title                                  | Status |
| ------ | --------------------------------------------- | -------------------------------------- | ------ |
| MED-01 | `/app/medical`                                | Medical workspace (redirects)          | ✅      |
| MED-02 | `/app/medical/patients`                       | Patient panel                          | ✅      |
| MED-03 | `/app/medical/patients/:id`                   | Chart shell + summary tab              | ✅      |
| MED-04 | `/app/medical/patients/:id/problems`          | Problem list (ICD-10 add)              | ✅      |
| MED-05 | `/app/medical/patients/:id/allergies`         | Allergies (regional allergen picker)   | ✅      |
| MED-06 | `/app/medical/patients/:id/medications`       | Medications + Rx pad                   | ✅      |
| MED-07 | `/app/medical/patients/:id/immunizations`     | Immunizations (CVX, ACIP due-list)     | ✅      |
| MED-08 | `/app/medical/patients/:id/vitals`            | Vitals flowsheet + recorder            | ✅      |
| MED-09 | `/app/medical/patients/:id/growth`            | Pediatric growth (WHO 0–24mo / CDC)    | ✅      |
| MED-10 | `/app/medical/patients/:id/pregnancy`         | Prenatal flowsheet + ultrasounds       | ✅      |
| MED-11 | `/app/medical/patients/:id/labs`              | Patient-scoped lab list                | ✅      |
| MED-12 | `/app/medical/patients/:id/imaging`           | Imaging studies                        | ✅      |
| MED-13 | `/app/medical/patients/:id/history`           | Family + social history                | ✅      |
| MED-14 | `/app/medical/patients/:id/documents`         | Inbound documents + faxes              | ✅      |
| MED-15 | `/app/medical/patients/:id/encounters`        | Encounter timeline                     | ✅      |
| MED-16 | `/app/medical/patients/:id/care-plan`         | Care plan + goals                      | ✅      |
| MED-17 | `/app/medical/patients/:id/billing`           | Coverage + claims for patient          | ✅      |
| MED-18 | `/app/medical/patients/:id/audit`             | Chart-scoped access log                | ✅      |
| MED-19 | `/app/medical/patients/:id/psych`             | Psych scales (PHQ-9, GAD-7, etc.)      | ✅      |

### Clinical workflows + worklists

| ID     | Path                                          | Title                                  | Status |
| ------ | --------------------------------------------- | -------------------------------------- | ------ |
| MED-20 | `/app/medical/encounters/:id`                 | Encounter shell + SOAP editor          | ✅      |
| MED-21 | `/app/medical/encounters/:id/superbill`       | Superbill builder (CMS-1500 shape)     | ✅      |
| MED-22 | `/app/medical/telehealth/:id`                 | Telehealth provider room               | ✅      |
| MED-23 | `/app/medical/schedule`                       | Day/Week schedule grid                 | ✅      |
| MED-24 | `/app/medical/front-desk`                     | Front-desk arrival pipeline            | ✅      |
| MED-25 | `/app/medical/recalls`                        | Recall worklist                        | ✅      |
| MED-26 | `/app/medical/labs/inbox`                     | Lab inbox (sign / notify)              | ✅      |
| MED-27 | `/app/medical/labs/:id`                       | Lab report detail + trend              | ✅      |
| MED-28 | `/app/medical/imaging/:id`                    | Imaging study detail + PACS link       | ✅      |
| MED-29 | `/app/medical/rx/refills`                     | Refill queue                           | ✅      |
| MED-30 | `/app/medical/billing`                        | Claims worklist                        | ✅      |
| MED-31 | `/app/medical/billing/:id`                    | Claim detail + payment posting         | ✅      |
| MED-32 | `/app/medical/admin/clinical-locale`          | Clinical-locale settings               | ✅      |
| MED-33 | `/app/medical/admin/audit`                    | Tenant-wide audit overview             | ✅      |

### Patient portal (separate sub-app, lean shell)

| ID      | Path                       | Title                          | Status |
| ------- | -------------------------- | ------------------------------ | ------ |
| MEDP-01 | `/portal`                  | Portal home                    | ✅      |
| MEDP-02 | `/portal/appointments`     | Patient appointments           | ✅      |
| MEDP-03 | `/portal/messages`         | Patient ↔ care-team messages   | ✅      |
| MEDP-04 | `/portal/results`          | Released test results          | ✅      |
| MEDP-05 | `/portal/medications`      | Active prescriptions + refills | ✅      |
| MEDP-06 | `/portal/billing`          | Statements + payment           | ✅      |

---

## 19. Law firm vertical

| ID     | Path                              | Title                      | Status |
| ------ | --------------------------------- | -------------------------- | ------ |
| LAW-01 | `/law`                            | Firm dashboard             | □      |
| LAW-02 | `/law/cases`                      | Cases / matters            | □      |
| LAW-03 | `/law/cases/new`                  | New case                   | □      |
| LAW-04 | `/law/cases/:id`                  | Case detail                | □      |
| LAW-05 | `/law/cases/:id/documents`        | Case documents             | □      |
| LAW-06 | `/law/cases/:id/court-dates`      | Court dates                | □      |
| LAW-07 | `/law/cases/:id/time-entries`     | Time entries               | □      |
| LAW-08 | `/law/clients`                    | Clients                    | □      |
| LAW-09 | `/law/conflicts`                  | Conflict checks            | □      |
| LAW-10 | `/law/trust-accounting`           | Trust accounting           | □      |

---

## 20. Restaurant vertical

| ID     | Path                              | Title                      | Status |
| ------ | --------------------------------- | -------------------------- | ------ |
| RST-01 | `/restaurant`                     | Restaurant dashboard       | □      |
| RST-02 | `/restaurant/menu`                | Menu                       | □      |
| RST-03 | `/restaurant/menu/categories`     | Categories                 | □      |
| RST-04 | `/restaurant/tables`              | Tables / floor map         | □      |
| RST-05 | `/restaurant/reservations`        | Reservations               | □      |
| RST-06 | `/restaurant/orders`              | Orders                     | □      |
| RST-07 | `/restaurant/orders/new`          | New order (POS)            | □      |
| RST-08 | `/restaurant/kds`                 | Kitchen display            | □      |
| RST-09 | `/restaurant/inventory`           | Inventory                  | □      |
| RST-10 | `/restaurant/suppliers`           | Suppliers                  | □      |
| RST-11 | `/restaurant/recipes`             | Recipes                    | □      |
| RST-12 | `/restaurant/shifts`              | Staff shifts               | □      |

---

## 21. Gym vertical

| ID     | Path                              | Title                  | Status |
| ------ | --------------------------------- | ---------------------- | ------ |
| GYM-01 | `/gym`                            | Gym dashboard          | □      |
| GYM-02 | `/gym/members`                    | Members                | □      |
| GYM-03 | `/gym/members/:id`                | Member detail          | □      |
| GYM-04 | `/gym/memberships`                | Memberships / plans    | □      |
| GYM-05 | `/gym/classes`                    | Classes                | □      |
| GYM-06 | `/gym/classes/:id/bookings`       | Class bookings         | □      |
| GYM-07 | `/gym/trainers`                   | Trainers               | □      |
| GYM-08 | `/gym/equipment`                  | Equipment              | □      |
| GYM-09 | `/gym/workouts`                   | Workout plans          | □      |
| GYM-10 | `/gym/nutrition`                  | Nutrition plans        | □      |

---

## 22. Salon / spa vertical

| ID     | Path                              | Title                  | Status |
| ------ | --------------------------------- | ---------------------- | ------ |
| SAL-01 | `/salon`                          | Salon dashboard        | □      |
| SAL-02 | `/salon/clients`                  | Clients                | □      |
| SAL-03 | `/salon/services`                 | Services menu          | □      |
| SAL-04 | `/salon/stylists`                 | Stylists               | □      |
| SAL-05 | `/salon/appointments`             | Appointments           | □      |
| SAL-06 | `/salon/inventory`                | Inventory              | □      |
| SAL-07 | `/salon/loyalty`                  | Loyalty programs       | □      |
| SAL-08 | `/salon/packages`                 | Packages / memberships | □      |

---

## 23. Retail vertical

| ID     | Path                              | Title                | Status |
| ------ | --------------------------------- | -------------------- | ------ |
| RTL-01 | `/retail`                         | Retail dashboard     | □      |
| RTL-02 | `/retail/products`                | Products             | □      |
| RTL-03 | `/retail/products/new`            | New product          | □      |
| RTL-04 | `/retail/pos`                     | POS                  | □      |
| RTL-05 | `/retail/inventory`               | Inventory            | □      |
| RTL-06 | `/retail/suppliers`               | Suppliers            | □      |
| RTL-07 | `/retail/returns`                 | Returns              | □      |
| RTL-08 | `/retail/promotions`              | Promotions           | □      |
| RTL-09 | `/retail/loyalty`                 | Loyalty              | □      |

---

## 24. Platform admin (super-admin only)

Permissions: `platform:admin` (BOS staff only).

| ID     | Path                                  | Title                       | Status |
| ------ | ------------------------------------- | --------------------------- | ------ |
| PLT-01 | `/admin/tenants`                      | All tenants                 | □      |
| PLT-02 | `/admin/tenants/:id`                  | Tenant detail               | □      |
| PLT-03 | `/admin/tenants/:id/impersonate`      | Impersonate (audited)       | □      |
| PLT-04 | `/admin/plans`                        | Plans & pricing             | □      |
| PLT-05 | `/admin/feature-flags`                | Global feature flags        | □      |
| PLT-06 | `/admin/audit`                        | Cross-tenant audit          | □      |
| PLT-07 | `/admin/system-health`                | System health               | □      |
| PLT-08 | `/admin/announcements`                | Platform announcements      | □      |

---

## 25. Public (unauthenticated)

| ID     | Path                              | Title                      | Status |
| ------ | --------------------------------- | -------------------------- | ------ |
| PUB-01 | `/booking/:tenantSlug`            | Public booking             | ✓      |
| PUB-02 | `/p/:tenantSlug/:formSlug`        | Public form (intake)       | □      |
| PUB-03 | `/share/:token`                   | Public document share      | □      |
| PUB-04 | `/error/404`                      | Not found                  | □      |
| PUB-05 | `/error/500`                      | Server error               | □      |
| PUB-06 | `/error/maintenance`              | Maintenance                | □      |

---

## How to extend this inventory

- Adding a screen: append to the right module table; assign next free ID;
  status `□`.
- Removing a screen: don't delete the row — strike through with `~~ID~~`
  and add a one-line note in the Status column.
- Renaming a path: change Path; ID stays.
- Adding a new vertical: copy the structure of §16 (Dental) and start
  from `XYZ-01`.

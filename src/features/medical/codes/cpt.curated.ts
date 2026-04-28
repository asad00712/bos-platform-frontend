/**
 * Curated CPT / HCPCS subset for ambulatory billing demos.
 *
 * Important: CPT is owned by the AMA and requires a license for
 * full distribution. This list is a small clinically-relevant subset
 * used to drive picker UX; it does not constitute a CPT redistribution
 * or substitute for the licensed code set.
 */

export type CptEntry = {
  code: string
  display: string
  /** E/M, procedure, immunization, etc. */
  category:
    | 'em_office'
    | 'em_telehealth'
    | 'em_preventive'
    | 'procedure'
    | 'immunization_admin'
    | 'lab_in_office'
    | 'imaging'
}

export const CPT: CptEntry[] = [
  /* E/M established outpatient */
  { code: '99202', display: 'New patient office visit, straightforward (15–29 min)', category: 'em_office' },
  { code: '99203', display: 'New patient office visit, low MDM (30–44 min)', category: 'em_office' },
  { code: '99204', display: 'New patient office visit, moderate MDM (45–59 min)', category: 'em_office' },
  { code: '99205', display: 'New patient office visit, high MDM (60–74 min)', category: 'em_office' },
  { code: '99211', display: 'Established patient nurse visit', category: 'em_office' },
  { code: '99212', display: 'Established patient office visit, straightforward (10–19 min)', category: 'em_office' },
  { code: '99213', display: 'Established patient office visit, low MDM (20–29 min)', category: 'em_office' },
  { code: '99214', display: 'Established patient office visit, moderate MDM (30–39 min)', category: 'em_office' },
  { code: '99215', display: 'Established patient office visit, high MDM (40–54 min)', category: 'em_office' },

  /* preventive */
  { code: '99381', display: 'Preventive infant exam (<1 yr), new', category: 'em_preventive' },
  { code: '99382', display: 'Preventive exam, 1–4 yr, new', category: 'em_preventive' },
  { code: '99391', display: 'Preventive infant exam (<1 yr), established', category: 'em_preventive' },
  { code: '99392', display: 'Preventive exam, 1–4 yr, established', category: 'em_preventive' },
  { code: '99395', display: 'Preventive exam, 18–39 yr, established', category: 'em_preventive' },
  { code: '99396', display: 'Preventive exam, 40–64 yr, established', category: 'em_preventive' },

  /* telehealth */
  { code: '99421', display: 'Online digital E/M, 5–10 minutes', category: 'em_telehealth' },
  { code: '99422', display: 'Online digital E/M, 11–20 minutes', category: 'em_telehealth' },
  { code: '99423', display: 'Online digital E/M, 21+ minutes', category: 'em_telehealth' },

  /* common procedures */
  { code: '12001', display: 'Simple repair of superficial wounds (≤2.5 cm)', category: 'procedure' },
  { code: '17110', display: 'Destruction of benign skin lesions (≤14)', category: 'procedure' },
  { code: '69210', display: 'Removal of impacted cerumen, one or both ears', category: 'procedure' },
  { code: '93000', display: 'ECG with at least 12 leads, with interpretation and report', category: 'procedure' },
  { code: '94640', display: 'Pressurized inhalation treatment for acute airway obstruction', category: 'procedure' },
  { code: '20610', display: 'Major joint or bursa arthrocentesis or injection', category: 'procedure' },

  /* immunization administration */
  { code: '90460', display: 'Immunization admin, <19 yr, with counseling, first component', category: 'immunization_admin' },
  { code: '90461', display: 'Immunization admin, <19 yr, each additional component', category: 'immunization_admin' },
  { code: '90471', display: 'Immunization admin, percutaneous/intramuscular, first', category: 'immunization_admin' },
  { code: '90472', display: 'Immunization admin, each additional', category: 'immunization_admin' },

  /* in-office labs / waived */
  { code: '81002', display: 'Urinalysis, dip stick, manual, non-automated', category: 'lab_in_office' },
  { code: '85651', display: 'ESR, non-automated', category: 'lab_in_office' },
  { code: '83036', display: 'Hemoglobin A1c', category: 'lab_in_office' },
]

export const CPT_MODIFIERS: { code: string; display: string }[] = [
  { code: '25', display: 'Significant, separately identifiable E/M same day' },
  { code: '59', display: 'Distinct procedural service' },
  { code: '50', display: 'Bilateral procedure' },
  { code: '76', display: 'Repeat procedure by same physician' },
  { code: '77', display: 'Repeat procedure by another physician' },
  { code: '91', display: 'Repeat clinical diagnostic lab' },
  { code: 'RT', display: 'Right side' },
  { code: 'LT', display: 'Left side' },
  { code: '95', display: 'Synchronous telemedicine via real-time interactive A/V' },
  { code: 'GT', display: 'Telehealth via interactive A/V (legacy)' },
]

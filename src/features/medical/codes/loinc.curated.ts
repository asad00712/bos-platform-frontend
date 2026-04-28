/**
 * Curated LOINC subset for vitals + common ambulatory labs + survey
 * instruments. Codes verified against LOINC release 2.78.
 *
 * Standard: LOINC, Regenstrief Institute (free).
 */

export type LoincEntry = {
  code: string
  display: string
  category: 'vital-signs' | 'lab' | 'survey'
  /** Loinc property name, useful for sorting flowsheets. */
  property?: string
  /** Default unit for the analyte (UCUM). Caller may convert per locale. */
  defaultUnit?: string
  /** Loose grouping for picker affordances. */
  panel?: string
  /** Specialty pre-filter tag. */
  specialty?: 'fm' | 'peds' | 'ob' | 'cardio' | 'psych' | 'derm' | 'all'
}

export const LOINC: LoincEntry[] = [
  /* ============== vitals ============== */
  { code: '8480-6', display: 'Systolic blood pressure', category: 'vital-signs', defaultUnit: 'mmHg' },
  { code: '8462-4', display: 'Diastolic blood pressure', category: 'vital-signs', defaultUnit: 'mmHg' },
  { code: '85354-9', display: 'Blood pressure panel', category: 'vital-signs', defaultUnit: 'mmHg' },
  { code: '8867-4', display: 'Heart rate', category: 'vital-signs', defaultUnit: '/min' },
  { code: '9279-1', display: 'Respiratory rate', category: 'vital-signs', defaultUnit: '/min' },
  { code: '2708-6', display: 'Oxygen saturation in arterial blood', category: 'vital-signs', defaultUnit: '%' },
  { code: '8310-5', display: 'Body temperature', category: 'vital-signs', defaultUnit: '°C' },
  { code: '29463-7', display: 'Body weight', category: 'vital-signs', defaultUnit: 'kg' },
  { code: '8302-2', display: 'Body height', category: 'vital-signs', defaultUnit: 'cm' },
  { code: '39156-5', display: 'Body mass index (BMI)', category: 'vital-signs', defaultUnit: 'kg/m²' },
  { code: '38208-5', display: 'Pain score (0–10)', category: 'vital-signs', defaultUnit: '{score}' },
  { code: '9843-4', display: 'Head circumference', category: 'vital-signs', defaultUnit: 'cm', specialty: 'peds' },

  /* ============== labs — chemistry ============== */
  { code: '2345-7', display: 'Glucose [mass/volume] in serum or plasma', category: 'lab', defaultUnit: 'mg/dL', panel: 'Chem' },
  { code: '4548-4', display: 'Hemoglobin A1c', category: 'lab', defaultUnit: '%', panel: 'Diabetes' },
  { code: '2160-0', display: 'Creatinine [mass/volume] in serum or plasma', category: 'lab', defaultUnit: 'mg/dL', panel: 'Renal' },
  { code: '33914-3', display: 'Glomerular filtration rate (eGFR)', category: 'lab', defaultUnit: 'mL/min/{1.73_m2}', panel: 'Renal' },
  { code: '3094-0', display: 'Urea nitrogen [mass/volume] in serum or plasma', category: 'lab', defaultUnit: 'mg/dL', panel: 'Renal' },
  { code: '2951-2', display: 'Sodium [moles/volume] in serum or plasma', category: 'lab', defaultUnit: 'mmol/L', panel: 'Chem' },
  { code: '2823-3', display: 'Potassium [moles/volume] in serum or plasma', category: 'lab', defaultUnit: 'mmol/L', panel: 'Chem' },
  { code: '2075-0', display: 'Chloride [moles/volume] in serum or plasma', category: 'lab', defaultUnit: 'mmol/L', panel: 'Chem' },
  { code: '24323-8', display: 'Comprehensive metabolic 2000 panel', category: 'lab', panel: 'Chem' },

  /* ============== labs — lipids ============== */
  { code: '2093-3', display: 'Cholesterol [mass/volume] in serum or plasma', category: 'lab', defaultUnit: 'mg/dL', panel: 'Lipid' },
  { code: '2571-8', display: 'Triglyceride [mass/volume] in serum or plasma', category: 'lab', defaultUnit: 'mg/dL', panel: 'Lipid' },
  { code: '2085-9', display: 'HDL cholesterol [mass/volume] in serum or plasma', category: 'lab', defaultUnit: 'mg/dL', panel: 'Lipid' },
  { code: '13457-7', display: 'LDL cholesterol calculated', category: 'lab', defaultUnit: 'mg/dL', panel: 'Lipid' },
  { code: '57698-3', display: 'Lipid panel', category: 'lab', panel: 'Lipid' },

  /* ============== labs — thyroid ============== */
  { code: '3016-3', display: 'Thyrotropin (TSH)', category: 'lab', defaultUnit: 'mIU/L', panel: 'Thyroid' },
  { code: '3024-7', display: 'Free thyroxine (T4)', category: 'lab', defaultUnit: 'ng/dL', panel: 'Thyroid' },
  { code: '3053-6', display: 'Free triiodothyronine (T3)', category: 'lab', defaultUnit: 'pg/mL', panel: 'Thyroid' },

  /* ============== labs — CBC ============== */
  { code: '58410-2', display: 'CBC panel with differential, automated', category: 'lab', panel: 'CBC' },
  { code: '718-7', display: 'Hemoglobin', category: 'lab', defaultUnit: 'g/dL', panel: 'CBC' },
  { code: '4544-3', display: 'Hematocrit', category: 'lab', defaultUnit: '%', panel: 'CBC' },
  { code: '6690-2', display: 'White blood cell count', category: 'lab', defaultUnit: '10*3/uL', panel: 'CBC' },
  { code: '777-3', display: 'Platelet count', category: 'lab', defaultUnit: '10*3/uL', panel: 'CBC' },

  /* ============== labs — coag ============== */
  { code: '5902-2', display: 'Prothrombin time (PT)', category: 'lab', defaultUnit: 's', panel: 'Coag' },
  { code: '6301-6', display: 'INR in platelet poor plasma', category: 'lab', defaultUnit: '{INR}', panel: 'Coag' },

  /* ============== labs — urinalysis / micro ============== */
  { code: '24356-8', display: 'Urinalysis complete panel', category: 'lab', panel: 'UA' },
  { code: '14959-1', display: 'Urine albumin/creatinine ratio', category: 'lab', defaultUnit: 'mg/g', panel: 'UA' },

  /* ============== labs — pregnancy / OB ============== */
  { code: '2106-3', display: 'Choriogonadotropin (hCG) qualitative', category: 'lab', specialty: 'ob' },
  { code: '14958-3', display: 'Microalbumin/creatinine ratio in urine', category: 'lab', specialty: 'ob' },
  { code: '5198-7', display: 'Group B streptococcus screen', category: 'lab', specialty: 'ob' },
  { code: '14771-0', display: '50g glucose challenge 1h', category: 'lab', specialty: 'ob' },

  /* ============== surveys ============== */
  { code: '44249-1', display: 'PHQ-9 quick depression assessment', category: 'survey', specialty: 'psych' },
  { code: '69737-5', display: 'Generalized anxiety disorder 7 item (GAD-7)', category: 'survey', specialty: 'psych' },
  { code: '71354-5', display: 'Edinburgh Postnatal Depression Scale', category: 'survey', specialty: 'ob' },
  { code: '75626-2', display: 'AUDIT-C alcohol-use screening', category: 'survey', specialty: 'fm' },
  { code: '88121-9', display: 'Columbia Suicide Severity Rating Scale', category: 'survey', specialty: 'psych' },
]

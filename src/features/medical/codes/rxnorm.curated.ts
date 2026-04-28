/**
 * Curated RxNorm subset — common ambulatory medications. Each entry
 * carries the INN/USAN generic name plus locale-specific brand
 * variants so prescribers see the right label and patients can match
 * what they were dispensed.
 *
 * The `rxcui` is RxNorm's internal concept identifier; we use it as a
 * stable foreign key but display always leads with INN per medical-
 * locale rule §15.1 of the research doc.
 */

export type RxNormForm = 'tablet' | 'capsule' | 'oral_solution' | 'oral_susp' | 'inhaler' | 'injectable' | 'patch' | 'cream' | 'drops' | 'spray'

export type RxNormStrength = {
  /** e.g. "10 mg", "5 mg/5 mL", "100 mcg/spray". */
  label: string
  /** Numeric magnitude in display unit (for dose-range checks). */
  magnitude: number
  /** UCUM unit. */
  unit: string
  /** Form for this specific strength. */
  form: RxNormForm
}

export type RxNormEntry = {
  rxcui: string
  /** International Nonproprietary Name (WHO INN) — primary display. */
  inn: string
  /** Locale-specific brand names. Key is locale or 'global'; value is array. */
  brands: Partial<Record<'global' | 'us' | 'uk' | 'eu' | 'sa' | 'pk' | 'in', string[]>>
  /** Therapeutic class for grouping in order sets and DDI logic. */
  classes: string[]
  /** ATC code (WHO) where useful for EU/global tenants. */
  atc?: string
  strengths: RxNormStrength[]
  /** Default route — overridable in the SIG builder. */
  defaultRoute: 'PO' | 'IV' | 'IM' | 'SQ' | 'INH' | 'TOP' | 'SL' | 'PR' | 'OPHTH'
  /** Controlled substance schedule (US DEA). */
  controlled?: 'CII' | 'CIII' | 'CIV' | 'CV'
  /** Pregnancy risk per prescriber-facing tooltip. */
  pregnancyNote?: string
  /** Common indications used by the SIG suggester. */
  indications?: string[]
}

export const RXNORM: RxNormEntry[] = [
  /* analgesics + antipyretic */
  {
    rxcui: '161',
    inn: 'paracetamol',
    brands: { us: ['acetaminophen', 'Tylenol'], uk: ['Panadol'], global: ['Panadol'], sa: ['Panadol'], pk: ['Panadol'] },
    classes: ['analgesic', 'antipyretic'],
    atc: 'N02BE01',
    strengths: [
      { label: '500 mg', magnitude: 500, unit: 'mg', form: 'tablet' },
      { label: '650 mg', magnitude: 650, unit: 'mg', form: 'tablet' },
      { label: '160 mg/5 mL', magnitude: 32, unit: 'mg/mL', form: 'oral_susp' },
    ],
    defaultRoute: 'PO',
    indications: ['Pain', 'Fever'],
  },
  {
    rxcui: '5640',
    inn: 'ibuprofen',
    brands: { us: ['Advil', 'Motrin'], uk: ['Nurofen'], global: ['Brufen'] },
    classes: ['nsaid', 'analgesic'],
    atc: 'M01AE01',
    strengths: [
      { label: '200 mg', magnitude: 200, unit: 'mg', form: 'tablet' },
      { label: '400 mg', magnitude: 400, unit: 'mg', form: 'tablet' },
      { label: '600 mg', magnitude: 600, unit: 'mg', form: 'tablet' },
      { label: '100 mg/5 mL', magnitude: 20, unit: 'mg/mL', form: 'oral_susp' },
    ],
    defaultRoute: 'PO',
    indications: ['Pain', 'Fever', 'Inflammation'],
  },

  /* antibiotics */
  {
    rxcui: '723',
    inn: 'amoxicillin',
    brands: { us: ['Amoxil'], global: ['Amoxil'] },
    classes: ['penicillin', 'antibiotic'],
    atc: 'J01CA04',
    strengths: [
      { label: '250 mg', magnitude: 250, unit: 'mg', form: 'capsule' },
      { label: '500 mg', magnitude: 500, unit: 'mg', form: 'capsule' },
      { label: '125 mg/5 mL', magnitude: 25, unit: 'mg/mL', form: 'oral_susp' },
      { label: '250 mg/5 mL', magnitude: 50, unit: 'mg/mL', form: 'oral_susp' },
    ],
    defaultRoute: 'PO',
    indications: ['Otitis media', 'Sinusitis', 'Pharyngitis', 'Pneumonia'],
  },
  {
    rxcui: '1672',
    inn: 'azithromycin',
    brands: { us: ['Zithromax', 'Z-Pak'], global: ['Zithromax'] },
    classes: ['macrolide', 'antibiotic'],
    atc: 'J01FA10',
    strengths: [
      { label: '250 mg', magnitude: 250, unit: 'mg', form: 'tablet' },
      { label: '500 mg', magnitude: 500, unit: 'mg', form: 'tablet' },
      { label: '200 mg/5 mL', magnitude: 40, unit: 'mg/mL', form: 'oral_susp' },
    ],
    defaultRoute: 'PO',
    indications: ['Bronchitis', 'Pneumonia', 'Pharyngitis'],
  },

  /* cardiometabolic */
  {
    rxcui: '6809',
    inn: 'metformin',
    brands: { us: ['Glucophage'], global: ['Glucophage'] },
    classes: ['biguanide'],
    atc: 'A10BA02',
    strengths: [
      { label: '500 mg', magnitude: 500, unit: 'mg', form: 'tablet' },
      { label: '850 mg', magnitude: 850, unit: 'mg', form: 'tablet' },
      { label: '1000 mg', magnitude: 1000, unit: 'mg', form: 'tablet' },
    ],
    defaultRoute: 'PO',
    indications: ['Type 2 diabetes'],
  },
  {
    rxcui: '29046',
    inn: 'lisinopril',
    brands: { us: ['Prinivil', 'Zestril'] },
    classes: ['ace_inhibitor'],
    atc: 'C09AA03',
    strengths: [
      { label: '5 mg', magnitude: 5, unit: 'mg', form: 'tablet' },
      { label: '10 mg', magnitude: 10, unit: 'mg', form: 'tablet' },
      { label: '20 mg', magnitude: 20, unit: 'mg', form: 'tablet' },
    ],
    defaultRoute: 'PO',
    pregnancyNote: 'Contraindicated in pregnancy (ACE inhibitor — fetal harm).',
    indications: ['Hypertension', 'Heart failure'],
  },
  {
    rxcui: '6918',
    inn: 'metoprolol',
    brands: { us: ['Lopressor', 'Toprol XL'] },
    classes: ['beta_blocker'],
    atc: 'C07AB02',
    strengths: [
      { label: '25 mg (succinate ER)', magnitude: 25, unit: 'mg', form: 'tablet' },
      { label: '50 mg (succinate ER)', magnitude: 50, unit: 'mg', form: 'tablet' },
      { label: '50 mg (tartrate)', magnitude: 50, unit: 'mg', form: 'tablet' },
      { label: '100 mg (tartrate)', magnitude: 100, unit: 'mg', form: 'tablet' },
    ],
    defaultRoute: 'PO',
    indications: ['Hypertension', 'Atrial fibrillation', 'Heart failure'],
  },
  {
    rxcui: '83367',
    inn: 'atorvastatin',
    brands: { us: ['Lipitor'], global: ['Lipitor'] },
    classes: ['statin'],
    atc: 'C10AA05',
    strengths: [
      { label: '10 mg', magnitude: 10, unit: 'mg', form: 'tablet' },
      { label: '20 mg', magnitude: 20, unit: 'mg', form: 'tablet' },
      { label: '40 mg', magnitude: 40, unit: 'mg', form: 'tablet' },
      { label: '80 mg', magnitude: 80, unit: 'mg', form: 'tablet' },
    ],
    defaultRoute: 'PO',
    pregnancyNote: 'Contraindicated in pregnancy.',
    indications: ['Hyperlipidemia', 'ASCVD risk reduction'],
  },
  {
    rxcui: '11289',
    inn: 'warfarin',
    brands: { us: ['Coumadin', 'Jantoven'] },
    classes: ['anticoagulant_vka'],
    atc: 'B01AA03',
    strengths: [
      { label: '1 mg', magnitude: 1, unit: 'mg', form: 'tablet' },
      { label: '2.5 mg', magnitude: 2.5, unit: 'mg', form: 'tablet' },
      { label: '5 mg', magnitude: 5, unit: 'mg', form: 'tablet' },
    ],
    defaultRoute: 'PO',
    pregnancyNote: 'Contraindicated in pregnancy (teratogenic).',
    indications: ['Atrial fibrillation', 'DVT/PE', 'Mechanical valve'],
  },
  {
    rxcui: '1364430',
    inn: 'apixaban',
    brands: { us: ['Eliquis'], global: ['Eliquis'] },
    classes: ['anticoagulant_doac'],
    atc: 'B01AF02',
    strengths: [
      { label: '2.5 mg', magnitude: 2.5, unit: 'mg', form: 'tablet' },
      { label: '5 mg', magnitude: 5, unit: 'mg', form: 'tablet' },
    ],
    defaultRoute: 'PO',
    indications: ['Atrial fibrillation', 'DVT/PE'],
  },

  /* respiratory */
  {
    rxcui: '435',
    inn: 'salbutamol',
    brands: { us: ['albuterol', 'ProAir', 'Ventolin'], uk: ['Ventolin'], global: ['Ventolin'] },
    classes: ['saba'],
    atc: 'R03AC02',
    strengths: [
      { label: '90 mcg/spray inhaler', magnitude: 90, unit: 'mcg', form: 'inhaler' },
      { label: '2.5 mg/3 mL nebulizer', magnitude: 2.5, unit: 'mg', form: 'oral_solution' },
    ],
    defaultRoute: 'INH',
    indications: ['Asthma', 'Bronchospasm'],
  },
  {
    rxcui: '745679',
    inn: 'fluticasone/salmeterol',
    brands: { us: ['Advair'], global: ['Seretide'] },
    classes: ['ics_laba'],
    strengths: [
      { label: '100/50 mcg DPI', magnitude: 100, unit: 'mcg', form: 'inhaler' },
      { label: '250/50 mcg DPI', magnitude: 250, unit: 'mcg', form: 'inhaler' },
      { label: '500/50 mcg DPI', magnitude: 500, unit: 'mcg', form: 'inhaler' },
    ],
    defaultRoute: 'INH',
    indications: ['Asthma', 'COPD'],
  },

  /* GI */
  {
    rxcui: '7646',
    inn: 'omeprazole',
    brands: { us: ['Prilosec'], global: ['Losec'] },
    classes: ['ppi'],
    atc: 'A02BC01',
    strengths: [
      { label: '20 mg', magnitude: 20, unit: 'mg', form: 'capsule' },
      { label: '40 mg', magnitude: 40, unit: 'mg', form: 'capsule' },
    ],
    defaultRoute: 'PO',
    indications: ['GERD', 'Peptic ulcer'],
  },

  /* psych */
  {
    rxcui: '36437',
    inn: 'sertraline',
    brands: { us: ['Zoloft'], global: ['Lustral'] },
    classes: ['ssri'],
    atc: 'N06AB06',
    strengths: [
      { label: '25 mg', magnitude: 25, unit: 'mg', form: 'tablet' },
      { label: '50 mg', magnitude: 50, unit: 'mg', form: 'tablet' },
      { label: '100 mg', magnitude: 100, unit: 'mg', form: 'tablet' },
    ],
    defaultRoute: 'PO',
    indications: ['Major depression', 'Anxiety', 'PTSD'],
  },
  {
    rxcui: '321988',
    inn: 'escitalopram',
    brands: { us: ['Lexapro'], uk: ['Cipralex'] },
    classes: ['ssri'],
    atc: 'N06AB10',
    strengths: [
      { label: '5 mg', magnitude: 5, unit: 'mg', form: 'tablet' },
      { label: '10 mg', magnitude: 10, unit: 'mg', form: 'tablet' },
      { label: '20 mg', magnitude: 20, unit: 'mg', form: 'tablet' },
    ],
    defaultRoute: 'PO',
    indications: ['Major depression', 'Generalized anxiety'],
  },

  /* controlled (US schedule shown — demo only, no EPCS enforcement) */
  {
    rxcui: '7052',
    inn: 'morphine',
    brands: { us: ['MS Contin'] },
    classes: ['opioid'],
    atc: 'N02AA01',
    strengths: [
      { label: '15 mg ER', magnitude: 15, unit: 'mg', form: 'tablet' },
      { label: '30 mg ER', magnitude: 30, unit: 'mg', form: 'tablet' },
    ],
    defaultRoute: 'PO',
    controlled: 'CII',
    pregnancyNote: 'Risk of neonatal opioid withdrawal in chronic use.',
    indications: ['Severe pain'],
  },
  {
    rxcui: '6470',
    inn: 'lorazepam',
    brands: { us: ['Ativan'] },
    classes: ['benzodiazepine'],
    atc: 'N05BA06',
    strengths: [
      { label: '0.5 mg', magnitude: 0.5, unit: 'mg', form: 'tablet' },
      { label: '1 mg', magnitude: 1, unit: 'mg', form: 'tablet' },
      { label: '2 mg', magnitude: 2, unit: 'mg', form: 'tablet' },
    ],
    defaultRoute: 'PO',
    controlled: 'CIV',
    pregnancyNote: 'Avoid in pregnancy where possible.',
    indications: ['Acute anxiety', 'Status epilepticus'],
  },

  /* allergy / antihistamine */
  {
    rxcui: '1424',
    inn: 'cetirizine',
    brands: { us: ['Zyrtec'] },
    classes: ['antihistamine_2'],
    atc: 'R06AE07',
    strengths: [
      { label: '5 mg', magnitude: 5, unit: 'mg', form: 'tablet' },
      { label: '10 mg', magnitude: 10, unit: 'mg', form: 'tablet' },
      { label: '5 mg/5 mL', magnitude: 1, unit: 'mg/mL', form: 'oral_solution' },
    ],
    defaultRoute: 'PO',
    indications: ['Allergic rhinitis', 'Urticaria'],
  },

  /* SGLT2 + GLP-1 (modern DM) */
  {
    rxcui: '1545653',
    inn: 'empagliflozin',
    brands: { us: ['Jardiance'], global: ['Jardiance'] },
    classes: ['sglt2'],
    atc: 'A10BK03',
    strengths: [
      { label: '10 mg', magnitude: 10, unit: 'mg', form: 'tablet' },
      { label: '25 mg', magnitude: 25, unit: 'mg', form: 'tablet' },
    ],
    defaultRoute: 'PO',
    indications: ['Type 2 diabetes', 'Heart failure', 'CKD'],
  },
]

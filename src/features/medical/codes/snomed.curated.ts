/**
 * Curated SNOMED CT subset for problem-list entries, allergies, and
 * common procedures. Codes are real SNOMED International concept IDs;
 * displays are the preferred FSN-derived term.
 *
 * Standard: SNOMED International (national license required for redist;
 * citing concept IDs as labels in a demo is fine).
 */

export type SnomedEntry = {
  code: string
  display: string
  category: 'finding' | 'disorder' | 'procedure' | 'substance' | 'situation'
  /** Optional crosswalk to the ICD-10 entry our picker prefers when both exist. */
  icd10?: string
}

export const SNOMED: SnomedEntry[] = [
  /* common findings + disorders */
  { code: '44054006', display: 'Type 2 diabetes mellitus', category: 'disorder', icd10: 'E11.9' },
  { code: '46635009', display: 'Type 1 diabetes mellitus', category: 'disorder', icd10: 'E10.9' },
  { code: '38341003', display: 'Essential hypertension', category: 'disorder', icd10: 'I10' },
  { code: '195967001', display: 'Asthma', category: 'disorder', icd10: 'J45.909' },
  { code: '13645005', display: 'Chronic obstructive lung disease', category: 'disorder', icd10: 'J44.9' },
  { code: '49436004', display: 'Atrial fibrillation', category: 'disorder', icd10: 'I48.91' },
  { code: '84114007', display: 'Heart failure', category: 'disorder', icd10: 'I50.9' },
  { code: '53741008', display: 'Coronary arteriosclerosis', category: 'disorder', icd10: 'I25.10' },
  { code: '40930008', display: 'Hypothyroidism', category: 'disorder', icd10: 'E03.9' },
  { code: '267432004', display: 'Pure hypercholesterolemia', category: 'disorder', icd10: 'E78.00' },
  { code: '414916001', display: 'Obesity', category: 'disorder', icd10: 'E66.9' },
  { code: '198992004', display: 'Iron deficiency anemia', category: 'disorder', icd10: 'D50.9' },
  { code: '370143000', display: 'Major depressive disorder', category: 'disorder', icd10: 'F32.9' },
  { code: '21897009', display: 'Generalized anxiety disorder', category: 'disorder', icd10: 'F41.1' },
  { code: '47505003', display: 'Post-traumatic stress disorder', category: 'disorder', icd10: 'F43.10' },
  { code: '406506008', display: 'Attention deficit hyperactivity disorder', category: 'disorder', icd10: 'F90.9' },
  { code: '24700007', display: 'Multiple sclerosis', category: 'disorder' },
  { code: '396275006', display: 'Osteoarthritis', category: 'disorder', icd10: 'M19.90' },
  { code: '203082005', display: 'Fibromyalgia', category: 'disorder', icd10: 'M79.7' },
  { code: '37796009', display: 'Migraine', category: 'disorder', icd10: 'G43.909' },
  { code: '422504002', display: 'Ischemic stroke', category: 'disorder', icd10: 'I63.9' },
  { code: '236068007', display: 'Gestational diabetes mellitus', category: 'disorder', icd10: 'O24.410' },
  { code: '48194001', display: 'Pregnancy', category: 'situation', icd10: 'Z34.90' },

  /* common allergens (substance category) */
  { code: '7980', display: 'Penicillin', category: 'substance' },
  { code: '387406002', display: 'Sulfonamide', category: 'substance' },
  { code: '372687004', display: 'Amoxicillin', category: 'substance' },
  { code: '256349002', display: 'Peanut', category: 'substance' },
  { code: '227355008', display: 'Shellfish', category: 'substance' },
  { code: '256350002', display: 'Tree nut', category: 'substance' },
  { code: '102263004', display: 'Eggs (edible)', category: 'substance' },
  { code: '226760005', display: 'Wheat', category: 'substance' },
  { code: '102259007', display: 'Cow milk', category: 'substance' },
  { code: '256348005', display: 'Sesame seed', category: 'substance' },
  { code: '111088007', display: 'Latex', category: 'substance' },
  { code: '111103005', display: 'Bee venom', category: 'substance' },
  { code: '256286006', display: 'Date palm pollen', category: 'substance' },
  { code: '410942007', display: 'Drug or medicament', category: 'substance' },

  /* common procedures */
  { code: '33879002', display: 'Administration of vaccine product', category: 'procedure' },
  { code: '410620009', display: 'Well child visit', category: 'procedure' },
  { code: '386053000', display: 'Evaluation procedure', category: 'procedure' },
  { code: '171207006', display: 'Depression screening', category: 'procedure' },
  { code: '443488002', display: 'Diabetic foot examination', category: 'procedure' },
  { code: '274441001', display: 'Cervical smear', category: 'procedure' },
  { code: '46680005', display: 'Vital signs', category: 'procedure' },
  { code: '252416005', display: 'Histopathology test', category: 'procedure' },
  { code: '430193006', display: 'Reconciliation of current medications', category: 'procedure' },
]

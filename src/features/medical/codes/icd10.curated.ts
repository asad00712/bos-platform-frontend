/**
 * Curated ICD-10-CM subset for ambulatory primary care.
 *
 * NOT a substitute for a licensed ICD-10 distribution. Picked to cover the
 * top diagnoses encountered in family medicine + pediatrics + OB-GYN +
 * common chronic disease so the demo behaves clinically. Codes follow the
 * 2025 CMS ICD-10-CM release.
 *
 * Source/standard: WHO ICD-10 + CMS/NCHS clinical modification.
 */

export type Icd10Entry = {
  code: string
  display: string
  /** Coarse chapter for picker grouping. */
  chapter: string
  /** Body system tag for fast specialty pre-filtering in the picker. */
  system?:
    | 'cardio'
    | 'endo'
    | 'gi'
    | 'gu'
    | 'hem'
    | 'id'
    | 'msk'
    | 'neuro'
    | 'ob'
    | 'peds'
    | 'psych'
    | 'resp'
    | 'skin'
    | 'misc'
}

export const ICD10: Icd10Entry[] = [
  // Endocrine / metabolic
  { code: 'E11.9', display: 'Type 2 diabetes mellitus without complications', chapter: 'Endocrine', system: 'endo' },
  { code: 'E11.65', display: 'Type 2 diabetes mellitus with hyperglycemia', chapter: 'Endocrine', system: 'endo' },
  { code: 'E11.22', display: 'Type 2 diabetes mellitus with diabetic chronic kidney disease', chapter: 'Endocrine', system: 'endo' },
  { code: 'E10.9', display: 'Type 1 diabetes mellitus without complications', chapter: 'Endocrine', system: 'endo' },
  { code: 'E78.5', display: 'Hyperlipidemia, unspecified', chapter: 'Endocrine', system: 'endo' },
  { code: 'E78.00', display: 'Pure hypercholesterolemia, unspecified', chapter: 'Endocrine', system: 'endo' },
  { code: 'E03.9', display: 'Hypothyroidism, unspecified', chapter: 'Endocrine', system: 'endo' },
  { code: 'E05.90', display: 'Thyrotoxicosis, unspecified', chapter: 'Endocrine', system: 'endo' },
  { code: 'E66.9', display: 'Obesity, unspecified', chapter: 'Endocrine', system: 'endo' },
  { code: 'E55.9', display: 'Vitamin D deficiency, unspecified', chapter: 'Endocrine', system: 'endo' },

  // Cardiovascular
  { code: 'I10', display: 'Essential (primary) hypertension', chapter: 'Circulatory', system: 'cardio' },
  { code: 'I25.10', display: 'Atherosclerotic heart disease of native coronary artery without angina pectoris', chapter: 'Circulatory', system: 'cardio' },
  { code: 'I48.91', display: 'Unspecified atrial fibrillation', chapter: 'Circulatory', system: 'cardio' },
  { code: 'I50.9', display: 'Heart failure, unspecified', chapter: 'Circulatory', system: 'cardio' },
  { code: 'I63.9', display: 'Cerebral infarction, unspecified', chapter: 'Circulatory', system: 'cardio' },

  // Respiratory
  { code: 'J45.909', display: 'Unspecified asthma, uncomplicated', chapter: 'Respiratory', system: 'resp' },
  { code: 'J44.9', display: 'Chronic obstructive pulmonary disease, unspecified', chapter: 'Respiratory', system: 'resp' },
  { code: 'J06.9', display: 'Acute upper respiratory infection, unspecified', chapter: 'Respiratory', system: 'resp' },
  { code: 'J20.9', display: 'Acute bronchitis, unspecified', chapter: 'Respiratory', system: 'resp' },
  { code: 'J30.9', display: 'Allergic rhinitis, unspecified', chapter: 'Respiratory', system: 'resp' },

  // Gastrointestinal
  { code: 'K21.9', display: 'Gastro-esophageal reflux disease without esophagitis', chapter: 'Digestive', system: 'gi' },
  { code: 'K58.9', display: 'Irritable bowel syndrome without diarrhea', chapter: 'Digestive', system: 'gi' },
  { code: 'K59.00', display: 'Constipation, unspecified', chapter: 'Digestive', system: 'gi' },

  // Genitourinary
  { code: 'N39.0', display: 'Urinary tract infection, site not specified', chapter: 'Genitourinary', system: 'gu' },
  { code: 'N18.3', display: 'Chronic kidney disease, stage 3 (moderate)', chapter: 'Genitourinary', system: 'gu' },

  // OB-GYN
  { code: 'Z34.90', display: 'Encounter for supervision of normal pregnancy, unspecified', chapter: 'Pregnancy', system: 'ob' },
  { code: 'Z34.91', display: 'Encounter for supervision of normal pregnancy, first trimester', chapter: 'Pregnancy', system: 'ob' },
  { code: 'O24.410', display: 'Gestational diabetes mellitus in pregnancy, diet controlled', chapter: 'Pregnancy', system: 'ob' },
  { code: 'O14.93', display: 'Unspecified pre-eclampsia, third trimester', chapter: 'Pregnancy', system: 'ob' },
  { code: 'Z39.2', display: 'Encounter for routine postpartum follow-up', chapter: 'Pregnancy', system: 'ob' },

  // Pediatrics
  { code: 'Z00.121', display: 'Encounter for routine child health examination with abnormal findings', chapter: 'Wellness', system: 'peds' },
  { code: 'Z00.129', display: 'Encounter for routine child health examination without abnormal findings', chapter: 'Wellness', system: 'peds' },
  { code: 'H66.90', display: 'Otitis media, unspecified, unspecified ear', chapter: 'Ear', system: 'peds' },
  { code: 'L20.9', display: 'Atopic dermatitis, unspecified', chapter: 'Skin', system: 'peds' },
  { code: 'F90.9', display: 'Attention-deficit hyperactivity disorder, unspecified type', chapter: 'Behavioral', system: 'peds' },

  // Psych / behavioral
  { code: 'F32.9', display: 'Major depressive disorder, single episode, unspecified', chapter: 'Behavioral', system: 'psych' },
  { code: 'F33.1', display: 'Major depressive disorder, recurrent, moderate', chapter: 'Behavioral', system: 'psych' },
  { code: 'F41.1', display: 'Generalized anxiety disorder', chapter: 'Behavioral', system: 'psych' },
  { code: 'F41.9', display: 'Anxiety disorder, unspecified', chapter: 'Behavioral', system: 'psych' },
  { code: 'F43.10', display: 'Post-traumatic stress disorder, unspecified', chapter: 'Behavioral', system: 'psych' },
  { code: 'F50.00', display: 'Eating disorder, unspecified', chapter: 'Behavioral', system: 'psych' },

  // Skin
  { code: 'L70.0', display: 'Acne vulgaris', chapter: 'Skin', system: 'skin' },
  { code: 'D22.5', display: 'Melanocytic nevi of trunk', chapter: 'Skin', system: 'skin' },
  { code: 'L40.0', display: 'Psoriasis vulgaris', chapter: 'Skin', system: 'skin' },

  // Musculoskeletal
  { code: 'M54.5', display: 'Low back pain', chapter: 'Musculoskeletal', system: 'msk' },
  { code: 'M25.561', display: 'Pain in right knee', chapter: 'Musculoskeletal', system: 'msk' },
  { code: 'M79.7', display: 'Fibromyalgia', chapter: 'Musculoskeletal', system: 'msk' },
  { code: 'M19.90', display: 'Unspecified osteoarthritis, unspecified site', chapter: 'Musculoskeletal', system: 'msk' },

  // Neuro
  { code: 'G43.909', display: 'Migraine, unspecified, not intractable, without status migrainosus', chapter: 'Nervous', system: 'neuro' },
  { code: 'G47.00', display: 'Insomnia, unspecified', chapter: 'Nervous', system: 'neuro' },
  { code: 'R51.9', display: 'Headache, unspecified', chapter: 'Symptoms', system: 'neuro' },

  // Hematology / immune
  { code: 'D50.9', display: 'Iron deficiency anemia, unspecified', chapter: 'Blood', system: 'hem' },
  { code: 'D64.9', display: 'Anemia, unspecified', chapter: 'Blood', system: 'hem' },

  // Infectious
  { code: 'B34.9', display: 'Viral infection, unspecified', chapter: 'Infectious', system: 'id' },
  { code: 'A09', display: 'Infectious gastroenteritis and colitis, unspecified', chapter: 'Infectious', system: 'id' },

  // Wellness / preventive
  { code: 'Z00.00', display: 'Encounter for general adult medical examination without abnormal findings', chapter: 'Wellness', system: 'misc' },
  { code: 'Z71.3', display: 'Dietary counseling and surveillance', chapter: 'Wellness', system: 'misc' },
  { code: 'Z23', display: 'Encounter for immunization', chapter: 'Wellness', system: 'misc' },
]

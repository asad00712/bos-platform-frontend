/**
 * Curated CDC CVX vaccine codes covering the routine WHO/CDC schedule
 * and the most common adult/travel additions. CVX is the CDC's vaccine-
 * product code system, the spine of every immunization registry.
 */

export type CvxEntry = {
  code: string
  /** Short display, e.g. "MMR". */
  display: string
  /** Full descriptor. */
  fullName: string
  /** Default route (intramuscular, oral, intranasal, subcutaneous). */
  defaultRoute: 'IM' | 'PO' | 'IN' | 'SQ' | 'INH'
  /** Default site for IM/SQ. */
  defaultSite?: 'left_deltoid' | 'right_deltoid' | 'left_thigh' | 'right_thigh'
  /** ACIP-aligned series schedule expressed as ages-in-months for peds
   *  doses; used by the immunization due-list calculator. */
  schedule?: { ageMonths: number; doseLabel: string }[]
  /** Categories used for filter chips. */
  category: 'routine_peds' | 'adult' | 'travel' | 'seasonal'
}

export const CVX: CvxEntry[] = [
  /* peds primary */
  {
    code: '08',
    display: 'Hep B',
    fullName: 'Hepatitis B vaccine',
    defaultRoute: 'IM',
    defaultSite: 'left_thigh',
    schedule: [
      { ageMonths: 0, doseLabel: 'Birth dose' },
      { ageMonths: 2, doseLabel: 'Dose 2' },
      { ageMonths: 6, doseLabel: 'Dose 3' },
    ],
    category: 'routine_peds',
  },
  {
    code: '20',
    display: 'DTaP',
    fullName: 'Diphtheria, tetanus, acellular pertussis',
    defaultRoute: 'IM',
    defaultSite: 'left_thigh',
    schedule: [
      { ageMonths: 2, doseLabel: 'Dose 1' },
      { ageMonths: 4, doseLabel: 'Dose 2' },
      { ageMonths: 6, doseLabel: 'Dose 3' },
      { ageMonths: 15, doseLabel: 'Dose 4' },
      { ageMonths: 60, doseLabel: 'Dose 5' },
    ],
    category: 'routine_peds',
  },
  {
    code: '17',
    display: 'Hib',
    fullName: 'Haemophilus influenzae type b',
    defaultRoute: 'IM',
    schedule: [
      { ageMonths: 2, doseLabel: 'Dose 1' },
      { ageMonths: 4, doseLabel: 'Dose 2' },
      { ageMonths: 6, doseLabel: 'Dose 3' },
      { ageMonths: 12, doseLabel: 'Booster' },
    ],
    category: 'routine_peds',
  },
  {
    code: '133',
    display: 'PCV13',
    fullName: 'Pneumococcal conjugate vaccine, 13-valent',
    defaultRoute: 'IM',
    schedule: [
      { ageMonths: 2, doseLabel: 'Dose 1' },
      { ageMonths: 4, doseLabel: 'Dose 2' },
      { ageMonths: 6, doseLabel: 'Dose 3' },
      { ageMonths: 12, doseLabel: 'Dose 4' },
    ],
    category: 'routine_peds',
  },
  {
    code: '10',
    display: 'IPV',
    fullName: 'Inactivated polio vaccine',
    defaultRoute: 'IM',
    schedule: [
      { ageMonths: 2, doseLabel: 'Dose 1' },
      { ageMonths: 4, doseLabel: 'Dose 2' },
      { ageMonths: 6, doseLabel: 'Dose 3' },
      { ageMonths: 60, doseLabel: 'Dose 4' },
    ],
    category: 'routine_peds',
  },
  {
    code: '116',
    display: 'Rotavirus',
    fullName: 'Rotavirus, live oral',
    defaultRoute: 'PO',
    schedule: [
      { ageMonths: 2, doseLabel: 'Dose 1' },
      { ageMonths: 4, doseLabel: 'Dose 2' },
      { ageMonths: 6, doseLabel: 'Dose 3' },
    ],
    category: 'routine_peds',
  },
  {
    code: '03',
    display: 'MMR',
    fullName: 'Measles, mumps, rubella',
    defaultRoute: 'SQ',
    schedule: [
      { ageMonths: 12, doseLabel: 'Dose 1' },
      { ageMonths: 60, doseLabel: 'Dose 2' },
    ],
    category: 'routine_peds',
  },
  {
    code: '21',
    display: 'Varicella',
    fullName: 'Varicella vaccine',
    defaultRoute: 'SQ',
    schedule: [
      { ageMonths: 12, doseLabel: 'Dose 1' },
      { ageMonths: 60, doseLabel: 'Dose 2' },
    ],
    category: 'routine_peds',
  },
  {
    code: '83',
    display: 'Hep A',
    fullName: 'Hepatitis A vaccine, pediatric/adolescent',
    defaultRoute: 'IM',
    schedule: [
      { ageMonths: 12, doseLabel: 'Dose 1' },
      { ageMonths: 18, doseLabel: 'Dose 2' },
    ],
    category: 'routine_peds',
  },

  /* adolescent / adult */
  {
    code: '115',
    display: 'Tdap',
    fullName: 'Tetanus, reduced diphtheria, acellular pertussis',
    defaultRoute: 'IM',
    defaultSite: 'left_deltoid',
    category: 'adult',
  },
  {
    code: '62',
    display: 'HPV9',
    fullName: 'Human papillomavirus 9-valent',
    defaultRoute: 'IM',
    category: 'adult',
  },
  {
    code: '114',
    display: 'MenACWY',
    fullName: 'Meningococcal A/C/W/Y conjugate',
    defaultRoute: 'IM',
    category: 'adult',
  },
  {
    code: '163',
    display: 'MenB',
    fullName: 'Meningococcal B recombinant',
    defaultRoute: 'IM',
    category: 'adult',
  },

  /* adult / older adult */
  {
    code: '187',
    display: 'Shingrix',
    fullName: 'Recombinant zoster vaccine',
    defaultRoute: 'IM',
    defaultSite: 'left_deltoid',
    category: 'adult',
  },
  {
    code: '215',
    display: 'PCV15',
    fullName: 'Pneumococcal conjugate vaccine, 15-valent',
    defaultRoute: 'IM',
    category: 'adult',
  },
  {
    code: '216',
    display: 'PCV20',
    fullName: 'Pneumococcal conjugate vaccine, 20-valent',
    defaultRoute: 'IM',
    category: 'adult',
  },
  {
    code: '33',
    display: 'PPSV23',
    fullName: 'Pneumococcal polysaccharide vaccine, 23-valent',
    defaultRoute: 'IM',
    category: 'adult',
  },

  /* seasonal */
  {
    code: '150',
    display: 'Influenza (IIV4)',
    fullName: 'Inactivated quadrivalent influenza vaccine',
    defaultRoute: 'IM',
    category: 'seasonal',
  },
  {
    code: '300',
    display: 'COVID-19',
    fullName: 'COVID-19 vaccine (mRNA, current strain)',
    defaultRoute: 'IM',
    category: 'seasonal',
  },
]

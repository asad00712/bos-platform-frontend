/**
 * Region-aware allergen lists. Mirrors the food-allergen "top-N" lists
 * mandated in each jurisdiction plus a handful of environmental allergens
 * that vary regionally. The picker offers the union and pre-filters by
 * the active locale to surface what each tenant's clinicians expect.
 *
 * Sources: FDA FASTER Act 2023 (US Top 9), EU Annex II of FIC
 * Regulation 1169/2011 (EU 14), FSANZ Standard 1.2.3 (AU/NZ).
 */

export type AllergenEntry = {
  /** Stable internal id; not a code. */
  id: string
  /** Default English display. */
  display: string
  category: 'food' | 'medication' | 'environment' | 'biologic'
  /** Where this allergen is on a regulatory list (informational). */
  regions: ('us' | 'eu' | 'uk' | 'au' | 'gulf' | 'global')[]
  /** SNOMED code if curated in snomed.curated.ts. */
  snomed?: string
}

export const ALLERGENS: AllergenEntry[] = [
  /* food — global core */
  { id: 'milk', display: 'Cow milk', category: 'food', regions: ['global'], snomed: '102259007' },
  { id: 'egg', display: 'Eggs', category: 'food', regions: ['global'], snomed: '102263004' },
  { id: 'fish', display: 'Fish', category: 'food', regions: ['global'] },
  { id: 'shellfish', display: 'Shellfish (crustacean)', category: 'food', regions: ['global'], snomed: '227355008' },
  { id: 'tree_nut', display: 'Tree nuts', category: 'food', regions: ['global'], snomed: '256350002' },
  { id: 'peanut', display: 'Peanut', category: 'food', regions: ['global'], snomed: '256349002' },
  { id: 'wheat', display: 'Wheat', category: 'food', regions: ['global'], snomed: '226760005' },
  { id: 'soy', display: 'Soy', category: 'food', regions: ['global'] },
  { id: 'sesame', display: 'Sesame', category: 'food', regions: ['us', 'eu', 'uk', 'au'], snomed: '256348005' },

  /* food — EU/UK/AU additions */
  { id: 'mustard', display: 'Mustard', category: 'food', regions: ['eu', 'uk', 'au'] },
  { id: 'lupin', display: 'Lupin', category: 'food', regions: ['eu', 'uk', 'au'] },
  { id: 'celery', display: 'Celery', category: 'food', regions: ['eu', 'uk'] },
  { id: 'sulphites', display: 'Sulphites (>10 mg/kg)', category: 'food', regions: ['eu', 'uk', 'au'] },
  { id: 'mollusc', display: 'Molluscs', category: 'food', regions: ['eu', 'uk', 'au'] },

  /* common drug allergens — anchor on SNOMED where available */
  { id: 'penicillin', display: 'Penicillins', category: 'medication', regions: ['global'], snomed: '7980' },
  { id: 'amoxicillin', display: 'Amoxicillin', category: 'medication', regions: ['global'], snomed: '372687004' },
  { id: 'sulfa', display: 'Sulfonamide antibiotics', category: 'medication', regions: ['global'], snomed: '387406002' },
  { id: 'nsaid', display: 'NSAIDs', category: 'medication', regions: ['global'] },
  { id: 'iodine_contrast', display: 'Iodinated contrast media', category: 'medication', regions: ['global'] },
  { id: 'opioid', display: 'Opioids (general)', category: 'medication', regions: ['global'] },

  /* biologic */
  { id: 'latex', display: 'Latex', category: 'biologic', regions: ['global'], snomed: '111088007' },
  { id: 'bee_venom', display: 'Bee venom', category: 'biologic', regions: ['global'], snomed: '111103005' },

  /* environmental — global + regional */
  { id: 'dust_mite', display: 'House dust mite', category: 'environment', regions: ['global'] },
  { id: 'cat_dander', display: 'Cat dander', category: 'environment', regions: ['global'] },
  { id: 'dog_dander', display: 'Dog dander', category: 'environment', regions: ['global'] },
  { id: 'grass_pollen', display: 'Grass pollen (mixed)', category: 'environment', regions: ['global'] },
  { id: 'tree_pollen', display: 'Tree pollen (mixed)', category: 'environment', regions: ['global'] },
  { id: 'date_palm', display: 'Date palm pollen', category: 'environment', regions: ['gulf'], snomed: '256286006' },
  { id: 'camel_dander', display: 'Camel dander', category: 'environment', regions: ['gulf'] },
  { id: 'cockroach', display: 'Cockroach', category: 'environment', regions: ['us', 'global'] },
  { id: 'alternaria', display: 'Alternaria mold', category: 'environment', regions: ['global'] },
]

/** Pick the regional set the picker should pre-filter on for a tenant. */
export function regionForLocale(locale: string): 'us' | 'eu' | 'uk' | 'au' | 'gulf' | 'global' {
  if (locale.startsWith('en-US')) return 'us'
  if (locale.startsWith('en-GB')) return 'uk'
  if (locale.startsWith('en-AU')) return 'au'
  if (locale.startsWith('ar') || locale.startsWith('ur')) return 'gulf'
  if (locale.startsWith('es') || locale.startsWith('fr') || locale.startsWith('de') || locale.startsWith('it')) return 'eu'
  return 'global'
}

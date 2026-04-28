import { AlertOctagon, AlertTriangle, Info, ShieldAlert } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'

export type DDIAlertTier = 'contraindicated' | 'severe' | 'moderate' | 'minor'

export type DDIAlert = {
  id: string
  /** Tier drives banner color, ack ceremony, and severity sort. */
  tier: DDIAlertTier
  /** Drug class or substance pair driving the alert. */
  primary: string
  /** Counterparty drug or class. */
  counter: string
  /** What happens (mechanism). */
  description: string
  /** Patient-relevant action (clinical advice). */
  recommendation: string
  /** ATC / RxClass references when available. */
  reference?: string
  /** Allergic-cross-reactivity → the picker is forbidden, not just risky. */
  allergyHardStop?: boolean
}

const TIER_LABEL: Record<DDIAlertTier, string> = {
  contraindicated: 'Contraindicated',
  severe: 'Severe',
  moderate: 'Moderate',
  minor: 'Minor',
}

const TIER_TONE: Record<DDIAlertTier, string> = {
  contraindicated: 'border-rose-700 bg-rose-600 text-white',
  severe: 'border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  moderate: 'border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  minor: 'border-sky-500/40 bg-sky-500/5 text-sky-700 dark:text-sky-300',
}

const TIER_ICON: Record<DDIAlertTier, typeof AlertOctagon> = {
  contraindicated: AlertOctagon,
  severe: ShieldAlert,
  moderate: AlertTriangle,
  minor: Info,
}

type Props = {
  alerts: DDIAlert[]
  className?: string
}

/**
 * Drug-decision-support alerts list. Ordered by severity. Contraindicated
 * + allergy-cross-reactivity tiers are hard-stops; the consuming form is
 * responsible for blocking the sign action when any such alert exists.
 *
 * Per medical-rule §5: alert fatigue is the enemy. Minor tier is muted
 * by default and never blocks; only severe+ requires a typed override
 * reason — collected by the consuming form, not this component.
 */
export function DDIAlertList({ alerts, className }: Props) {
  if (alerts.length === 0) return null
  const sorted = [...alerts].sort((a, b) => RANK[a.tier] - RANK[b.tier])

  return (
    <ul className={cn('space-y-2', className)} role="list">
      {sorted.map((a) => {
        const Icon = TIER_ICON[a.tier]
        return (
          <li
            key={a.id}
            role="alert"
            aria-live="polite"
            className={cn(
              'flex items-start gap-3 rounded-lg border-2 px-3 py-2.5 text-sm',
              TIER_TONE[a.tier],
            )}
          >
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <Badge variant="outline" className="border-current font-semibold uppercase">
                  {TIER_LABEL[a.tier]}
                </Badge>
                <span className="font-semibold">
                  {a.primary} <span className="text-muted-foreground/70">×</span> {a.counter}
                </span>
                {a.allergyHardStop ? (
                  <Badge variant="outline" className="border-current text-[10px] uppercase">
                    Allergy hard-stop
                  </Badge>
                ) : null}
              </div>
              <p className="leading-snug">{a.description}</p>
              <p className="text-xs leading-snug">
                <span className="font-medium">Recommendation: </span>
                <span>{a.recommendation}</span>
              </p>
              {a.reference ? (
                <p className="text-[11px] text-muted-foreground">{a.reference}</p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

const RANK: Record<DDIAlertTier, number> = {
  contraindicated: 0,
  severe: 1,
  moderate: 2,
  minor: 3,
}

/**
 * Small mock decision-support engine. Real-world EMRs source this from
 * Lexicomp / First Databank / Multum. Our demo encodes a few canonical
 * pairs that exercise each tier so the Rx ceremony has something to
 * trip on.
 *
 * Inputs are RxNorm displays (drug INN strings) plus the patient's
 * allergy substance displays. Returns the union of ddi + allergy cross
 * reactivity hits.
 */
export function evaluateDDI(args: {
  rxDrugInn: string
  patientActiveDrugInns: string[]
  patientAllergyDisplays: string[]
  pregnancyActive: boolean
}): DDIAlert[] {
  const out: DDIAlert[] = []
  const newDrug = args.rxDrugInn.toLowerCase()
  const others = args.patientActiveDrugInns.map((s) => s.toLowerCase())
  const allergies = args.patientAllergyDisplays.map((s) => s.toLowerCase())

  // Allergy cross-reactivity hard stops
  if (
    (newDrug === 'amoxicillin' || newDrug.includes('penicillin')) &&
    allergies.some((a) => a.includes('penicillin'))
  ) {
    out.push({
      id: 'allergy-pcn',
      tier: 'contraindicated',
      primary: args.rxDrugInn,
      counter: 'Penicillin allergy',
      description:
        'Documented penicillin allergy — high risk of anaphylaxis with β-lactam.',
      recommendation: 'Choose a non-β-lactam alternative (e.g. azithromycin) or formal de-labeling.',
      allergyHardStop: true,
    })
  }
  if (
    (newDrug.includes('ibuprofen') || newDrug.includes('naproxen') || newDrug.includes('nsaid')) &&
    allergies.some((a) => a.includes('nsaid'))
  ) {
    out.push({
      id: 'allergy-nsaid',
      tier: 'contraindicated',
      primary: args.rxDrugInn,
      counter: 'NSAID intolerance',
      description: 'Patient has documented NSAID intolerance with prior GI bleed.',
      recommendation: 'Consider acetaminophen or topical analgesic.',
      allergyHardStop: true,
    })
  }

  // Pregnancy contraindications
  if (args.pregnancyActive) {
    if (newDrug.includes('warfarin')) {
      out.push({
        id: 'preg-warfarin',
        tier: 'contraindicated',
        primary: 'Warfarin',
        counter: 'Pregnancy',
        description: 'Teratogenic — fetal warfarin syndrome risk in T1.',
        recommendation: 'Switch to LMWH for therapeutic anticoagulation in pregnancy.',
      })
    }
    if (newDrug.includes('atorvastatin') || newDrug.includes('statin')) {
      out.push({
        id: 'preg-statin',
        tier: 'contraindicated',
        primary: args.rxDrugInn,
        counter: 'Pregnancy',
        description: 'Statins contraindicated in pregnancy.',
        recommendation: 'Hold statin until postpartum + lactation reassessment.',
      })
    }
    if (newDrug.includes('lisinopril') || newDrug.includes('ace inhibitor')) {
      out.push({
        id: 'preg-ace',
        tier: 'contraindicated',
        primary: args.rxDrugInn,
        counter: 'Pregnancy',
        description: 'ACE inhibitor — fetal renal injury and oligohydramnios risk.',
        recommendation: 'Switch to labetalol or methyldopa for HTN in pregnancy.',
      })
    }
  }

  // Severe interactions
  if (newDrug.includes('warfarin') && others.some((o) => o.includes('amiodarone'))) {
    out.push({
      id: 'ddi-warf-amio',
      tier: 'severe',
      primary: 'Warfarin',
      counter: 'Amiodarone',
      description: 'Amiodarone potentiates warfarin → INR rise within 1–2 weeks.',
      recommendation: 'Reduce warfarin 30–50% empirically and monitor INR weekly.',
      reference: 'Lexicomp / Stockley\'s.',
    })
  }
  if (
    (newDrug.includes('sertraline') || newDrug.includes('escitalopram') || newDrug.includes('ssri')) &&
    others.some((o) => o.includes('tramadol') || o.includes('linezolid'))
  ) {
    out.push({
      id: 'ddi-ssri-serotonergic',
      tier: 'severe',
      primary: args.rxDrugInn,
      counter: 'Serotonergic agent',
      description: 'Risk of serotonin syndrome with concurrent serotonergic agents.',
      recommendation: 'Avoid combination; if necessary, monitor for clonus/hyperthermia/agitation.',
    })
  }

  // Moderate
  if (newDrug.includes('atorvastatin') && others.some((o) => o.includes('clarithromycin'))) {
    out.push({
      id: 'ddi-stat-macrolide',
      tier: 'moderate',
      primary: 'Atorvastatin',
      counter: 'Clarithromycin',
      description: 'CYP3A4 inhibition → ↑ statin exposure, myopathy risk.',
      recommendation: 'Hold statin during macrolide course or switch to azithromycin.',
    })
  }

  // Minor
  if (newDrug.includes('metformin') && others.some((o) => o.includes('contrast'))) {
    out.push({
      id: 'ddi-met-contrast',
      tier: 'minor',
      primary: 'Metformin',
      counter: 'IV contrast',
      description: 'Hold metformin around contrast administration if eGFR <60.',
      recommendation: 'Hold day of and 48h post; recheck creatinine before resuming.',
    })
  }

  return out
}

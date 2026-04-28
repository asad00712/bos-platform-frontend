import { NavLink } from 'react-router'
import {
  Activity,
  Brain,
  CalendarDays,
  ClipboardList,
  Eye,
  FileText,
  Files,
  HeartPulse,
  Home,
  ListChecks,
  Microscope,
  Pill,
  Receipt,
  ShieldAlert,
  Stethoscope,
  Syringe,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'

export type ChartSidebarItem = {
  to: string
  i18nKey: string
  label: string
  icon: LucideIcon
  /** Numeric badge (unsigned labs, refills, etc.). */
  count?: number
  /** Hide unless tenant ageBand qualifies (e.g. "Growth" only for peds). */
  showFor?: 'always' | 'peds' | 'ob' | 'adult'
}

type Props = {
  patientId: string
  ageBand:
    | 'neonate'
    | 'infant'
    | 'toddler'
    | 'child'
    | 'adolescent'
    | 'adult'
    | 'geriatric'
  /** True when the patient has an active pregnancy. */
  hasActivePregnancy?: boolean
  className?: string
}

/**
 * Vertical sidebar of chart sections. Behaves like a chart "tab strip"
 * but vertical so we can fit twelve sections without truncation. Hides
 * sections that don't apply to the patient's age band / OB status — a
 * geriatric chart never shows Growth; an adult male never shows OB.
 */
export function ChartSidebar({
  patientId,
  ageBand,
  hasActivePregnancy,
  className,
}: Props) {
  const isPeds = ageBand === 'neonate' || ageBand === 'infant' || ageBand === 'toddler' || ageBand === 'child' || ageBand === 'adolescent'

  const items: ChartSidebarItem[] = [
    { to: '', i18nKey: 'medical.patient.tabs.summary', label: 'Summary', icon: Home, showFor: 'always' },
    { to: 'problems', i18nKey: 'medical.patient.tabs.problems', label: 'Problems', icon: Activity, showFor: 'always' },
    { to: 'allergies', i18nKey: 'medical.patient.tabs.allergies', label: 'Allergies', icon: ShieldAlert, showFor: 'always' },
    { to: 'medications', i18nKey: 'medical.patient.tabs.medications', label: 'Medications', icon: Pill, showFor: 'always' },
    { to: 'immunizations', i18nKey: 'medical.patient.tabs.immunizations', label: 'Immunizations', icon: Syringe, showFor: 'always' },
    { to: 'vitals', i18nKey: 'medical.patient.tabs.vitals', label: 'Vitals', icon: HeartPulse, showFor: 'always' },
    { to: 'growth', i18nKey: 'medical.patient.tabs.growth', label: 'Growth', icon: TrendingUp, showFor: 'peds' },
    { to: 'pregnancy', i18nKey: 'medical.ob.ga', label: 'Prenatal', icon: Stethoscope, showFor: 'ob' },
    { to: 'psych', i18nKey: 'medical.psych.phq9', label: 'Psych scales', icon: Brain, showFor: 'always' },
    { to: 'labs', i18nKey: 'medical.patient.tabs.labs', label: 'Labs', icon: Microscope, showFor: 'always' },
    { to: 'imaging', i18nKey: 'medical.patient.tabs.imaging', label: 'Imaging', icon: Eye, showFor: 'always' },
    { to: 'history', i18nKey: 'medical.patient.tabs.history', label: 'History', icon: ListChecks, showFor: 'always' },
    { to: 'documents', i18nKey: 'medical.patient.tabs.documents', label: 'Documents', icon: Files, showFor: 'always' },
    { to: 'encounters', i18nKey: 'medical.patient.tabs.encounters', label: 'Encounters', icon: ClipboardList, showFor: 'always' },
    { to: 'family', i18nKey: 'medical.patient.fields.emergencyContact', label: 'Family + social', icon: Users, showFor: 'always' },
    { to: 'care-plan', i18nKey: 'medical.patient.tabs.summary', label: 'Care plan', icon: FileText, showFor: 'always' },
    { to: 'billing', i18nKey: 'medical.patient.tabs.billing', label: 'Billing', icon: Receipt, showFor: 'always' },
    { to: 'audit', i18nKey: 'medical.audit.peek', label: 'Access log', icon: CalendarDays, showFor: 'always' },
  ]

  const visible = items.filter((it) => {
    if (it.showFor === 'always') return true
    if (it.showFor === 'peds') return isPeds
    if (it.showFor === 'ob') return Boolean(hasActivePregnancy)
    return true
  })

  return (
    <nav
      aria-label="Patient chart sections"
      className={cn(
        'flex w-56 flex-col gap-0.5 rounded-lg border bg-card p-2',
        className,
      )}
    >
      {visible.map((it) => {
        const Icon = it.icon
        const target = it.to ? `/app/medical/patients/${patientId}/${it.to}` : `/app/medical/patients/${patientId}`
        return (
          <NavLink
            key={it.to || 'summary'}
            to={target}
            end={it.to === ''}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-accent font-medium text-accent-foreground'
                  : 'text-muted-foreground',
              )
            }
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="flex-1 truncate">{it.label}</span>
            {it.count && it.count > 0 ? (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] tabular-nums">
                {it.count}
              </Badge>
            ) : null}
          </NavLink>
        )
      })}
    </nav>
  )
}

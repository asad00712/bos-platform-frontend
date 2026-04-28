import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { cn } from '@/shared/lib/utils'
import { BidiCode } from '@/shared/lib/bidi'

import { ICD10 } from '../codes/icd10.curated'
import { SNOMED } from '../codes/snomed.curated'
import { LOINC } from '../codes/loinc.curated'
import { CPT } from '../codes/cpt.curated'
import { RXNORM } from '../codes/rxnorm.curated'
import { ALLERGENS, regionForLocale } from '../codes/allergens.regional'
import type { CodeableConcept } from '../api/medical.contracts'
import { useTenant } from '@/shared/hooks/useTenant'

type System =
  | 'http://hl7.org/fhir/sid/icd-10-cm'
  | 'http://snomed.info/sct'
  | 'http://loinc.org'
  | 'http://www.ama-assn.org/go/cpt'
  | 'http://www.nlm.nih.gov/research/umls/rxnorm'
  | 'http://terminology.hl7.org/CodeSystem/allergen'

type Entry = {
  system: System
  code: string
  display: string
  /** Optional secondary line for the row (e.g. SNOMED → ICD crosswalk). */
  hint?: string
  /** Optional category chip rendered on the right. */
  category?: string
}

type Props = {
  /** Which coding system to draw from. */
  system: 'icd10' | 'snomed' | 'loinc' | 'cpt' | 'rxnorm' | 'allergen'
  value?: CodeableConcept | null
  onChange: (concept: CodeableConcept) => void
  placeholder?: string
  /** Optional category pre-filter (e.g. only 'food' allergens, only 'lab' LOINC). */
  filterCategory?: string
  triggerClassName?: string
  /** Pre-filter to a specialty when supported (LOINC + ICD-10). */
  specialty?: string
  disabled?: boolean
}

const SYSTEM_URI: Record<Props['system'], System> = {
  icd10: 'http://hl7.org/fhir/sid/icd-10-cm',
  snomed: 'http://snomed.info/sct',
  loinc: 'http://loinc.org',
  cpt: 'http://www.ama-assn.org/go/cpt',
  rxnorm: 'http://www.nlm.nih.gov/research/umls/rxnorm',
  allergen: 'http://terminology.hl7.org/CodeSystem/allergen',
}

/**
 * Universal coding-system picker. Backed by the curated datasets we
 * vendor in `src/features/medical/codes/`. Keeps the keyboard model
 * uniform across allergy/condition/order/Rx/billing surfaces:
 *   ↓/↑ to move  · Enter to select  · ⌫ on input to broaden  · Esc to close.
 *
 * Display rules:
 *   - Code rendered in `<bdi>` so it cannot flip in RTL.
 *   - Always shows code + display + optional hint; never truncates the
 *     display (medical-rule #11 — never-truncate drug names).
 */
export function CodePicker({
  system,
  value,
  onChange,
  placeholder,
  filterCategory,
  triggerClassName,
  specialty,
  disabled,
}: Props) {
  const { tenant } = useTenant()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const entries = useMemo<Entry[]>(() => {
    const sys = SYSTEM_URI[system]
    if (system === 'icd10') {
      return ICD10.filter((e) => (specialty ? e.system === specialty : true))
        .map((e) => ({ system: sys, code: e.code, display: e.display, hint: e.chapter }))
    }
    if (system === 'snomed') {
      return SNOMED.filter((e) => (filterCategory ? e.category === filterCategory : true)).map((e) => ({
        system: sys,
        code: e.code,
        display: e.display,
        hint: e.icd10 ? `ICD-10 ${e.icd10}` : e.category,
      }))
    }
    if (system === 'loinc') {
      return LOINC.filter((e) => (filterCategory ? e.category === filterCategory : true))
        .filter((e) => (specialty ? e.specialty === specialty || e.specialty === 'all' : true))
        .map((e) => ({
          system: sys,
          code: e.code,
          display: e.display,
          hint: e.panel ?? e.category,
          category: e.category,
        }))
    }
    if (system === 'cpt') {
      return CPT.filter((e) => (filterCategory ? e.category === filterCategory : true)).map((e) => ({
        system: sys,
        code: e.code,
        display: e.display,
        hint: e.category,
      }))
    }
    if (system === 'rxnorm') {
      return RXNORM.map((e) => {
        const localeBrands =
          tenant.locale?.startsWith('en-US')
            ? e.brands.us
            : tenant.locale?.startsWith('en-GB')
              ? e.brands.uk
              : tenant.locale?.startsWith('ar') || tenant.locale?.startsWith('ur')
                ? e.brands.global ?? e.brands.us
                : e.brands.global
        const brandHint = (localeBrands ?? []).slice(0, 2).join(' / ')
        return {
          system: sys,
          code: e.rxcui,
          display: e.inn,
          hint: brandHint || e.classes[0],
          category: e.controlled ?? '',
        }
      })
    }
    if (system === 'allergen') {
      const region = regionForLocale(tenant.locale ?? 'en-US')
      return ALLERGENS.filter((a) => a.regions.includes(region) || a.regions.includes('global'))
        .filter((a) => (filterCategory ? a.category === filterCategory : true))
        .map((a) => ({
          system: sys,
          code: a.snomed ?? a.id,
          display: a.display,
          hint: a.category,
        }))
    }
    return []
  }, [system, filterCategory, specialty, tenant.locale])

  const filtered = useMemo(() => {
    if (!query) return entries
    const needle = query.toLowerCase()
    return entries.filter(
      (e) =>
        e.display.toLowerCase().includes(needle) ||
        e.code.toLowerCase().includes(needle) ||
        e.hint?.toLowerCase().includes(needle),
    )
  }, [entries, query])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between text-start font-normal',
            !value && 'text-muted-foreground',
            triggerClassName,
          )}
        >
          {value ? (
            <span className="flex flex-1 items-baseline gap-2 truncate">
              <BidiCode className="text-xs text-muted-foreground">{value.code}</BidiCode>
              <span className="truncate">{value.display}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="size-4 text-muted-foreground" />
              {placeholder ?? 'Pick a code…'}
            </span>
          )}
          <ChevronsUpDown className="ms-auto size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[28rem] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput value={query} onValueChange={setQuery} placeholder="Search code or text…" />
          <CommandList className="max-h-80">
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup>
              {filtered.slice(0, 100).map((e) => (
                <CommandItem
                  key={`${e.system}-${e.code}`}
                  value={`${e.code} ${e.display}`}
                  onSelect={() => {
                    onChange({ system: e.system, code: e.code, display: e.display })
                    setOpen(false)
                  }}
                  className="flex items-start gap-2 py-2"
                >
                  <Check
                    className={cn(
                      'mt-0.5 size-4 shrink-0',
                      value?.code === e.code ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-baseline gap-2">
                      <BidiCode className="shrink-0 text-xs font-semibold text-muted-foreground">
                        {e.code}
                      </BidiCode>
                      <span className="break-words text-sm leading-tight">{e.display}</span>
                    </div>
                    {e.hint ? <p className="text-xs text-muted-foreground">{e.hint}</p> : null}
                  </div>
                  {e.category ? (
                    <span className="ms-2 shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                      {e.category}
                    </span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/* ============== thin wrappers for typed call sites ============== */

export function Icd10Picker(props: Omit<Props, 'system'>) {
  return <CodePicker {...props} system="icd10" />
}
export function SnomedPicker(props: Omit<Props, 'system'>) {
  return <CodePicker {...props} system="snomed" />
}
export function LoincPicker(props: Omit<Props, 'system'>) {
  return <CodePicker {...props} system="loinc" />
}
export function CptPicker(props: Omit<Props, 'system'>) {
  return <CodePicker {...props} system="cpt" />
}
export function RxNormPicker(props: Omit<Props, 'system'>) {
  return <CodePicker {...props} system="rxnorm" />
}
export function AllergenPicker(props: Omit<Props, 'system'>) {
  return <CodePicker {...props} system="allergen" />
}

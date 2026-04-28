import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  ClipboardCheck,
  FileText,
  Plus,
  Send,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

import { formatCurrency, formatDate } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'
import { BidiCode, BidiNum } from '@/shared/lib/bidi'

import { useCoverages, useEncounter, usePatient } from '../hooks'
import type { CodeableConcept } from '../api/medical.contracts'
import { CptPicker, Icd10Picker } from '../components/CodePicker'
import { CPT_MODIFIERS } from '../codes/cpt.curated'

type DiagnosisRow = {
  pointer: string // A, B, C, D
  code: CodeableConcept | null
}

type ChargeRow = {
  id: string
  cpt: CodeableConcept | null
  modifier: string
  units: number
  unitPrice: number
  pointers: string[] // up to 4: ['A', 'B']
}

const DEFAULT_DIAGNOSES: DiagnosisRow[] = [
  { pointer: 'A', code: null },
  { pointer: 'B', code: null },
  { pointer: 'C', code: null },
  { pointer: 'D', code: null },
]

function newCharge(id: number): ChargeRow {
  return {
    id: `line-${id}`,
    cpt: null,
    modifier: '',
    units: 1,
    unitPrice: 0,
    pointers: ['A'],
  }
}

/**
 * Superbill builder. Composes the encounter into a CMS-1500 / professional
 * claim shape: 4 diagnosis pointers (A-D) cross-walked from the assessment,
 * one or more CPT charge lines with modifiers + units + unit price + pointer
 * mapping, totals + claim-ready summary.
 *
 * "Submit claim" toasts in the demo; in production it persists to the claims
 * inbox and routes to the clearinghouse.
 */
export function SuperbillPage() {
  const { id: encounterId } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const enc = useEncounter(tenant.id, encounterId)
  const patient = usePatient(tenant.id, enc.data?.encounter.patientId)
  const coverages = useCoverages(tenant.id, enc.data?.encounter.patientId)

  const [diagnoses, setDiagnoses] = useState<DiagnosisRow[]>(DEFAULT_DIAGNOSES)
  const [charges, setCharges] = useState<ChargeRow[]>([newCharge(1)])
  const [coverageId, setCoverageId] = useState<string>('')

  const total = useMemo(
    () => charges.reduce((s, c) => s + c.units * c.unitPrice, 0),
    [charges],
  )

  if (enc.isLoading || !enc.data) {
    return (
      <PageContainer>
        <PageHeader title="Loading encounter…" />
        <Skeleton className="h-72 w-full" />
      </PageContainer>
    )
  }

  if (enc.isError || !patient.data) {
    return (
      <PageContainer>
        <PageHeader title="Superbill" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>Encounter not found</EmptyTitle>
            <EmptyDescription>Open from the encounter detail or claim worklist.</EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to="/app/medical/billing">
              <ArrowLeft /> Back to claims
            </Link>
          </Button>
        </Empty>
      </PageContainer>
    )
  }

  const e = enc.data.encounter
  const patientName = `${patient.data.patient.name.preferred ?? patient.data.patient.name.given} ${patient.data.patient.name.family}`

  function setDx(idx: number, code: CodeableConcept) {
    setDiagnoses((cur) => cur.map((d, i) => (i === idx ? { ...d, code } : d)))
  }
  function setCpt(rowId: string, code: CodeableConcept) {
    setCharges((cur) =>
      cur.map((c) =>
        c.id === rowId
          ? {
              ...c,
              cpt: code,
              // Seed a sensible price based on the E/M code level
              unitPrice: c.unitPrice || defaultPriceForCpt(code.code),
            }
          : c,
      ),
    )
  }
  function setRowField<K extends keyof ChargeRow>(rowId: string, key: K, value: ChargeRow[K]) {
    setCharges((cur) => cur.map((c) => (c.id === rowId ? { ...c, [key]: value } : c)))
  }
  function togglePointer(rowId: string, pointer: string) {
    setCharges((cur) =>
      cur.map((c) =>
        c.id === rowId
          ? {
              ...c,
              pointers: c.pointers.includes(pointer)
                ? c.pointers.filter((p) => p !== pointer)
                : c.pointers.length >= 4
                  ? c.pointers
                  : [...c.pointers, pointer],
            }
          : c,
      ),
    )
  }

  const filledDx = diagnoses.filter((d) => d.code)
  const validatedCharges = charges.filter((c) => c.cpt && c.units > 0 && c.unitPrice > 0)
  const ready = filledDx.length > 0 && validatedCharges.length === charges.length

  return (
    <PageContainer>
      <PageHeader
        title="Superbill"
        description={`${patientName} · ${e.visitType} · ${formatDate(e.startAt, { dateStyle: 'medium' })}`}
        breadcrumbs={[
          { label: 'Encounter', href: `/app/medical/encounters/${e.id}` },
          { label: 'Superbill' },
        ]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to={`/app/medical/encounters/${e.id}`}>
                <ArrowLeft /> Back to note
              </Link>
            </Button>
            <Button
              disabled={!ready || !coverageId}
              onClick={() =>
                toast.success('Claim submitted', {
                  description: `${patientName} · ${formatCurrency(total, tenant.currency ?? 'USD', { maximumFractionDigits: 2 })}`,
                })
              }
            >
              <Send /> Submit claim
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Diagnoses (ICD-10)
            </h3>
            <ol className="space-y-2">
              {diagnoses.map((d, i) => (
                <li key={d.pointer} className="flex items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-muted/50 font-mono text-xs font-semibold">
                    {d.pointer}
                  </span>
                  <div className="flex-1">
                    <Icd10Picker
                      value={d.code}
                      onChange={(c) => setDx(i, c)}
                      placeholder={`Pointer ${d.pointer} — search ICD-10…`}
                    />
                  </div>
                  {d.code ? (
                    <BidiCode className="text-xs text-muted-foreground">{d.code.code}</BidiCode>
                  ) : null}
                </li>
              ))}
            </ol>

            <div className="space-y-2 pt-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Charge lines (CPT)
                <Button
                  size="sm"
                  variant="outline"
                  className="ms-auto"
                  onClick={() => setCharges((cur) => [...cur, newCharge(cur.length + 1)])}
                >
                  <Plus /> Add line
                </Button>
              </h3>
              <ul className="space-y-3">
                {charges.map((row) => (
                  <li key={row.id} className="rounded-md border p-3">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
                      <div className="md:col-span-5">
                        <Label className="text-xs">CPT</Label>
                        <CptPicker
                          value={row.cpt}
                          onChange={(c) => setCpt(row.id, c)}
                          placeholder="Pick CPT/HCPCS…"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs">Modifier</Label>
                        <Select
                          value={row.modifier || 'none'}
                          onValueChange={(v) => setRowField(row.id, 'modifier', v === 'none' ? '' : v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">—</SelectItem>
                            {CPT_MODIFIERS.map((m) => (
                              <SelectItem key={m.code} value={m.code}>
                                -{m.code} · {m.display}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-1">
                        <Label className="text-xs">Units</Label>
                        <Input
                          inputMode="numeric"
                          min={1}
                          value={row.units}
                          onChange={(e) =>
                            setRowField(row.id, 'units', Math.max(1, Number(e.target.value) || 1))
                          }
                          className="h-9 text-center tabular-nums"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs">Unit price</Label>
                        <Input
                          inputMode="decimal"
                          value={row.unitPrice || ''}
                          onChange={(e) =>
                            setRowField(row.id, 'unitPrice', Number(e.target.value) || 0)
                          }
                          className="h-9 text-end tabular-nums"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs">Line total</Label>
                        <p className="flex h-9 items-center justify-end rounded-md border bg-muted/30 px-3 text-sm font-medium tabular-nums">
                          <BidiNum>
                            {formatCurrency(
                              row.units * row.unitPrice,
                              tenant.currency ?? 'USD',
                              { maximumFractionDigits: 2 },
                            )}
                          </BidiNum>
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <Label className="me-1 text-xs">Pointers:</Label>
                        {(['A', 'B', 'C', 'D'] as const).map((p) => {
                          const active = row.pointers.includes(p)
                          const has = diagnoses.find((d) => d.pointer === p)?.code
                          return (
                            <button
                              key={p}
                              type="button"
                              disabled={!has}
                              onClick={() => togglePointer(row.id, p)}
                              className={`flex size-6 items-center justify-center rounded-md border font-mono text-[11px] transition ${
                                active
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : has
                                    ? 'hover:bg-accent'
                                    : 'opacity-30 cursor-not-allowed'
                              }`}
                            >
                              {p}
                            </button>
                          )
                        })}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setCharges((cur) => (cur.length === 1 ? cur : cur.filter((c) => c.id !== row.id)))
                        }
                        disabled={charges.length === 1}
                      >
                        <Trash2 /> Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardContent className="space-y-3 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Coverage routing
              </h3>
              <Select value={coverageId} onValueChange={setCoverageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick coverage…" />
                </SelectTrigger>
                <SelectContent>
                  {(coverages.data?.items ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.payor} · {c.planName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {coverageId ? (
                <p className="text-xs text-muted-foreground">
                  {(coverages.data?.items ?? []).find((c) => c.id === coverageId)?.network ===
                  'in_network'
                    ? 'In-network'
                    : 'Out of network'}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Summary
              </h3>
              <div className="flex items-baseline justify-between text-sm">
                <span>Lines</span>
                <span className="font-medium tabular-nums">{charges.length}</span>
              </div>
              <div className="flex items-baseline justify-between text-sm">
                <span>Diagnoses</span>
                <span className="font-medium tabular-nums">{filledDx.length}</span>
              </div>
              <div className="flex items-baseline justify-between text-base font-semibold">
                <span>Charge total</span>
                <span className="tabular-nums">
                  <BidiNum>
                    {formatCurrency(total, tenant.currency ?? 'USD', { maximumFractionDigits: 2 })}
                  </BidiNum>
                </span>
              </div>

              {!ready ? (
                <p className="rounded-md bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">
                  Add at least one diagnosis and complete every charge line before submitting.
                </p>
              ) : (
                <Badge className="gap-1">
                  <ClipboardCheck className="size-3" /> Claim ready to submit
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="p-4 text-xs text-muted-foreground">
              The submitted claim flows to the claims worklist for clearinghouse routing,
              denial review, and payment posting.
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

/** Anchor unit pricing on the canonical CMS Medicare PFS bands so the demo
 *  doesn't show $0 lines. Real-world pricing comes from the contract fee
 *  schedule per payor. */
function defaultPriceForCpt(code: string): number {
  if (code.startsWith('992')) {
    const last = code.slice(-1)
    if (last === '1') return 65
    if (last === '2') return 105
    if (last === '3') return 175
    if (last === '4') return 250
    if (last === '5') return 325
    if (last === '6') return 145
  }
  if (code.startsWith('99381') || code.startsWith('99391')) return 280
  if (code.startsWith('99395') || code.startsWith('99396')) return 320
  if (code.startsWith('994')) return 95
  if (code === '93000') return 60
  if (code === '20610') return 110
  if (code === '12001') return 200
  if (code === '17110') return 145
  if (code === '69210') return 75
  return 100
}

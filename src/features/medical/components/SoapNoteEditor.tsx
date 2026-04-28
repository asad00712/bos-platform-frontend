import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, FileSignature, Lock, Save } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import { formatRelative } from '@/shared/lib/format'

import type { CodeableConcept, EncounterNote, SoapNote } from '../api/medical.contracts'
import { Icd10Picker } from './CodePicker'
import { BidiCode } from '@/shared/lib/bidi'

const ROS_SYSTEMS: { key: keyof SoapNote['subjective']['ros']; label: string }[] = [
  { key: 'constitutional', label: 'Constitutional' },
  { key: 'eyes', label: 'Eyes' },
  { key: 'ent', label: 'ENT' },
  { key: 'cardiovascular', label: 'Cardiovascular' },
  { key: 'respiratory', label: 'Respiratory' },
  { key: 'gi', label: 'GI' },
  { key: 'gu', label: 'GU' },
  { key: 'musculoskeletal', label: 'Musculoskeletal' },
  { key: 'skin', label: 'Skin' },
  { key: 'neurological', label: 'Neurological' },
  { key: 'psychiatric', label: 'Psychiatric' },
  { key: 'endocrine', label: 'Endocrine' },
  { key: 'heme_lymph', label: 'Heme / Lymph' },
  { key: 'allergic_immuno', label: 'Allergic / Immuno' },
] as const

type Props = {
  note: EncounterNote | null
  /** Sticky banner state — true when a sign ceremony is open. */
  signing?: boolean
  onSaveDraft: (soap: SoapNote) => void | Promise<void>
  onRequestSign: (soap: SoapNote) => void
  onAddAddendum: (text: string) => void | Promise<void>
  isDirty?: boolean
  isSavingDraft?: boolean
}

function emptySoap(): SoapNote {
  return {
    subjective: {
      chiefComplaint: '',
      hpi: '',
      ros: ROS_SYSTEMS.reduce<Record<string, string>>((acc, s) => {
        acc[s.key] = ''
        return acc
      }, {}),
      pmh: '',
      psh: '',
      fh: '',
      sh: '',
    },
    objective: { examFreeText: '', examBySystem: {} },
    assessment: [],
    plan: '',
  }
}

/**
 * SOAP note editor. Three rules:
 *   1. Default state for any unsigned note is "draft" — never auto-sign.
 *   2. Auto-save the draft every 8 seconds while edits are pending and
 *      again on blur. The footer always tells the clinician when the
 *      last save happened so they know nothing's lost.
 *   3. Once `state === 'signed'`, fields are read-only. The only mutation
 *      surface is "Add addendum" which appends a new author-attributed
 *      block; the original signed text is never edited.
 */
export function SoapNoteEditor({
  note,
  onSaveDraft,
  onRequestSign,
  onAddAddendum,
  isSavingDraft,
}: Props) {
  const [soap, setSoap] = useState<SoapNote>(note?.soap ?? emptySoap())
  const [tab, setTab] = useState('s')
  const [addendum, setAddendum] = useState('')
  const dirtyRef = useRef(false)

  useEffect(() => {
    setSoap(note?.soap ?? emptySoap())
    dirtyRef.current = false
  }, [note?.id])

  useEffect(() => {
    if (!note || note.state === 'signed') return
    if (!dirtyRef.current) return
    const t = setTimeout(() => {
      dirtyRef.current = false
      void onSaveDraft(soap)
    }, 8000)
    return () => clearTimeout(t)
  }, [soap, note, onSaveDraft])

  const readonly = note?.state === 'signed'

  function setSubjective<K extends keyof SoapNote['subjective']>(key: K, value: SoapNote['subjective'][K]) {
    if (readonly) return
    dirtyRef.current = true
    setSoap((s) => ({ ...s, subjective: { ...s.subjective, [key]: value } }))
  }
  function setRos(key: string, value: string) {
    if (readonly) return
    dirtyRef.current = true
    setSoap((s) => ({
      ...s,
      subjective: { ...s.subjective, ros: { ...s.subjective.ros, [key]: value } },
    }))
  }
  function setObjectiveText(value: string) {
    if (readonly) return
    dirtyRef.current = true
    setSoap((s) => ({ ...s, objective: { ...s.objective, examFreeText: value } }))
  }
  function setPlan(value: string) {
    if (readonly) return
    dirtyRef.current = true
    setSoap((s) => ({ ...s, plan: value }))
  }
  function pickAssessmentDx(idx: number, code: CodeableConcept) {
    if (readonly) return
    dirtyRef.current = true
    setSoap((s) => {
      const next = [...s.assessment]
      next[idx] = { ...next[idx], icd10: code, conditionId: next[idx]?.conditionId ?? null, note: next[idx]?.note ?? '' }
      return { ...s, assessment: next }
    })
  }
  function addAssessment() {
    if (readonly) return
    dirtyRef.current = true
    setSoap((s) => ({
      ...s,
      assessment: [
        ...s.assessment,
        { conditionId: null, icd10: { system: '', code: '', display: '' }, note: '' },
      ],
    }))
  }
  function setAssessmentNote(idx: number, value: string) {
    if (readonly) return
    dirtyRef.current = true
    setSoap((s) => {
      const next = [...s.assessment]
      if (next[idx]) next[idx] = { ...next[idx], note: value }
      return { ...s, assessment: next }
    })
  }
  function removeAssessment(idx: number) {
    if (readonly) return
    dirtyRef.current = true
    setSoap((s) => ({ ...s, assessment: s.assessment.filter((_, i) => i !== idx) }))
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2 border-b pb-3">
          <NoteStateBadge state={note?.state ?? 'draft'} />
          {note?.signedAt ? (
            <span className="text-xs text-muted-foreground">
              Signed by {note.signedBy} · {formatRelative(note.signedAt)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {note ? `Last draft ${formatRelative(note.draftSavedAt)}` : 'New draft'}
            </span>
          )}
          <div className="ms-auto flex items-center gap-2">
            {!readonly ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    dirtyRef.current = false
                    void onSaveDraft(soap)
                  }}
                  disabled={isSavingDraft}
                >
                  <Save /> {isSavingDraft ? 'Saving…' : 'Save draft'}
                </Button>
                <Button type="button" size="sm" onClick={() => onRequestSign(soap)}>
                  <FileSignature /> Sign note
                </Button>
              </>
            ) : (
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="size-3.5" /> Immutable — use addendum
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Signed notes cannot be edited. Append an addendum to record clarifications or corrections.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="s">S — Subjective</TabsTrigger>
            <TabsTrigger value="o">O — Objective</TabsTrigger>
            <TabsTrigger value="a">A — Assessment</TabsTrigger>
            <TabsTrigger value="p">P — Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="s" className="mt-4 space-y-3">
            <FieldArea
              label="Chief complaint"
              value={soap.subjective.chiefComplaint}
              onChange={(v) => setSubjective('chiefComplaint', v)}
              readonly={readonly}
              rows={2}
            />
            <FieldArea
              label="History of present illness (HPI)"
              value={soap.subjective.hpi}
              onChange={(v) => setSubjective('hpi', v)}
              readonly={readonly}
              rows={4}
            />
            <details className="rounded-md border p-3 text-sm">
              <summary className="cursor-pointer font-medium">Review of systems</summary>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                {ROS_SYSTEMS.map((s) => (
                  <FieldArea
                    key={s.key}
                    label={s.label}
                    value={soap.subjective.ros[s.key] ?? ''}
                    onChange={(v) => setRos(s.key, v)}
                    readonly={readonly}
                    rows={2}
                    compact
                  />
                ))}
              </div>
            </details>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FieldArea label="PMH" value={soap.subjective.pmh} onChange={(v) => setSubjective('pmh', v)} readonly={readonly} rows={3} />
              <FieldArea label="PSH" value={soap.subjective.psh} onChange={(v) => setSubjective('psh', v)} readonly={readonly} rows={3} />
              <FieldArea label="Family history" value={soap.subjective.fh} onChange={(v) => setSubjective('fh', v)} readonly={readonly} rows={2} />
              <FieldArea label="Social history" value={soap.subjective.sh} onChange={(v) => setSubjective('sh', v)} readonly={readonly} rows={2} />
            </div>
          </TabsContent>

          <TabsContent value="o" className="mt-4 space-y-3">
            <FieldArea
              label="Physical exam"
              value={soap.objective.examFreeText}
              onChange={setObjectiveText}
              readonly={readonly}
              rows={6}
              placeholder="Gen: alert, NAD. Heart: RRR, no murmur. Lungs: CTAB. Abd: soft, non-tender. Neuro: no focal deficit."
            />
          </TabsContent>

          <TabsContent value="a" className="mt-4 space-y-3">
            <ul className="space-y-3">
              {soap.assessment.map((row, idx) => (
                <li key={idx} className="space-y-2 rounded-md border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                    <div className="min-w-0 flex-1">
                      <Icd10Picker
                        value={row.icd10.code ? row.icd10 : null}
                        onChange={(c) => pickAssessmentDx(idx, c)}
                        placeholder="Pick ICD-10 diagnosis…"
                        disabled={readonly}
                      />
                    </div>
                    {row.icd10.code ? (
                      <BidiCode className="text-xs text-muted-foreground">{row.icd10.code}</BidiCode>
                    ) : null}
                    {!readonly ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAssessment(idx)}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  <Textarea
                    rows={2}
                    placeholder="Clinical reasoning, severity, plan reference…"
                    value={row.note}
                    onChange={(e) => setAssessmentNote(idx, e.target.value)}
                    readOnly={readonly}
                    className={readonly ? 'bg-muted/30' : undefined}
                  />
                </li>
              ))}
            </ul>
            {!readonly ? (
              <Button type="button" variant="outline" onClick={addAssessment}>
                + Add assessment
              </Button>
            ) : null}
          </TabsContent>

          <TabsContent value="p" className="mt-4">
            <FieldArea
              label="Plan"
              value={soap.plan}
              onChange={setPlan}
              readonly={readonly}
              rows={8}
              placeholder="Orders, prescriptions, follow-up, patient education…"
            />
          </TabsContent>
        </Tabs>

        {/* addenda */}
        {note && note.addenda.length > 0 ? (
          <div className="space-y-2 border-t pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Addenda
            </p>
            <ul className="space-y-2">
              {note.addenda.map((a) => (
                <li key={a.id} className="rounded-md border bg-muted/30 p-3 text-sm">
                  <p className="text-xs font-medium text-muted-foreground">
                    {a.authorName} · {formatRelative(a.addedAt)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap leading-relaxed">{a.text}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* addendum composer — only when signed */}
        {readonly ? (
          <div className="space-y-2 rounded-md border bg-muted/20 p-3">
            <Label className="text-xs">New addendum</Label>
            <Textarea
              rows={3}
              value={addendum}
              onChange={(e) => setAddendum(e.target.value)}
              placeholder="Add a clarification or correction. Original signed text is preserved."
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={addendum.trim().length === 0}
                onClick={async () => {
                  await onAddAddendum(addendum.trim())
                  setAddendum('')
                }}
              >
                Add addendum
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function NoteStateBadge({ state }: { state: EncounterNote['state'] }) {
  if (state === 'signed') {
    return (
      <Badge variant="outline" className="gap-1.5 border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="size-3" /> Signed
      </Badge>
    )
  }
  if (state === 'pending_cosign') {
    return <Badge variant="secondary">Pending co-sign</Badge>
  }
  return <Badge variant="outline">Draft</Badge>
}

function FieldArea({
  label,
  value,
  onChange,
  readonly,
  rows,
  placeholder,
  compact,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  readonly?: boolean
  rows?: number
  placeholder?: string
  compact?: boolean
}) {
  return (
    <div className={cn('space-y-1.5', compact && 'space-y-1')}>
      <Label className={cn('text-xs', compact && 'text-[11px] text-muted-foreground')}>{label}</Label>
      <Textarea
        rows={rows ?? 3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readonly}
        placeholder={placeholder}
        className={cn(readonly && 'bg-muted/30')}
      />
    </div>
  )
}

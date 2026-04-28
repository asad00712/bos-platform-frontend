import { useState } from 'react'
import { useParams } from 'react-router'
import { Plus } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { formatRelative } from '@/shared/lib/format'
import { BidiCode } from '@/shared/lib/bidi'
import { useTenant } from '@/shared/hooks/useTenant'

import { useAddProblem, useProblems } from '../../hooks'
import { Icd10Picker } from '../../components/CodePicker'
import type { CodeableConcept } from '../../api/medical.contracts'

export function ProblemsPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const q = useProblems(tenant.id, id)

  const active = (q.data?.items ?? []).filter((p) => p.clinicalStatus === 'active')
  const resolved = (q.data?.items ?? []).filter((p) => p.clinicalStatus !== 'active')

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Problem list</h2>
          <p className="text-sm text-muted-foreground">
            Active conditions appear at the top. Resolved ones are kept for history.
          </p>
        </div>
        {id ? <NewProblemDialog patientId={id} /> : null}
      </header>

      <Section title={`Active (${active.length})`} loading={q.isLoading}>
        {active.map((p) => (
          <li key={p.id} className="flex flex-wrap items-baseline gap-2">
            <BidiCode className="text-xs text-muted-foreground">{p.icd10.code}</BidiCode>
            <span className="font-medium">{p.icd10.display}</span>
            {p.severity ? (
              <Badge variant="outline" className="text-[10px] capitalize">
                {p.severity}
              </Badge>
            ) : null}
            <span className="ms-auto text-xs text-muted-foreground">
              Onset {p.onsetDate ? formatRelative(p.onsetDate) : '—'}
            </span>
          </li>
        ))}
      </Section>

      {resolved.length > 0 ? (
        <Section title={`Inactive / resolved (${resolved.length})`} muted loading={false}>
          {resolved.map((p) => (
            <li key={p.id} className="flex flex-wrap items-baseline gap-2 text-muted-foreground">
              <BidiCode className="text-xs">{p.icd10.code}</BidiCode>
              <span className="line-through">{p.icd10.display}</span>
              <span className="ms-auto text-xs">
                {p.resolvedDate ? `Resolved ${formatRelative(p.resolvedDate)}` : 'Inactive'}
              </span>
            </li>
          ))}
        </Section>
      ) : null}
    </div>
  )
}

function Section({
  title,
  loading,
  muted,
  children,
}: {
  title: string
  loading?: boolean
  muted?: boolean
  children: React.ReactNode
}) {
  return (
    <section className={muted ? 'opacity-80' : undefined}>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      ) : (
        <ul className="space-y-2 text-sm">{children}</ul>
      )}
    </section>
  )
}

function NewProblemDialog({ patientId }: { patientId: string }) {
  const { tenant } = useTenant()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState<CodeableConcept | null>(null)
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe' | ''>('')
  const [notes, setNotes] = useState('')
  const m = useAddProblem(tenant.id, patientId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Add problem
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add problem</DialogTitle>
          <DialogDescription>
            Pick an ICD-10 code and add clinical context.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Diagnosis</Label>
            <Icd10Picker value={code} onChange={setCode} placeholder="Search ICD-10…" />
          </div>
          <div className="space-y-1.5">
            <Label>Severity</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as typeof severity)}>
              <SelectTrigger>
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!code || m.isPending}
            onClick={async () => {
              if (!code) return
              await m.mutateAsync({
                encounterId: null,
                category: 'problem_list_item',
                clinicalStatus: 'active',
                verificationStatus: 'confirmed',
                icd10: code,
                snomed: null,
                severity: severity || null,
                onsetDate: new Date().toISOString().slice(0, 10),
                resolvedDate: null,
                notes: notes || null,
              })
              setOpen(false)
              setCode(null)
              setSeverity('')
              setNotes('')
            }}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

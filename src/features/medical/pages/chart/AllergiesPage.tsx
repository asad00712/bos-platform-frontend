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
import { useTenant } from '@/shared/hooks/useTenant'

import { AllergenPicker } from '../../components/CodePicker'
import { useAddAllergy, useAllergies } from '../../hooks'
import type { Allergy, CodeableConcept } from '../../api/medical.contracts'

export function AllergiesPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const q = useAllergies(tenant.id, id)
  const items = q.data?.items ?? []

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Allergies & intolerances</h2>
          <p className="text-sm text-muted-foreground">
            High-criticality allergies block matching prescriptions until acknowledged.
          </p>
        </div>
        {id ? <NewAllergyDialog patientId={id} /> : null}
      </header>

      {q.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {q.data?.noKnownAllergies
            ? 'Patient explicitly has no known allergies.'
            : 'No allergies recorded — confirm with the patient.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((a) => (
            <Row key={a.id} a={a} />
          ))}
        </ul>
      )}
    </div>
  )
}

function Row({ a }: { a: Allergy }) {
  return (
    <li className="space-y-1 rounded-md border p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={a.criticality === 'high' ? 'destructive' : 'outline'}>
          {a.criticality === 'high' ? 'HIGH' : a.criticality === 'low' ? 'LOW' : '?'}
        </Badge>
        <span className="font-semibold">{a.substance.display}</span>
        <Badge variant="outline" className="text-[10px] capitalize">
          {a.category}
        </Badge>
        <span className="text-xs capitalize text-muted-foreground">
          {a.type}
        </span>
        <span className="ms-auto text-xs text-muted-foreground">
          {a.recordedAt ? formatRelative(a.recordedAt) : ''}
        </span>
      </div>
      {a.reactionText ? (
        <p className="text-sm">
          <span className="text-muted-foreground">Reaction: </span>
          {a.reactionText}
          {a.reactionSeverity ? (
            <span className="ms-1 text-xs uppercase text-muted-foreground">({a.reactionSeverity})</span>
          ) : null}
        </p>
      ) : null}
      {a.notes ? <p className="text-xs text-muted-foreground">{a.notes}</p> : null}
    </li>
  )
}

function NewAllergyDialog({ patientId }: { patientId: string }) {
  const { tenant } = useTenant()
  const [open, setOpen] = useState(false)
  const [substance, setSubstance] = useState<CodeableConcept | null>(null)
  const [category, setCategory] = useState<Allergy['category']>('medication')
  const [criticality, setCriticality] = useState<Allergy['criticality']>('low')
  const [severity, setSeverity] = useState<NonNullable<Allergy['reactionSeverity']> | ''>('')
  const [reaction, setReaction] = useState('')
  const m = useAddAllergy(tenant.id, patientId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Add allergy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add allergy / intolerance</DialogTitle>
          <DialogDescription>
            Use the regional allergen list. Mark high criticality if anaphylaxis or airway involvement.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Substance</Label>
            <AllergenPicker
              value={substance}
              onChange={setSubstance}
              filterCategory={category}
              placeholder="Pick allergen…"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="biologic">Biologic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Criticality</Label>
              <Select
                value={criticality}
                onValueChange={(v) => setCriticality(v as typeof criticality)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="unable_to_assess">Unable to assess</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Reaction</Label>
            <Textarea
              rows={2}
              placeholder="Hives, throat tightening, rash, etc."
              value={reaction}
              onChange={(e) => setReaction(e.target.value)}
            />
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
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!substance || m.isPending}
            onClick={async () => {
              if (!substance) return
              await m.mutateAsync({
                type: 'allergy',
                category,
                criticality,
                substance,
                reactionText: reaction || null,
                reactionSeverity: severity || null,
                onsetDate: null,
                verificationStatus: 'confirmed',
                notes: null,
              })
              setOpen(false)
              setSubstance(null)
              setReaction('')
              setSeverity('')
            }}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

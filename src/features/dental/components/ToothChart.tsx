import { useMemo, useState } from 'react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
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
import { cn } from '@/shared/lib/utils'
import { formatRelative } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'
import { usePermissions } from '@/shared/hooks/usePermissions'

import {
  useAddToothMark,
  useRemoveToothMarks,
  useToothChart,
} from '../hooks'
import type {
  ToothConditionKind,
  ToothMark,
  ToothSurface,
} from '../api/dental.contracts'
import { TOOTH_KIND_LABEL, TOOTH_KIND_TONE } from './Badges'

/** FDI permanent dentition rows. */
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11]
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28]
const LOWER_LEFT = [38, 37, 36, 35, 34, 33, 32, 31]
const LOWER_RIGHT = [41, 42, 43, 44, 45, 46, 47, 48]

const KIND_OPTIONS: ToothConditionKind[] = [
  'healthy',
  'caries',
  'restoration',
  'crown',
  'root_canal',
  'extraction',
  'implant',
  'watch',
]

const SURFACE_OPTIONS: { label: string; value: ToothSurface | 'whole' }[] = [
  { label: 'Whole tooth', value: 'whole' },
  { label: 'Mesial (M)', value: 'mesial' },
  { label: 'Distal (D)', value: 'distal' },
  { label: 'Occlusal (O)', value: 'occlusal' },
  { label: 'Buccal (B)', value: 'buccal' },
  { label: 'Lingual (L)', value: 'lingual' },
]

const SURFACE_LETTER: Record<ToothSurface, string> = {
  mesial: 'M',
  distal: 'D',
  occlusal: 'O',
  buccal: 'B',
  lingual: 'L',
}

type SelectedTooth = {
  number: number
  marks: ToothMark[]
}

type Props = { patientId: string }

export function ToothChart({ patientId }: Props) {
  const { tenant } = useTenant()
  const { has } = usePermissions()
  const query = useToothChart(tenant.id, patientId)
  const addMark = useAddToothMark(tenant.id, patientId)
  const removeMarks = useRemoveToothMarks(tenant.id, patientId)

  const [selected, setSelected] = useState<SelectedTooth | null>(null)
  const [draft, setDraft] = useState<{
    surface: ToothSurface | 'whole'
    kind: ToothConditionKind
    notes: string
  }>({ surface: 'whole', kind: 'caries', notes: '' })

  const canWrite = has('dental:write')

  const marksByTooth = useMemo(() => {
    const map = new Map<number, ToothMark[]>()
    for (const m of query.data?.marks ?? []) {
      const arr = map.get(m.toothNumber) ?? []
      arr.push(m)
      map.set(m.toothNumber, arr)
    }
    return map
  }, [query.data?.marks])

  const openTooth = (n: number) => {
    setSelected({ number: n, marks: marksByTooth.get(n) ?? [] })
    setDraft({ surface: 'whole', kind: 'caries', notes: '' })
  }

  const closeTooth = () => setSelected(null)

  const onAdd = async () => {
    if (!selected) return
    await addMark.mutateAsync({
      toothNumber: selected.number,
      surface: draft.surface === 'whole' ? null : draft.surface,
      kind: draft.kind,
      notes: draft.notes || undefined,
    })
    setDraft((d) => ({ ...d, notes: '' }))
    // Refresh local selected with latest marks (read from cache via refetch)
    setSelected((cur) =>
      cur ? { ...cur, marks: marksByTooth.get(cur.number) ?? [] } : cur,
    )
  }

  const onRemove = async (mark: ToothMark) => {
    if (!selected) return
    await removeMarks.mutateAsync({
      toothNumber: mark.toothNumber,
      surface: mark.surface,
    })
  }

  if (query.isLoading || !query.data) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <ChartRow row={UPPER_RIGHT} marksByTooth={marksByTooth} onClick={openTooth} />
      <ChartRow row={UPPER_LEFT} marksByTooth={marksByTooth} onClick={openTooth} />
      <div className="my-2 border-t" />
      <ChartRow row={LOWER_LEFT} marksByTooth={marksByTooth} onClick={openTooth} flipped />
      <ChartRow row={LOWER_RIGHT} marksByTooth={marksByTooth} onClick={openTooth} flipped />

      <Legend />

      {/* Detail / edit dialog */}
      <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && closeTooth()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tooth {selected?.number}</DialogTitle>
            <DialogDescription>
              {selected
                ? `${marksByTooth.get(selected.number)?.length ?? 0} marks recorded`
                : ''}
            </DialogDescription>
          </DialogHeader>

          {/* Existing marks */}
          {selected ? (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                History
              </p>
              {(marksByTooth.get(selected.number) ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No marks yet.</p>
              ) : (
                <ul className="space-y-2">
                  {(marksByTooth.get(selected.number) ?? []).map((m, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-3 rounded-md border bg-card/50 p-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn('capitalize', TOOTH_KIND_TONE[m.kind])}
                          >
                            {TOOTH_KIND_LABEL[m.kind]}
                          </Badge>
                          {m.surface ? (
                            <span className="text-xs text-muted-foreground">
                              {SURFACE_LETTER[m.surface]} ({m.surface})
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">whole tooth</span>
                          )}
                        </div>
                        {m.notes ? (
                          <p className="text-xs text-muted-foreground">{m.notes}</p>
                        ) : null}
                        <p className="text-[11px] text-muted-foreground">
                          {formatRelative(m.recordedAt)}
                        </p>
                      </div>
                      {canWrite ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemove(m)}
                          disabled={removeMarks.isPending}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          {canWrite && selected ? (
            <div className="space-y-3 border-t pt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Add a mark
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Condition</Label>
                  <Select
                    value={draft.kind}
                    onValueChange={(v) =>
                      setDraft((d) => ({ ...d, kind: v as ToothConditionKind }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KIND_OPTIONS.map((k) => (
                        <SelectItem key={k} value={k} className="capitalize">
                          {TOOTH_KIND_LABEL[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Surface</Label>
                  <Select
                    value={draft.surface}
                    onValueChange={(v) =>
                      setDraft((d) => ({
                        ...d,
                        surface: v as ToothSurface | 'whole',
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SURFACE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Input
                  placeholder="Optional clinical notes…"
                  value={draft.notes}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, notes: e.target.value }))
                  }
                />
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" onClick={closeTooth}>
              Close
            </Button>
            {canWrite ? (
              <Button onClick={onAdd} disabled={addMark.isPending}>
                {addMark.isPending ? 'Saving…' : 'Add mark'}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ChartRow({
  row,
  marksByTooth,
  onClick,
  flipped,
}: {
  row: number[]
  marksByTooth: Map<number, ToothMark[]>
  onClick: (n: number) => void
  flipped?: boolean
}) {
  return (
    <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
      {row.map((n) => (
        <Tooth
          key={n}
          number={n}
          marks={marksByTooth.get(n) ?? []}
          onClick={() => onClick(n)}
          flipped={flipped}
        />
      ))}
    </div>
  )
}

function Tooth({
  number,
  marks,
  onClick,
  flipped,
}: {
  number: number
  marks: ToothMark[]
  onClick: () => void
  flipped?: boolean
}) {
  // Pick the most recent mark (whole-tooth) for the body color; surfaces stack as small dots.
  const wholeTooth = marks.findLast?.((m) => m.surface === null) ?? null
  const surfaceMarks = marks.filter((m) => m.surface !== null)
  const tone = wholeTooth ? TOOTH_KIND_TONE[wholeTooth.kind] : TOOTH_KIND_TONE.healthy

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex aspect-[3/4] flex-col items-center justify-center rounded-md border text-[10px] font-medium transition hover:border-primary',
        tone,
        flipped && 'rotate-180',
      )}
      aria-label={`Tooth ${number}`}
    >
      <span className={cn(flipped && '-rotate-180')}>{number}</span>
      {surfaceMarks.length > 0 ? (
        <span
          className={cn(
            'absolute inset-x-1 bottom-1 flex flex-wrap justify-center gap-0.5',
            flipped && '-rotate-180',
          )}
        >
          {surfaceMarks.slice(0, 4).map((m, i) => (
            <span
              key={i}
              className={cn(
                'grid size-3 place-items-center rounded-full text-[7px] font-bold uppercase',
                TOOTH_KIND_TONE[m.kind],
                'border',
              )}
              title={`${SURFACE_LETTER[m.surface!]} · ${TOOTH_KIND_LABEL[m.kind]}`}
            >
              {SURFACE_LETTER[m.surface!]}
            </span>
          ))}
        </span>
      ) : null}
    </button>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border bg-card/40 p-3 text-xs">
      {KIND_OPTIONS.filter((k) => k !== 'healthy').map((k) => (
        <span key={k} className="flex items-center gap-1.5">
          <span
            className={cn('size-3 rounded-sm border', TOOTH_KIND_TONE[k])}
          />
          <span className="text-muted-foreground">{TOOTH_KIND_LABEL[k]}</span>
        </span>
      ))}
      <span className="ms-auto text-muted-foreground">
        Click a tooth to view or edit marks.
      </span>
    </div>
  )
}

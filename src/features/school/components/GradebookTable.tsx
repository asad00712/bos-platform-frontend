import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/lib/utils'

import type { GradebookResponse } from '../api/school.contracts'

type Props = {
  gradebook: GradebookResponse
  /** Set true to allow inline editing. Saves are local-state only in this demo. */
  editable?: boolean
}

export function GradebookTable({ gradebook, editable = true }: Props) {
  const [edits, setEdits] = useState<Record<string, number>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setEdits({})
    setSaved(false)
  }, [gradebook.examId, gradebook.paperId, gradebook.classId])

  const dirty = Object.keys(edits).length > 0

  const stats = computeStats(gradebook, edits)

  const setMark = (studentId: string, raw: string) => {
    const n = Number(raw)
    if (Number.isNaN(n)) return
    const clamped = Math.max(0, Math.min(gradebook.maxMarks, n))
    setEdits((prev) => ({ ...prev, [studentId]: clamped }))
    setSaved(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="text-xs">
          Max {gradebook.maxMarks}
        </Badge>
        <Badge variant="outline" className="text-xs">
          Pass {gradebook.passingMarks}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          Avg {stats.average.toFixed(1)}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          High {stats.highest}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          Low {stats.lowest}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          Pass rate {(stats.passRate * 100).toFixed(0)}%
        </Badge>

        {editable ? (
          <div className="ms-auto flex items-center gap-2">
            {saved ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                Marks saved
              </span>
            ) : null}
            <Button
              size="sm"
              disabled={!dirty}
              onClick={() => {
                setEdits({})
                setSaved(true)
              }}
            >
              Save marks
            </Button>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-14 p-3 text-center">Roll</th>
              <th className="p-3 text-start">Student</th>
              <th className="w-32 p-3 text-center">Marks</th>
              <th className="w-20 p-3 text-center">Grade</th>
              <th className="w-20 p-3 text-center">Result</th>
            </tr>
          </thead>
          <tbody>
            {gradebook.rows.map((r) => {
              const current = edits[r.studentId] ?? r.marks
              const passed = current >= gradebook.passingMarks
              return (
                <tr key={r.studentId} className="border-t">
                  <td className="p-3 text-center text-xs font-medium tabular-nums text-muted-foreground">
                    {r.rollNumber}
                  </td>
                  <td className="p-3 font-medium">{r.studentName}</td>
                  <td className="p-3 text-center">
                    {editable ? (
                      <Input
                        type="number"
                        min={0}
                        max={gradebook.maxMarks}
                        value={current}
                        onChange={(e) => setMark(r.studentId, e.target.value)}
                        className="h-8 w-20 text-center tabular-nums"
                      />
                    ) : (
                      <span className="tabular-nums">
                        {current} / {gradebook.maxMarks}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant="outline" className="font-mono">
                      {gradeFor(current / gradebook.maxMarks)}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    {passed ? (
                      <CheckCircle2
                        className={cn('mx-auto size-4 text-emerald-500')}
                      />
                    ) : (
                      <XCircle className="mx-auto size-4 text-rose-500" />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function computeStats(gb: GradebookResponse, edits: Record<string, number>) {
  if (gb.rows.length === 0) {
    return { average: 0, highest: 0, lowest: 0, passRate: 0 }
  }
  const marks = gb.rows.map((r) => edits[r.studentId] ?? r.marks)
  const sum = marks.reduce((s, m) => s + m, 0)
  const passed = marks.filter((m) => m >= gb.passingMarks).length
  return {
    average: sum / marks.length,
    highest: Math.max(...marks),
    lowest: Math.min(...marks),
    passRate: passed / marks.length,
  }
}

function gradeFor(percent: number): string {
  if (percent >= 0.9) return 'A+'
  if (percent >= 0.8) return 'A'
  if (percent >= 0.7) return 'B'
  if (percent >= 0.6) return 'C'
  if (percent >= 0.5) return 'D'
  return 'F'
}

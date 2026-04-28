import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ClipboardCheck } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { useTenant } from '@/shared/hooks/useTenant'

import { GradebookTable } from '../components/GradebookTable'
import { useClassesList, useExam, useExamsList, useGradebook } from '../hooks'

export function GradebookPage() {
  const { tenant } = useTenant()
  const [params, setParams] = useSearchParams()

  const examsQ = useExamsList(tenant.id)
  const classesQ = useClassesList(tenant.id)

  const [examId, setExamId] = useState(params.get('examId') ?? '')
  const [paperId, setPaperId] = useState(params.get('paperId') ?? '')
  const [sectionId, setSectionId] = useState('')

  const examQ = useExam(tenant.id, examId || undefined)

  // Default exam: first published or graded
  useEffect(() => {
    if (!examId && examsQ.data?.items[0]) {
      setExamId(examsQ.data.items[0].id)
    }
  }, [examId, examsQ.data])

  // Default paper for current exam
  useEffect(() => {
    if (examQ.data && !paperId && examQ.data.papers[0]) {
      setPaperId(examQ.data.papers[0].id)
    }
  }, [examQ.data, paperId])

  // Default section: first
  useEffect(() => {
    if (!sectionId && classesQ.data?.items[0]?.sections[0]) {
      setSectionId(classesQ.data.items[0].sections[0].id)
    }
  }, [sectionId, classesQ.data])

  // Persist examId/paperId in URL
  useEffect(() => {
    if (examId && paperId) {
      setParams({ examId, paperId }, { replace: true })
    }
  }, [examId, paperId, setParams])

  const allSections = useMemo(
    () =>
      classesQ.data?.items.flatMap((c) =>
        c.sections.map((s) => ({
          ...s,
          label: `${c.name} · Section ${s.sectionName}`,
        })),
      ) ?? [],
    [classesQ.data],
  )

  const gb = useGradebook(
    tenant.id,
    examId || undefined,
    paperId || undefined,
    sectionId || undefined,
  )

  return (
    <PageContainer>
      <PageHeader
        title="Gradebook"
        description="Enter and review marks per paper × section"
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={examId}
              onValueChange={(v) => {
                setExamId(v)
                setPaperId('')
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Exam" />
              </SelectTrigger>
              <SelectContent>
                {examsQ.data?.items.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paperId} onValueChange={setPaperId} disabled={!examId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Paper" />
              </SelectTrigger>
              <SelectContent>
                {examQ.data?.papers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sectionId} onValueChange={setSectionId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                {allSections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!examId || !paperId || !sectionId ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <ClipboardCheck className="size-8 opacity-50" />
              <p>Pick an exam, paper, and section to load the gradebook.</p>
            </div>
          ) : gb.isLoading || !gb.data ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm">
                <span className="font-medium">{gb.data.examName}</span>{' '}
                <span className="text-muted-foreground">
                  · {gb.data.subjectName} · {gb.data.className}{' '}
                  {gb.data.sectionName}
                </span>
              </p>
              <GradebookTable gradebook={gb.data} />
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

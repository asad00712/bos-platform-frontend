import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Printer } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
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

import { TimetableGrid } from '../components/TimetableGrid'
import { useClassesList, useTeachersList, useTimetable } from '../hooks'

export function TimetablePage() {
  const { tenant } = useTenant()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialClassId = searchParams.get('classId') ?? ''

  const tt = useTimetable(tenant.id)
  const classesQ = useClassesList(tenant.id)
  const teachersQ = useTeachersList(tenant.id)

  const [view, setView] = useState<'class' | 'teacher'>('class')
  const [classId, setClassId] = useState<string>(initialClassId)
  const [sectionId, setSectionId] = useState<string>('')
  const [teacherId, setTeacherId] = useState<string>('')

  const sectionsForClass = useMemo(() => {
    return classesQ.data?.items.find((c) => c.id === classId)?.sections ?? []
  }, [classesQ.data, classId])

  // Default to the first class/section if none picked
  useMemo(() => {
    if (view === 'class' && !classId && classesQ.data?.items[0]) {
      setClassId(classesQ.data.items[0].id)
      setSectionId(classesQ.data.items[0].sections[0]?.id ?? '')
    }
  }, [view, classId, classesQ.data])

  const updateClass = (id: string) => {
    setClassId(id)
    const firstSection =
      classesQ.data?.items.find((c) => c.id === id)?.sections[0]?.id ?? ''
    setSectionId(firstSection)
    setSearchParams({ classId: id })
  }

  if (tt.isLoading || !tt.data) {
    return (
      <PageContainer>
        <PageHeader title="Timetable" description="Loading…" />
        <Skeleton className="h-[480px] w-full rounded-lg" />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Timetable"
        description="Period × day grid · period times include breaks"
        actions={
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer /> Print
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={view}
              onValueChange={(v) => setView(v as 'class' | 'teacher')}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="class">By class</SelectItem>
                <SelectItem value="teacher">By teacher</SelectItem>
              </SelectContent>
            </Select>

            {view === 'class' ? (
              <>
                <Select value={classId} onValueChange={updateClass}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classesQ.data?.items.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={sectionId}
                  onValueChange={setSectionId}
                  disabled={!classId}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionsForClass.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        Section {s.sectionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachersQ.data?.items.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <TimetableGrid
            timetable={tt.data}
            classId={view === 'class' ? classId || undefined : undefined}
            sectionId={view === 'class' ? sectionId || undefined : undefined}
            teacherId={view === 'teacher' ? teacherId || undefined : undefined}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

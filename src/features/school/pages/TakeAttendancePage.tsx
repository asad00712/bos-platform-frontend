import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck } from 'lucide-react'

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

import { formatDate } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import { AttendanceMarker } from '../components/AttendanceMarker'
import { useAttendanceRoster, useClassesList } from '../hooks'

export function TakeAttendancePage() {
  const { tenant } = useTenant()
  const classesQ = useClassesList(tenant.id)

  const [classId, setClassId] = useState<string>('')
  const [sectionId, setSectionId] = useState<string>('')

  const sectionsForClass = useMemo(
    () => classesQ.data?.items.find((c) => c.id === classId)?.sections ?? [],
    [classesQ.data, classId],
  )

  useEffect(() => {
    if (!classId && classesQ.data?.items[0]) {
      const firstClass = classesQ.data.items[0]
      setClassId(firstClass.id)
      setSectionId(firstClass.sections[0]?.id ?? '')
    }
  }, [classId, classesQ.data])

  const roster = useAttendanceRoster(tenant.id, sectionId || undefined)

  return (
    <PageContainer>
      <PageHeader
        title="Take attendance"
        description={`Mark presence for ${formatDate(new Date(), { dateStyle: 'full' })}`}
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={classId}
              onValueChange={(v) => {
                setClassId(v)
                const firstSection =
                  classesQ.data?.items.find((c) => c.id === v)?.sections[0]?.id ?? ''
                setSectionId(firstSection)
              }}
            >
              <SelectTrigger className="w-[160px]">
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
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                {sectionsForClass.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    Section {s.sectionName} · {s.enrolled} students
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {roster.data ? (
              <p className="ms-auto text-xs text-muted-foreground">
                {roster.data.records.length} students ·{' '}
                {roster.data.className} · {roster.data.sectionName}
              </p>
            ) : null}
          </div>

          {roster.isLoading || !roster.data ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : roster.data.records.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <CalendarCheck className="size-8 opacity-50" />
              <p>No students in this section.</p>
            </div>
          ) : (
            <AttendanceMarker roster={roster.data} sectionId={sectionId} />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

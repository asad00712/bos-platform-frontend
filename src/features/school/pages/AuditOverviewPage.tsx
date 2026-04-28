import { useMemo } from 'react'

import {
  VerticalAuditPage,
  type VerticalAuditEvent,
} from '@/shared/ui/vertical-audit-page'
import { useTenant } from '@/shared/hooks/useTenant'

import { useStudentList } from '../hooks'

/**
 * School audit overview. Stitches a deterministic event stream from the
 * student panel mock (record opens + attendance saves + report-card
 * publishes) until the school backend exposes a real audit feed.
 */
export function AuditOverviewPage() {
  const { tenant } = useTenant()
  const list = useStudentList(tenant.id, {})

  const events: VerticalAuditEvent[] = useMemo(() => {
    const items = list.data?.items ?? []
    const out: VerticalAuditEvent[] = []
    items.slice(0, 14).forEach((s, i) => {
      const t = Date.now() - i * 1000 * 60 * 39
      out.push({
        id: `aud-s-${s.id}-open`,
        actorName: s.homeroomTeacher ?? 'Front office',
        action: 'Opened student record',
        subjectName: `${s.firstName} ${s.lastName}`,
        subjectType: 'student',
        occurredAt: new Date(t).toISOString(),
        ip: '10.0.0.5',
      })
      if (i % 4 === 0) {
        out.push({
          id: `aud-s-${s.id}-att`,
          actorName: s.homeroomTeacher ?? 'Teacher',
          action: 'Saved attendance',
          subjectName: `${s.className} · Section ${s.sectionName}`,
          subjectType: 'attendance',
          occurredAt: new Date(t - 4 * 60 * 1000).toISOString(),
          ip: '10.0.0.5',
        })
      }
      if (i === 2) {
        out.push({
          id: `aud-s-${s.id}-rc`,
          actorName: 'Principal',
          action: 'Published report card',
          subjectName: `${s.firstName} ${s.lastName}`,
          subjectType: 'report_card',
          occurredAt: new Date(t - 30 * 60 * 1000).toISOString(),
          ip: '10.0.0.7',
        })
      }
    })
    return out.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
  }, [list.data])

  return (
    <VerticalAuditPage
      title="School audit"
      description="Student record access, attendance saves, and report-card publishes."
      breadcrumbs={[
        { label: 'School', href: '/app/school/students' },
        { label: 'Audit' },
      ]}
      events={events}
      isLoading={list.isLoading}
      subjectTypes={['student', 'attendance', 'report_card']}
    />
  )
}

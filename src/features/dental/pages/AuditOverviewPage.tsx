import { useMemo } from 'react'

import {
  VerticalAuditPage,
  type VerticalAuditEvent,
} from '@/shared/ui/vertical-audit-page'
import { useTenant } from '@/shared/hooks/useTenant'

import { usePatientList } from '../hooks'

/**
 * Dental audit overview. Builds a deterministic event stream from the
 * patient list mock (chart opens + treatment-plan signs + claim
 * submissions) until the dental backend exposes a real audit feed.
 */
export function AuditOverviewPage() {
  const { tenant } = useTenant()
  const list = usePatientList(tenant.id, {})

  const events: VerticalAuditEvent[] = useMemo(() => {
    const items = list.data?.items ?? []
    const out: VerticalAuditEvent[] = []
    items.slice(0, 12).forEach((p, i) => {
      const t = Date.now() - i * 1000 * 60 * 47
      out.push({
        id: `aud-d-${p.id}-open`,
        actorName: p.primaryDentistName ?? 'Front desk',
        action: 'Opened patient chart',
        subjectName: `${p.firstName} ${p.lastName}`,
        subjectType: 'patient',
        occurredAt: new Date(t).toISOString(),
        ip: '10.0.0.5',
      })
      if (i % 3 === 0) {
        out.push({
          id: `aud-d-${p.id}-tp`,
          actorName: p.primaryDentistName ?? 'Dr. Hassan',
          action: 'Signed treatment plan',
          subjectName: `${p.firstName} ${p.lastName}`,
          subjectType: 'treatment_plan',
          occurredAt: new Date(t - 5 * 60 * 1000).toISOString(),
          ip: '10.0.0.5',
        })
      }
      if (i === 1) {
        out.push({
          id: `aud-d-${p.id}-claim`,
          actorName: 'Billing team',
          action: 'Submitted claim',
          subjectName: `Claim CLM-1024`,
          subjectType: 'claim',
          occurredAt: new Date(t - 20 * 60 * 1000).toISOString(),
          ip: '10.0.0.6',
        })
      }
    })
    return out.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
  }, [list.data])

  return (
    <VerticalAuditPage
      title="Dental audit"
      description="Patient chart access, treatment-plan signing, and claim submissions."
      breadcrumbs={[
        { label: 'Dental', href: '/app/dental/patients' },
        { label: 'Audit' },
      ]}
      events={events}
      isLoading={list.isLoading}
      subjectTypes={['patient', 'treatment_plan', 'claim']}
    />
  )
}

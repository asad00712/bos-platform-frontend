import { Link, Outlet, useParams } from 'react-router'
import { ArrowLeft, ShieldAlert } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

import { useTenant } from '@/shared/hooks/useTenant'
import { useAllergies, useAuditEvents, usePatient, usePregnancy } from '../hooks'
import { AllergyAckBanner } from '../components/AllergyAckBanner'
import { ChartSidebar } from '../components/ChartSidebar'
import { PatientStoryboard } from '../components/PatientStoryboard'
import { BreakGlassDialog } from '../components/BreakGlassDialog'
import { toast } from 'sonner'

export function PatientChartLayout() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const patient = usePatient(tenant.id, id)
  const allergies = useAllergies(tenant.id, id)
  const pregnancy = usePregnancy(tenant.id, id)
  // We don't render audit here — but pre-warm the cache so the "audit"
  // section loads instantly when the clinician taps "Who viewed?".
  useAuditEvents(tenant.id, id)

  if (patient.isLoading || !patient.data) {
    return (
      <PageContainer>
        <PageHeader title="Loading patient…" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </PageContainer>
    )
  }

  if (patient.isError) {
    return (
      <PageContainer>
        <PageHeader title="Patient" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldAlert />
            </EmptyMedia>
            <EmptyTitle>Patient not found</EmptyTitle>
            <EmptyDescription>
              {(patient.error as Error)?.message ?? 'They may have been removed.'}
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to="/app/medical/patients">
              <ArrowLeft /> Back to patients
            </Link>
          </Button>
        </Empty>
      </PageContainer>
    )
  }

  const fullName = `${patient.data.patient.name.preferred ?? patient.data.patient.name.given} ${patient.data.patient.name.family}`

  return (
    <PageContainer>
      <PageHeader
        title={fullName}
        breadcrumbs={[
          { label: 'Patients', href: '/app/medical/patients' },
          { label: fullName },
        ]}
        actions={
          <BreakGlassDialog
            trigger={
              <Button variant="outline" size="sm" className="gap-1.5">
                <ShieldAlert className="size-4 text-rose-500" /> Emergency access
              </Button>
            }
            onConfirm={(reason) => {
              toast.success('Break-glass access opened', {
                description: 'Logged for privacy review.',
              })
              // Real impl would call a server endpoint and start a 60-min window.
              void reason
            }}
          />
        }
      />

      <PatientStoryboard detail={patient.data} />

      <AllergyAckBanner
        allergies={allergies.data?.items ?? []}
        noKnownAllergies={Boolean(allergies.data?.noKnownAllergies)}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[14rem_1fr]">
        <aside className="hidden lg:block">
          <ChartSidebar
            patientId={patient.data.patient.id}
            ageBand={patient.data.ageBand}
            hasActivePregnancy={Boolean(pregnancy.data)}
          />
        </aside>
        <div className="min-w-0">
          <Card>
            <CardContent className="p-5">
              <Outlet />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

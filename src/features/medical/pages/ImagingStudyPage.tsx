import { Link, useParams } from 'react-router'
import { ArrowLeft, ExternalLink, Eye, Image, Layers } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
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

import { formatDateTime } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'
import { BidiCode } from '@/shared/lib/bidi'

import { useImaging, usePatient } from '../hooks'

/**
 * Imaging detail. We don't ship a real DICOM viewer (medical-rule §8 —
 * scope notes); we provide a structured surface listing modality, study
 * description, body part, accession + study UID, status, radiologist,
 * findings + impression, and a deep-link to the external PACS viewer.
 *
 * Looking up the study requires a patientId — pulled by walking the
 * imaging list of the active patient referenced from the chart. When
 * landed via direct URL we fall back to a global search hint.
 */
export function ImagingStudyPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()

  // Until a study-by-id endpoint exists, we walk the imaging lists of
  // the demo-seed patients with imaging on file. Hooks are unconditional
  // (rules-of-hooks compliant); React Query dedupes by key.
  const q1 = useImaging(tenant.id, 'pat-fernando-g')
  const q2 = useImaging(tenant.id, 'pat-priya-s')
  const q3 = useImaging(tenant.id, 'pat-nora-m')
  const q4 = useImaging(tenant.id, 'pat-khalid-a')
  const q5 = useImaging(tenant.id, 'pat-sandra-l')
  const studies = [
    ...(q1.data?.items ?? []),
    ...(q2.data?.items ?? []),
    ...(q3.data?.items ?? []),
    ...(q4.data?.items ?? []),
    ...(q5.data?.items ?? []),
  ]
  const study = studies.find((s) => s.id === id)
  const patientId = study?.patientId
  const patient = usePatient(tenant.id, patientId)

  const isLoading = q1.isLoading || q2.isLoading || q3.isLoading || q4.isLoading || q5.isLoading

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Loading study…" />
        <Skeleton className="h-72 w-full" />
      </PageContainer>
    )
  }

  if (!study) {
    return (
      <PageContainer>
        <PageHeader title="Imaging study" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Image />
            </EmptyMedia>
            <EmptyTitle>Study not found</EmptyTitle>
            <EmptyDescription>
              Open the study from the patient's chart, or check the accession number.
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

  return (
    <PageContainer>
      <PageHeader
        title={study.studyDescription}
        description={`${formatDateTime(study.performedAt)} · ${study.performingFacility}`}
        breadcrumbs={[
          { label: 'Patients', href: '/app/medical/patients' },
          patient.data
            ? {
                label: `${patient.data.patient.name.preferred ?? patient.data.patient.name.given} ${patient.data.patient.name.family}`,
                href: `/app/medical/patients/${patient.data.patient.id}/imaging`,
              }
            : { label: 'Patient' },
          { label: study.studyDescription },
        ]}
        actions={
          <>
            <Badge variant="outline" className="font-mono uppercase">
              {study.modality}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {study.status.replace('_', ' ')}
            </Badge>
            {study.pacsUrl ? (
              <Button asChild>
                <a href={study.pacsUrl} target="_blank" rel="noreferrer">
                  <Layers className="me-1 size-4" /> Open in PACS
                  <ExternalLink className="ms-1 size-3" />
                </a>
              </Button>
            ) : null}
          </>
        }
      />

      <Card>
        <CardContent className="grid grid-cols-2 gap-3 p-5 text-sm md:grid-cols-3">
          <KV k="Body part" v={study.bodyPart} />
          <KV k="Laterality" v={study.laterality === 'na' ? '—' : study.laterality} />
          <KV k="Contrast" v={study.contrast ? 'Yes' : 'No'} />
          <KV k="Accession" v={<BidiCode>{study.accessionNumber}</BidiCode>} />
          <KV k="Study UID" v={<BidiCode className="text-[11px]">{study.studyUid}</BidiCode>} />
          <KV k="Radiologist" v={study.radiologist ?? '—'} />
        </CardContent>
      </Card>

      {study.findings || study.impression ? (
        <Card>
          <CardContent className="space-y-3 p-5 text-sm">
            {study.findings ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Findings
                </p>
                <p className="mt-1 whitespace-pre-line leading-relaxed">{study.findings}</p>
              </div>
            ) : null}
            {study.impression ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Impression
                </p>
                <p className="mt-1 whitespace-pre-line leading-relaxed">{study.impression}</p>
              </div>
            ) : (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-300">
                Read pending. Final impression has not been dictated yet.
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
          <Eye className="size-4" />
          <p>
            Series + thumbnail viewer ships with the integrated PACS. For now, use the deep-link
            above to launch the external viewer.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</p>
      <div className="font-medium capitalize tabular-nums">{v}</div>
    </div>
  )
}

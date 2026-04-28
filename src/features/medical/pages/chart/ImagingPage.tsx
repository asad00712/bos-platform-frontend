import { Link, useParams } from 'react-router'
import { Eye, ExternalLink, Image, Layers } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatDate } from '@/shared/lib/format'
import { BidiCode } from '@/shared/lib/bidi'

import { useImaging } from '../../hooks'
import type { ImagingStudy } from '../../api/medical.contracts'

const STATUS_TONE: Record<ImagingStudy['status'], string> = {
  ordered: 'border-sky-500/40 bg-sky-500/5 text-sky-700 dark:text-sky-300',
  scheduled: 'border-sky-500/40 bg-sky-500/5 text-sky-700 dark:text-sky-300',
  performed: 'border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300',
  dictated: 'border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300',
  final_read: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300',
}

const STATUS_LABEL: Record<ImagingStudy['status'], string> = {
  ordered: 'Ordered',
  scheduled: 'Scheduled',
  performed: 'Performed',
  dictated: 'Dictated · pending read',
  final_read: 'Final read',
}

export function ImagingPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const q = useImaging(tenant.id, id)
  const items = q.data?.items ?? []

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Imaging</h2>
        <p className="text-sm text-muted-foreground">
          Studies, modality, and the radiologist read. PDF + PACS deep-link where available.
        </p>
      </header>

      {q.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Image className="size-4" /> No imaging on file.
        </p>
      ) : (
        <ul className="space-y-2">
          {items
            .slice()
            .sort((a, b) => b.performedAt.localeCompare(a.performedAt))
            .map((s) => (
              <li key={s.id} className="rounded-md border p-3 text-sm">
                <div className="flex flex-wrap items-baseline gap-2">
                  <Badge variant="outline" className="font-mono uppercase">
                    {s.modality}
                  </Badge>
                  <span className="break-words font-medium">{s.studyDescription}</span>
                  {s.contrast ? (
                    <Badge variant="outline" className="text-[10px] uppercase">
                      Contrast
                    </Badge>
                  ) : null}
                  {s.laterality !== 'na' ? (
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {s.laterality}
                    </Badge>
                  ) : null}
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_TONE[s.status]}`}
                  >
                    {STATUS_LABEL[s.status]}
                  </span>
                  <span className="ms-auto text-xs text-muted-foreground">
                    {formatDate(s.performedAt, { dateStyle: 'medium' })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.bodyPart} · {s.performingFacility}
                  <span className="mx-1.5">·</span>
                  <BidiCode>{s.accessionNumber}</BidiCode>
                </p>
                {s.findings ? (
                  <p className="mt-2 break-words text-sm">
                    <span className="font-medium text-muted-foreground">Findings: </span>
                    {s.findings}
                  </p>
                ) : null}
                {s.impression ? (
                  <p className="mt-1 break-words text-sm">
                    <span className="font-medium text-muted-foreground">Impression: </span>
                    {s.impression}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {s.radiologist ? (
                    <span className="text-xs text-muted-foreground">Read by {s.radiologist}</span>
                  ) : null}
                  <div className="ms-auto flex gap-2">
                    <Button asChild size="sm" variant="ghost">
                      <Link to={`/app/medical/imaging/${s.id}`}>
                        <Eye className="me-1 size-3.5" /> Detail
                      </Link>
                    </Button>
                    {s.pacsUrl ? (
                      <Button asChild size="sm" variant="outline">
                        <a href={s.pacsUrl} target="_blank" rel="noreferrer">
                          <Layers className="me-1 size-3.5" /> PACS
                          <ExternalLink className="ms-1 size-3" />
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}

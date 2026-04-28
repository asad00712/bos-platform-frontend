import { Hammer } from 'lucide-react'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

/**
 * Stub used for chart sections owned by later sub-phases (Medications,
 * Immunizations, Growth, Labs, Imaging, Pregnancy, Psych). Lets the
 * sidebar route resolve cleanly today; replaced section-by-section.
 */
export function ComingSoonPage({ title, subPhase }: { title: string; subPhase: string }) {
  return (
    <Empty className="py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Hammer />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          Lands in {subPhase}. Data is already mocked — the page just hasn't been
          composed yet.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

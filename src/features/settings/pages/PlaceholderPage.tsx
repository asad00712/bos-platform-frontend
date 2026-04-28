import type { LucideIcon } from 'lucide-react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { SectionPanel } from '../components/SectionPanel'

type Props = {
  title: string
  description: string
  emptyTitle: string
  emptyDescription: string
  Icon: LucideIcon
}

export function PlaceholderSettingsPage({
  title,
  description,
  emptyTitle,
  emptyDescription,
  Icon,
}: Props) {
  return (
    <SectionPanel title={title} description={description}>
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon />
          </EmptyMedia>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </SectionPanel>
  )
}

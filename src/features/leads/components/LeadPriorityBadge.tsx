import { Badge } from '@/shared/ui/badge'
import type { LeadPriority } from '@/types/crm'

const VARIANT: Record<LeadPriority, 'default' | 'secondary' | 'outline'> = {
  high: 'default',
  medium: 'secondary',
  low: 'outline',
}

const LABEL: Record<LeadPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export function LeadPriorityBadge({ priority }: { priority: LeadPriority }) {
  return (
    <Badge variant={VARIANT[priority]} className="capitalize">
      {LABEL[priority]}
    </Badge>
  )
}

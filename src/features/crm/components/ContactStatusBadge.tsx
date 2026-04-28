import { Badge } from '@/shared/ui/badge'
import type { ContactStatus } from '../api/crm.contracts'

const STATUS_VARIANT: Record<ContactStatus, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  inactive: 'secondary',
  archived: 'outline',
}

const STATUS_LABEL: Record<ContactStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
}

export function ContactStatusBadge({ status }: { status: ContactStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="capitalize">
      {STATUS_LABEL[status]}
    </Badge>
  )
}

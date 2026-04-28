import { Badge } from '@/shared/ui/badge'
import type {
  DocumentKind,
  DocumentStatus,
  SignatureStatus,
} from '../api/documents.contracts'

const KIND_LABEL: Record<DocumentKind, string> = {
  contract: 'Contract',
  consent: 'Consent',
  template: 'Template',
  invoice: 'Invoice',
  medical: 'Medical',
  general: 'General',
}

const KIND_VARIANT: Record<DocumentKind, 'default' | 'secondary' | 'outline'> = {
  contract: 'default',
  consent: 'secondary',
  template: 'outline',
  invoice: 'outline',
  medical: 'secondary',
  general: 'outline',
}

export function DocumentKindBadge({ kind }: { kind: DocumentKind }) {
  return <Badge variant={KIND_VARIANT[kind]}>{KIND_LABEL[kind]}</Badge>
}

const STATUS_VARIANT: Record<
  DocumentStatus,
  'default' | 'secondary' | 'outline'
> = {
  draft: 'outline',
  pending_review: 'secondary',
  active: 'default',
  archived: 'outline',
}

const STATUS_LABEL: Record<DocumentStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending review',
  active: 'Active',
  archived: 'Archived',
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
}

const SIG_VARIANT: Record<
  SignatureStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending: 'outline',
  sent: 'secondary',
  signed: 'default',
  declined: 'destructive',
  expired: 'destructive',
}

const SIG_LABEL: Record<SignatureStatus, string> = {
  pending: 'Pending',
  sent: 'Sent',
  signed: 'Signed',
  declined: 'Declined',
  expired: 'Expired',
}

export function SignatureStatusBadge({ status }: { status: SignatureStatus }) {
  return <Badge variant={SIG_VARIANT[status]}>{SIG_LABEL[status]}</Badge>
}

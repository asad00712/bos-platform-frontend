import { Badge } from '@/shared/ui/badge'
import type {
  ClaimStatus,
  PatientStatus,
  ProcedureStatus,
  ToothConditionKind,
  TreatmentPlanStatus,
} from '../api/dental.contracts'

const PATIENT_STATUS_VARIANT: Record<
  PatientStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  active: 'default',
  recall_due: 'secondary',
  inactive: 'outline',
  archived: 'outline',
}

const PATIENT_STATUS_LABEL: Record<PatientStatus, string> = {
  active: 'Active',
  recall_due: 'Recall due',
  inactive: 'Inactive',
  archived: 'Archived',
}

export function PatientStatusBadge({ status }: { status: PatientStatus }) {
  return (
    <Badge variant={PATIENT_STATUS_VARIANT[status]}>
      {PATIENT_STATUS_LABEL[status]}
    </Badge>
  )
}

const PLAN_VARIANT: Record<
  TreatmentPlanStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  draft: 'outline',
  proposed: 'secondary',
  accepted: 'default',
  in_progress: 'default',
  completed: 'outline',
  declined: 'destructive',
}

const PLAN_LABEL: Record<TreatmentPlanStatus, string> = {
  draft: 'Draft',
  proposed: 'Proposed',
  accepted: 'Accepted',
  in_progress: 'In progress',
  completed: 'Completed',
  declined: 'Declined',
}

export function TreatmentPlanStatusBadge({
  status,
}: {
  status: TreatmentPlanStatus
}) {
  return <Badge variant={PLAN_VARIANT[status]}>{PLAN_LABEL[status]}</Badge>
}

const PROC_VARIANT: Record<
  ProcedureStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  planned: 'outline',
  in_progress: 'secondary',
  completed: 'default',
  cancelled: 'destructive',
}

const PROC_LABEL: Record<ProcedureStatus, string> = {
  planned: 'Planned',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function ProcedureStatusBadge({ status }: { status: ProcedureStatus }) {
  return <Badge variant={PROC_VARIANT[status]}>{PROC_LABEL[status]}</Badge>
}

const CLAIM_VARIANT: Record<
  ClaimStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  draft: 'outline',
  submitted: 'secondary',
  approved: 'default',
  partial: 'secondary',
  denied: 'destructive',
  paid: 'default',
}

const CLAIM_LABEL: Record<ClaimStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  partial: 'Partial',
  denied: 'Denied',
  paid: 'Paid',
}

export function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  return <Badge variant={CLAIM_VARIANT[status]}>{CLAIM_LABEL[status]}</Badge>
}

export const TOOTH_KIND_TONE: Record<ToothConditionKind, string> = {
  healthy: 'bg-card border-border',
  caries: 'bg-rose-500/20 border-rose-500/50 text-rose-700 dark:text-rose-300',
  restoration: 'bg-blue-500/20 border-blue-500/50 text-blue-700 dark:text-blue-300',
  crown:
    'bg-amber-500/25 border-amber-500/60 text-amber-700 dark:text-amber-300',
  root_canal: 'bg-violet-500/20 border-violet-500/50 text-violet-700 dark:text-violet-300',
  extraction: 'bg-muted text-muted-foreground border-border line-through',
  implant: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-700 dark:text-emerald-300',
  watch: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-700 dark:text-yellow-300',
}

export const TOOTH_KIND_LABEL: Record<ToothConditionKind, string> = {
  healthy: 'Healthy',
  caries: 'Caries',
  restoration: 'Restoration',
  crown: 'Crown',
  root_canal: 'Root canal',
  extraction: 'Extraction',
  implant: 'Implant',
  watch: 'Watch',
}

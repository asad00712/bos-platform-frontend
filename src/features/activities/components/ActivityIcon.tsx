import {
  CalendarDays,
  CheckSquare,
  FileText,
  Mail,
  MessageSquareText,
  Phone,
  Receipt,
  Sparkles,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { ActivityKind } from '@/types/crm'

type Spec = { Icon: LucideIcon; tone: string; label: string }

const SPEC: Record<ActivityKind, Spec> = {
  note: {
    Icon: FileText,
    tone: 'bg-muted text-muted-foreground',
    label: 'Note',
  },
  call: {
    Icon: Phone,
    tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    label: 'Call',
  },
  email: {
    Icon: Mail,
    tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    label: 'Email',
  },
  sms: {
    Icon: MessageSquareText,
    tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    label: 'SMS',
  },
  whatsapp: {
    Icon: MessageSquareText,
    tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    label: 'WhatsApp',
  },
  meeting: {
    Icon: Users,
    tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    label: 'Meeting',
  },
  task: {
    Icon: CheckSquare,
    tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    label: 'Task',
  },
  appointment: {
    Icon: CalendarDays,
    tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    label: 'Appointment',
  },
  invoice: {
    Icon: Receipt,
    tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    label: 'Invoice',
  },
  system: {
    Icon: Sparkles,
    tone: 'bg-muted text-muted-foreground',
    label: 'System',
  },
}

export function activityIconSpec(kind: ActivityKind): Spec {
  return SPEC[kind] ?? SPEC.note
}

export function ActivityIcon({
  kind,
  className,
}: {
  kind: ActivityKind
  className?: string
}) {
  const { Icon, tone } = activityIconSpec(kind)
  return (
    <span
      className={`grid size-8 shrink-0 place-items-center rounded-md ${tone} ${className ?? ''}`}
    >
      <Icon className="size-4" />
    </span>
  )
}

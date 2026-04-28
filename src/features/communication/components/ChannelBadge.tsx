import { Mail, MessageSquareText, Phone, StickyNote } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import type { Channel } from '../api/communication.contracts'

const META: Record<
  Channel,
  { Icon: LucideIcon; label: string; tone: string }
> = {
  email: {
    Icon: Mail,
    label: 'Email',
    tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  sms: {
    Icon: MessageSquareText,
    label: 'SMS',
    tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  note: {
    Icon: StickyNote,
    label: 'Internal',
    tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  call: {
    Icon: Phone,
    label: 'Call',
    tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  const { Icon, label } = META[channel]
  return (
    <Badge variant="outline" className="gap-1">
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}

export function ChannelIcon({
  channel,
  className,
}: {
  channel: Channel
  className?: string
}) {
  const { Icon, tone } = META[channel]
  return (
    <span
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-md',
        tone,
        className,
      )}
    >
      <Icon className="size-4" />
    </span>
  )
}

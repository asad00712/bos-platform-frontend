import type { LeadStatus } from '@/types/crm'

export function LeadStatusChip({ status }: { status: LeadStatus | undefined | null }) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        No status
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{
        background: status.color
          ? `color-mix(in oklch, ${status.color} 18%, transparent)`
          : 'var(--muted)',
        color: status.color ?? 'var(--muted-foreground)',
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: status.color ?? 'var(--muted-foreground)' }}
      />
      {status.name}
    </span>
  )
}

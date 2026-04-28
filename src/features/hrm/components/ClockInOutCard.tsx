import { useEffect, useState } from 'react'
import { Clock, LogIn, LogOut } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import { formatTime } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import { useClockIn, useClockOut, useTodayAttendance } from '../hooks'
import type { AttendanceEntry } from '../api/hrm.contracts'

type Props = {
  employeeId: string
  employeeName: string
  className?: string
}

/** Shows current clock-in state for an employee + a clock-in/out button. */
export function ClockInOutCard({ employeeId, employeeName, className }: Props) {
  const { tenant } = useTenant()
  const list = useTodayAttendance(tenant.id)
  const clockIn = useClockIn(tenant.id)
  const clockOut = useClockOut(tenant.id)

  const today = list.data?.items.find(
    (e) => e.employeeId === employeeId,
  )

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Time clock
            </p>
            <p className="text-base font-medium">{employeeName}</p>
          </div>
          <span className="grid size-10 place-items-center rounded-md bg-muted text-muted-foreground">
            <Clock className="size-5" />
          </span>
        </div>

        <LiveTime />

        {list.isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <ClockState entry={today} />
        )}

        <ClockButtons
          today={today}
          isPending={clockIn.isPending || clockOut.isPending}
          onClockIn={() => clockIn.mutate({ employeeId, employeeName })}
          onClockOut={() => clockOut.mutate(employeeId)}
        />
      </CardContent>
    </Card>
  )
}

function LiveTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1_000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="font-mono text-3xl font-semibold tabular-nums">
      {now.toLocaleTimeString()}
    </div>
  )
}

function ClockState({ entry }: { entry: AttendanceEntry | undefined }) {
  if (!entry || (!entry.clockInAt && !entry.clockOutAt)) {
    return (
      <p className="text-sm text-muted-foreground">
        Not clocked in yet today.
      </p>
    )
  }
  if (entry.clockInAt && !entry.clockOutAt) {
    return (
      <p className="text-sm text-muted-foreground">
        Clocked in at <span className="font-medium">{formatTime(entry.clockInAt)}</span>
        {entry.state === 'late' ? ' · marked late' : ''}.
      </p>
    )
  }
  if (entry.clockInAt && entry.clockOutAt) {
    return (
      <p className="text-sm text-muted-foreground">
        Today: {formatTime(entry.clockInAt)} → {formatTime(entry.clockOutAt)} ·{' '}
        <span className="font-medium">{entry.hoursWorked}h</span>
      </p>
    )
  }
  return null
}

function ClockButtons({
  today,
  isPending,
  onClockIn,
  onClockOut,
}: {
  today: AttendanceEntry | undefined
  isPending: boolean
  onClockIn: () => void
  onClockOut: () => void
}) {
  const isClockedIn = today?.clockInAt && !today?.clockOutAt
  if (isClockedIn) {
    return (
      <Button onClick={onClockOut} disabled={isPending} variant="destructive">
        <LogOut /> Clock out
      </Button>
    )
  }
  return (
    <Button onClick={onClockIn} disabled={isPending}>
      <LogIn /> Clock in
    </Button>
  )
}

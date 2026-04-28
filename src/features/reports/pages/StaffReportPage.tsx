import { useState } from 'react'
import { Link } from 'react-router'
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { KpiCard } from '@/shared/ui/kpi-card'
import { Panel } from '@/shared/ui/panel'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

import { formatPercent } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'
import { routes } from '@/routes/routeMap'

import { useStaffReport } from '../hooks'
import { presetRange } from '../lib/date-range'
import type { DateRange } from '../api/reports.contracts'
import { DateRangePicker } from '../components/DateRangePicker'

const config = {
  value: { label: 'Hours', color: 'var(--chart-3)' },
} satisfies ChartConfig

export function StaffReportPage() {
  const { tenant } = useTenant()
  const [range, setRange] = useState<DateRange>(() => presetRange('month'))
  const query = useStaffReport(tenant.id, range)

  return (
    <PageContainer>
      <PageHeader
        title="Staff report"
        description="Hours worked, attendance, and per-employee utilization."
        breadcrumbs={[
          { label: 'Reports', href: routes.app.reports() },
          { label: 'Staff' },
        ]}
        actions={<DateRangePicker value={range} onChange={setRange} />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard
          label="Total hours"
          value={query.data?.totalHoursWorked ?? 0}
          caption="Across all employees"
          isLoading={query.isLoading}
        />
        <KpiCard
          label="Attendance rate"
          value={(query.data?.attendanceRate ?? 0) * 100}
          caption="Days clocked in / scheduled"
          isLoading={query.isLoading}
        />
        <KpiCard
          label="Average per employee"
          value={query.data?.averageHoursPerEmployee ?? 0}
          caption="Hours"
          isLoading={query.isLoading}
        />
      </div>

      <Panel title="Hours worked" description="Daily total team hours">
        {query.isLoading || !query.data ? (
          <Skeleton className="h-[240px] w-full" />
        ) : (
          <ChartContainer config={config} className="h-[240px] w-full">
            <LineChart
              data={query.data.hoursByDay}
              margin={{ top: 8, right: 12, bottom: 8, left: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="preserveStartEnd"
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </Panel>

      <Card>
        <CardContent className="p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Per employee
          </p>
          {query.isLoading || !query.data ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Appointments</TableHead>
                  <TableHead className="text-right">Utilization</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.byEmployee.map((row) => (
                  <TableRow key={row.employeeId}>
                    <TableCell>
                      <Link
                        to={routes.app.hrm.employee(row.employeeId)}
                        className="font-medium underline-offset-2 hover:underline"
                      >
                        {row.employeeName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.hoursWorked}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.appointments}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPercent(row.utilization, 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

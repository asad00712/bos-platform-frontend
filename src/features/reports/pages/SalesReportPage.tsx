import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from 'recharts'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent } from '@/shared/ui/card'
import { Panel } from '@/shared/ui/panel'
import { KpiCard } from '@/shared/ui/kpi-card'
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

import { formatCompact, formatCurrency, formatPercent } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'
import { routes } from '@/routes/routeMap'

import { useSalesReport } from '../hooks'
import { presetRange } from '../lib/date-range'
import type { DateRange } from '../api/reports.contracts'
import { DateRangePicker } from '../components/DateRangePicker'

const PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

const revenueConfig = {
  value: { label: 'Revenue', color: 'var(--chart-1)' },
} satisfies ChartConfig

const methodConfig = {
  value: { label: 'Revenue' },
} satisfies ChartConfig

export function SalesReportPage() {
  const { tenant } = useTenant()
  const [range, setRange] = useState<DateRange>(() => presetRange('month'))
  const query = useSalesReport(tenant.id, range)

  const breakdownTotal = useMemo(
    () => (query.data?.byMethod ?? []).reduce((s, m) => s + m.value, 0) || 1,
    [query.data?.byMethod],
  )

  return (
    <PageContainer>
      <PageHeader
        title="Sales report"
        description="Revenue, collections, and payment mix."
        breadcrumbs={[
          { label: 'Reports', href: routes.app.reports() },
          { label: 'Sales' },
        ]}
        actions={<DateRangePicker value={range} onChange={setRange} />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total revenue"
          value={query.data?.totalRevenue ?? 0}
          currency={query.data?.currency}
          isLoading={query.isLoading}
        />
        <KpiCard
          label="Invoices"
          value={query.data?.invoiceCount ?? 0}
          isLoading={query.isLoading}
        />
        <KpiCard
          label="Average ticket"
          value={query.data?.averageTicket ?? 0}
          currency={query.data?.currency}
          isLoading={query.isLoading}
        />
        <KpiCard
          label="Collected rate"
          value={(query.data?.collectedRate ?? 0) * 100}
          caption="Paid / billed"
          isLoading={query.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          title="Revenue trend"
          description="Daily collected revenue"
          className="lg:col-span-2"
        >
          {query.isLoading || !query.data ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <ChartContainer config={revenueConfig} className="h-[260px] w-full">
              <AreaChart
                data={query.data.revenueByDay}
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
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCompact(Number(value))}
                    />
                  }
                />
                <Area
                  dataKey="value"
                  type="monotone"
                  fill="var(--color-value)"
                  fillOpacity={0.2}
                  stroke="var(--color-value)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </Panel>

        <Panel title="By payment method" description="Share of revenue">
          {query.isLoading || !query.data ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <ChartContainer config={methodConfig} className="aspect-square h-[180px]">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) =>
                          formatCurrency(Number(value), query.data!.currency, {
                            maximumFractionDigits: 0,
                          })
                        }
                      />
                    }
                  />
                  <Pie
                    data={query.data.byMethod}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={48}
                    outerRadius={76}
                    strokeWidth={2}
                  >
                    {query.data.byMethod.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <ul className="w-full space-y-1.5 text-xs">
                {query.data.byMethod.map((m, i) => (
                  <li key={m.key} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="size-2 rounded-full"
                        style={{ background: PALETTE[i % PALETTE.length] }}
                      />
                      {m.label}
                    </span>
                    <span className="text-muted-foreground">
                      {formatPercent(m.value / breakdownTotal, 0)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>
      </div>

      <Card>
        <CardContent className="p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Top contacts
          </p>
          {query.isLoading || !query.data ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Invoices</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.topContacts.map((c) => (
                  <TableRow key={c.contactId ?? c.contactName}>
                    <TableCell>
                      {c.contactId ? (
                        <Link
                          to={routes.app.crm.contact(c.contactId)}
                          className="font-medium underline-offset-2 hover:underline"
                        >
                          {c.contactName}
                        </Link>
                      ) : (
                        c.contactName
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.invoiceCount}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(c.revenue, query.data!.currency, {
                        maximumFractionDigits: 0,
                      })}
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

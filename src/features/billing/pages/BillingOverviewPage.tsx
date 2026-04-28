import { Link } from 'react-router'
import {
  AlertTriangle,
  CircleDollarSign,
  FileText,
  Plus,
  Wallet,
} from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { KpiCard } from '@/shared/ui/kpi-card'
import { useTenant } from '@/shared/hooks/useTenant'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { routes } from '@/routes/routeMap'

import { useBillingOverview } from '../hooks'
import { NewInvoiceDialog } from '../components/NewInvoiceDialog'

export function BillingOverviewPage() {
  const { tenant } = useTenant()
  const { has } = usePermissions()
  const overview = useBillingOverview(tenant.id)

  const canWrite = has('billing:write')
  const currency = overview.data?.currency ?? tenant.currency ?? 'USD'

  return (
    <PageContainer>
      <PageHeader
        title="Billing"
        description="Revenue, outstanding balances, and recent payments."
        actions={
          canWrite ? (
            <NewInvoiceDialog
              trigger={
                <Button>
                  <Plus /> New invoice
                </Button>
              }
            />
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Outstanding"
          value={overview.data?.outstanding ?? 0}
          currency={currency}
          icon={<CircleDollarSign className="size-4" />}
          isLoading={overview.isLoading}
        />
        <KpiCard
          label="Overdue"
          value={overview.data?.overdue ?? 0}
          currency={currency}
          icon={<AlertTriangle className="size-4" />}
          isLoading={overview.isLoading}
        />
        <KpiCard
          label="Paid in last 30 days"
          value={overview.data?.paidThisMonth ?? 0}
          currency={currency}
          icon={<Wallet className="size-4" />}
          isLoading={overview.isLoading}
        />
        <KpiCard
          label="Drafts"
          value={overview.data?.draftCount ?? 0}
          icon={<FileText className="size-4" />}
          isLoading={overview.isLoading}
          caption="Unsent invoices"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Button variant="outline" size="lg" asChild className="h-auto justify-start gap-3 p-5 text-start">
          <Link to={routes.app.billing.invoices()}>
            <FileText className="size-5" />
            <div>
              <div className="font-medium">All invoices</div>
              <div className="text-xs text-muted-foreground">
                Search, filter, and manage every invoice.
              </div>
            </div>
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild className="h-auto justify-start gap-3 p-5 text-start">
          <Link to={routes.app.billing.payments()}>
            <Wallet className="size-5" />
            <div>
              <div className="font-medium">Payments</div>
              <div className="text-xs text-muted-foreground">
                Every recorded payment across all invoices.
              </div>
            </div>
          </Link>
        </Button>
      </div>
    </PageContainer>
  )
}

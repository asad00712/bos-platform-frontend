import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { LayoutGrid, List, Plus, Workflow } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

import { useTenant } from '@/shared/hooks/useTenant'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useHasPermission } from '@/shared/auth/useHasPermission'
import { routes } from '@/routes/routeMap'

import type { LeadFilters } from '../api/leads.api'
import { useLeadsList } from '../hooks'
import { LeadsTable } from '../components/LeadsTable'
import { LeadsFilters } from '../components/LeadsFilters'
import { NewLeadDialog } from '../components/NewLeadDialog'

export function LeadsListPage() {
  const { tenant } = useTenant()
  const canCreate = useHasPermission('tenant:leads:create')

  const [filters, setFilters] = useState<LeadFilters>({})
  const debouncedSearch = useDebouncedValue(filters.search ?? '', 250)
  const queryFilters = useMemo<LeadFilters>(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch],
  )

  const list = useLeadsList(tenant.id, queryFilters)
  const total = list.data?.total ?? 0
  const items = list.data?.items

  return (
    <PageContainer>
      <PageHeader
        title="Leads"
        description={
          list.isLoading ? 'Loading leads…' : `${total} ${total === 1 ? 'lead' : 'leads'}`
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={routes.app.crm.leadKanban()}>
                <LayoutGrid /> Kanban
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={routes.app.crm.leadStatuses()}>Statuses</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={routes.app.crm.leadAssignment()}>Assignment</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={routes.app.crm.leadWebhooks()}>Webhooks</Link>
            </Button>
            {canCreate ? (
              <NewLeadDialog
                trigger={
                  <Button>
                    <Plus /> New lead
                  </Button>
                }
              />
            ) : null}
          </div>
        }
      />

      <Card>
        <CardContent className="p-4">
          {list.isError ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Workflow />
                </EmptyMedia>
                <EmptyTitle>Couldn&apos;t load leads</EmptyTitle>
                <EmptyDescription>
                  {(list.error as Error)?.message ?? 'Try refreshing.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <LeadsTable
              data={items}
              isLoading={list.isLoading}
              toolbar={<LeadsFilters value={filters} onChange={setFilters} />}
            />
          )}
        </CardContent>
      </Card>

      <p className="hidden">
        <List />
      </p>
    </PageContainer>
  )
}

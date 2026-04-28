import { useMemo, useState } from 'react'
import { Plus, UserSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
import { useHasPermission } from '@/shared/auth/useHasPermission'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

import { useContactList, useSegments } from '../hooks'
import type { ListFilters } from '../api/crm.contracts'
import { ContactsTable } from '../components/ContactsTable'
import { ContactFilters } from '../components/ContactFilters'
import { NewContactDialog } from '../components/NewContactDialog'

export function ContactsListPage() {
  const { t } = useTranslation()
  const { tenant } = useTenant()
  const canWrite = useHasPermission('tenant:contacts:create')

  const [filters, setFilters] = useState<ListFilters>({})
  const debouncedSearch = useDebouncedValue(filters.search ?? '', 250)

  const queryFilters = useMemo<ListFilters>(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch],
  )

  const list = useContactList(tenant.id, queryFilters)
  const segments = useSegments(tenant.id)

  const total = list.data?.total ?? 0
  const items = list.data?.items

  return (
    <PageContainer>
      <PageHeader
        title={t('navigation.crm')}
        description={
          list.isLoading
            ? 'Loading contacts…'
            : `${total} ${total === 1 ? 'contact' : 'contacts'}`
        }
        actions={
          canWrite ? (
            <NewContactDialog
              trigger={
                <Button>
                  <Plus /> New contact
                </Button>
              }
            />
          ) : undefined
        }
      />

      {segments.data && segments.data.items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {segments.data.items.map((s) => {
            const dot = s.color ?? 'oklch(0.7 0.05 260)'
            return (
              <button
                key={s.id}
                type="button"
                className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs hover:bg-accent"
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: dot }}
                />
                <span className="font-medium">{s.name}</span>
                <span className="text-muted-foreground">{s.count}</span>
              </button>
            )
          })}
        </div>
      ) : null}

      <Card>
        <CardContent className="p-4">
          {list.isError ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UserSquare />
                </EmptyMedia>
                <EmptyTitle>Couldn&apos;t load contacts</EmptyTitle>
                <EmptyDescription>
                  {(list.error as Error)?.message ?? 'Try refreshing.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ContactsTable
              data={items}
              isLoading={list.isLoading}
              toolbar={<ContactFilters value={filters} onChange={setFilters} />}
            />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

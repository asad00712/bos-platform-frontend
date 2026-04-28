import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { useTenant } from '@/shared/hooks/useTenant'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { routes } from '@/routes/routeMap'

import { useReportCatalog } from '../hooks'
import type { ReportCategory } from '../api/reports.contracts'
import { ReportCard } from '../components/ReportCard'

const CATEGORY_OPTIONS: { label: string; value: ReportCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Sales', value: 'sales' },
  { label: 'Operations', value: 'operations' },
  { label: 'Staff', value: 'staff' },
  { label: 'Patients', value: 'patients' },
  { label: 'Governance', value: 'governance' },
]

export function ReportsLibraryPage() {
  const { tenant } = useTenant()
  const query = useReportCatalog(tenant.id)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ReportCategory | 'all'>('all')
  const debounced = useDebouncedValue(search, 200)

  const items = useMemo(() => {
    const all = query.data?.items ?? []
    const q = debounced.trim().toLowerCase()
    return all.filter((r) => {
      if (category !== 'all' && r.category !== category) return false
      if (q) {
        const hay = `${r.name} ${r.description}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [query.data, debounced, category])

  const isFiltered = Boolean(search) || category !== 'all'

  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        description="Pre-built reports across sales, operations, staff, and governance."
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <InputGroup className="w-full sm:max-w-sm">
              <InputGroupAddon align="inline-start">
                <Search className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search reports…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as ReportCategory | 'all')}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={String(o.value)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isFiltered ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setCategory('all')
                }}
              >
                <X /> Clear
              </Button>
            ) : null}
          </div>

          {query.isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((r) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  href={
                    r.slug ? `${routes.app.reports()}/${r.slug}` : null
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

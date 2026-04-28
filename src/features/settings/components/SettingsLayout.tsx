import { Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent } from '@/shared/ui/card'

import { SettingsNav } from './SettingsNav'

export function SettingsLayout() {
  const { t } = useTranslation()

  return (
    <PageContainer>
      <PageHeader
        title={t('navigation.settings')}
        description="Tenant configuration, members, integrations, and platform options."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        <Card>
          <CardContent className="p-4">
            <SettingsNav />
          </CardContent>
        </Card>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </PageContainer>
  )
}

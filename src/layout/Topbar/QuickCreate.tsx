import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Button } from '@/shared/ui/button'
import { quickCreateActions } from '@/config/navigation'
import { usePermissions } from '@/shared/hooks/usePermissions'

export function QuickCreate() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { has } = usePermissions()

  const visible = quickCreateActions.filter((a) => has(a.permission))
  if (visible.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus />
          <span className="hidden sm:inline">{t('topbar.quickCreate')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>{t('quickCreate.title')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {visible.map((a) => {
          const Icon = a.icon
          return (
            <DropdownMenuItem key={a.path} onClick={() => navigate(a.path)}>
              <Icon /> {t(a.i18nKey)}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

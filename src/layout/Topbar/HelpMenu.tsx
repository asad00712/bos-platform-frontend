import { CircleHelp, BookOpen, LifeBuoy, Keyboard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

export function HelpMenu() {
  const { t } = useTranslation()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('topbar.help')}>
          <CircleHelp />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled>
          <BookOpen /> Documentation
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Keyboard /> Keyboard shortcuts
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <LifeBuoy /> Contact support
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

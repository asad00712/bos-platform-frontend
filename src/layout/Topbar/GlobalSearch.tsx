import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/shared/ui/button'
import { Kbd, KbdGroup } from '@/shared/ui/kbd'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/shared/ui/command'

import { buildNavigation, quickCreateActions } from '@/config/navigation'
import { useTenant } from '@/shared/hooks/useTenant'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { resolveCommands } from '@/shared/command/commandRegistry'

export function GlobalSearch() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const { has } = usePermissions()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const navGroups = buildNavigation(tenant.vertical)
  const goAction = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  const registryActions = useMemo(
    () =>
      resolveCommands({
        permissions: tenant.permissions ?? [],
        vertical: tenant.vertical,
      }),
    [tenant.permissions, tenant.vertical],
  )

  const groupedRegistry = useMemo(() => {
    const map = new Map<string, typeof registryActions>()
    for (const a of registryActions) {
      const list = map.get(a.section) ?? []
      list.push(a)
      map.set(a.section, list)
    }
    return Array.from(map.entries())
  }, [registryActions])

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full max-w-sm justify-start text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="ms-1 hidden md:inline">
          {t('topbar.searchPlaceholder')}
        </span>
        <span className="md:hidden">{t('actions.search')}</span>
        <KbdGroup className="ms-auto hidden md:flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t('topbar.searchPlaceholder')} />
        <CommandList>
          <CommandEmpty>{t('states.empty')}</CommandEmpty>

          {navGroups.map((group) => {
            const items = group.items.filter((i) => has(i.permission))
            if (items.length === 0) return null
            return (
              <CommandGroup key={group.i18nKey} heading={t(group.i18nKey)}>
                {items.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.path}
                      onSelect={() => goAction(item.path)}
                    >
                      <Icon />
                      <span>{t(item.i18nKey)}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )
          })}

          <CommandSeparator />

          <CommandGroup heading={t('quickCreate.title')}>
            {quickCreateActions
              .filter((a) => has(a.permission))
              .map((a) => {
                const Icon = a.icon
                return (
                  <CommandItem key={a.path} onSelect={() => goAction(a.path)}>
                    <Icon />
                    <span>{t(a.i18nKey)}</span>
                  </CommandItem>
                )
              })}
          </CommandGroup>

          {groupedRegistry.length > 0 ? (
            <>
              <CommandSeparator />
              {groupedRegistry.map(([section, actions]) => (
                <CommandGroup key={`reg-${section}`} heading={section}>
                  {actions.map((a) => {
                    const Icon = a.icon
                    return (
                      <CommandItem
                        key={a.id}
                        value={`${a.label} ${(a.keywords ?? []).join(' ')}`}
                        onSelect={() => {
                          setOpen(false)
                          void a.run({ navigate, toast: (m) => toast(m) })
                        }}
                      >
                        {Icon ? <Icon /> : null}
                        <span className="flex-1">{a.label}</span>
                        {a.shortcut ? (
                          <span className="ms-auto text-[11px] text-muted-foreground">
                            {a.shortcut}
                          </span>
                        ) : null}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              ))}
            </>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  )
}

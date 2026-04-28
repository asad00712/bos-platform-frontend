import { useEffect, useState } from 'react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Switch } from '@/shared/ui/switch'

import { useTenant } from '@/shared/hooks/useTenant'

import {
  useNotificationPreferences,
  useSaveNotificationPreferences,
} from '../hooks'
import type {
  ChannelPref,
  NotificationKind,
  NotificationPreferences,
} from '../api/notifications.contracts'

const KIND_META: { id: NotificationKind; title: string; description: string }[] = [
  { id: 'appointment', title: 'Appointments', description: 'New bookings, reschedules, no-shows.' },
  { id: 'invoice', title: 'Invoices', description: 'Created, sent, paid, or overdue.' },
  { id: 'lead', title: 'Leads', description: 'New contacts and lifecycle changes.' },
  { id: 'support', title: 'Support', description: 'New tickets, replies, escalations.' },
  { id: 'mention', title: 'Mentions', description: 'When teammates @-mention you.' },
  { id: 'system', title: 'System', description: 'Branding, billing, and platform events.' },
]

const CHANNELS: { key: keyof ChannelPref; label: string }[] = [
  { key: 'push', label: 'In-app' },
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
]

export function NotificationPreferencesPage() {
  const { tenant } = useTenant()
  const query = useNotificationPreferences(tenant.id)
  const save = useSaveNotificationPreferences(tenant.id)

  const [draft, setDraft] = useState<NotificationPreferences | null>(null)

  useEffect(() => {
    if (query.data) setDraft(query.data)
  }, [query.data])

  const dirty =
    draft && query.data ? JSON.stringify(draft) !== JSON.stringify(query.data) : false

  const toggle = (kind: NotificationKind, channel: keyof ChannelPref) => {
    if (!draft) return
    setDraft({
      ...draft,
      [kind]: { ...draft[kind], [channel]: !draft[kind][channel] },
    })
  }

  return (
    <PageContainer>
      <PageHeader
        title="Notification preferences"
        description="Pick the channels each event should reach you on."
        breadcrumbs={[
          { label: 'Notifications', href: '/app/notifications' },
          { label: 'Preferences' },
        ]}
        actions={
          <Button
            disabled={!draft || !dirty || save.isPending}
            onClick={() => draft && save.mutate(draft)}
          >
            {save.isPending ? 'Saving…' : 'Save preferences'}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {query.isLoading || !draft ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <ul className="divide-y">
              {KIND_META.map((meta) => (
                <li
                  key={meta.id}
                  className="flex flex-wrap items-center gap-4 px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{meta.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {meta.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-5">
                    {CHANNELS.map((c) => {
                      const isOn = draft[meta.id][c.key]
                      return (
                        <label
                          key={c.key}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Switch
                            checked={isOn}
                            onCheckedChange={() => toggle(meta.id, c.key)}
                          />
                          <span className="text-muted-foreground">{c.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

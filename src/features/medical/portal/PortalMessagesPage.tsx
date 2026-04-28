import { useState } from 'react'
import { Send } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { cn } from '@/shared/lib/utils'

const SEED_THREADS = [
  {
    id: 't1',
    subject: 'Prenatal nutrition question',
    category: 'general',
    unread: false,
    messages: [
      {
        id: 'm1',
        author: 'You',
        role: 'patient' as const,
        body: 'Hi! Quick question — is it ok to keep taking my iron supplement on an empty stomach? It seems to help with absorption but I read mixed advice.',
        sentAt: '2 days ago',
      },
      {
        id: 'm2',
        author: 'Dr. F. Adeyemi',
        role: 'provider' as const,
        body: 'Great question. Empty stomach is fine if you tolerate it — just avoid taking it with calcium or coffee within 2 hours. If it causes nausea, take it with a small snack.',
        sentAt: '1 day ago',
      },
    ],
  },
  {
    id: 't2',
    subject: 'GTT result follow-up',
    category: 'results',
    unread: true,
    messages: [
      {
        id: 'm3',
        author: 'Dr. F. Adeyemi',
        role: 'provider' as const,
        body: 'Your 1-hour glucose challenge came back at 142 mg/dL — slightly above the 140 cutoff. We\'ll plan a 3-hour confirmatory test at your next visit. Nothing to worry about today; carry on with your usual diet.',
        sentAt: '3 hours ago',
      },
    ],
  },
]

export function PortalMessagesPage() {
  const [activeId, setActiveId] = useState(SEED_THREADS[0]!.id)
  const [draft, setDraft] = useState('')
  const [category, setCategory] = useState('general')
  const active = SEED_THREADS.find((t) => t.id === activeId)!

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Non-urgent communication with your care team. Replies typically arrive within 1 business day.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[18rem_1fr]">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <ul className="divide-y">
              {SEED_THREADS.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(t.id)}
                    className={cn(
                      'flex w-full items-start gap-2 p-3 text-start transition-colors hover:bg-accent',
                      t.id === activeId && 'bg-accent',
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="flex items-baseline gap-2">
                        <span className="break-words font-medium">{t.subject}</span>
                        {t.unread ? (
                          <span className="size-2 shrink-0 rounded-full bg-primary" />
                        ) : null}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground">{t.category}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
              <h2 className="text-base font-semibold">{active.subject}</h2>
              <Badge variant="outline" className="capitalize">
                {active.category}
              </Badge>
            </div>
            <ul className="space-y-3">
              {active.messages.map((m) => (
                <li
                  key={m.id}
                  className={cn(
                    'flex gap-3 rounded-md border p-3',
                    m.role === 'patient' && 'bg-primary/5',
                  )}
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">
                      {m.author
                        .split(/\s+/)
                        .map((p) => p[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="flex items-baseline gap-2 text-sm">
                      <span className="font-medium">{m.author}</span>
                      <span className="text-xs text-muted-foreground">{m.sentAt}</span>
                    </p>
                    <p className="whitespace-pre-line text-sm leading-relaxed">{m.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-t pt-3">
              <div className="flex flex-wrap items-end gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Reply</Label>
                  <Textarea
                    rows={3}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type your message…"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="rx">Prescription</SelectItem>
                      <SelectItem value="results">Results</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  disabled={draft.trim().length === 0}
                  onClick={() => setDraft('')}
                  className="self-end"
                >
                  <Send /> Send
                </Button>
              </div>
              <p className="text-[11px] text-rose-600 dark:text-rose-400">
                Do not use this for emergencies. Call your local emergency number for any urgent
                medical concern.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

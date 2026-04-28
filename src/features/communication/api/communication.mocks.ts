import type {
  InboxFilters,
  Message,
  MessageInput,
  MessageTemplate,
  TemplatesResponse,
  Thread,
  ThreadDetail,
  ThreadsResponse,
} from './communication.contracts'

function minutesAgo(n: number): string {
  return new Date(Date.now() - n * 60_000).toISOString()
}
function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3_600_000).toISOString()
}
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

type StoredThread = {
  thread: Thread
  messages: Message[]
}

let store: StoredThread[] = [
  {
    thread: {
      id: 'thr-001',
      channel: 'email',
      contactId: 'c-1001',
      contactName: 'Sarah Mitchell',
      subject: 'Crown fitting follow-up',
      preview: 'Thanks Maya — feeling great after the fitting. Is the receipt…',
      unread: true,
      lastActivityAt: minutesAgo(15),
      messageCount: 3,
    },
    messages: [
      {
        id: 'msg-001-1',
        threadId: 'thr-001',
        channel: 'email',
        direction: 'outbound',
        status: 'delivered',
        fromName: 'Maya Patel',
        toName: 'Sarah Mitchell',
        subject: 'Crown fitting follow-up',
        body: 'Hi Sarah,\n\nFollowing up after your crown fitting — let me know how everything feels and if you need anything for the soreness.\n\nMaya',
        occurredAt: hoursAgo(4),
      },
      {
        id: 'msg-001-2',
        threadId: 'thr-001',
        channel: 'email',
        direction: 'inbound',
        status: 'read',
        fromName: 'Sarah Mitchell',
        toName: 'Maya Patel',
        subject: 'Re: Crown fitting follow-up',
        body: 'Hi Maya — feeling great, thank you! Quick question on the receipt for insurance. Could you resend the itemized version?',
        occurredAt: hoursAgo(2),
      },
      {
        id: 'msg-001-3',
        threadId: 'thr-001',
        channel: 'email',
        direction: 'inbound',
        status: 'read',
        fromName: 'Sarah Mitchell',
        toName: 'Maya Patel',
        subject: 'Re: Crown fitting follow-up',
        body: 'Thanks Maya — feeling great after the fitting. Is the receipt with the procedure codes available?',
        occurredAt: minutesAgo(15),
      },
    ],
  },
  {
    thread: {
      id: 'thr-002',
      channel: 'sms',
      contactId: 'c-1006',
      contactName: 'Maria Garcia',
      subject: null,
      preview: "Got it, see you Tuesday at 2:30. Thanks!",
      unread: false,
      lastActivityAt: hoursAgo(3),
      messageCount: 4,
    },
    messages: [
      {
        id: 'msg-002-1',
        threadId: 'thr-002',
        channel: 'sms',
        direction: 'outbound',
        status: 'delivered',
        fromName: 'Acme Dental',
        toName: 'Maria Garcia',
        subject: null,
        body: 'Hi Maria — confirming your new patient consult on Tuesday at 2:30 PM. Reply Y to confirm or N to reschedule.',
        occurredAt: hoursAgo(8),
      },
      {
        id: 'msg-002-2',
        threadId: 'thr-002',
        channel: 'sms',
        direction: 'inbound',
        status: 'read',
        fromName: 'Maria Garcia',
        toName: 'Acme Dental',
        subject: null,
        body: 'Y',
        occurredAt: hoursAgo(7),
      },
      {
        id: 'msg-002-3',
        threadId: 'thr-002',
        channel: 'sms',
        direction: 'outbound',
        status: 'delivered',
        fromName: 'Acme Dental',
        toName: 'Maria Garcia',
        subject: null,
        body: 'Confirmed — see you Tuesday. Please bring insurance card.',
        occurredAt: hoursAgo(7),
      },
      {
        id: 'msg-002-4',
        threadId: 'thr-002',
        channel: 'sms',
        direction: 'inbound',
        status: 'read',
        fromName: 'Maria Garcia',
        toName: 'Acme Dental',
        subject: null,
        body: 'Got it, see you Tuesday at 2:30. Thanks!',
        occurredAt: hoursAgo(3),
      },
    ],
  },
  {
    thread: {
      id: 'thr-003',
      channel: 'email',
      contactId: 'c-1003',
      contactName: 'Greenfield Academy',
      subject: 'Annual screening contract — countersigned?',
      preview: "Counsel is reviewing the redlines today. We'll have signature back by Friday.",
      unread: true,
      lastActivityAt: hoursAgo(26),
      messageCount: 2,
    },
    messages: [
      {
        id: 'msg-003-1',
        threadId: 'thr-003',
        channel: 'email',
        direction: 'outbound',
        status: 'delivered',
        fromName: 'Owner',
        toName: 'Greenfield Academy',
        subject: 'Annual screening contract — countersigned?',
        body: 'Hi — just checking in on the screening contract. Happy to walk through any open questions.',
        occurredAt: daysAgo(2),
      },
      {
        id: 'msg-003-2',
        threadId: 'thr-003',
        channel: 'email',
        direction: 'inbound',
        status: 'read',
        fromName: 'Greenfield Academy',
        toName: 'Owner',
        subject: 'Re: Annual screening contract — countersigned?',
        body: "Counsel is reviewing the redlines today. We'll have signature back by Friday.",
        occurredAt: hoursAgo(26),
      },
    ],
  },
  {
    thread: {
      id: 'thr-004',
      channel: 'note',
      contactId: 'c-1002',
      contactName: 'Khalid Al-Rashid',
      subject: 'Internal — pricing discussion',
      preview: 'Heads up team: we discussed the multi-office discount structure on…',
      unread: false,
      lastActivityAt: daysAgo(1),
      messageCount: 1,
    },
    messages: [
      {
        id: 'msg-004-1',
        threadId: 'thr-004',
        channel: 'note',
        direction: 'internal',
        status: 'sent',
        fromName: 'Maya Patel',
        toName: null,
        subject: 'Internal — pricing discussion',
        body: 'Heads up team: we discussed the multi-office discount structure on the Al-Rashid call. They are looking for 12% off for 3+ offices on retainer. Let me know before I draft the proposal.',
        occurredAt: daysAgo(1),
      },
    ],
  },
  {
    thread: {
      id: 'thr-005',
      channel: 'sms',
      contactId: 'c-1007',
      contactName: 'Tariq Bajwa',
      subject: null,
      preview: 'Hi, need to reschedule — can I do next week instead?',
      unread: true,
      lastActivityAt: minutesAgo(45),
      messageCount: 1,
    },
    messages: [
      {
        id: 'msg-005-1',
        threadId: 'thr-005',
        channel: 'sms',
        direction: 'inbound',
        status: 'delivered',
        fromName: 'Tariq Bajwa',
        toName: 'Acme Dental',
        subject: null,
        body: 'Hi, need to reschedule — can I do next week instead?',
        occurredAt: minutesAgo(45),
      },
    ],
  },
]

const templates: MessageTemplate[] = [
  {
    id: 'tpl-001',
    name: 'Appointment confirmation (SMS)',
    kind: 'sms',
    subject: null,
    body: 'Hi {{firstName}} — confirming your {{appointmentType}} with {{staffName}} on {{date}} at {{time}}. Reply Y to confirm.',
    variables: ['firstName', 'appointmentType', 'staffName', 'date', 'time'],
  },
  {
    id: 'tpl-002',
    name: 'Recall reminder (email)',
    kind: 'email',
    subject: 'Time for your {{interval}} checkup',
    body: 'Hi {{firstName}},\n\nIt has been {{interval}} since your last visit — let us schedule your next checkup. Reply or book online at {{bookingUrl}}.\n\n{{tenantName}}',
    variables: ['firstName', 'interval', 'bookingUrl', 'tenantName'],
  },
  {
    id: 'tpl-003',
    name: 'Invoice reminder',
    kind: 'email',
    subject: 'Quick reminder: invoice {{invoiceNumber}}',
    body: 'Hi {{firstName}},\n\nA quick nudge that invoice {{invoiceNumber}} for {{amount}} is due {{dueDate}}. Pay securely at {{payLink}}.\n\nThanks,\n{{tenantName}}',
    variables: ['firstName', 'invoiceNumber', 'amount', 'dueDate', 'payLink', 'tenantName'],
  },
  {
    id: 'tpl-004',
    name: 'No-show follow-up',
    kind: 'email',
    subject: 'We missed you',
    body: 'Hi {{firstName}},\n\nWe missed you on {{date}} — happy to reschedule whenever works for you. Reply or book at {{bookingUrl}}.',
    variables: ['firstName', 'date', 'bookingUrl'],
  },
]

function applyFilters(items: Thread[], f: InboxFilters): Thread[] {
  const q = f.search?.trim().toLowerCase()
  return items.filter((t) => {
    if (f.channel && t.channel !== f.channel) return false
    if (f.unreadOnly && !t.unread) return false
    if (q) {
      const hay = `${t.subject ?? ''} ${t.preview} ${t.contactName ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

export const communicationMocks = {
  listThreads(filters: InboxFilters): ThreadsResponse {
    const items = applyFilters(store.map((s) => s.thread), filters).sort((a, b) =>
      b.lastActivityAt.localeCompare(a.lastActivityAt),
    )
    return { items, total: items.length }
  },

  getThread(id: string): ThreadDetail | null {
    const found = store.find((s) => s.thread.id === id)
    if (!found) return null
    return {
      ...found.thread,
      messages: [...found.messages].sort((a, b) =>
        a.occurredAt.localeCompare(b.occurredAt),
      ),
    }
  },

  markRead(id: string): ThreadDetail | null {
    const idx = store.findIndex((s) => s.thread.id === id)
    if (idx < 0) return null
    store[idx] = {
      ...store[idx],
      thread: { ...store[idx].thread, unread: false },
    }
    return communicationMocks.getThread(id)
  },

  send(input: MessageInput): { thread: ThreadDetail; message: Message } {
    let target = input.threadId
      ? store.find((s) => s.thread.id === input.threadId) ?? null
      : null

    if (!target) {
      const id = `thr-${Date.now()}`
      const newThread: Thread = {
        id,
        channel: input.channel,
        contactId: input.contactId ?? null,
        contactName: null,
        subject: input.subject ?? null,
        preview: input.body.slice(0, 80),
        unread: false,
        lastActivityAt: new Date().toISOString(),
        messageCount: 0,
      }
      target = { thread: newThread, messages: [] }
      store = [target, ...store]
    }

    const message: Message = {
      id: `msg-${Date.now()}`,
      threadId: target.thread.id,
      channel: input.channel,
      direction: input.channel === 'note' ? 'internal' : 'outbound',
      status: input.channel === 'note' ? 'sent' : 'queued',
      fromName: 'You',
      toName: target.thread.contactName,
      subject: input.subject ?? target.thread.subject ?? null,
      body: input.body,
      occurredAt: new Date().toISOString(),
    }

    const messages = [...target.messages, message]
    const updatedThread: Thread = {
      ...target.thread,
      preview: input.body.slice(0, 80),
      lastActivityAt: message.occurredAt,
      messageCount: messages.length,
      unread: false,
    }
    const idx = store.findIndex((s) => s.thread.id === target!.thread.id)
    if (idx >= 0) store[idx] = { thread: updatedThread, messages }

    return {
      thread: { ...updatedThread, messages },
      message,
    }
  },

  templates(): TemplatesResponse {
    return { items: templates }
  },
}

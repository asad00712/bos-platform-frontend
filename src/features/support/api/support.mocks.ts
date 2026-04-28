import type {
  HelpArticlesResponse,
  Ticket,
  TicketDetail,
  TicketFilters,
  TicketInput,
  TicketReply,
  TicketReplyInput,
  TicketsResponse,
} from './support.contracts'

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3_600_000).toISOString()
}
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

type StoredTicket = {
  ticket: Ticket
  body: string
  replies: TicketReply[]
}

let store: StoredTicket[] = [
  {
    ticket: {
      id: 'tkt-089',
      number: 'TKT-089',
      subject: 'SLA breach risk on overdue invoice',
      status: 'in_progress',
      priority: 'urgent',
      category: 'Billing',
      requesterName: 'Maya Patel',
      requesterEmail: 'maya@acmedental.com',
      assigneeName: 'BOS Support',
      createdAt: hoursAgo(6),
      updatedAt: hoursAgo(1),
      replyCount: 2,
    },
    body: 'INV-2026-141 is 32 days overdue and our automated reminder workflow stopped firing after the last template update. Can you take a look?',
    replies: [
      {
        id: 'rep-089-1',
        ticketId: 'tkt-089',
        authorType: 'agent',
        authorName: 'BOS Support',
        body: 'Looking into the workflow runs now. Will report back within the hour.',
        occurredAt: hoursAgo(4),
      },
      {
        id: 'rep-089-2',
        ticketId: 'tkt-089',
        authorType: 'system',
        authorName: 'system',
        body: 'Priority escalated to urgent (response SLA breached).',
        occurredAt: hoursAgo(1),
      },
    ],
  },
  {
    ticket: {
      id: 'tkt-088',
      number: 'TKT-088',
      subject: 'Cannot connect Google Calendar',
      status: 'waiting',
      priority: 'normal',
      category: 'Integrations',
      requesterName: 'Maya Patel',
      requesterEmail: 'maya@acmedental.com',
      assigneeName: 'BOS Support',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(1),
      replyCount: 1,
    },
    body: 'Trying to connect Google Calendar from Settings → Integrations and the OAuth popup closes without finishing.',
    replies: [
      {
        id: 'rep-088-1',
        ticketId: 'tkt-088',
        authorType: 'agent',
        authorName: 'BOS Support',
        body: 'Could you grab a screenshot of the popup right before it closes, plus your tenant slug?',
        occurredAt: daysAgo(1),
      },
    ],
  },
  {
    ticket: {
      id: 'tkt-085',
      number: 'TKT-085',
      subject: 'Remove old whitening template',
      status: 'resolved',
      priority: 'low',
      category: 'Documents',
      requesterName: 'Maya Patel',
      requesterEmail: 'maya@acmedental.com',
      assigneeName: 'BOS Support',
      createdAt: daysAgo(7),
      updatedAt: daysAgo(5),
      replyCount: 2,
    },
    body: 'Want to delete the old whitening aftercare template — newer one is live.',
    replies: [
      {
        id: 'rep-085-1',
        ticketId: 'tkt-085',
        authorType: 'agent',
        authorName: 'BOS Support',
        body: 'Done — archived the old version. Let us know if you need it restored.',
        occurredAt: daysAgo(6),
      },
      {
        id: 'rep-085-2',
        ticketId: 'tkt-085',
        authorType: 'customer',
        authorName: 'Maya Patel',
        body: 'Thanks!',
        occurredAt: daysAgo(5),
      },
    ],
  },
]

const articles: HelpArticlesResponse = {
  items: [
    {
      id: 'help-001',
      title: 'Getting started with the BOS dashboard',
      excerpt: 'A quick tour of widgets, KPIs, and how vertical layouts work.',
      category: 'Dashboard',
      href: '#',
    },
    {
      id: 'help-002',
      title: 'Inviting team members and choosing roles',
      excerpt: 'Walks through the invite flow, role permissions, and seat counts.',
      category: 'Team',
      href: '#',
    },
    {
      id: 'help-003',
      title: 'Connecting payments with Stripe',
      excerpt: 'Set up Stripe to collect card payments inside invoices.',
      category: 'Billing',
      href: '#',
    },
    {
      id: 'help-004',
      title: 'Customizing branding and the white-label experience',
      excerpt: 'App name, primary color presets, custom fonts, and logos.',
      category: 'Settings',
      href: '#',
    },
    {
      id: 'help-005',
      title: 'Setting up SMS reminders for appointments',
      excerpt: 'Wire Twilio and pick the templates that fire automatically.',
      category: 'Communication',
      href: '#',
    },
    {
      id: 'help-006',
      title: 'Creating roles with custom permission sets',
      excerpt: 'When the built-in roles don\'t fit, here\'s how to extend them.',
      category: 'Security',
      href: '#',
    },
  ],
}

function applyFilters(items: Ticket[], f: TicketFilters): Ticket[] {
  const q = f.search?.trim().toLowerCase()
  return items.filter((t) => {
    if (f.status && t.status !== f.status) return false
    if (f.priority && t.priority !== f.priority) return false
    if (q) {
      const hay = `${t.number} ${t.subject} ${t.category}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

function nextNumber(): string {
  return `TKT-${String(90 + store.length).padStart(3, '0')}`
}

export const supportMocks = {
  list(filters: TicketFilters): TicketsResponse {
    const items = applyFilters(store.map((s) => s.ticket), filters).sort(
      (a, b) => b.updatedAt.localeCompare(a.updatedAt),
    )
    return { items, total: items.length }
  },

  get(id: string): TicketDetail | null {
    const found = store.find((s) => s.ticket.id === id)
    if (!found) return null
    return {
      ...found.ticket,
      body: found.body,
      replies: [...found.replies].sort((a, b) =>
        a.occurredAt.localeCompare(b.occurredAt),
      ),
    }
  },

  create(input: TicketInput, requesterName: string, requesterEmail: string): TicketDetail {
    const id = `tkt-${Date.now()}`
    const now = new Date().toISOString()
    const created: StoredTicket = {
      ticket: {
        id,
        number: nextNumber(),
        subject: input.subject,
        status: 'open',
        priority: input.priority,
        category: input.category,
        requesterName,
        requesterEmail,
        assigneeName: 'BOS Support',
        createdAt: now,
        updatedAt: now,
        replyCount: 0,
      },
      body: input.body,
      replies: [],
    }
    store = [created, ...store]
    return supportMocks.get(id)!
  },

  reply(
    id: string,
    input: TicketReplyInput,
    authorName: string,
  ): TicketDetail | null {
    const idx = store.findIndex((s) => s.ticket.id === id)
    if (idx < 0) return null
    const cur = store[idx]
    const now = new Date().toISOString()
    const reply: TicketReply = {
      id: `rep-${Date.now()}`,
      ticketId: id,
      authorType: 'customer',
      authorName,
      body: input.body,
      occurredAt: now,
    }
    const updated: StoredTicket = {
      ...cur,
      replies: [...cur.replies, reply],
      ticket: {
        ...cur.ticket,
        updatedAt: now,
        replyCount: cur.replies.length + 1,
        status:
          cur.ticket.status === 'waiting' || cur.ticket.status === 'resolved'
            ? 'in_progress'
            : cur.ticket.status,
      },
    }
    store[idx] = updated
    return supportMocks.get(id)
  },

  changeStatus(id: string, status: Ticket['status']): TicketDetail | null {
    const idx = store.findIndex((s) => s.ticket.id === id)
    if (idx < 0) return null
    store[idx] = {
      ...store[idx],
      ticket: { ...store[idx].ticket, status, updatedAt: new Date().toISOString() },
    }
    return supportMocks.get(id)
  },

  helpArticles(): HelpArticlesResponse {
    return articles
  },
}

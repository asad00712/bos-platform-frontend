import type {
  ActionStep,
  Run,
  RunsResponse,
  TemplatesResponse,
  Workflow,
  WorkflowDetail,
  WorkflowFilters,
  WorkflowInput,
  WorkflowsResponse,
} from './automation.contracts'

function minutesAgo(n: number): string {
  return new Date(Date.now() - n * 60_000).toISOString()
}
function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3_600_000).toISOString()
}
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

type StoredWorkflow = {
  workflow: Workflow
  steps: ActionStep[]
}

let workflows: StoredWorkflow[] = [
  {
    workflow: {
      id: 'wf-001',
      name: 'Recall reminders (6-month)',
      description: 'Email patients 6 months after their last cleaning.',
      status: 'active',
      trigger: { kind: 'schedule', label: 'Daily at 9:00 AM' },
      actionCount: 3,
      runs30d: 124,
      successRate: 0.99,
      lastRunAt: hoursAgo(3),
      createdAt: daysAgo(220),
    },
    steps: [
      { id: 'st-001-1', kind: 'find_contacts', label: 'Find patients due for recall' },
      { id: 'st-001-2', kind: 'send_email', label: 'Send "Time for your checkup" template' },
      { id: 'st-001-3', kind: 'create_task', label: 'Create follow-up task for front desk' },
    ],
  },
  {
    workflow: {
      id: 'wf-002',
      name: 'Overdue invoice nudge',
      description: 'SMS + email reminders for invoices >30 days overdue.',
      status: 'active',
      trigger: { kind: 'schedule', label: 'Daily at 10:00 AM' },
      actionCount: 4,
      runs30d: 30,
      successRate: 0.93,
      lastRunAt: hoursAgo(8),
      createdAt: daysAgo(110),
    },
    steps: [
      { id: 'st-002-1', kind: 'find_invoices', label: 'Find invoices overdue 30+ days' },
      { id: 'st-002-2', kind: 'send_email', label: 'Send overdue email reminder' },
      { id: 'st-002-3', kind: 'send_sms', label: 'Send SMS if no reply within 24h' },
      { id: 'st-002-4', kind: 'create_task', label: 'Escalate to billing manager after 60d' },
    ],
  },
  {
    workflow: {
      id: 'wf-003',
      name: 'New lead welcome',
      description: 'Welcome email when a contact lands as a lead.',
      status: 'active',
      trigger: { kind: 'event', label: 'Contact created with status=lead' },
      actionCount: 2,
      runs30d: 18,
      successRate: 1,
      lastRunAt: minutesAgo(35),
      createdAt: daysAgo(60),
    },
    steps: [
      { id: 'st-003-1', kind: 'send_email', label: 'Send welcome template' },
      { id: 'st-003-2', kind: 'assign_owner', label: 'Round-robin assign to sales' },
    ],
  },
  {
    workflow: {
      id: 'wf-004',
      name: 'No-show follow-up',
      description: 'Email + reschedule link 30 minutes after a no-show.',
      status: 'paused',
      trigger: { kind: 'event', label: 'Appointment marked no_show' },
      actionCount: 2,
      runs30d: 6,
      successRate: 0.83,
      lastRunAt: daysAgo(4),
      createdAt: daysAgo(40),
    },
    steps: [
      { id: 'st-004-1', kind: 'wait', label: 'Wait 30 minutes' },
      { id: 'st-004-2', kind: 'send_email', label: 'Send rebook email with link' },
    ],
  },
  {
    workflow: {
      id: 'wf-005',
      name: 'Birthday note',
      description: 'Send a friendly note to active patients on their birthday.',
      status: 'draft',
      trigger: { kind: 'schedule', label: 'Daily at 7:00 AM' },
      actionCount: 1,
      runs30d: 0,
      successRate: 0,
      lastRunAt: null,
      createdAt: daysAgo(2),
    },
    steps: [
      { id: 'st-005-1', kind: 'send_sms', label: 'Send birthday SMS' },
    ],
  },
]

let runs: Run[] = [
  {
    id: 'run-1', workflowId: 'wf-001', workflowName: 'Recall reminders (6-month)',
    status: 'succeeded', triggeredBy: 'schedule', startedAt: hoursAgo(3),
    durationMs: 4_120, error: null,
  },
  {
    id: 'run-2', workflowId: 'wf-002', workflowName: 'Overdue invoice nudge',
    status: 'succeeded', triggeredBy: 'schedule', startedAt: hoursAgo(8),
    durationMs: 6_780, error: null,
  },
  {
    id: 'run-3', workflowId: 'wf-003', workflowName: 'New lead welcome',
    status: 'succeeded', triggeredBy: 'event:contact.created', startedAt: minutesAgo(35),
    durationMs: 1_240, error: null,
  },
  {
    id: 'run-4', workflowId: 'wf-002', workflowName: 'Overdue invoice nudge',
    status: 'failed', triggeredBy: 'schedule', startedAt: daysAgo(1),
    durationMs: 980, error: 'SendGrid 429: rate limited',
  },
  {
    id: 'run-5', workflowId: 'wf-001', workflowName: 'Recall reminders (6-month)',
    status: 'succeeded', triggeredBy: 'schedule', startedAt: daysAgo(1),
    durationMs: 4_660, error: null,
  },
  {
    id: 'run-6', workflowId: 'wf-004', workflowName: 'No-show follow-up',
    status: 'cancelled', triggeredBy: 'event:appointment.no_show', startedAt: daysAgo(4),
    durationMs: 200, error: null,
  },
  {
    id: 'run-7', workflowId: 'wf-003', workflowName: 'New lead welcome',
    status: 'succeeded', triggeredBy: 'event:contact.created', startedAt: hoursAgo(20),
    durationMs: 1_440, error: null,
  },
  {
    id: 'run-8', workflowId: 'wf-002', workflowName: 'Overdue invoice nudge',
    status: 'running', triggeredBy: 'schedule', startedAt: minutesAgo(2),
    durationMs: 0, error: null,
  },
]

const templates: TemplatesResponse = {
  items: [
    {
      id: 'tpl-recall',
      name: 'Recall reminders',
      description: 'Email + SMS chain to bring patients back at your preferred interval.',
      category: 'Patient lifecycle',
      triggerKind: 'schedule',
      triggerLabel: 'Daily at 9:00 AM',
      steps: ['Find patients due', 'Send email', 'Send SMS after 3d if unread', 'Create task on day 7'],
    },
    {
      id: 'tpl-noshow',
      name: 'No-show recovery',
      description: 'Friendly rebook email plus calendar link.',
      category: 'Operations',
      triggerKind: 'event',
      triggerLabel: 'Appointment marked no_show',
      steps: ['Wait 30 minutes', 'Send rebook email with calendar link'],
    },
    {
      id: 'tpl-overdue',
      name: 'Overdue invoice nudges',
      description: 'Multi-touch email + SMS reminders escalating after 30/60/90 days.',
      category: 'Billing',
      triggerKind: 'schedule',
      triggerLabel: 'Daily at 10:00 AM',
      steps: ['Find overdue invoices', 'Send email', 'Send SMS after 24h', 'Escalate after 60d'],
    },
    {
      id: 'tpl-welcome',
      name: 'New lead welcome series',
      description: 'Three-touch welcome over 7 days; auto-stops on reply.',
      category: 'CRM',
      triggerKind: 'event',
      triggerLabel: 'Contact created (status=lead)',
      steps: ['Send welcome email', 'Wait 3d', 'Send case studies', 'Wait 4d', 'Send call CTA'],
    },
    {
      id: 'tpl-staff-hours',
      name: 'Weekly staff hours digest',
      description: 'Email managers a Friday digest of clocked hours and overtime.',
      category: 'HR',
      triggerKind: 'schedule',
      triggerLabel: 'Friday at 5:00 PM',
      steps: ['Aggregate hours', 'Render digest', 'Email to managers'],
    },
    {
      id: 'tpl-birthday',
      name: 'Birthday note',
      description: 'A short SMS to active patients on their birthday.',
      category: 'Patient lifecycle',
      triggerKind: 'schedule',
      triggerLabel: 'Daily at 7:00 AM',
      steps: ['Find birthdays today', 'Send SMS'],
    },
  ],
}

function applyFilters(items: Workflow[], f: WorkflowFilters): Workflow[] {
  const q = f.search?.trim().toLowerCase()
  return items.filter((w) => {
    if (f.status && w.status !== f.status) return false
    if (q) {
      const hay = `${w.name} ${w.description} ${w.trigger.label}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

export const automationMocks = {
  list(filters: WorkflowFilters): WorkflowsResponse {
    const items = applyFilters(workflows.map((w) => w.workflow), filters).sort(
      (a, b) => (b.lastRunAt ?? b.createdAt).localeCompare(a.lastRunAt ?? a.createdAt),
    )
    return { items, total: items.length }
  },

  get(id: string): WorkflowDetail | null {
    const found = workflows.find((w) => w.workflow.id === id)
    if (!found) return null
    return { ...found.workflow, steps: found.steps }
  },

  create(input: WorkflowInput): WorkflowDetail {
    const id = `wf-${Date.now()}`
    const created: StoredWorkflow = {
      workflow: {
        id,
        name: input.name,
        description: input.description ?? '',
        status: 'draft',
        trigger: { kind: input.triggerKind, label: input.triggerLabel },
        actionCount: 0,
        runs30d: 0,
        successRate: 0,
        lastRunAt: null,
        createdAt: new Date().toISOString(),
      },
      steps: [],
    }
    workflows = [created, ...workflows]
    return { ...created.workflow, steps: created.steps }
  },

  setStatus(id: string, status: Workflow['status']): WorkflowDetail | null {
    const idx = workflows.findIndex((w) => w.workflow.id === id)
    if (idx < 0) return null
    workflows[idx] = {
      ...workflows[idx],
      workflow: { ...workflows[idx].workflow, status },
    }
    return automationMocks.get(id)
  },

  remove(id: string): boolean {
    const before = workflows.length
    workflows = workflows.filter((w) => w.workflow.id !== id)
    runs = runs.filter((r) => r.workflowId !== id)
    return workflows.length < before
  },

  runs(workflowId?: string): RunsResponse {
    const items = (workflowId ? runs.filter((r) => r.workflowId === workflowId) : runs)
      .slice()
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    return { items }
  },

  templates(): TemplatesResponse {
    return templates
  },
}

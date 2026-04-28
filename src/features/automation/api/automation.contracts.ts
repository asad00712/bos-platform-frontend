import { z } from 'zod'

/* -------------------- enums -------------------- */

export const triggerKindSchema = z.enum([
  'event',
  'schedule',
  'webhook',
  'manual',
])
export type TriggerKind = z.infer<typeof triggerKindSchema>

export const workflowStatusSchema = z.enum(['active', 'paused', 'draft'])
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>

export const runStatusSchema = z.enum([
  'queued',
  'running',
  'succeeded',
  'failed',
  'cancelled',
])
export type RunStatus = z.infer<typeof runStatusSchema>

/* -------------------- core -------------------- */

export const actionStepSchema = z.object({
  id: z.string(),
  /** kind = 'send_email' | 'send_sms' | 'create_task' | … (free-form for v1). */
  kind: z.string(),
  label: z.string(),
})
export type ActionStep = z.infer<typeof actionStepSchema>

export const workflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: workflowStatusSchema,
  trigger: z.object({
    kind: triggerKindSchema,
    /** Human-readable summary, e.g. "Invoice marked as paid". */
    label: z.string(),
  }),
  actionCount: z.number(),
  /** 30-day run summary. */
  runs30d: z.number(),
  successRate: z.number(),
  lastRunAt: z.string().nullable(),
  createdAt: z.string(),
})
export type Workflow = z.infer<typeof workflowSchema>

export const workflowDetailSchema = workflowSchema.extend({
  steps: z.array(actionStepSchema),
})
export type WorkflowDetail = z.infer<typeof workflowDetailSchema>

export const runSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  workflowName: z.string(),
  status: runStatusSchema,
  triggeredBy: z.string(),
  startedAt: z.string(),
  durationMs: z.number(),
  /** Optional short error string for failed runs. */
  error: z.string().nullable(),
})
export type Run = z.infer<typeof runSchema>

/* -------------------- list filters -------------------- */

export const workflowFiltersSchema = z.object({
  search: z.string().optional(),
  status: workflowStatusSchema.optional(),
})
export type WorkflowFilters = z.infer<typeof workflowFiltersSchema>

export const workflowsResponseSchema = z.object({
  items: z.array(workflowSchema),
  total: z.number(),
})
export type WorkflowsResponse = z.infer<typeof workflowsResponseSchema>

export const runsResponseSchema = z.object({
  items: z.array(runSchema),
})
export type RunsResponse = z.infer<typeof runsResponseSchema>

/* -------------------- inputs -------------------- */

export const workflowInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  triggerKind: triggerKindSchema,
  triggerLabel: z.string().min(1),
})
export type WorkflowInput = z.infer<typeof workflowInputSchema>

/* -------------------- templates -------------------- */

export const workflowTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  triggerKind: triggerKindSchema,
  triggerLabel: z.string(),
  steps: z.array(z.string()),
})
export type WorkflowTemplate = z.infer<typeof workflowTemplateSchema>

export const templatesResponseSchema = z.object({
  items: z.array(workflowTemplateSchema),
})
export type TemplatesResponse = z.infer<typeof templatesResponseSchema>

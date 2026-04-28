import { z } from 'zod'

/* -------------------- shared bits -------------------- */

export const trendDirectionSchema = z.enum(['up', 'down', 'flat'])
export type TrendDirection = z.infer<typeof trendDirectionSchema>

export const kpiSchema = z.object({
  id: z.string(),
  i18nKey: z.string(),
  value: z.number(),
  /** Format the value with `formatCurrency` instead of `formatNumber`. */
  currency: z.string().optional(),
  delta: z.number().optional(),
  /** Sign-aware trend. */
  trend: trendDirectionSchema.optional(),
  /** Short helper line under the value (e.g. "vs last month"). */
  caption: z.string().optional(),
  iconKey: z.string().optional(),
})
export type KpiCardData = z.infer<typeof kpiSchema>

/* -------------------- overview -------------------- */

export const aiInsightSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  ctas: z
    .array(z.object({ id: z.string(), label: z.string(), href: z.string().optional() }))
    .default([]),
})
export type AiInsight = z.infer<typeof aiInsightSchema>

export const overviewResponseSchema = z.object({
  kpis: z.array(kpiSchema),
  aiInsight: aiInsightSchema.nullable(),
})
export type OverviewResponse = z.infer<typeof overviewResponseSchema>

/* -------------------- revenue weekly -------------------- */

export const revenueWeekSchema = z.object({
  label: z.string(),
  value: z.number(),
  isPartial: z.boolean().default(false),
})

export const revenueWeeklyResponseSchema = z.object({
  totalCurrent: z.number(),
  totalPrior: z.number(),
  weeks: z.array(revenueWeekSchema),
})
export type RevenueWeeklyResponse = z.infer<typeof revenueWeeklyResponseSchema>

/* -------------------- activities -------------------- */

export const activityTypeSchema = z.enum([
  'invoice',
  'appointment',
  'lead',
  'support',
  'system',
])

export const activitySchema = z.object({
  id: z.string(),
  type: activityTypeSchema,
  title: z.string(),
  occurredAt: z.string(),
})

export const activitiesResponseSchema = z.object({
  items: z.array(activitySchema),
})
export type ActivitiesResponse = z.infer<typeof activitiesResponseSchema>
export type Activity = z.infer<typeof activitySchema>

/* -------------------- tasks -------------------- */

export const taskStatusSchema = z.enum(['todo', 'in_progress', 'done'])
export const taskPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent'])

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  assigneeName: z.string().nullable().optional(),
  dueAt: z.string().nullable().optional(),
})
export type Task = z.infer<typeof taskSchema>

export const tasksResponseSchema = z.object({
  items: z.array(taskSchema),
})
export type TasksResponse = z.infer<typeof tasksResponseSchema>

/* -------------------- pipeline -------------------- */

export const pipelineStageSchema = z.object({
  id: z.string(),
  name: z.string(),
  count: z.number(),
  value: z.number(),
})

export const pipelineResponseSchema = z.object({
  currency: z.string(),
  stages: z.array(pipelineStageSchema),
})
export type PipelineResponse = z.infer<typeof pipelineResponseSchema>

/* -------------------- revenue by vertical -------------------- */

export const revenueByVerticalSliceSchema = z.object({
  vertical: z.string(),
  label: z.string(),
  value: z.number(),
})

export const revenueByVerticalResponseSchema = z.object({
  currency: z.string(),
  total: z.number(),
  slices: z.array(revenueByVerticalSliceSchema),
})
export type RevenueByVerticalResponse = z.infer<
  typeof revenueByVerticalResponseSchema
>

/* -------------------- active verticals -------------------- */

export const verticalStatusSchema = z.enum(['live', 'beta', 'dev'])

export const activeVerticalSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: verticalStatusSchema,
  customers: z.number(),
})

export const activeVerticalsResponseSchema = z.object({
  items: z.array(activeVerticalSchema),
})
export type ActiveVerticalsResponse = z.infer<typeof activeVerticalsResponseSchema>

/* -------------------- recent clients -------------------- */

export const clientStatusSchema = z.enum(['active', 'pending', 'paused'])

export const recentClientSchema = z.object({
  id: z.string(),
  name: z.string(),
  vertical: z.string(),
  status: clientStatusSchema,
  value: z.number(),
  currency: z.string(),
})
export type RecentClient = z.infer<typeof recentClientSchema>

export const recentClientsResponseSchema = z.object({
  items: z.array(recentClientSchema),
})
export type RecentClientsResponse = z.infer<typeof recentClientsResponseSchema>

/* -------------------- date range param -------------------- */

export const dateRangeSchema = z.object({
  from: z.string(),
  to: z.string(),
})
export type DateRange = z.infer<typeof dateRangeSchema>

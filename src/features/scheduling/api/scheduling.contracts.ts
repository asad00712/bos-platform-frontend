import { z } from 'zod'

export const appointmentStatusSchema = z.enum([
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
])
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>

export const appointmentKindSchema = z.enum([
  'consultation',
  'procedure',
  'follow_up',
  'screening',
  'other',
])
export type AppointmentKind = z.infer<typeof appointmentKindSchema>

export const resourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Free-form: 'Operatory 1', 'Conference room', 'Stylist Maya'. */
  kind: z.string(),
  color: z.string().optional(),
})
export type Resource = z.infer<typeof resourceSchema>

export const appointmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  status: appointmentStatusSchema,
  kind: appointmentKindSchema,
  contactId: z.string().nullable(),
  contactName: z.string().nullable(),
  staffName: z.string().nullable(),
  resourceId: z.string().nullable(),
  resourceName: z.string().nullable(),
  notes: z.string().nullable(),
})
export type Appointment = z.infer<typeof appointmentSchema>

export const appointmentDetailSchema = appointmentSchema.extend({
  contactPhone: z.string().nullable(),
  contactEmail: z.string().nullable(),
  createdAt: z.string(),
  cancelledReason: z.string().nullable(),
})
export type AppointmentDetail = z.infer<typeof appointmentDetailSchema>

/* range filter */

export const rangeQuerySchema = z.object({
  from: z.string(),
  to: z.string(),
  resourceId: z.string().optional(),
  status: appointmentStatusSchema.optional(),
})
export type RangeQuery = z.infer<typeof rangeQuerySchema>

export const appointmentsResponseSchema = z.object({
  items: z.array(appointmentSchema),
})
export type AppointmentsResponse = z.infer<typeof appointmentsResponseSchema>

export const resourcesResponseSchema = z.object({
  items: z.array(resourceSchema),
})
export type ResourcesResponse = z.infer<typeof resourcesResponseSchema>

/* input shapes */

export const appointmentInputSchema = z.object({
  title: z.string().min(1),
  startsAt: z.string(),
  endsAt: z.string(),
  status: appointmentStatusSchema,
  kind: appointmentKindSchema,
  contactId: z.string().nullable().optional(),
  staffName: z.string().nullable().optional(),
  resourceId: z.string().nullable().optional(),
  notes: z.string().optional(),
})
export type AppointmentInput = z.infer<typeof appointmentInputSchema>

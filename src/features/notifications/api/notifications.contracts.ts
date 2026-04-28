import { z } from 'zod'

export const notificationKindSchema = z.enum([
  'appointment',
  'invoice',
  'lead',
  'support',
  'system',
  'mention',
])
export type NotificationKind = z.infer<typeof notificationKindSchema>

export const notificationSchema = z.object({
  id: z.string(),
  kind: notificationKindSchema,
  title: z.string(),
  body: z.string().nullable(),
  href: z.string().nullable(),
  read: z.boolean(),
  occurredAt: z.string(),
})
export type Notification = z.infer<typeof notificationSchema>

export const notificationsResponseSchema = z.object({
  items: z.array(notificationSchema),
  unread: z.number(),
})
export type NotificationsResponse = z.infer<typeof notificationsResponseSchema>

/* -------------------- preferences -------------------- */

export const channelPrefSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  push: z.boolean(),
})
export type ChannelPref = z.infer<typeof channelPrefSchema>

export const notificationPreferencesSchema = z.object({
  appointment: channelPrefSchema,
  invoice: channelPrefSchema,
  lead: channelPrefSchema,
  support: channelPrefSchema,
  system: channelPrefSchema,
  mention: channelPrefSchema,
})
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>

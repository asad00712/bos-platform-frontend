import { z } from 'zod'

/* -------------------- enums -------------------- */

export const memberStatusSchema = z.enum([
  'active',
  'invited',
  'inactive',
])
export type MemberStatus = z.infer<typeof memberStatusSchema>

/* -------------------- organization -------------------- */

export const organizationProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  locale: z.string(),
  timezone: z.string(),
  currency: z.string(),
  plan: z.string(),
  vertical: z.string(),
})
export type OrganizationProfile = z.infer<typeof organizationProfileSchema>

export const organizationProfileInputSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and dashes only'),
  locale: z.string(),
  timezone: z.string(),
  currency: z.string(),
})
export type OrganizationProfileInput = z.infer<typeof organizationProfileInputSchema>

/* -------------------- branding -------------------- */

export const brandingInputSchema = z.object({
  appName: z.string().optional(),
  /** OKLCH triplet without the wrapping function, e.g. "0.65 0.13 220". */
  primaryColor: z.string().optional(),
  logoUrl: z.string().url().or(z.literal('')).optional(),
  faviconUrl: z.string().url().or(z.literal('')).optional(),
  fontFamily: z.string().optional(),
})
export type BrandingInput = z.infer<typeof brandingInputSchema>

/* -------------------- members -------------------- */

export const memberSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  roleId: z.string(),
  roleName: z.string(),
  status: memberStatusSchema,
  invitedAt: z.string().nullable(),
  lastActiveAt: z.string().nullable(),
})
export type Member = z.infer<typeof memberSchema>

export const membersResponseSchema = z.object({
  items: z.array(memberSchema),
  total: z.number(),
})
export type MembersResponse = z.infer<typeof membersResponseSchema>

export const inviteInputSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  roleId: z.string().min(1),
})
export type InviteInput = z.infer<typeof inviteInputSchema>

/* -------------------- roles -------------------- */

export const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  /** Permissions baked into this role. */
  permissions: z.array(z.string()),
  /** Built-in roles can't be edited or deleted. */
  builtIn: z.boolean(),
  /** Number of members holding this role. */
  memberCount: z.number(),
})
export type Role = z.infer<typeof roleSchema>

export const rolesResponseSchema = z.object({
  items: z.array(roleSchema),
})
export type RolesResponse = z.infer<typeof rolesResponseSchema>

/* -------------------- integrations -------------------- */

export const integrationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['payments', 'communication', 'calendar', 'accounting', 'storage']),
  /** Whether this tenant has it connected. */
  connected: z.boolean(),
  iconKey: z.string(),
})
export type Integration = z.infer<typeof integrationSchema>

export const integrationsResponseSchema = z.object({
  items: z.array(integrationSchema),
})
export type IntegrationsResponse = z.infer<typeof integrationsResponseSchema>

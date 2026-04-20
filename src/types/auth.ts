import type { VerticalType } from './tenant'

export type UserStatus =
  | 'invited'
  | 'pending_verification'
  | 'active'
  | 'locked'
  | 'suspended'
  | 'deleted'

export type UserResponse = {
  id: string
  email: string
  emailVerified: boolean
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  status: UserStatus
  twoFactorEnabled: boolean
  lastLoginAt: string | null
  createdAt: string
}

export type TokenPair = {
  accessToken: string
  accessTokenExpiresIn: number
  accessTokenExpiresAt: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = TokenPair & {
  user: UserResponse
  requires2FA: boolean
}

export type SignupRequest = {
  email: string
  password: string
  firstName: string
  lastName?: string
  orgName: string
  orgSlug: string
  vertical: VerticalType
  locale?: string
  timezone?: string
}

export type SignupResponse = {
  user: UserResponse
  tenantId: string
  tenantSlug: string
  nextStep: 'EMAIL_VERIFICATION_REQUIRED'
  devVerificationUrl?: string
}

export type RefreshResponse = TokenPair

export type VerifyEmailRequest = {
  token: string
}

export type ResendVerifyEmailRequest = {
  email: string
}

export type ForgotPasswordRequest = {
  email: string
}

export type ResetPasswordRequest = {
  token: string
  newPassword: string
}

export type TwoFactorCodeRequest = {
  code: string
}

export type TwoFactorSetupResponse = {
  secret: string
  otpauthUrl: string
  backupCodes: string[]
}

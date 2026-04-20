import { apiRequest } from './http'
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  ResendVerifyEmailRequest,
  ResetPasswordRequest,
  SignupRequest,
  SignupResponse,
  TwoFactorCodeRequest,
  TwoFactorSetupResponse,
  UserResponse,
  VerifyEmailRequest,
} from '../types/auth'

export const authApi = {
  login(payload: LoginRequest) {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(payload),
    })
  },
  signup(payload: SignupRequest) {
    return apiRequest<SignupResponse>('/auth/signup', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(payload),
    })
  },
  refresh() {
    return apiRequest<RefreshResponse>('/auth/refresh', {
      method: 'POST',
      auth: false,
    })
  },
  me() {
    return apiRequest<UserResponse>('/auth/me')
  },
  logout() {
    return apiRequest<void>('/auth/logout', {
      method: 'POST',
    })
  },
  verifyEmail(payload: VerifyEmailRequest) {
    return apiRequest<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(payload),
    })
  },
  resendVerifyEmail(payload: ResendVerifyEmailRequest) {
    return apiRequest<{ message: string }>('/auth/resend-verify-email', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(payload),
    })
  },
  forgotPassword(payload: ForgotPasswordRequest) {
    return apiRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(payload),
    })
  },
  resetPassword(payload: ResetPasswordRequest) {
    return apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(payload),
    })
  },
  beginTwoFactorSetup() {
    return apiRequest<TwoFactorSetupResponse>('/auth/2fa/setup', {
      method: 'POST',
    })
  },
  confirmTwoFactor(payload: TwoFactorCodeRequest) {
    return apiRequest<void>('/auth/2fa/confirm', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  verifyTwoFactorLogin(payload: TwoFactorCodeRequest) {
    return apiRequest<LoginResponse>('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

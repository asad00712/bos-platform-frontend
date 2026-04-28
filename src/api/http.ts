import { useActiveBranchStore } from '../stores/activeBranch.store'
import { useSessionStore } from '../stores/session.store'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api/v1'

export const apiBaseUrl = API_BASE_URL

type ApiRequestOptions = RequestInit & {
  auth?: boolean
  /**
   * Skip auto-injection of the `X-Branch-Id` header. Use for endpoints
   * that don't operate within a branch scope (e.g. /branches itself,
   * /auth/*).
   */
  branchScope?: boolean
}

export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(status: number, message: string, payload: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  const accessToken = useSessionStore.getState().accessToken

  if (!headers.has('content-type') && options.body) {
    headers.set('content-type', 'application/json')
  }

  if (options.auth !== false && accessToken) {
    headers.set('authorization', `Bearer ${accessToken}`)
  }

  if (options.branchScope !== false) {
    const branchId = useActiveBranchStore.getState().branchId
    if (branchId && !headers.has('x-branch-id')) {
      headers.set('x-branch-id', branchId)
    }
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    })
  } catch (error) {
    throw new ApiError(
      0,
      'Unable to reach the BOS auth service. Confirm the backend is running on port 3001.',
      error,
    )
  }

  if (!response.ok) {
    const payload = await parseJson(response)
    throw new ApiError(response.status, getErrorMessage(payload), payload)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const payload = await response.json()
  return unwrapApiPayload<T>(payload)
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function getErrorMessage(payload: unknown): string {
  const nestedMessage = readNestedMessage(payload)
  if (nestedMessage) {
    return nestedMessage
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    typeof payload.message === 'string'
  ) {
    return payload.message
  }

  return 'Something went wrong. Please try again.'
}

function unwrapApiPayload<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    'data' in payload
  ) {
    return (payload as { data: T }).data
  }

  return payload as T
}

function readNestedMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const record = payload as Record<string, unknown>

  if (typeof record.message === 'string') {
    return record.message
  }

  if (Array.isArray(record.message)) {
    return record.message.filter(Boolean).join(' ')
  }

  for (const key of ['error', 'response', 'details']) {
    const value = record[key]
    const nested = readNestedMessage(value)
    if (nested) {
      return nested
    }
  }

  return null
}

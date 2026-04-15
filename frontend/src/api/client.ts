import type { ErrorResponse } from '../features/face-search/types/process'

const DEFAULT_BASE_URL = 'http://127.0.0.1:8000'

export class ApiError extends Error {
  readonly code: string
  readonly status: number

  constructor(message: string, options: { code: string; status: number }) {
    super(message)
    this.name = 'ApiError'
    this.code = options.code
    this.status = options.status
  }
}

function getBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL

  return typeof baseUrl === 'string' && baseUrl.trim() ? baseUrl : DEFAULT_BASE_URL
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const maybeError = (value as Record<string, unknown>).error
  if (typeof maybeError !== 'object' || maybeError === null) {
    return false
  }

  return (
    typeof (maybeError as Record<string, unknown>).code === 'string' &&
    typeof (maybeError as Record<string, unknown>).message === 'string'
  )
}

export async function requestJson<TResponse>(
  path: string,
  init?: RequestInit,
  validate?: (value: unknown) => value is TResponse,
): Promise<TResponse> {
  const headers = new Headers(init?.headers ?? {})

  if (!(init?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers,
  })

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (isErrorResponse(data)) {
      throw new ApiError(data.error.message, {
        code: data.error.code,
        status: response.status,
      })
    }

    throw new ApiError('Unexpected API error.', {
      code: 'unknown_error',
      status: response.status,
    })
  }

  if (validate && !validate(data)) {
    throw new ApiError('Invalid API response.', {
      code: 'invalid_response',
      status: response.status,
    })
  }

  return data as TResponse
}

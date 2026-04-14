import { requestJson } from '../../../api/client'
import type { HealthResponse } from '../types/process'

function isHealthResponse(value: unknown): value is HealthResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const record = value as Record<string, unknown>

  return typeof record.status === 'string' && typeof record.service === 'string'
}

export function getHealth(): Promise<HealthResponse> {
  return requestJson('/health', undefined, isHealthResponse)
}

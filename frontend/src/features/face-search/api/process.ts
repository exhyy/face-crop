import { requestJson } from '../../../api/client'
import type { ProcessRequest, ProcessResponse } from '../types/process'

function isFaceBox(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.top === 'number' &&
    typeof record.right === 'number' &&
    typeof record.bottom === 'number' &&
    typeof record.left === 'number'
  )
}

function isProcessResponse(value: unknown): value is ProcessResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const record = value as Record<string, unknown>
  if (
    typeof record.totalImages !== 'number' ||
    typeof record.detectedFaces !== 'number' ||
    typeof record.matchedFaces !== 'number' ||
    !Array.isArray(record.results)
  ) {
    return false
  }

  return record.results.every((item) => {
    if (typeof item !== 'object' || item === null) {
      return false
    }

    const resultRecord = item as Record<string, unknown>

    return (
      typeof resultRecord.sourceFilename === 'string' &&
      typeof resultRecord.savedPath === 'string' &&
      (resultRecord.previewUrl === null || typeof resultRecord.previewUrl === 'string' || resultRecord.previewUrl === undefined) &&
      (resultRecord.faceBox === null || resultRecord.faceBox === undefined || isFaceBox(resultRecord.faceBox)) &&
      (resultRecord.matchScore === null || resultRecord.matchScore === undefined || typeof resultRecord.matchScore === 'number')
    )
  })
}

export function processFaces(payload: ProcessRequest): Promise<ProcessResponse> {
  return requestJson(
    '/process',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    isProcessResponse,
  )
}

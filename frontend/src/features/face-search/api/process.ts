import { requestJson } from '../../../api/client'
import type { ProcessFormValues, ProcessResponse, TargetFaceDetectionResponse } from '../types/process'
import { createProcessFormData, isProcessResponse, isTargetFaceDetectionResponse } from '../utils/validation'

const DEFAULT_BASE_URL = 'http://127.0.0.1:8000'

function getBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL

  return typeof baseUrl === 'string' && baseUrl.trim() ? baseUrl : DEFAULT_BASE_URL
}

export function detectTargetFaces(targetFile: File): Promise<TargetFaceDetectionResponse> {
  const formData = new FormData()
  formData.append('targetImage', targetFile)

  return requestJson(
    '/process/target-faces',
    {
      method: 'POST',
      body: formData,
    },
    isTargetFaceDetectionResponse,
  )
}

export function processFaces(values: ProcessFormValues): Promise<ProcessResponse> {
  return requestJson(
    '/process',
    {
      method: 'POST',
      body: createProcessFormData(values),
    },
    isProcessResponse,
  )
}

export function getFaceCropsDownloadUrl(runId: string): string {
  return `${getBaseUrl()}/process/${encodeURIComponent(runId)}/download`
}

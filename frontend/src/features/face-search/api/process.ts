import { requestJson } from '../../../api/client'
import type { ProcessFormValues, ProcessResponse, TargetFaceDetectionResponse } from '../types/process'
import { createProcessFormData, isProcessResponse, isTargetFaceDetectionResponse } from '../utils/validation'

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

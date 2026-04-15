import { requestJson } from '../../../api/client'
import type { ProcessFormValues, ProcessResponse } from '../types/process'
import { createProcessFormData, isProcessResponse } from '../utils/validation'

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

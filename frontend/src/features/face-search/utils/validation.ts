import type { ProcessFormErrors, ProcessFormValues, ProcessResponse } from '../types/process'

export function validateProcessForm(values: ProcessFormValues): ProcessFormErrors {
  const errors: ProcessFormErrors = {}
  const paddingValue = Number(values.padding)
  const thresholdValue = Number(values.threshold)

  if (values.targetFile === null) {
    errors.targetFile = 'Target image is required.'
  }

  if (values.candidateFiles.length === 0) {
    errors.candidateFiles = 'At least one candidate image is required.'
  }

  if (!Number.isFinite(paddingValue) || !Number.isInteger(paddingValue) || paddingValue < 0) {
    errors.padding = 'Padding must be a non-negative integer.'
  }

  if (!Number.isFinite(thresholdValue) || thresholdValue < -1 || thresholdValue > 1) {
    errors.threshold = 'Threshold must be between -1 and 1.'
  }

  if (values.matchMode !== '' && values.matchMode !== 'real') {
    errors.matchMode = 'Match mode must be empty or real.'
  }

  return errors
}

export function hasProcessFormErrors(errors: ProcessFormErrors): boolean {
  return Object.values(errors).some(Boolean)
}

export function createDefaultFormValues(): ProcessFormValues {
  return {
    targetFile: null,
    candidateFiles: [],
    padding: '0',
    threshold: '0.75',
    matchMode: '',
  }
}

export function createProcessFormData(values: ProcessFormValues): FormData {
  const formData = new FormData()

  if (values.targetFile) {
    formData.append('targetImage', values.targetFile)
  }

  for (const file of values.candidateFiles) {
    formData.append('candidateImages', file)
  }

  formData.append('padding', values.padding)
  formData.append('threshold', values.threshold)

  if (values.matchMode === 'real') {
    formData.append('matchMode', 'real')
  }

  return formData
}

export function isProcessResponse(value: unknown): value is ProcessResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const record = value as Record<string, unknown>
  if (
    typeof record.totalImages !== 'number' ||
    typeof record.detectedFaces !== 'number' ||
    typeof record.matchedFaces !== 'number' ||
    typeof record.runId !== 'string' ||
    typeof record.outputDirectory !== 'string' ||
    !Array.isArray(record.results)
  ) {
    return false
  }

  return record.results.every((item) => {
    if (typeof item !== 'object' || item === null) {
      return false
    }

    const resultRecord = item as Record<string, unknown>

    const faceBox = resultRecord.faceBox as Record<string, unknown> | null | undefined

    return (
      typeof resultRecord.sourceFilename === 'string' &&
      typeof resultRecord.savedPath === 'string' &&
      (resultRecord.previewUrl === null || typeof resultRecord.previewUrl === 'string' || resultRecord.previewUrl === undefined) &&
      (faceBox === null ||
        faceBox === undefined ||
        (typeof faceBox.top === 'number' &&
          typeof faceBox.right === 'number' &&
          typeof faceBox.bottom === 'number' &&
          typeof faceBox.left === 'number')) &&
      (resultRecord.matchScore === null || resultRecord.matchScore === undefined || typeof resultRecord.matchScore === 'number')
    )
  })
}

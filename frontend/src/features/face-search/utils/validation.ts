import type { ProcessFormErrors, ProcessFormValues, ProcessRequest } from '../types/process'

function parseCandidatePaths(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function validateProcessForm(values: ProcessFormValues): ProcessFormErrors {
  const errors: ProcessFormErrors = {}
  const paddingValue = Number(values.padding)
  const thresholdValue = Number(values.threshold)

  if (!values.targetImagePath.trim()) {
    errors.targetImagePath = 'Target image path is required.'
  }

  if (parseCandidatePaths(values.candidateImagePathsText).length === 0) {
    errors.candidateImagePathsText = 'At least one candidate image path is required.'
  }

  if (!values.outputDir.trim()) {
    errors.outputDir = 'Output directory is required.'
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

export function toProcessRequest(values: ProcessFormValues): ProcessRequest {
  const request: ProcessRequest = {
    targetImagePath: values.targetImagePath.trim(),
    candidateImagePaths: parseCandidatePaths(values.candidateImagePathsText),
    outputDir: values.outputDir.trim(),
    padding: Number(values.padding),
    threshold: Number(values.threshold),
  }

  if (values.matchMode === 'real') {
    request.matchMode = 'real'
  }

  return request
}

export function createDefaultFormValues(): ProcessFormValues {
  return {
    targetImagePath: '',
    candidateImagePathsText: '',
    outputDir: '',
    padding: '0',
    threshold: '0.75',
    matchMode: '',
  }
}

export interface HealthResponse {
  status: string
  service: string
}

export interface FaceBox {
  top: number
  right: number
  bottom: number
  left: number
}

export interface TargetFaceDetectionResponse {
  faces: FaceBox[]
  defaultFaceIndex: number | null
}

export interface ProcessResultItem {
  candidateIndex: number
  sourceFilename: string
  savedPath: string
  previewUrl?: string | null
  faceBox?: FaceBox | null
  matchScore?: number | null
}

export interface ProcessResponse {
  totalImages: number
  detectedFaces: number
  matchedFaces: number
  runId: string
  outputDirectory: string
  results: ProcessResultItem[]
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
  }
}

export type ProcessStatus = 'idle' | 'submitting' | 'success' | 'error'
export type TargetFaceDetectionStatus = 'idle' | 'loading' | 'success' | 'error'

export interface ProcessFormValues {
  targetFile: File | null
  candidateFiles: File[]
  padding: string
  threshold: string
  matchMode: '' | 'real'
  selectedTargetFaceIndex: number | null
}

export interface ProcessFormErrors {
  targetFile?: string
  candidateFiles?: string
  padding?: string
  threshold?: string
  matchMode?: string
}

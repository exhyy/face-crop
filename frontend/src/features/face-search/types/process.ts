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

export interface ProcessResultItem {
  sourceFilename: string
  savedPath: string
  previewUrl?: string | null
  faceBox?: FaceBox | null
  matchScore?: number | null
}

export interface ProcessRequest {
  targetImagePath: string
  candidateImagePaths: string[]
  outputDir: string
  padding: number
  threshold: number
  matchMode?: 'real'
}

export interface ProcessResponse {
  totalImages: number
  detectedFaces: number
  matchedFaces: number
  results: ProcessResultItem[]
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
  }
}

export type ProcessStatus = 'idle' | 'submitting' | 'success' | 'error'

export interface ProcessFormValues {
  targetImagePath: string
  candidateImagePathsText: string
  outputDir: string
  padding: string
  threshold: string
  matchMode: '' | 'real'
}

export interface ProcessFormErrors {
  targetImagePath?: string
  candidateImagePathsText?: string
  outputDir?: string
  padding?: string
  threshold?: string
  matchMode?: string
}

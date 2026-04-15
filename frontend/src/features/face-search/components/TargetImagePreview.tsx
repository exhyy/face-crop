import { FaceOverlayPreview } from './FaceOverlayPreview'
import type { FaceBox } from '../types/process'

interface TargetImagePreviewProps {
  previewUrl: string
  faces: FaceBox[]
  selectedFaceIndex: number | null
  onSelectFace: (index: number) => void
  status: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
}

export function TargetImagePreview({
  previewUrl,
  faces,
  selectedFaceIndex,
  onSelectFace,
  status,
  error,
}: TargetImagePreviewProps) {
  const hasFaces = faces.length > 0
  const noFaceMessage = 'No face detected in the target image.'
  const isNoFaceError = error === noFaceMessage

  return (
    <div className="target-preview">
      <div className="target-preview__stack">
        <FaceOverlayPreview
          previewUrl={previewUrl}
          imageAlt="Selected target"
          faces={faces}
          selectedFaceIndex={selectedFaceIndex}
          onSelectFace={onSelectFace}
          interactive
        />
        {status === 'loading' ? (
          <div className="target-preview__loading-banner" role="status" aria-live="polite">
            Detecting faces in the target image...
          </div>
        ) : null}
      </div>

      <div className="target-preview__meta">
        {status === 'error' && !isNoFaceError ? <p className="error-text">{error ?? 'Unable to detect faces in the target image.'}</p> : null}
        {(status === 'success' && !hasFaces) || isNoFaceError ? (
          <div className="target-preview__notice target-preview__notice--warning" role="status">
            <p className="target-preview__notice-label">No faces detected</p>
            <p className="target-preview__notice-text">{noFaceMessage}</p>
          </div>
        ) : null}
        {hasFaces ? (
          <div className="target-preview__notice target-preview__notice--info" role="status">
            <p className="target-preview__notice-label">Detected faces</p>
            <p className="target-preview__notice-text">
              {faces.length} option{faces.length === 1 ? '' : 's'} available. Click a box on the image to switch selection.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

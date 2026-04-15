import { useState } from 'react'
import type { CSSProperties } from 'react'

import type { FaceBox } from '../types/process'

interface TargetImagePreviewProps {
  previewUrl: string
  faces: FaceBox[]
  selectedFaceIndex: number | null
  onSelectFace: (index: number) => void
  status: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
}

function getBoxStyle(face: FaceBox, scale: number): CSSProperties {
  return {
    top: `${face.top * scale}px`,
    left: `${face.left * scale}px`,
    width: `${(face.right - face.left) * scale}px`,
    height: `${(face.bottom - face.top) * scale}px`,
  }
}

export function TargetImagePreview({
  previewUrl,
  faces,
  selectedFaceIndex,
  onSelectFace,
  status,
  error,
}: TargetImagePreviewProps) {
  const [imageScale, setImageScale] = useState(1)
  const hasFaces = faces.length > 0
  const selectedFace = selectedFaceIndex !== null ? faces[selectedFaceIndex] ?? null : null
  const noFaceMessage = 'No face detected in the target image.'
  const isNoFaceError = error === noFaceMessage

  return (
    <div className="target-preview">
      <div className="target-preview__frame">
        <img
          className="target-preview__image"
          src={previewUrl}
          alt="Selected target"
          onLoad={(event) => {
            const image = event.currentTarget
            const nextScale = image.naturalWidth > 0 ? image.clientWidth / image.naturalWidth : 1
            setImageScale(nextScale || 1)
          }}
        />
        {status === 'loading' ? (
          <div className="target-preview__loading-banner" role="status" aria-live="polite">
            Detecting faces in the target image...
          </div>
        ) : null}
        {selectedFace ? (
          <div className="target-preview__spotlight" aria-hidden="true">
            <div className="target-preview__shade target-preview__shade--top" style={{ height: `${selectedFace.top * imageScale}px` }} />
            <div
              className="target-preview__shade target-preview__shade--left"
              style={{
                top: `${selectedFace.top * imageScale}px`,
                width: `${selectedFace.left * imageScale}px`,
                height: `${(selectedFace.bottom - selectedFace.top) * imageScale}px`,
              }}
            />
            <div
              className="target-preview__shade target-preview__shade--right"
              style={{
                top: `${selectedFace.top * imageScale}px`,
                left: `${selectedFace.right * imageScale}px`,
                height: `${(selectedFace.bottom - selectedFace.top) * imageScale}px`,
              }}
            />
            <div
              className="target-preview__shade target-preview__shade--bottom"
              style={{
                top: `${selectedFace.bottom * imageScale}px`,
              }}
            />
          </div>
        ) : null}
        <div className="target-preview__overlay" aria-hidden="true">
          {faces.map((face, index) => (
            <button
              key={`${face.top}-${face.right}-${face.bottom}-${face.left}-${index}`}
              className={`target-preview__face ${selectedFaceIndex === index ? 'target-preview__face--selected' : ''}`}
              style={getBoxStyle(face, imageScale)}
              type="button"
              onClick={() => onSelectFace(index)}
              aria-label={`Select face ${index + 1}`}
            />
          ))}
        </div>
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

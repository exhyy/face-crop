import type { CSSProperties } from 'react'
import { useState } from 'react'

import type { FaceBox } from '../types/process'

interface FaceOverlayPreviewProps {
  previewUrl: string
  imageAlt: string
  faces: FaceBox[]
  selectedFaceIndex: number | null
  onSelectFace?: (index: number) => void
  interactive?: boolean
  frameClassName?: string
  imageClassName?: string
  overlayClassName?: string
}

function getBoxStyle(face: FaceBox, scale: number): CSSProperties {
  return {
    top: `${face.top * scale}px`,
    left: `${face.left * scale}px`,
    width: `${(face.right - face.left) * scale}px`,
    height: `${(face.bottom - face.top) * scale}px`,
  }
}

export function FaceOverlayPreview({
  previewUrl,
  imageAlt,
  faces,
  selectedFaceIndex,
  onSelectFace,
  interactive = false,
  frameClassName = 'target-preview__frame',
  imageClassName = 'target-preview__image',
  overlayClassName = 'target-preview__overlay',
}: FaceOverlayPreviewProps) {
  const [imageScale, setImageScale] = useState(1)
  const selectedFace = selectedFaceIndex !== null ? faces[selectedFaceIndex] ?? null : null

  return (
    <div className={frameClassName}>
      <img
        className={imageClassName}
        src={previewUrl}
        alt={imageAlt}
        onLoad={(event) => {
          const image = event.currentTarget
          const nextScale = image.naturalWidth > 0 ? image.clientWidth / image.naturalWidth : 1
          setImageScale(nextScale || 1)
        }}
      />
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
      <div className={overlayClassName} aria-hidden="true">
        {faces.map((face, index) => {
          const className = `target-preview__face ${selectedFaceIndex === index ? 'target-preview__face--selected' : ''}`

          if (interactive && onSelectFace) {
            return (
              <button
                key={`${face.top}-${face.right}-${face.bottom}-${face.left}-${index}`}
                className={className}
                style={getBoxStyle(face, imageScale)}
                type="button"
                onClick={() => onSelectFace(index)}
                aria-label={`Select face ${index + 1}`}
              />
            )
          }

          return <div key={`${face.top}-${face.right}-${face.bottom}-${face.left}-${index}`} className={className} style={getBoxStyle(face, imageScale)} />
        })}
      </div>
    </div>
  )
}

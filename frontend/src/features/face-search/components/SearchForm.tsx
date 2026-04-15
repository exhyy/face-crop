import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import { detectTargetFaces, getFaceCropsDownloadUrl } from '../api/process'
import { FaceOverlayPreview } from './FaceOverlayPreview'
import { TargetImagePreview } from './TargetImagePreview'
import type {
  FaceBox,
  ProcessFormErrors,
  ProcessFormValues,
  ProcessResultItem,
  TargetFaceDetectionStatus,
} from '../types/process'
import { createDefaultFormValues } from '../utils/validation'

interface SearchFormProps {
  isSubmitting: boolean
  onSubmit: (values: ProcessFormValues) => void
  externalErrors: ProcessFormErrors
  processResults: ProcessResultItem[]
  runId: string | null
}

export function SearchForm({ isSubmitting, onSubmit, externalErrors, processResults, runId }: SearchFormProps) {
  const [values, setValues] = useState<ProcessFormValues>(createDefaultFormValues)
  const [targetPreviewUrl, setTargetPreviewUrl] = useState<string | null>(null)
  const [detectedFaces, setDetectedFaces] = useState<FaceBox[]>([])
  const [targetFaceStatus, setTargetFaceStatus] = useState<TargetFaceDetectionStatus>('idle')
  const [targetFaceError, setTargetFaceError] = useState<string | null>(null)
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(0)
  const [candidatePreviewUrls, setCandidatePreviewUrls] = useState<string[]>([])

  useEffect(() => {
    return () => {
      if (targetPreviewUrl) {
        URL.revokeObjectURL(targetPreviewUrl)
      }
    }
  }, [targetPreviewUrl])

  useEffect(() => {
    const nextPreviewUrls = values.candidateFiles.map((file) => URL.createObjectURL(file))
    setCandidatePreviewUrls((current) => {
      current.forEach((url) => URL.revokeObjectURL(url))
      return nextPreviewUrls
    })
    setSelectedCandidateIndex(0)

    return () => {
      nextPreviewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [values.candidateFiles])

  const activeCandidateFile = values.candidateFiles[selectedCandidateIndex] ?? null
  const activeCandidatePreviewUrl = candidatePreviewUrls[selectedCandidateIndex] ?? null
  const activeCandidateMatches = useMemo(
    () => processResults.filter((result) => result.candidateIndex === selectedCandidateIndex && result.faceBox).map((result) => result.faceBox as FaceBox),
    [processResults, selectedCandidateIndex],
  )

  const updateField = <T extends keyof ProcessFormValues>(field: T, value: ProcessFormValues[T]) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const handleInputChange =
    (field: 'padding' | 'threshold' | 'matchMode') => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      updateField(field, event.target.value as ProcessFormValues[typeof field])
    }

  const handleTargetFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const nextTargetFile = event.target.files?.[0] ?? null

    if (targetPreviewUrl) {
      URL.revokeObjectURL(targetPreviewUrl)
    }

    updateField('targetFile', nextTargetFile)
    updateField('selectedTargetFaceIndex', null)
    setDetectedFaces([])
    setTargetFaceError(null)

    if (nextTargetFile === null) {
      setTargetPreviewUrl(null)
      setTargetFaceStatus('idle')
      return
    }

    setTargetPreviewUrl(URL.createObjectURL(nextTargetFile))
    setTargetFaceStatus('loading')

    try {
      const response = await detectTargetFaces(nextTargetFile)
      setDetectedFaces(response.faces)
      updateField('selectedTargetFaceIndex', response.defaultFaceIndex)
      setTargetFaceStatus('success')
    } catch (error) {
      setDetectedFaces([])
      updateField('selectedTargetFaceIndex', null)
      setTargetFaceStatus('error')
      setTargetFaceError(error instanceof Error ? error.message : 'Unable to detect faces in the target image.')
    }
  }

  const handleCandidateFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateField('candidateFiles', Array.from(event.target.files ?? []))
  }

  const handleSelectTargetFace = (index: number) => {
    updateField('selectedTargetFaceIndex', index)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(values)
  }

  return (
    <section className="panel panel--form">
      <div className="panel__intro panel__intro--tight">
        <p className="section-label">Request</p>
        <h2>Search input</h2>
      </div>
      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <div className="form-section form-section--soft-divider">
          <div className="form-section__header">
            <div>
              <h3>Target image</h3>
              <p className="help-text">Reference image for the current run.</p>
            </div>
          </div>
          <div className="upload-card upload-card--target">
            <label htmlFor="targetFile">Choose target image</label>
            <input id="targetFile" name="targetFile" type="file" accept="image/*" onChange={handleTargetFileChange} />
            <p className="field-hint">Single image file.</p>
            <div className="selection-summary">
              <span className="selection-summary__label">Selected</span>
              <span className="selection-summary__value">{values.targetFile ? values.targetFile.name : 'None'}</span>
            </div>
            {targetPreviewUrl ? (
              <TargetImagePreview
                previewUrl={targetPreviewUrl}
                faces={detectedFaces}
                selectedFaceIndex={values.selectedTargetFaceIndex}
                onSelectFace={handleSelectTargetFace}
                status={targetFaceStatus}
                error={targetFaceError}
              />
            ) : null}
            {externalErrors.targetFile ? <p className="error-text">{externalErrors.targetFile}</p> : null}
          </div>
        </div>

        <div className="form-section form-section--soft-divider">
          <div className="form-section__header">
            <div>
              <h3>Candidate images</h3>
              <p className="help-text">Batch of images to compare.</p>
            </div>
          </div>
          <div className="upload-card upload-card--candidate">
            <label htmlFor="candidateFiles">Choose candidate images</label>
            <input id="candidateFiles" name="candidateFiles" type="file" accept="image/*" multiple onChange={handleCandidateFilesChange} />
            <p className="field-hint">Multiple files supported.</p>
            <div className="selection-summary">
              <span className="selection-summary__label">Selected</span>
              <span className="selection-summary__value">{values.candidateFiles.length} file{values.candidateFiles.length === 1 ? '' : 's'}</span>
            </div>
            {activeCandidatePreviewUrl && activeCandidateFile ? (
              <div className="candidate-preview">
                <div className="candidate-preview__stage">
                  <FaceOverlayPreview
                    previewUrl={activeCandidatePreviewUrl}
                    imageAlt={`Candidate preview for ${activeCandidateFile.name}`}
                    faces={activeCandidateMatches}
                    selectedFaceIndex={activeCandidateMatches.length > 0 ? 0 : null}
                    frameClassName="target-preview__frame candidate-preview__frame"
                  />
                </div>
                <div className="candidate-preview__meta">
                  <p className="candidate-preview__filename">{activeCandidateFile.name}</p>
                  <p className="help-text">
                    {activeCandidateMatches.length > 0
                      ? `${activeCandidateMatches.length} matched face${activeCandidateMatches.length === 1 ? '' : 's'} highlighted on this image.`
                      : 'Run search to highlight matched faces on the active candidate image.'}
                  </p>
                </div>
                <div className="candidate-preview__thumbs" role="list" aria-label="Candidate image thumbnails">
                  {values.candidateFiles.map((file, index) => {
                    const thumbnailUrl = candidatePreviewUrls[index]
                    const isActive = index === selectedCandidateIndex

                    return (
                      <button
                        key={`${file.name}-${file.lastModified}-${index}`}
                        className={`candidate-preview__thumb ${isActive ? 'candidate-preview__thumb--active' : ''}`}
                        type="button"
                        onClick={() => setSelectedCandidateIndex(index)}
                        aria-pressed={isActive}
                        aria-label={`Show candidate image ${index + 1}: ${file.name}`}
                      >
                        <img src={thumbnailUrl} alt="" />
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
            {externalErrors.candidateFiles ? <p className="error-text">{externalErrors.candidateFiles}</p> : null}
          </div>
        </div>

        <div className="form-section">
          <div className="form-section__header">
            <div>
              <h3>Settings</h3>
              <p className="help-text">Fine-tune how strict matching should be and how the saved crops are framed.</p>
            </div>
          </div>
          <div className="form-row form-row--inline form-row--settings">
            <div className="form-row setting-card setting-card--polished">
              <div className="setting-card__intro">
                <p className="setting-card__eyebrow">Crop framing</p>
                <label htmlFor="padding">Padding</label>
                <p className="setting-card__description">Adds extra space around the matched face before the crop is saved.</p>
              </div>
              <input id="padding" name="padding" value={values.padding} onChange={handleInputChange('padding')} inputMode="numeric" />
              <p className="setting-card__note">Use 0 for a tight crop, or raise it when you want more headroom around the face.</p>
              {externalErrors.padding ? <p className="error-text">{externalErrors.padding}</p> : null}
            </div>

            <div className="form-row setting-card setting-card--polished">
              <div className="setting-card__intro">
                <p className="setting-card__eyebrow">Match strictness</p>
                <label htmlFor="threshold">Threshold</label>
                <p className="setting-card__description">Controls how closely a candidate face must match the target face.</p>
              </div>
              <input
                id="threshold"
                name="threshold"
                value={values.threshold}
                onChange={handleInputChange('threshold')}
                inputMode="decimal"
              />
              <p className="setting-card__note">Higher values are stricter. Lower values allow more possible matches.</p>
              {externalErrors.threshold ? <p className="error-text">{externalErrors.threshold}</p> : null}
            </div>

            <div className="form-row setting-card setting-card--polished">
              <div className="setting-card__intro">
                <p className="setting-card__eyebrow">Comparison mode</p>
                <label htmlFor="matchMode">Match mode</label>
                <p className="setting-card__description">Choose how the backend should run the face comparison for this search.</p>
              </div>
              <select id="matchMode" name="matchMode" value={values.matchMode} onChange={handleInputChange('matchMode')}>
                <option value="">Default</option>
                <option value="real">real</option>
              </select>
              <p className="setting-card__note">Default is the standard option. Use real only when you specifically want that backend mode.</p>
              {externalErrors.matchMode ? <p className="error-text">{externalErrors.matchMode}</p> : null}
            </div>
          </div>
        </div>

        <div className="actions actions--form actions--quiet">
          <div className="actions actions--form-inline">
            <button className="button button--primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Run search'}
            </button>
            {runId && processResults.length > 0 ? (
              <a className="button button--secondary" href={getFaceCropsDownloadUrl(runId)}>
                Download crops zip
              </a>
            ) : null}
          </div>
          <p className="help-text">A new run replaces the previous result set.</p>
        </div>
      </form>
    </section>
  )
}

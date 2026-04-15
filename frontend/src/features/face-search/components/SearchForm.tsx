import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import type { ProcessFormErrors, ProcessFormValues } from '../types/process'
import { createDefaultFormValues } from '../utils/validation'

interface SearchFormProps {
  isSubmitting: boolean
  onSubmit: (values: ProcessFormValues) => void
  externalErrors: ProcessFormErrors
}

export function SearchForm({ isSubmitting, onSubmit, externalErrors }: SearchFormProps) {
  const [values, setValues] = useState<ProcessFormValues>(createDefaultFormValues)

  const updateField = <T extends keyof ProcessFormValues>(field: T, value: ProcessFormValues[T]) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const handleInputChange =
    (field: 'padding' | 'threshold' | 'matchMode') => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      updateField(field, event.target.value as ProcessFormValues[typeof field])
    }

  const handleTargetFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateField('targetFile', event.target.files?.[0] ?? null)
  }

  const handleCandidateFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateField('candidateFiles', Array.from(event.target.files ?? []))
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
            {values.candidateFiles.length > 0 ? (
              <ul className="selected-file-list">
                {values.candidateFiles.map((file) => (
                  <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>
                ))}
              </ul>
            ) : null}
            {externalErrors.candidateFiles ? <p className="error-text">{externalErrors.candidateFiles}</p> : null}
          </div>
        </div>

        <div className="form-section">
          <div className="form-section__header">
            <div>
              <h3>Settings</h3>
              <p className="help-text">Threshold, padding, and matching mode.</p>
            </div>
          </div>
          <div className="form-row form-row--inline form-row--settings">
            <div className="form-row setting-card">
              <label htmlFor="padding">Padding</label>
              <input id="padding" name="padding" value={values.padding} onChange={handleInputChange('padding')} inputMode="numeric" />
              <p className="field-hint">Non-negative integer.</p>
              {externalErrors.padding ? <p className="error-text">{externalErrors.padding}</p> : null}
            </div>

            <div className="form-row setting-card">
              <label htmlFor="threshold">Threshold</label>
              <input
                id="threshold"
                name="threshold"
                value={values.threshold}
                onChange={handleInputChange('threshold')}
                inputMode="decimal"
              />
              <p className="field-hint">Range: -1 to 1.</p>
              {externalErrors.threshold ? <p className="error-text">{externalErrors.threshold}</p> : null}
            </div>

            <div className="form-row setting-card">
              <label htmlFor="matchMode">Match mode</label>
              <select id="matchMode" name="matchMode" value={values.matchMode} onChange={handleInputChange('matchMode')}>
                <option value="">Default</option>
                <option value="real">real</option>
              </select>
              <p className="field-hint">Backend-supported mode.</p>
              {externalErrors.matchMode ? <p className="error-text">{externalErrors.matchMode}</p> : null}
            </div>
          </div>
        </div>

        <div className="actions actions--form actions--quiet">
          <button className="button button--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Run search'}
          </button>
          <p className="help-text">A new run replaces the previous result set.</p>
        </div>
      </form>
    </section>
  )
}

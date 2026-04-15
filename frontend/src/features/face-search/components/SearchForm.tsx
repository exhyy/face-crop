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
    <section className="panel">
      <h2>Search request</h2>
      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <label htmlFor="targetFile">Target image</label>
          <input id="targetFile" name="targetFile" type="file" accept="image/*" onChange={handleTargetFileChange} />
          <p className="help-text">Choose the target image from your local device.</p>
          {values.targetFile ? <p className="help-text">Selected: {values.targetFile.name}</p> : null}
          {externalErrors.targetFile ? <p className="error-text">{externalErrors.targetFile}</p> : null}
        </div>

        <div className="form-row">
          <label htmlFor="candidateFiles">Candidate images</label>
          <input id="candidateFiles" name="candidateFiles" type="file" accept="image/*" multiple onChange={handleCandidateFilesChange} />
          <p className="help-text">Choose one or more candidate images from your local device.</p>
          <p className="help-text">Selected files: {values.candidateFiles.length}</p>
          {values.candidateFiles.length > 0 ? (
            <ul className="selected-file-list">
              {values.candidateFiles.map((file) => (
                <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>
              ))}
            </ul>
          ) : null}
          {externalErrors.candidateFiles ? <p className="error-text">{externalErrors.candidateFiles}</p> : null}
        </div>

        <div className="form-row form-row--inline">
          <div className="form-row">
            <label htmlFor="padding">Padding</label>
            <input id="padding" name="padding" value={values.padding} onChange={handleInputChange('padding')} inputMode="numeric" />
            {externalErrors.padding ? <p className="error-text">{externalErrors.padding}</p> : null}
          </div>

          <div className="form-row">
            <label htmlFor="threshold">Threshold</label>
            <input
              id="threshold"
              name="threshold"
              value={values.threshold}
              onChange={handleInputChange('threshold')}
              inputMode="decimal"
            />
            {externalErrors.threshold ? <p className="error-text">{externalErrors.threshold}</p> : null}
          </div>

          <div className="form-row">
            <label htmlFor="matchMode">Match mode</label>
            <select id="matchMode" name="matchMode" value={values.matchMode} onChange={handleInputChange('matchMode')}>
              <option value="">Default</option>
              <option value="real">real</option>
            </select>
            {externalErrors.matchMode ? <p className="error-text">{externalErrors.matchMode}</p> : null}
          </div>
        </div>

        <div className="actions">
          <button className="button button--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Upload and process'}
          </button>
        </div>
      </form>
    </section>
  )
}

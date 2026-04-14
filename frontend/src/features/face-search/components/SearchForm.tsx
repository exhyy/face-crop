import { useMemo, useState } from 'react'
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

  const candidateCount = useMemo(() => {
    return values.candidateImagePathsText
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean).length
  }, [values.candidateImagePathsText])

  const updateField = <T extends keyof ProcessFormValues>(field: T, value: ProcessFormValues[T]) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const handleInputChange =
    (field: keyof ProcessFormValues) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      updateField(field, event.target.value as ProcessFormValues[typeof field])
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
          <label htmlFor="targetImagePath">Target image path</label>
          <input
            id="targetImagePath"
            name="targetImagePath"
            value={values.targetImagePath}
            onChange={handleInputChange('targetImagePath')}
            placeholder="/absolute/path/to/target.jpg"
          />
          <p className="help-text">Provide the target image path expected by the backend.</p>
          {externalErrors.targetImagePath ? <p className="error-text">{externalErrors.targetImagePath}</p> : null}
        </div>

        <div className="form-row">
          <label htmlFor="candidateImagePathsText">Candidate image paths</label>
          <textarea
            id="candidateImagePathsText"
            name="candidateImagePathsText"
            value={values.candidateImagePathsText}
            onChange={handleInputChange('candidateImagePathsText')}
            placeholder="/absolute/path/to/candidate-1.jpg&#10;/absolute/path/to/candidate-2.jpg"
          />
          <p className="help-text">Enter one path per line or separate entries with commas. Current count: {candidateCount}.</p>
          {externalErrors.candidateImagePathsText ? <p className="error-text">{externalErrors.candidateImagePathsText}</p> : null}
        </div>

        <div className="form-row">
          <label htmlFor="outputDir">Output directory</label>
          <input
            id="outputDir"
            name="outputDir"
            value={values.outputDir}
            onChange={handleInputChange('outputDir')}
            placeholder="/absolute/path/to/output"
          />
          <p className="help-text">The directory must already exist on the backend host.</p>
          {externalErrors.outputDir ? <p className="error-text">{externalErrors.outputDir}</p> : null}
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
            {isSubmitting ? 'Processing...' : 'Process images'}
          </button>
        </div>
      </form>
    </section>
  )
}

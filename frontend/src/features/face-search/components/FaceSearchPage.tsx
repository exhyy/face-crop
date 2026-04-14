import { useState } from 'react'

import { CropResultList } from './CropResultList'
import { HealthStatus } from './HealthStatus'
import { ProcessStatus } from './ProcessStatus'
import { ProcessSummary } from './ProcessSummary'
import { SearchForm } from './SearchForm'
import { useHealthCheck } from '../hooks/useHealthCheck'
import { useProcessFaces } from '../hooks/useProcessFaces'
import type { ProcessFormErrors, ProcessFormValues } from '../types/process'
import { hasProcessFormErrors, toProcessRequest, validateProcessForm } from '../utils/validation'

export function FaceSearchPage() {
  const health = useHealthCheck()
  const processFaces = useProcessFaces()
  const [formErrors, setFormErrors] = useState<ProcessFormErrors>({})

  const handleSubmit = async (values: ProcessFormValues) => {
    const nextErrors = validateProcessForm(values)
    setFormErrors(nextErrors)

    if (hasProcessFormErrors(nextErrors)) {
      return
    }

    await processFaces.run(toProcessRequest(values))
  }

  return (
    <main className="page">
      <header className="page__header">
        <h1 className="page__title">Face Crop Frontend</h1>
        <p className="page__description">
          Submit local image paths to the backend, then review processing status, summary metrics, and saved outputs.
        </p>
      </header>

      <div className="layout-grid">
        <HealthStatus status={health.status} data={health.data} error={health.error} />
        <SearchForm
          isSubmitting={processFaces.status === 'submitting'}
          onSubmit={handleSubmit}
          externalErrors={formErrors}
        />
        <ProcessStatus status={processFaces.status} error={processFaces.error} />
        <ProcessSummary status={processFaces.status} result={processFaces.result} />
        <CropResultList results={processFaces.result?.results ?? []} />
      </div>
    </main>
  )
}

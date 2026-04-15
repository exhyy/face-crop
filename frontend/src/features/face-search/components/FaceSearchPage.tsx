import { useState } from 'react'

import { HealthStatus } from './HealthStatus'
import { ProcessStatus } from './ProcessStatus'
import { ProcessSummary } from './ProcessSummary'
import { SearchForm } from './SearchForm'
import { useHealthCheck } from '../hooks/useHealthCheck'
import { useProcessFaces } from '../hooks/useProcessFaces'
import type { ProcessFormErrors, ProcessFormValues } from '../types/process'
import { hasProcessFormErrors, validateProcessForm } from '../utils/validation'

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

    await processFaces.run(values)
  }

  return (
    <main className="page page-shell">
      <header className="page__header page-hero page-hero--compact">
        <div className="page-hero__bar">
          <div className="page-hero__identity">
            <div className="page__eyebrow">Local face search</div>
            <h1 className="page__title page__title--compact">Face search</h1>
          </div>
          <p className="page-hero__note">Reference image + batch comparison</p>
        </div>
        <div className="page__status-row page__status-row--compact">
          <HealthStatus status={health.status} data={health.data} error={health.error} />
          <ProcessStatus status={processFaces.status} error={processFaces.error} />
        </div>
      </header>

      <div className="layout-grid layout-grid--main layout-grid--above-fold">
        <div className="layout-grid__primary">
          <SearchForm
            isSubmitting={processFaces.status === 'submitting'}
            onSubmit={handleSubmit}
            externalErrors={formErrors}
            processResults={processFaces.result?.results ?? []}
            runId={processFaces.result?.runId ?? null}
          />
        </div>
        <aside className="layout-grid__secondary">
          <ProcessSummary />
        </aside>
      </div>
    </main>
  )
}

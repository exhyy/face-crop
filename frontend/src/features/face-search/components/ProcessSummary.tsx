import type { ProcessResponse, ProcessStatus as ProcessStatusValue } from '../types/process'

interface ProcessSummaryProps {
  result: ProcessResponse | null
  status: ProcessStatusValue
}

export function ProcessSummary({ result, status }: ProcessSummaryProps) {
  return (
    <section className="panel panel--summary">
      <div className="panel__intro">
        <p className="section-label">Run summary</p>
        <h2>Latest output</h2>
        <p className="help-text">A compact view of the current processing run and its saved results.</p>
      </div>
      {result ? (
        <div className="summary-grid">
          <div className="summary-card">
            <p className="summary-card__label">Status</p>
            <p className="summary-card__value summary-card__value--text">{status}</p>
          </div>
          <div className="summary-card">
            <p className="summary-card__label">Total images</p>
            <p className="summary-card__value">{result.totalImages}</p>
          </div>
          <div className="summary-card">
            <p className="summary-card__label">Detected faces</p>
            <p className="summary-card__value">{result.detectedFaces}</p>
          </div>
          <div className="summary-card">
            <p className="summary-card__label">Matched faces</p>
            <p className="summary-card__value">{result.matchedFaces}</p>
          </div>
        </div>
      ) : (
        <div className="summary-empty-state">
          <p className="summary-empty-state__title">No run results yet</p>
          <p className="help-text">Start a processing run to see summary metrics and output details here.</p>
        </div>
      )}
    </section>
  )
}

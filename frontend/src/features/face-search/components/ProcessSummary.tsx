import type { ProcessResponse, ProcessStatus as ProcessStatusValue } from '../types/process'

interface ProcessSummaryProps {
  result: ProcessResponse | null
  status: ProcessStatusValue
}

export function ProcessSummary({ result, status }: ProcessSummaryProps) {
  return (
    <section className="panel">
      <h2>Result summary</h2>
      {result ? (
        <div className="summary-grid">
          <div className="summary-card">
            <p className="summary-card__label">Status</p>
            <p className="summary-card__value">{status}</p>
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
        <p className="help-text">Run the process request to see summary metrics here.</p>
      )}
    </section>
  )
}

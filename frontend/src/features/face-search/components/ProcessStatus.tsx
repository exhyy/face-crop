import type { ProcessStatus as ProcessStatusValue } from '../types/process'

interface ProcessStatusProps {
  status: ProcessStatusValue
  error: string | null
}

export function ProcessStatus({ status, error }: ProcessStatusProps) {
  const message =
    status === 'idle'
      ? 'Ready to run.'
      : status === 'submitting'
        ? 'Processing images...'
        : status === 'success'
          ? 'Run completed.'
          : error ?? 'Processing failed.'

  const badgeClassName =
    status === 'success'
      ? 'badge badge--ok'
      : status === 'submitting'
        ? 'badge badge--warn'
        : status === 'error'
          ? 'badge badge--error'
          : 'badge badge--neutral'

  const badgeLabel =
    status === 'idle' ? 'Ready' : status === 'submitting' ? 'Running' : status === 'success' ? 'Complete' : 'Error'

  return (
    <section className="status-card" aria-live="polite">
      <div className="status-card__header">
        <div>
          <p className="status-card__title">Run</p>
          <p className="status-card__meta">Current processing state.</p>
        </div>
        <span className={badgeClassName}>{badgeLabel}</span>
      </div>
      <p className={status === 'error' ? 'error-text' : 'help-text'}>{message}</p>
    </section>
  )
}

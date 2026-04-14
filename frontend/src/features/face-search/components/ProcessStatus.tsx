import type { ProcessStatus as ProcessStatusValue } from '../types/process'

interface ProcessStatusProps {
  status: ProcessStatusValue
  error: string | null
}

export function ProcessStatus({ status, error }: ProcessStatusProps) {
  const message =
    status === 'idle'
      ? 'Ready to submit a processing request.'
      : status === 'submitting'
        ? 'Processing images...'
        : status === 'success'
          ? 'Processing completed successfully.'
          : error ?? 'Processing failed.'

  const badgeClassName =
    status === 'success'
      ? 'badge badge--ok'
      : status === 'submitting'
        ? 'badge badge--warn'
        : status === 'error'
          ? 'badge badge--error'
          : 'badge badge--warn'

  return (
    <section className="panel status-block" aria-live="polite">
      <div>
        <h2>Processing status</h2>
        <span className={badgeClassName}>{status}</span>
      </div>
      <p className={status === 'error' ? 'error-text' : 'help-text'}>{message}</p>
    </section>
  )
}

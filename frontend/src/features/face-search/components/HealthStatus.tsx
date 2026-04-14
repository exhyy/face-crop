import type { HealthResponse } from '../types/process'

interface HealthStatusProps {
  status: 'loading' | 'healthy' | 'unavailable'
  data: HealthResponse | null
  error: string | null
}

export function HealthStatus({ status, data, error }: HealthStatusProps) {
  const badgeClassName =
    status === 'healthy' ? 'badge badge--ok' : status === 'loading' ? 'badge badge--warn' : 'badge badge--error'

  const badgeLabel = status === 'healthy' ? 'Healthy' : status === 'loading' ? 'Checking' : 'Unavailable'

  return (
    <section className="panel status-block" aria-live="polite">
      <div>
        <h2>Backend status</h2>
        <span className={badgeClassName}>{badgeLabel}</span>
      </div>
      {data ? <p className="help-text">Connected to {data.service}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </section>
  )
}

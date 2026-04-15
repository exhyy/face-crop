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
    <section className="status-card" aria-live="polite">
      <div className="status-card__header">
        <div>
          <p className="status-card__title">Backend</p>
          <p className="status-card__meta">Local processing service.</p>
        </div>
        <span className={badgeClassName}>{badgeLabel}</span>
      </div>
      {data ? <p className="help-text">Connected to {data.service}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </section>
  )
}

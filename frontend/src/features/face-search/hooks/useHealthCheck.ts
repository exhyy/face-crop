import { useEffect, useState } from 'react'

import { getHealth } from '../api/health'
import type { HealthResponse } from '../types/process'

export function useHealthCheck() {
  const [status, setStatus] = useState<'loading' | 'healthy' | 'unavailable'>('loading')
  const [data, setData] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus('loading')
      setError(null)

      try {
        const next = await getHealth()
        if (cancelled) {
          return
        }
        setData(next)
        setStatus('healthy')
      } catch (err) {
        if (cancelled) {
          return
        }
        setData(null)
        setStatus('unavailable')
        setError(err instanceof Error ? err.message : 'Unable to reach backend.')
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  return { status, data, error }
}

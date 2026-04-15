import { useState } from 'react'

import { processFaces } from '../api/process'
import type { ProcessFormValues, ProcessResponse, ProcessStatus } from '../types/process'

export function useProcessFaces() {
  const [status, setStatus] = useState<ProcessStatus>('idle')
  const [result, setResult] = useState<ProcessResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async (values: ProcessFormValues) => {
    setStatus('submitting')
    setError(null)
    setResult(null)

    try {
      const next = await processFaces(values)
      setResult(next)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Unable to process images.')
    }
  }

  return { status, result, error, run }
}

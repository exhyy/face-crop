import { describe, expect, it } from 'vitest'

import { createDefaultFormValues, toProcessRequest, validateProcessForm } from './validation'

describe('validateProcessForm', () => {
  it('returns field errors for missing required values', () => {
    const values = createDefaultFormValues()

    expect(validateProcessForm(values)).toEqual({
      targetImagePath: 'Target image path is required.',
      candidateImagePathsText: 'At least one candidate image path is required.',
      outputDir: 'Output directory is required.',
    })
  })

  it('builds a valid request payload', () => {
    const values = {
      targetImagePath: ' /tmp/target.jpg ',
      candidateImagePathsText: ' /tmp/a.jpg\n/tmp/b.jpg ',
      outputDir: ' /tmp/output ',
      padding: '2',
      threshold: '0.9',
      matchMode: 'real' as const,
    }

    expect(validateProcessForm(values)).toEqual({})
    expect(toProcessRequest(values)).toEqual({
      targetImagePath: '/tmp/target.jpg',
      candidateImagePaths: ['/tmp/a.jpg', '/tmp/b.jpg'],
      outputDir: '/tmp/output',
      padding: 2,
      threshold: 0.9,
      matchMode: 'real',
    })
  })
})

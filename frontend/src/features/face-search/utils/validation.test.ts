import { describe, expect, it } from 'vitest'

import { createDefaultFormValues, createProcessFormData, validateProcessForm } from './validation'

describe('validateProcessForm', () => {
  it('returns field errors for missing required values', () => {
    const values = createDefaultFormValues()

    expect(validateProcessForm(values)).toEqual({
      targetFile: 'Target image is required.',
      candidateFiles: 'At least one candidate image is required.',
    })
  })

  it('builds valid FormData from selected files', () => {
    const targetFile = new File(['target'], 'target.jpg', { type: 'image/jpeg' })
    const candidateOne = new File(['a'], 'a.jpg', { type: 'image/jpeg' })
    const candidateTwo = new File(['b'], 'b.png', { type: 'image/png' })

    const values = {
      targetFile,
      candidateFiles: [candidateOne, candidateTwo],
      padding: '2',
      threshold: '0.9',
      matchMode: 'real' as const,
      selectedTargetFaceIndex: 1,
    }

    expect(validateProcessForm(values)).toEqual({})

    const formData = createProcessFormData(values)
    expect(formData.get('targetImage')).toBe(targetFile)
    expect(formData.getAll('candidateImages')).toEqual([candidateOne, candidateTwo])
    expect(formData.get('padding')).toBe('2')
    expect(formData.get('threshold')).toBe('0.9')
    expect(formData.get('matchMode')).toBe('real')
  })
})
